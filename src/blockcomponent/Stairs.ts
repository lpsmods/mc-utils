import { BlockBaseComponent, NeighborUpdateEvent } from "./base";
import {
  Block,
  BlockComponentOnPlaceEvent,
  BlockComponentTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { WorldUtils } from "../world/utils";
import { BlockUtils } from "../block/utils";
import { TextUtils } from "../text";
import { AddonUtils } from "../addon";

export interface StairsOptions {
  direction_state: keyof BlockStateSuperset;
  half_state: keyof BlockStateSuperset;
  shape_state: keyof BlockStateSuperset;
}

export class StairsComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("stairs");

  /**
   * Vanilla stairs block behavior.
   */
  constructor() {
    super();
    this.onPlace = this.onPlace.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  isStairs(block: Block): boolean {
    return (
      block.hasTag("minecraft:stairs") ||
      block.hasTag("stairs") ||
      block.typeId.toString().endsWith("stairs")
    );
  }

  isDifferentOrientation(
    block: Block,
    dir: string,
    options: StairsOptions,
  ): boolean | undefined {
    var blockState = block.offset(WorldUtils.dir2Offset(dir));
    if (!blockState) return;
    return (
      !this.isStairs(blockState) ||
      !BlockUtils.matchState(block, blockState, options.direction_state) ||
      !BlockUtils.matchState(block, blockState, options.half_state)
    );
  }

  getStairsShape(block: Block, options: StairsOptions): string {
    var direction3;
    var direction2;

    // Back
    var direction = block.permutation.getState(
      options.direction_state,
    ) as string;
    var blockState = block.offset(WorldUtils.dir2Offset(direction));
    if (!blockState) return "straight";
    if (
      this.isStairs(blockState) &&
      BlockUtils.matchState(block, blockState, options.half_state) &&
      WorldUtils.getAxis(
        (direction2 = blockState.permutation.getState(
          options.direction_state,
        ) as string),
      ) !=
        WorldUtils.getAxis(
          block.permutation.getState(options.direction_state) as string,
        ) &&
      this.isDifferentOrientation(
        block,
        WorldUtils.getOpposite(direction2),
        options,
      )
    ) {
      if (
        TextUtils.titleCase(direction2) ==
        WorldUtils.rotateYCounterclockwise(direction)
      ) {
        return "inner_right";
      }
      return "inner_left";
    }

    // Front
    var blockState2 = block.offset(
      WorldUtils.dir2Offset(WorldUtils.getOpposite(direction)),
    );
    if (!blockState2) return "straight";
    if (
      this.isStairs(blockState2) &&
      BlockUtils.matchState(block, blockState2, options.half_state) &&
      WorldUtils.getAxis(
        (direction3 = blockState2.permutation.getState(
          options.direction_state,
        ) as string),
      ) !=
        WorldUtils.getAxis(
          block.permutation.getState(options.direction_state) as string,
        ) &&
      this.isDifferentOrientation(block, direction3, options)
    ) {
      if (
        TextUtils.titleCase(direction3) ==
        WorldUtils.rotateYCounterclockwise(direction)
      ) {
        return "outer_right";
      }
      return "outer_left";
    }
    return "straight";
  }

  // EVENTS

  onNeighborUpdate(
    event: NeighborUpdateEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as StairsOptions;
    const state = event.block.permutation;
    var shape = this.getStairsShape(event.block, options); // e.block -> e.block.permutation
    if (state.getState(options.shape_state) != shape) {
      BlockUtils.setState(event.block, options.shape_state, shape);
    }
  }

  onPlace(
    event: BlockComponentOnPlaceEvent,
    args: CustomComponentParameters,
  ): void {
    this.update(event.block, args);
  }

  onTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    super.baseTick(event, args);
  }
}
