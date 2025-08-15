// TODO:

import { Block, Dimension } from "@minecraft/server";
import { EventSignal } from ".";

export class BlockEvent {
  constructor(block: Block, dimension?: Dimension) {
    this.block = block;
    this.dimension = dimension ?? block.dimension;
  }

  readonly block: Block;
  readonly dimension: Dimension;
}

export class BlockNearbyEntityTickEvent extends BlockEvent {}
export class BlockNeighborUpdateEvent extends BlockEvent {}
export class BlockEnterEvent extends BlockEvent {}
export class BlockLeaveEvent extends BlockEvent {}
export class InBlockTickEvent extends BlockEvent {}

export class BlockNearbyEntityTickEventSignal extends EventSignal<BlockNearbyEntityTickEvent> {
  constructor() {
    super();
  }
}
export class BlockNeighborUpdateEventSignal extends EventSignal<BlockNeighborUpdateEvent> {
  constructor() {
    super();
  }
}
export class BlockEnterEventSignal extends EventSignal<BlockEnterEvent> {
  constructor() {
    super();
  }
}
export class BlockLeaveEventSignal extends EventSignal<BlockLeaveEvent> {
  constructor() {
    super();
  }
}
export class InBlockTickEventSignal extends EventSignal<InBlockTickEvent> {
  constructor() {
    super();
  }
}

export class BlockEvents {
  private constructor() {}

  /**
   * This event fires every tick a entity is near a block.
   */
  static readonly nearbyEntityTick = new BlockNearbyEntityTickEventSignal();

  /**
   * This event fires when a block has updated.
   */
  static readonly neighborUpdate = new BlockNeighborUpdateEventSignal();

  /**
   * This event fires when an entity enters a block.
   */
  static readonly enter = new BlockEnterEventSignal();

  /**
   * This event fires when a entity leaves a block.
   */
  static readonly leave = new BlockLeaveEventSignal();

  /**
   * This event fires every tick a entity is in a block.
   */
  static readonly inBlockTick = new InBlockTickEventSignal();
}

function setup(): void {}

setup();
