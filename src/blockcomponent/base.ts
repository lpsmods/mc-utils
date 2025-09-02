import {
  Block,
  BlockComponentTickEvent,
  Direction,
  BlockComponentOnPlaceEvent,
  CustomComponentParameters,
  Entity,
  BlockComponentPlayerPlaceBeforeEvent,
  BlockComponentEntityFallOnEvent,
  BlockComponentPlayerBreakEvent,
  BlockComponentPlayerInteractEvent,
  BlockComponentRandomTickEvent,
  BlockComponentStepOffEvent,
  BlockComponentStepOnEvent,
  Vector3,
  system,
} from "@minecraft/server";
import { WorldUtils } from "../world/utils";
import { Hasher } from "../type";
import { BlockUtils } from "../block/utils";
import { BlockEvent, InBlockTickEvent } from "../event/block";

export class NeighborUpdateEvent extends BlockEvent {
  constructor(block: Block, sourceBlock: Block, direction?: Direction) {
    super(block);
    this.sourceBlock = sourceBlock;
    this.direction = direction;
  }

  /**
   * The block that was updated next to `block`
   */
  readonly sourceBlock: Block;

  /**
   * The direction the update came from.
   */
  readonly direction?: Direction;
}

export class NearbyEntityBlockEvent extends BlockEvent {
  constructor(block: Block, entity: Entity) {
    super(block);
    this.entity = entity;
  }

  /**
   * The nearby entity.
   */
  readonly entity: Entity;
}

export class EnterBlockEvent extends NearbyEntityBlockEvent {
  constructor(block: Block, source: Entity, sameBlockType: boolean) {
    super(block, source);
    this.sameBlockType = sameBlockType;
  }

  /**
   * True if the entered block is the same type as the last block.
   */
  readonly sameBlockType: boolean;
}

export class LeaveBlockEvent extends NearbyEntityBlockEvent {
  constructor(block: Block, source: Entity, sameBlockType: boolean) {
    super(block, source);
    this.sameBlockType = sameBlockType;
  }

  /**
   * True if the entered block is the same type as the last block.
   */
  readonly sameBlockType: boolean;
}

export class ScheduledBlockEvent extends BlockEvent {}

export interface ScheduledEvent {
  callback: (
    event: ScheduledBlockEvent,
    args: CustomComponentParameters,
  ) => void;
  timeLeft: number;
  totalTimeLeft: number;
  block: Block;
}

/**
 * Custom block component containing additional block events.
 */
export abstract class BlockBaseComponent {
  static components: BlockBaseComponent[] = [];
  private scheduledEvents = new Set<ScheduledEvent>();

  constructor() {}

  destroy = BlockUtils.destroy;

  baseTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    this.afterTick(event, args);
    this.enterLeaveTick(event, args);
    this.neighborTick(event, args);
  }

  basePlace(
    event: BlockComponentOnPlaceEvent,
    args: CustomComponentParameters,
  ): void {
    for (const direction in Direction) {
      const sourceBlock = event.block.offset(WorldUtils.dir2Offset(direction));
      if (!sourceBlock) continue;
      const updateEvent = new NeighborUpdateEvent(
        event.block,
        sourceBlock,
        direction as Direction,
      );
      this.onNeighborUpdate(updateEvent, args);
    }
  }

  isInBlock(block: Block, entity: Entity): boolean {
    return (
      Math.floor(entity.location.x) == block.location.x &&
      Math.floor(entity.location.y) == block.location.y &&
      Math.floor(entity.location.z) == block.location.z
    );
  }

  // TODO: Tick is per block instance (more blocks screws w/ timing)
  afterTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    for (const e of this.scheduledEvents) {
      if (e.timeLeft > 0) {
        e.timeLeft--;
        continue;
      }
      try {
        if (event.block.typeId !== e.block.typeId) return;
        const sEvent = new ScheduledBlockEvent(e.block);
        e.callback(sEvent, args);
      } finally {
        this.scheduledEvents.delete(e);
      }
    }
  }

  enterLeaveTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    const entities = event.dimension.getEntities({
      maxDistance: 1.5,
      location: event.block.location,
    });
    const hash = Hasher.stringify(event.block);
    for (const entity of entities) {
      this.onNearbyEntityTick(
        new NearbyEntityBlockEvent(event.block, entity),
        args,
      );
      let eBlock = entity.dimension.getBlock(entity.location);
      let blk = entity.getDynamicProperty("mcutils:in_block") as string;
      let block = Hasher.parseBlock(blk);
      let bl = this.isInBlock(event.block, entity);
      if (bl) this.inBlockTick(new InBlockTickEvent(event.block, entity), args);
      if (bl && blk !== hash) {
        entity.setDynamicProperty("mcutils:in_block", hash);
        let same = event.block.typeId == block?.typeId;
        this.onEnter(new EnterBlockEvent(event.block, entity, same), args);
        continue;
      }
      if (!bl && blk === hash) {
        let same = event.block?.typeId == eBlock?.typeId;
        this.onLeave(new LeaveBlockEvent(event.block, entity, same), args);
        entity.setDynamicProperty("mcutils:in_block", Hasher.stringify(eBlock));
      }
    }
  }

  neighborTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    const direction = BlockUtils.getNeighborUpdate(event);
    if (!direction) return;
    const updateBlock = event.block.offset(WorldUtils.dir2Offset(direction));
    if (!updateBlock) return;
    this.onNeighborUpdate(
      new NeighborUpdateEvent(event.block, updateBlock, direction),
      args,
    );
  }

  update(block: Block, args: CustomComponentParameters): void {
    const event = new NeighborUpdateEvent(block, block);
    this.onNeighborUpdate(event, args);
  }

  spawnParticle(block: Block, effectName: string, location?: Vector3) {
    const loc = location ?? { x: 0, y: 0, z: 0 };
    const pos = {
      x: block.location.x + 0.5 + loc.x / 16,
      y: block.location.y + loc.y / 16,
      z: block.location.z + 0.5 + loc.z / 16,
    };
    block.dimension.spawnParticle(effectName, pos);
  }

  after(
    block: Block,
    callback: (
      event: ScheduledBlockEvent,
      args: CustomComponentParameters,
    ) => void,
    tickDelay: number,
  ) {
    this.scheduledEvents.add({
      callback: callback,
      block: block,
      totalTimeLeft: tickDelay,
      timeLeft: tickDelay,
    });
  }

  // CUSTOM EVENTS

  /**
   * This function will be called when an entity is nearby.
   * @param {NearbyEntityBlockEvent} event
   */
  onNearbyEntityTick(
    event: NearbyEntityBlockEvent,
    args: CustomComponentParameters,
  ): void {}

  /**
   * This function will be called when a block has been placed/updated next to this block. (Requires neighborTick)
   * @param {NeighborUpdateEvent} event
   */
  onNeighborUpdate(
    event: NeighborUpdateEvent,
    args: CustomComponentParameters,
  ): void {}

  /**
   * This function will be called when an entity has entered the block. (Requires enterLeaveTick)
   * @param {EnterBlockEvent} event
   * @param {CustomComponentParameters} args
   */
  onEnter(event: EnterBlockEvent, args: CustomComponentParameters): void {}

  /**
   * This function will be called when an entity has left the block. (Requires enterLeaveTick)
   * @param {LeaveBlockEvent} event
   * @param {CustomComponentParameters} args
   */
  onLeave(event: LeaveBlockEvent, args: CustomComponentParameters): void {}

  /**
   * This function will be called when an entity is in the block. (Requires enterLeaveTick)
   * @param {InBlockTickEvent} event
   * @param {CustomComponentParameters} args
   */
  inBlockTick(event: InBlockTickEvent, args: CustomComponentParameters): void {}

  // EVENTS

  /**
   * This function will be called before a player places the block.
   */
  beforeOnPlayerPlace?(
    event: BlockComponentPlayerPlaceBeforeEvent,
    args: CustomComponentParameters,
  ): void;

  /**
   * This function will be called when an entity falls onto the block that this custom component is bound to.
   */
  onEntityFallOn?(
    event: BlockComponentEntityFallOnEvent,
    args: CustomComponentParameters,
  ): void;

  /**
   * This function will be called when the block that this custom component is bound to is placed.
   */
  onPlace?(
    event: BlockComponentOnPlaceEvent,
    args: CustomComponentParameters,
  ): void;

  /**
   * This function will be called when a player breaks the block.
   */
  onPlayerBreak?(
    event: BlockComponentPlayerBreakEvent,
    args: CustomComponentParameters,
  ): void;

  /**
   * This function will be called when a player successfully interacts with the block that this custom component is bound to.
   */
  onPlayerInteract?(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters,
  ): void;

  /**
   * This function will be called when a block randomly ticks.
   */
  onRandomTick?(
    event: BlockComponentRandomTickEvent,
    args: CustomComponentParameters,
  ): void;

  /**
   * This function will be called when an entity steps off the block that this custom component is bound to.
   */
  onStepOff?(
    event: BlockComponentStepOffEvent,
    args: CustomComponentParameters,
  ): void;

  /**
   * This function will be called when an entity steps onto the block that this custom component is bound to.
   */
  onStepOn?(
    event: BlockComponentStepOnEvent,
    args: CustomComponentParameters,
  ): void;

  /**
   * This function will be called when a block ticks.
   */
  onTick?(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void;
}
