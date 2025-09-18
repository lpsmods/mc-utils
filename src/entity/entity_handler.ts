import {
  PlayerInteractWithEntityAfterEvent,
  Entity,
  EntityQueryOptions,
  world,
  EntityDieAfterEvent,
  EntityRemoveBeforeEvent,
  EntityHealthChangedAfterEvent,
  EntityHitBlockAfterEvent,
  EntityHitEntityAfterEvent,
  EntityHurtAfterEvent,
  EntityLoadAfterEvent,
  EntitySpawnAfterEvent,
  PlayerInteractWithEntityBeforeEvent,
} from "@minecraft/server";

import { RandomUtils } from "../random";
import {
  EntityDismountEvent,
  EntityEvents,
  EntityFallOnEvent,
  EntityMountEvent,
  EntityMovedEvent,
  EntityStepOffEvent,
  EntityStepOnEvent,
  EntityTickEvent,
} from "../event/entity";
import { forAllDimensions } from "../utils";

let initialized = false;

// TODO: Error when falling block falls from a high height.
export class EntityHandler {
  static all = new Map<string, EntityHandler>();
  options: EntityQueryOptions;
  entity?: Entity;
  readonly id: string;

  constructor(options: EntityQueryOptions, handleId?: string) {
    this.options = options;
    this.id = handleId ?? RandomUtils.id(4);
    EntityHandler.all.set(this.id, this);
    if (!initialized) init();
  }

  /**
   * Remove all entities from the world.
   */
  removeAll(): void {
    this.getEntities().forEach((entity) => entity.remove());
  }

  /**
   * Get all entities from all dimensions
   * @param {EntityQueryOptions} options Additional options
   * @returns {Entity[]}
   */
  getEntities(options?: EntityQueryOptions): Entity[] {
    const results: Entity[] = [];
    forAllDimensions((dim) => {
      for (const entity of dim.getEntities({ ...this.options, ...(options ?? {}) })) {
        results.push(entity);
      }
    });
    return results;
  }

  /**
   * Unregister api events.
   */
  delete(): void {
    EntityHandler.all.delete(this.id);
  }

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
   * Fires when a entity ticks.
   * @param {EntityTickEvent} event
   */
  onTick?(event: EntityTickEvent): void {}

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

function callHandle(name: string, entity: Entity | undefined, event: any): void {
  if (!entity) return;
  for (const handler of EntityHandler.all.values()) {
    if (!entity || !entity.isValid || !entity.matches(handler.options ?? {})) continue;
    const func = handler[name as keyof EntityHandler];
    if (!func) continue;
    if (typeof func !== "function") continue;
    func(event);
  }
}

function init() {
  initialized = true;

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
