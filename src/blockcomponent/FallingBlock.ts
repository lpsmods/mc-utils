import {
  Block,
  BlockComponentOnPlaceEvent,
  BlockComponentTickEvent,
  CustomComponentParameters,
  Direction,
} from "@minecraft/server";
import { BlockBaseComponent, NeighborUpdateEvent } from "./BlockBase";
import { FallingBlockEvent, FallingBlockHandler } from "../entity/FallingBlockHandler";

export interface FallingBlockOptions {
  entity: string;
}

export class FallingBlockComponent extends BlockBaseComponent {
  static typeId = "mcutils:falling_block";

  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
    this.onPlace = this.onPlace.bind(this);
  }

  fall(block: Block, args: CustomComponentParameters): void {
    const options = args.params as FallingBlockOptions;
    FallingBlockHandler.create(this, args, block, options.entity);
  }

  // CUSTOM EVENTS

  /**
   * This function will be called when the block falls.
   * @param {FallingBlockEvent} event
   * @param {CustomComponentParameters} args
   */
  onFall?(event: FallingBlockEvent, args: CustomComponentParameters): void;

  /**
   * This function will be called when the block has landed.
   * @param {FallingBlockEvent} event
   * @param {CustomComponentParameters} args
   */
  onLand?(event: FallingBlockEvent, args: CustomComponentParameters): void;

  // EVENTS

  onNeighborUpdate(event: NeighborUpdateEvent, args: CustomComponentParameters): void {
    if (event.direction !== Direction.Down) return;
    if (!event.sourceBlock.isAir) return;
    this.fall(event.block, args);
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    this.baseTick(event, args);
  }

  onPlace(event: BlockComponentOnPlaceEvent, args: CustomComponentParameters): void {
    const down = event.block.below();
    if (!down || !down.isAir) return;
    this.fall(event.block, args);
  }
}
