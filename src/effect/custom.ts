import {
  Entity,
  EntityDieAfterEvent,
  EntityHealthChangedAfterEvent,
  EntityHitBlockAfterEvent,
  EntityHitEntityAfterEvent,
  EntityHurtAfterEvent,
  EntityLoadAfterEvent,
  EntityRemoveBeforeEvent,
  EntitySpawnAfterEvent,
  PlayerInteractWithEntityAfterEvent,
  PlayerInteractWithEntityBeforeEvent,
  system,
  world,
} from "@minecraft/server";
import { Registry } from "../registry";
import { VersionedDataStorage } from "../data";
import { forAllDimensions } from "../utils";
import {
  EntityDismountEvent,
  EntityEvents,
  EntityFallOnEvent,
  EntityMountEvent,
  EntityMovedEvent,
  EntityStepOffEvent,
  EntityStepOnEvent,
} from "../event";
import { boolean, defaulted, max, min, number, object, string, Struct } from "superstruct";

let initialized = false;

export interface CustomEffectUtilsOptions {
  amplifier?: number;
  showParticles?: boolean;
}

export interface CustomEffectInstance {
  effect: string;
  amplifier: number;
  duration: number;
  showParticles: boolean;
  totalDuration: number;
  params: { [key: string]: any };
}

export class CustomEffectEvent {
  constructor(entity: Entity, effect: CustomEffectInstance) {
    this.entity = entity;
    if (!effect.amplifier) effect.amplifier = 0;
    if (!effect.showParticles) effect.showParticles = true;
    this.effect = effect;
  }

  readonly entity: Entity;
  readonly effect: CustomEffectInstance;
}

export class CustomEffectTickEvent extends CustomEffectEvent {}

export class CustomEffectStartEvent extends CustomEffectEvent {
  cancel: boolean = false;
}

export class CustomEffectEndEvent extends CustomEffectEvent {
  cancel: boolean = false;
}

export class CustomEffectUtils {
  private static struct: Struct<any, any> = object({
    effect: string(),
    duration: number(),
    totalDuration: number(),
    showParticles: defaulted(boolean(), true),
    amplifier: defaulted(min(max(number(), 255), 0), 0),
    params: defaulted(object(), {}),
  });

  static getStorage(entity: Entity): VersionedDataStorage {
    return new VersionedDataStorage("mcutils:custom_effects", 1, entity);
  }
  /**
   * All effects the entity has.
   * @param {Entity} entity
   * @returns {CustomEffectInstance[]}
   */
  static getAll(entity: Entity): CustomEffectInstance[] {
    const store = this.getStorage(entity);
    return store.get("active_effects", []);
  }

  /**
   * Apply a custom effect to an entity.
   * @param {Entity} entity
   * @param {string} effectType Custom effect id.
   * @param {number} duration
   * @param {CustomEffectUtilsOptions} options
   * @returns {boolean}
   */
  static add(entity: Entity, effectType: string, duration: number, options?: CustomEffectUtilsOptions): boolean {
    const effect = customEffectRegistry.get(effectType);
    if (!effect) throw new Error(`Effect "${effectType}" not found!`);
    const instance: CustomEffectInstance = this.struct.create({
      duration,
      effect: effectType,
      totalDuration: duration,
      amplifier: options?.amplifier,
      showParticles: options?.showParticles,
    });
    const event = new CustomEffectStartEvent(entity, instance);
    if (effect.onStart) effect.onStart(event);
    if (event.cancel) return false;

    const effects = this.getAll(entity);
    const instance2 = effects.find((effect) => effect.effect === effectType);
    if (instance2) {
      instance2.duration = event.effect.duration;
      instance2.amplifier = event.effect.amplifier;
    } else {
      effects.push(event.effect);
    }
    const store = this.getStorage(entity);
    store.set("active_effects", effects);
    return true;
  }

  /**
   * Remove a custom effect from an entity.
   * @param {Entity} entity
   * @param {string} effectType Custom effect id.
   */
  static remove(entity: Entity, effectType: string): void {
    if (!customEffectRegistry.has(effectType)) throw new Error(`Effect "${effectType}" not found!`);
    let effects = this.getAll(entity);
    effects = effects.filter((instance) => {
      if (instance.effect !== effectType) return true;
      const effect = customEffectRegistry.get(instance.effect);
      const event = new CustomEffectEndEvent(entity, instance);
      if (effect?.onEnd) effect.onEnd(event);
      return !event.cancel;
    });
    const store = this.getStorage(entity);
    store.set("active_effects", effects);
  }

  /**
   * Remove all effects from the entity.
   * @param {Entity} entity
   */
  static removeAll(entity: Entity): void {
    let effects = this.getAll(entity);
    effects = effects.filter((instance) => {
      const event = new CustomEffectEndEvent(entity, instance);
      const effect = customEffectRegistry.get(instance.effect);
      if (effect?.onEnd) effect.onEnd(event);
      return !event.cancel;
    });
    const store = this.getStorage(entity);
    store.set("active_effects", effects);
  }

  /**
   * Whether or not the entity has the effect.
   * @param {Entity} entity
   * @param {string} effectName Custom effect Id.
   * @returns {boolean}
   */
  static has(entity: Entity, effectName: string): boolean {
    return this.getAll(entity).some((instance) => instance.effect === effectName);
  }
}

export class CustomEffects extends Registry<CustomEffect> {
  static readonly registryId = "custom_effects";

  register(name: string, customEffect: CustomEffect): CustomEffect | undefined {
    if (!initialized) init();
    return super.register(name, customEffect);
  }
}

export const customEffectRegistry = new CustomEffects();

export abstract class CustomEffect {
  static readonly effectId: string;

  // EFFECT EVENTS

  onTick?(event: CustomEffectTickEvent): void;
  onStart?(event: CustomEffectStartEvent): void;
  onEnd?(event: CustomEffectEndEvent): void;

  // CUSTOM EVENTS

  /**
   * Fires when a entity mounts another entity.
   * @param {EntityMountEnterEvent} event
   */
  onMount?(event: EntityMountEvent): void {}

  /**
   * Fires when a entity dismounts another entity.
   * @param {EntityMountExitEvent} event
   */
  onDismount?(event: EntityDismountEvent): void {}

  /**
   * Fires when a entity moves.
   * @param {EntityMovedEvent} event
   */
  onMoved?(event: EntityMovedEvent): void {}

  // EVENTS

  /**
   * Fires when a player interacts with a entity.
   * @param {PlayerInteractWithEntityAfterEvent} event
   */
  onInteract?(event: PlayerInteractWithEntityAfterEvent): void {}

  /**
   * Fires before a player interacts with an entity.
   * @param {PlayerInteractWithEntityBeforeEvent} event
   */
  onBeforeInteract?(event: PlayerInteractWithEntityBeforeEvent): void {}

  /**
   * Fires when a entity is removed.
   * @param {EntityRemoveBeforeEvent} event
   */
  onRemove?(event: EntityRemoveBeforeEvent): void {}

  /**
   * Fires when a entity dies.
   * @param {EntityDieAfterEvent} event
   */
  onDie?(event: EntityDieAfterEvent): void {}

  /**
   * Fires when a entity's health has changed.
   * @param {EntityHealthChangedAfterEvent} event
   */
  onHealthChanged?(event: EntityHealthChangedAfterEvent): void {}

  /**
   * Fires when a entity hits a block.
   * @param {EntityHitBlockAfterEvent} event
   */
  onHitBlock?(event: EntityHitBlockAfterEvent): void {}

  /**
   *  Fires when a entity hits another entity.
   * @param {EntityHitEntityAfterEvent} event
   */
  onHitEntity?(event: EntityHitEntityAfterEvent): void {}

  /**
   * Fires when a entity is hurt.
   * @param {EntityHurtAfterEvent} event
   */
  onHurt?(event: EntityHurtAfterEvent): void {}

  /**
   * Fires when a entity is loaded.
   * @param {EntityLoadAfterEvent} event
   */
  onLoad?(event: EntityLoadAfterEvent): void {}

  /**
   * Fires when a entity spawned.
   * @param {EntitySpawnAfterEvent} event
   */
  onSpawn?(event: EntitySpawnAfterEvent): void {}

  /**
   * Fires when a entity falls on a block.
   * @param {EntityFallOnEvent} event
   */
  onFallOn?(event: EntityFallOnEvent): void {}

  /**
   * Fires when a entity steps on a block.
   * @param {EntityStepOnEvent} event
   */
  onStepOn?(event: EntityStepOnEvent): void {}

  /**
   * Fires when a entity steps off a block.
   * @param {EntityStepOffEvent} event
   */
  onStepOff?(event: EntityStepOffEvent): void;
}

function decreaseDuration(entity: Entity, effects: CustomEffectInstance[]): void {
  const results = [];
  for (const instance of effects) {
    instance.duration--;
    if (instance.duration <= 0) {
      const effect = customEffectRegistry.get(instance.effect);
      const event = new CustomEffectEndEvent(entity, instance);
      if (effect?.onEnd) effect.onEnd(event);
      if (!event.cancel) continue;
    }
    results.push(instance);
  }
  const store = CustomEffectUtils.getStorage(entity);
  store.set("active_effects", results);
}

function tick(): void {
  forAllDimensions((dim) => {
    for (const entity of dim.getEntities()) {
      const effects = CustomEffectUtils.getAll(entity);
      effects.forEach((instance) => {
        const effect = customEffectRegistry.get(instance.effect);
        const event = new CustomEffectTickEvent(entity, instance);
        if (effect?.onTick) effect.onTick(event);
      });
      if (system.currentTick % 20 !== 0) return;
      decreaseDuration(entity, effects);
    }
  });
}

function callHandle(name: string, entity: Entity | undefined, event: any): void {
  if (!entity) return;
  for (const k of customEffectRegistry.keys()) {
    const effect = customEffectRegistry.get(k);
    if (!effect || !entity || !entity.isValid) continue;
    if (!CustomEffectUtils.has(entity, k)) continue;
    const func = effect[name as keyof CustomEffect];
    if (!func) continue;
    if (typeof func !== "function") continue;
    func(event);
  }
}

function init(): void {
  initialized = true;

  system.runInterval(tick);

  // CUSTOM EVENTS

  EntityEvents.mount.subscribe((event) => {
    callHandle("onMount", event.entity, event);
  });
  EntityEvents.dismount.subscribe((event) => {
    callHandle("onDismount", event.entity, event);
  });
  EntityEvents.moved.subscribe((event) => {
    callHandle("onMoved", event.entity, event);
  });
  EntityEvents.tick.subscribe((event) => {
    callHandle("onTick", event.entity, event);
  });
  EntityEvents.fallOn.subscribe((event) => {
    callHandle("onFallOn", event.entity, event);
  });
  EntityEvents.stepOn.subscribe((event) => {
    callHandle("onStepOn", event.entity, event);
  });
  EntityEvents.stepOff.subscribe((event) => {
    callHandle("onStepOff", event.entity, event);
  });

  // EVENTS

  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    callHandle("onInteract", event.target, event);
  });
  world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    callHandle("onBeforeInteract", event.target, event);
  });
  world.beforeEvents.entityRemove.subscribe((event) => {
    callHandle("onRemove", event.removedEntity, event);
  });
  world.afterEvents.entityDie.subscribe((event) => {
    callHandle("onDie", event.deadEntity, event);
  });
  world.afterEvents.entityHealthChanged.subscribe((event) => {
    callHandle("onHealthChanged", event.entity, event);
  });
  world.afterEvents.entityHitBlock.subscribe((event) => {
    callHandle("onHitBlock", event.damagingEntity, event);
  });
  world.afterEvents.entityHitEntity.subscribe((event) => {
    callHandle("onHitEntity", event.damagingEntity, event);
  });
  world.afterEvents.entityHurt.subscribe((event) => {
    callHandle("onHurt", event.hurtEntity, event);
  });
  world.afterEvents.entityLoad.subscribe((event) => {
    callHandle("onLoad", event.entity, event);
  });
  world.afterEvents.entitySpawn.subscribe((event) => {
    callHandle("onSpawn", event.entity, event);
  });
}
