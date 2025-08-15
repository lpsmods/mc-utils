import {
  PlayerInteractWithEntityAfterEvent,
  Dimension,
  Entity,
  EntityQueryOptions,
  world,
  Vector3,
  EntityDieAfterEvent,
  EntityRemoveBeforeEvent,
  EntityHealthChangedAfterEvent,
  EntityHitBlockAfterEvent,
  EntityHitEntityAfterEvent,
  EntityHurtAfterEvent,
  EntityLoadAfterEvent,
  EntitySpawnAfterEvent,
  Block,
  EntityInventoryComponent,
  system,
} from "@minecraft/server";
import { MathUtils } from "../MathUtils";
import { EntityEvents } from "../event/entity";
import { Hasher } from "../type";
import { RandomUtils } from "../RandomUtils";
import { forAllDimensions } from "../utils";
import { Vector3Utils } from "@minecraft/math";

export class EntityEvent {
  readonly entity: Entity;
  readonly dimension: Dimension;

  constructor(dimension: Dimension, entity: Entity) {
    this.dimension = dimension;
    this.entity = entity;
  }
}

export class EntityInventoryChangedEvent extends EntityEvent {
  constructor(dimension: Dimension, entity: Entity) {
    super(dimension, entity);
  }
}

export class EntityTickEvent extends EntityEvent {}

export class EntityMovedEvent extends EntityEvent {
  readonly prevLocation: Vector3;

  constructor(dimension: Dimension, entity: Entity, prevLocation: Vector3) {
    super(dimension, entity);
    this.prevLocation = prevLocation;
  }
}

export class EntityMountEnterEvent extends EntityEvent {
  rider: Entity;
  constructor(dimension: Dimension, entity: Entity, rider: Entity) {
    super(dimension, entity);
    this.rider = rider;
  }
}

export class EntityMountExitEvent extends EntityEvent {
  rider: Entity;
  constructor(dimension: Dimension, entity: Entity, rider: Entity) {
    super(dimension, entity);
    this.rider = rider;
  }
}

export class EntityFallOnEvent extends EntityEvent {
  fallDistance: number;
  constructor(entity: Entity, fallDistance: number) {
    super(entity.dimension, entity);
    this.fallDistance = fallDistance;
  }
}

export class EntityStepOnEvent extends EntityEvent {
  block: Block;
  constructor(entity: Entity, block: Block) {
    super(entity.dimension, entity);
    this.block = block;
  }
}

export class EntityStepOffEvent extends EntityEvent {
  block: Block;
  constructor(entity: Entity, block: Block) {
    super(entity.dimension, entity);
    this.block = block;
  }
}

// TODO: Error when falling block falls from a high height.
export class EntityHandler {
  static all = new Map<string, EntityHandler>();
  options: EntityQueryOptions;
  entity?: Entity;
  readonly id: string;

  constructor(options: EntityQueryOptions, id?: string) {
    this.options = options;
    this.id = id ?? RandomUtils.id(4);
    EntityHandler.all.set(this.id, this);
  }

  /**
   * Unregister api events.
   */
  remove(): void {
    EntityHandler.all.delete(this.id);
  }

  // CUSTOM EVENTS

  /**
   * This function will be called when a entity mounts another entity.
   * @param {EntityMountEnterEvent} event
   */
  onMount?(event: EntityMountEnterEvent): void {}

  /**
   * This function will be called when a entity dismounts another entity.
   * @param {EntityMountExitEvent} event
   */
  onDismount?(event: EntityMountExitEvent): void {}

  /**
   * This function will be called when a entity's inventory changes.
   * @param {EntityInventoryChangedEvent} event
   */
  onInventoryChanged?(event: EntityInventoryChangedEvent): void {}

  /**
   * This function will be called when a entity moves.
   * @param {EntityMovedEvent} event
   */
  onMoved?(event: EntityMovedEvent): void {}

  // EVENTS

  /**
   * This function will be called when a entity ticks.
   * @param {EntityTickEvent} event
   */
  onTick?(event: EntityTickEvent): void {}

  /**
   * This function will be called when a player interacts with a entity.
   * @param {PlayerInteractWithEntityAfterEvent} event
   */
  onPlayerInteract?(event: PlayerInteractWithEntityAfterEvent): void {}

  /**
   * This function will be called when a entity is removed.
   * @param {EntityRemoveBeforeEvent} event
   */
  onRemove?(event: EntityRemoveBeforeEvent): void {}

  /**
   * This function will be called when a entity dies.
   * @param {EntityDieAfterEvent} event
   */
  onDie?(event: EntityDieAfterEvent): void {}

  /**
   * This function will be called when a entity's health has changed.
   * @param {EntityHealthChangedAfterEvent} event
   */
  onHealthChanged?(event: EntityHealthChangedAfterEvent): void {}

  /**
   * This function will be called when a entity hits a block.
   * @param {EntityHitBlockAfterEvent} event
   */
  onHitBlock?(event: EntityHitBlockAfterEvent): void {}

  /**
   *  This function will be called when a entity hits another entity.
   * @param {EntityHitEntityAfterEvent} event
   */
  onHitEntity?(event: EntityHitEntityAfterEvent): void {}

  /**
   * This function will be called when a entity is hurt.
   * @param {EntityHurtAfterEvent} event
   */
  onHurt?(event: EntityHurtAfterEvent): void {}

  /**
   * This function will be called when a entity is loaded.
   * @param {EntityLoadAfterEvent} event
   */
  onLoad?(event: EntityLoadAfterEvent): void {}

  /**
   * This function will be called when a entity spawned.
   * @param {EntitySpawnAfterEvent} event
   */
  onSpawn?(event: EntitySpawnAfterEvent): void {}

  /**
   * This function will be called when a entity falls on a block.
   * @param {EntityFallOnEvent} event
   */
  onFallOn?(event: EntityFallOnEvent): void {}

  /**
   * This function will be called when a entity steps on a block.
   * @param {EntityStepOnEvent} event
   */
  onStepOn?(event: EntityStepOnEvent): void {}

  /**
   * This function will be called when a entity steps off a block.
   * @param {EntityStepOffEvent} event
   */
  onStepOff?(event: EntityStepOffEvent): void;
}

// TODO: Replace with EntityEvents
function inventoryTick(
  handler: EntityHandler,
  inv: EntityInventoryComponent,
  entity: Entity
): void {
  if (!inv.container) return;
  const currentHash = Hasher.stringify(inv.container);
  const prevHash = entity.getDynamicProperty("mcutils:prev_inv");
  if (currentHash !== prevHash) {
    entity.setDynamicProperty("mcutils:prev_inv", currentHash);
    const event = new EntityInventoryChangedEvent(entity.dimension, entity);
    if (handler.onInventoryChanged) handler.onInventoryChanged(event);
  }
}

function mountEntityTick(handler: EntityHandler, entity: Entity): void {
  const riding = entity.getComponent("riding");
  if (riding) {
    let lastMount = entity.getDynamicProperty("mcutils:last_mount");
    let target = riding.entityRidingOn.id;
    if (target != lastMount) {
      entity.setDynamicProperty("mcutils:last_mount", target);
    }
    return;
  }
  let id = entity.getDynamicProperty("mcutils:last_mount") as string;
  if (id) {
    const mountEvent = new EntityMountExitEvent(
      entity.dimension,
      world.getEntity(id) ?? entity,
      entity
    );
    entity.setDynamicProperty("mcutils:last_mount", undefined);
    entity.removeTag("mcutils_riding");
    if (handler.onDismount) handler.onDismount(mountEvent);
  }
}

function mountTick(handler: EntityHandler, event: EntityTickEvent): void {
  forAllDimensions((dim) => {
    for (const entity of dim.getEntities({ tags: ["mcutils_riding"] })) {
      mountEntityTick(handler, entity);
    }
  });
}

function movedTick(handler: EntityHandler, event: EntityTickEvent): void {
  const value = (event.entity.getDynamicProperty("mcutils:prev_location") as string) ?? "0,0,0";
  const prevPos = Hasher.parseVec3(value);
  const pos = event.entity.location;
  pos.x = Math.round(pos.x * 100) / 100;
  pos.y = Math.round(pos.y * 100) / 100;
  pos.z = Math.round(pos.z * 100) / 100;
  if (Vector3Utils.equals(prevPos, pos)) return;
  event.entity.setDynamicProperty("mcutils:prev_location", Hasher.stringify(pos));
  if (handler.onMoved)
    handler.onMoved(new EntityMovedEvent(event.entity.dimension, event.entity, prevPos));

  // Step on
  const newBlock = event.entity.dimension.getBlock(pos)?.below();
  const prevBlock = event.entity.dimension.getBlock(prevPos)?.below();
  if (!newBlock || !prevBlock) return;
  const newHash = Hasher.stringify(newBlock);
  const prevHash = Hasher.stringify(prevBlock);
  if (newHash === prevHash) return;
  if (handler.onStepOff) handler.onStepOff(new EntityStepOnEvent(event.entity, prevBlock));
  if (handler.onStepOn) handler.onStepOn(new EntityStepOnEvent(event.entity, newBlock));
}

function entityTick(handler: EntityHandler, event: EntityTickEvent): void {
  mountTick(handler, event);
  if (handler.onTick) handler.onTick(event);
  const inv = event.entity.getComponent("inventory");
  if (inv) inventoryTick(handler, inv, event.entity);
  movedTick(handler, event);

  // Fall
  let fallingPos = event.entity.getDynamicProperty("mcutils:falling_pos") as Vector3 | undefined;
  if (fallingPos == undefined && event.entity.isFalling) {
    // TODO: Save pos
    fallingPos = event.entity.location;
    event.entity.setDynamicProperty("mcutils:falling_pos", fallingPos);
  }

  if (fallingPos && event.entity.isOnGround) {
    let dif = Vector3Utils.floor(Vector3Utils.subtract(event.entity.location, fallingPos));
    event.entity.setDynamicProperty("mcutils:falling_pos");
    if (handler.onFallOn) handler.onFallOn(new EntityFallOnEvent(event.entity, dif.y));
  }
}

// Subscribe to vanilla api events.

function tick(): void {
  for (const handler of EntityHandler.all.values()) {
    // Players
    if (handler.options.type === "minecraft:player") {
      for (const player of world.getAllPlayers()) {
        if (!player.matches(handler.options)) return;
        const event = new EntityTickEvent(player.dimension, player);
        entityTick(handler, event);
      }
      continue;
    }
    // Mobs
    forAllDimensions((dim) => {
      for (const entity of dim.getEntities(handler.options)) {
        const event = new EntityTickEvent(dim, entity);
        entityTick(handler, event);
      }
    });
  }
}

function playerInteract(event: PlayerInteractWithEntityAfterEvent): void {
  if (!event.target) return;
  for (const handler of EntityHandler.all.values()) {
    if (!event.target.matches(handler.options)) continue;
    if (handler.onPlayerInteract) handler.onPlayerInteract(event);
    // Mountable
    if (event.player.isSneaking || event.player.hasTag("mcutils_riding")) continue;
    const rideable = event.target.getComponent("rideable");
    if (!rideable) continue;
    const mountEvent = new EntityMountEnterEvent(
      event.target.dimension,
      event.target,
      event.player
    );
    event.player.addTag("mcutils_riding");
    if (handler.onMount) handler.onMount(mountEvent);
  }
}

function callHandle(name: string, entity: Entity | undefined, event: any): void {
  if (!entity) return;
  for (const handler of EntityHandler.all.values()) {
    if (!entity.matches(handler.options)) continue;
    const func = handler[name as keyof EntityHandler];
    if (!func) continue;
    if (typeof func !== "function") continue;
    func(event);
  }
}

// TODO: Check all handlers to see if they hook into an event.
function main() {
  system.runInterval(tick);
  world.afterEvents.playerInteractWithEntity.subscribe(playerInteract);


  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    callHandle("onPlayerInteract", event.player, event);
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

main();
