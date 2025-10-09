import {
  Block,
  Entity,
  EntityQueryOptions,
  InvalidEntityError,
  LocationOutOfWorldBoundariesError,
  PlayerInteractWithEntityAfterEvent,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { EventSignal } from "./utils";
import { forAllDimensions } from "../utils";
import { Vector3Utils } from "@minecraft/math";
import { Hasher } from "../type";
import { ErrorUtils } from "../error";
import { ChunkUtils } from "../chunk";

export abstract class EntityEvent {
  constructor(entity: Entity) {
    this.entity = entity;
  }

  readonly entity: Entity;
}

export abstract class EntityBlockEvent extends EntityEvent {
  constructor(entity: Entity, block: Block) {
    super(entity);
    this.block = block;
  }

  readonly block: Block;
}

export class EntityMountEvent extends EntityEvent {
  constructor(entity: Entity, rider: Entity) {
    super(entity);
    this.rider = rider;
  }

  readonly rider: Entity;
}

export class EntityDismountEvent extends EntityEvent {
  constructor(entity: Entity, rider: Entity) {
    super(entity);
    this.rider = rider;
  }

  readonly rider: Entity;
}

export class EntityMovedEvent extends EntityEvent {
  constructor(entity: Entity, prevLocation: Vector3) {
    super(entity);
    this.prevLocation = prevLocation;

    const pos = Vector3Utils.floor(entity.location);
    const prev = Vector3Utils.floor(prevLocation);
    this.movedBlock = !Vector3Utils.equals(pos, prev);
    const cPos = ChunkUtils.pos(pos);
    const cPrev = ChunkUtils.pos(prev);
    this.movedChunk = cPos.x != cPrev.x || cPos.z != cPrev.z;
  }

  /**
   * The previous entity location.
   */
  readonly prevLocation: Vector3;

  /**
   * Whether or not the player moved to a new block.
   */
  readonly movedBlock: boolean;

  /**
   * Whether or not the player moved to a new chunk.
   */
  readonly movedChunk: boolean;
}

export class EntityFallOnEvent extends EntityEvent {
  constructor(entity: Entity, distance: number) {
    super(entity);
    this.distance = distance;
  }

  readonly distance: number;
}

export class EntityTickEvent extends EntityEvent {}

export class EntityStepOnEvent extends EntityBlockEvent {}

export class EntityStepOffEvent extends EntityBlockEvent {}

export class EntityEnterBlockEvent extends EntityBlockEvent {
  constructor(entity: Entity, block: Block, previousBlock?: Block) {
    super(entity, block);
    this.previousBlock = previousBlock;
    this.sameType = !previousBlock || block.matches(previousBlock.typeId);
  }

  readonly previousBlock?: Block;

  /**
   * Whether or not the current and previous block are the same type.
   */
  readonly sameType: boolean;
}

export class EntityLeaveBlockEvent extends EntityBlockEvent {
  constructor(entity: Entity, block: Block, newBlock?: Block) {
    super(entity, block);
    this.newBlock = newBlock;
    this.sameType = !newBlock || block.matches(newBlock.typeId);
  }

  readonly newBlock?: Block;

  /**
   * Whether or not the current and new block are the same type.
   */
  readonly sameType: boolean;
}

export class EntityInBlockTickEvent extends EntityBlockEvent {}

export abstract class EntityEventSignal<T extends EntityEvent> extends EventSignal<T, EntityQueryOptions> {
  apply(event: T): void {
    for (const fn of this.listeners) {
      if (!event.entity.isValid) continue;
      if (fn.options && !event.entity.matches(fn.options)) continue;
      try {
        fn.callback(event);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export class EntityMountEventSignal extends EntityEventSignal<EntityMountEvent> {}

export class EntityDismountEventSignal extends EntityEventSignal<EntityDismountEvent> {}

export class EntityMovedEventSignal extends EntityEventSignal<EntityMovedEvent> {}

export class EntityTickEventSignal extends EntityEventSignal<EntityTickEvent> {}

export class EntityFallOnEventSignal extends EntityEventSignal<EntityFallOnEvent> {}

export class EntityStepOnEventSignal extends EntityEventSignal<EntityStepOnEvent> {}

export class EntityStepOffEventSignal extends EntityEventSignal<EntityStepOffEvent> {}

export class EntityEnterBlockEventSignal extends EntityEventSignal<EntityEnterBlockEvent> {}

export class EntityLeaveBlockEventSignal extends EntityEventSignal<EntityLeaveBlockEvent> {}

export class EntityInBlockTickEventSignal extends EntityEventSignal<EntityInBlockTickEvent> {}

/**
 * Custom entity events
 */
export class EntityEvents {
  private constructor() {}

  /**
   * This event fires when a entity mounts.
   * @eventProperty
   */
  static readonly mount = new EntityMountEventSignal();

  /**
   * This event fires when a entity dismounts.
   * @eventProperty
   */
  static readonly dismount = new EntityDismountEventSignal();

  /**
   * This event fires when a entity moves.
   * @eventProperty
   */
  static readonly moved = new EntityMovedEventSignal();

  /**
   * This event fires every tick.
   * @eventProperty
   */
  static readonly tick = new EntityTickEventSignal();

  /**
   * This event fires when a entity falls on the ground.
   * @eventProperty
   */
  static readonly fallOn = new EntityFallOnEventSignal();

  /**
   * This event fires when a entity steps on a block.
   * @eventProperty
   */
  static readonly stepOn = new EntityStepOnEventSignal();

  /**
   * This event fires when a entity steps off a block.
   * @eventProperty
   */
  static readonly stepOff = new EntityStepOffEventSignal();

  /**
   * This event fires when an entity enters a block.
   * @eventProperty
   */
  static readonly enterBlock = new EntityEnterBlockEventSignal();

  /**
   * This event fires when a entity leaves a block.
   * @eventProperty
   */
  static readonly leaveBlock = new EntityLeaveBlockEventSignal();

  /**
   * This event fires every tick a entity is in a block.
   * @eventProperty
   */
  static readonly inBlockTick = new EntityInBlockTickEventSignal();

  static get size(): number {
    return (
      this.mount.size +
      this.dismount.size +
      this.moved.size +
      this.tick.size +
      this.fallOn.size +
      this.stepOn.size +
      this.stepOff.size +
      this.enterBlock.size +
      this.leaveBlock.size +
      this.inBlockTick.size
    );
  }
}

// INTERNAL LOGIC

function mountEntityTick(entity: Entity): void {
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
    const mountEvent = new EntityDismountEvent(world.getEntity(id) ?? entity, entity);
    entity.setDynamicProperty("mcutils:last_mount", undefined);
    entity.removeTag("mcutils_riding");
    EntityEvents.dismount.apply(mountEvent);
  }
}

function mountTick(event: EntityTickEvent): void {
  forAllDimensions((dim) => {
    for (const entity of dim.getEntities({ tags: ["mcutils_riding"] })) {
      mountEntityTick(entity);
    }
  });
}

function movedTick(event: EntityTickEvent): void {
  const dim = event.entity.dimension;
  const value = (event.entity.getDynamicProperty("mcutils:prev_location") as string) ?? "0,0,0";
  const prevPos = Hasher.parseVec3(value);
  const pos = event.entity.location;
  pos.x = Math.round(pos.x * 100) / 100;
  pos.y = Math.round(pos.y * 100) / 100;
  pos.z = Math.round(pos.z * 100) / 100;
  if (Vector3Utils.equals(prevPos, pos)) return;
  event.entity.setDynamicProperty("mcutils:prev_location", Hasher.stringify(pos));
  const movedEvent = new EntityMovedEvent(event.entity, prevPos);
  EntityEvents.moved.apply(movedEvent);

  if (!movedEvent.movedBlock) return;

  // Enter block
  let block = undefined;
  let prevBlock = undefined;
  try {
    block = dim.getBlock(pos);
    prevBlock = dim.getBlock(prevPos);
  } catch (err) {}
  if (prevBlock) {
    EntityEvents.leaveBlock.apply(new EntityLeaveBlockEvent(event.entity, prevBlock, block));
  }
  if (block) {
    EntityEvents.enterBlock.apply(new EntityEnterBlockEvent(event.entity, block, prevBlock));
  }

  // Step on/off
  ErrorUtils.wrapCatch(LocationOutOfWorldBoundariesError, () => {
    const newBlock = block?.below();
    const prevBlock2 = prevBlock?.below();
    if (!newBlock || !prevBlock2) return;
    const newHash = Hasher.stringify(newBlock);
    const prevHash = Hasher.stringify(prevBlock2);
    if (newHash === prevHash) return;
    EntityEvents.stepOn.apply(new EntityStepOnEvent(event.entity, newBlock));
    EntityEvents.stepOff.apply(new EntityStepOnEvent(event.entity, prevBlock2));
  });
}

function entityTick(event: EntityTickEvent): void {
  mountTick(event);
  EntityEvents.tick.apply(event);
  movedTick(event);

  // in block
  let block = undefined;
  try {
    block = event.entity.dimension.getBlock(event.entity.location);
  } catch (err) {}
  if (block) {
    EntityEvents.inBlockTick.apply(new EntityInBlockTickEvent(event.entity, block));
  }

  // Fall
  let fallingPos = event.entity.getDynamicProperty("mcutils:falling_pos") as Vector3 | undefined;
  if (fallingPos == undefined && event.entity.isFalling) {
    fallingPos = event.entity.location;
    event.entity.setDynamicProperty("mcutils:falling_pos", fallingPos);
  }

  if (fallingPos && event.entity.isOnGround) {
    let dif = Vector3Utils.floor(Vector3Utils.subtract(fallingPos, event.entity.location));
    event.entity.setDynamicProperty("mcutils:falling_pos");
    EntityEvents.fallOn.apply(new EntityFallOnEvent(event.entity, dif.y));
  }
}

function tick(): void {
  try {
    forAllDimensions((dim) => {
      for (const entity of dim.getEntities()) {
        const event = new EntityTickEvent(entity);
        entityTick(event);
      }
    });
  } catch (err) {
    if (err instanceof InvalidEntityError) return;
    throw err;
  }
}

function playerInteract(event: PlayerInteractWithEntityAfterEvent): void {
  try {
    // Mountable
    if (event.player.isSneaking || event.player.hasTag("mcutils_riding")) return;
    const rideable = event.target.getComponent("rideable");
    if (!rideable) return;
    const mountEvent = new EntityMountEvent(event.target, event.player);
    event.player.addTag("mcutils_riding");
    EntityEvents.mount.apply(mountEvent);
  } catch (err) {
    if (err instanceof InvalidEntityError) return;
    throw err;
  }
}

function init() {
  system.runInterval(tick);
  world.afterEvents.playerInteractWithEntity.subscribe(playerInteract);
}

init();
