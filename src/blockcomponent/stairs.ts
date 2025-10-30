import { BlockBaseComponent, NeighborUpdateEvent } from "./base";
import {
  Block,
  BlockComponentOnPlaceEvent,
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { TextUtils } from "../utils/text";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, object, string, Struct } from "superstruct";
import { DirectionUtils } from "../utils/direction";

export interface StairsOptions {
  direction_state: keyof BlockStateSuperset;
  half_state: keyof BlockStateSuperset;
  shape_state: keyof BlockStateSuperset;
}

export class StairsComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("stairs");
  struct: Struct<any, any> = object({
    direction_state: defaulted(string(), "minecraft:cardinal_direction"),
    half_state: defaulted(string(), "minecraft:vertical_half"),
    shape_state: defaulted(string(), "mcutils:shape"),
  });

  /**
   * Vanilla stairs block behavior.
   */
  constructor() {
    super();
    this.onPlace = this.onPlace.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  isStairs(block: Block): boolean {
    return block.hasTag("minecraft:stairs") || block.hasTag("stairs") || block.typeId.toString().endsWith("stairs");
  }

  isDifferentOrientation(block: Block, dir: string, options: StairsOptions): boolean | undefined {
    var blockState = block.offset(DirectionUtils.toOffset(dir));
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
    var direction = block.permutation.getState(options.direction_state) as string;
    var blockState = block.offset(DirectionUtils.toOffset(direction));
    if (!blockState) return "straight";
    if (
      this.isStairs(blockState) &&
      BlockUtils.matchState(block, blockState, options.half_state) &&
      DirectionUtils.toAxis((direction2 = blockState.permutation.getState(options.direction_state) as string)) !=
        DirectionUtils.toAxis(block.permutation.getState(options.direction_state) as string) &&
      this.isDifferentOrientation(block, DirectionUtils.getOpposite(direction2), options)
    ) {
      if (TextUtils.titleCase(direction2) == DirectionUtils.rotateYCounterclockwise(direction)) {
        return "inner_right";
      }
      return "inner_left";
    }

    // Front
    var blockState2 = block.offset(DirectionUtils.toOffset(DirectionUtils.getOpposite(direction)));
    if (!blockState2) return "straight";
    if (
      this.isStairs(blockState2) &&
      BlockUtils.matchState(block, blockState2, options.half_state) &&
      DirectionUtils.toAxis((direction3 = blockState2.permutation.getState(options.direction_state) as string)) !=
        DirectionUtils.toAxis(block.permutation.getState(options.direction_state) as string) &&
      this.isDifferentOrientation(block, direction3, options)
    ) {
      if (TextUtils.titleCase(direction3) == DirectionUtils.rotateYCounterclockwise(direction)) {
        return "outer_right";
      }
      return "outer_left";
    }
    return "straight";
  }

  // EVENTS

  onNeighborUpdate(event: NeighborUpdateEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as StairsOptions;
    const state = event.block.permutation;
    var shape = this.getStairsShape(event.block, options); // e.block -> e.block.permutation
    if (state.getState(options.shape_state) != shape) {
      BlockUtils.setState(event.block, options.shape_state, shape);
    }
  }

  onPlace(event: BlockComponentOnPlaceEvent, args: CustomComponentParameters): void {
    this.update(event.block, args);
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    super.baseTick(event, args);
  }
}
