import {
  Block,
  BlockComponentOnPlaceEvent,
  BlockComponentTickEvent,
  CustomComponentParameters,
  Direction,
} from "@minecraft/server";
import { BlockBaseComponent, NeighborUpdateEvent } from "./base";
import { FallingBlockEvent, FallingBlockHandler } from "../entity/falling_block_handler";
import { AddonUtils } from "../addon";
import { create, object, Struct } from "superstruct";
import { isEntity } from "../validation";

export interface FallingBlockOptions {
  entity: string;
}

export class FallingBlockComponent extends BlockBaseComponent {
  static readonly componentId = AddonUtils.makeId("falling_block");
  struct: Struct<any, any> = object({
    entity: isEntity,
  });

  /**
   * Vanilla falling block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
    this.onPlace = this.onPlace.bind(this);
  }

  fall(block: Block, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FallingBlockOptions;
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
