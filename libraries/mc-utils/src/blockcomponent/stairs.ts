import {
  Block,
  BlockComponentOnPlaceEvent,
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { create, defaulted, object, string, Struct } from "superstruct";

import { BlockBaseComponent, NeighborUpdateEvent } from "./base";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../utils/addon";
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
   * @deprecated Vanilla stairs block behavior.
   */
  constructor() {
    super();
    this.onPlace = this.onPlace.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  isStairs(block: Block): boolean {
    return block.hasTag("minecraft:stairs") || block.hasTag("stairs") || block.typeId.endsWith("stairs");
  }

  private getFacing(block: Block, options: StairsOptions): string {
    const states = block.permutation.getAllStates();
    if ("weirdo_direction" in states) return DirectionUtils.fromWeirdo(states.weirdo_direction as number).toLowerCase();
    return (states["minecraft:cardinal_direction"] as string).toLowerCase();
  }

  private getHalf(block: Block, options: StairsOptions): string {
    const states = block.permutation.getAllStates();
    if ("upside_down_bit" in states) return states.upside_down_bit ? "bottom" : "top";
    return (states["minecraft:vertical_half"] as string).toLowerCase();
  }

  private isLeftTurn(a: string, b: string): boolean {
    return (
      (a === "north" && b === "west") ||
      (a === "west" && b === "south") ||
      (a === "south" && b === "east") ||
      (a === "east" && b === "north")
    );
  }

  private isRightTurn(a: string, b: string): boolean {
    return (
      (a === "north" && b === "east") ||
      (a === "east" && b === "south") ||
      (a === "south" && b === "west") ||
      (a === "west" && b === "north")
    );
  }

  getStairsShape(block: Block, options: StairsOptions): string {
    const facing = this.getFacing(block, options);
    const forwardOffset = DirectionUtils.offsetFromDirection({ z: 1 }, facing);
    const forward = block.offset(forwardOffset);
    const forwardFacing = forward && this.isStairs(forward) ? this.getFacing(forward, options) : null;
    if (forward && forwardFacing) {
      const forwardHalf = this.getHalf(forward, options);
      if (this.isLeftTurn(facing, forwardFacing)) return forwardHalf == "bottom" ? "inner_left" : "inner_right";
      if (this.isRightTurn(facing, forwardFacing)) return forwardHalf == "bottom" ? "inner_right" : "inner_left";
    }

    const backwardOffset = DirectionUtils.offsetFromDirection({ z: -1 }, facing);
    const backward = block.offset(backwardOffset);
    const backwardFacing = backward && this.isStairs(backward) ? this.getFacing(backward, options) : null;
    if (backward && backwardFacing) {
      const backwardHalf = this.getHalf(backward, options);
      if (this.isLeftTurn(backwardFacing, facing)) return backwardHalf == "bottom" ? "outer_right" : "outer_left";
      if (this.isRightTurn(backwardFacing, facing)) return backwardHalf == "bottom" ? "outer_left" : "outer_right";
    }
    return "straight";
  }

  // EVENTS

  onNeighborUpdate(event: NeighborUpdateEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as StairsOptions;
    const state = event.block.permutation;
    var shape = this.getStairsShape(event.block, options);
    if (state.getState(options.shape_state) != shape) {
      BlockUtils.setState(event.block, options.shape_state, shape);
    }
  }

  onPlace(event: BlockComponentOnPlaceEvent, args: CustomComponentParameters): void {
    this.basePlace(event, args);
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    super.neighborTick(event, args);
  }
}
