// TODO: Implement

import { Block, Dimension } from "@minecraft/server";
import { EventSignal } from "./utils";

export abstract class BlockEvent {
  constructor(block: Block, dimension?: Dimension) {
    this.block = block;
    this.dimension = dimension ?? block.dimension;
  }

  readonly block: Block;
  readonly dimension: Dimension;
}

export class BlockNearbyEntityTickEvent extends BlockEvent {}

export class BlockNeighborUpdateEvent extends BlockEvent {}

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
/**
 * Custom block events.
 */
export class BlockEvents {
  private constructor() {}

  /**
   * This event fires every tick a entity is near a block.
   * @eventProperty
   */
  static readonly nearbyEntityTick = new BlockNearbyEntityTickEventSignal();

  /**
   * This event fires when a block has updated.
   * @eventProperty
   */
  static readonly neighborUpdate = new BlockNeighborUpdateEventSignal();

  static get size(): number {
    return this.nearbyEntityTick.size + this.neighborUpdate.size;
  }
}

function init() {}

init();
