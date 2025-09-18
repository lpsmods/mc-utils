import { BlockComponentRandomTickEvent, CustomComponentParameters } from "@minecraft/server";
import { RandomUtils } from "../random";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent } from "./base";
import { clampNumber } from "@minecraft/math";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, string, Struct } from "superstruct";

export interface CropOptions {
  growth_state: keyof BlockStateSuperset;
  max_stage: number;
}

export class CropComponent extends BlockBaseComponent {
  static readonly componentId = AddonUtils.makeId("crop");
  struct: Struct<any, any> = object({
    growth_state: string(),
    max_stage: defaulted(number(), 7),
  });

  /**
   * Vanilla crop block behavior.
   */
  constructor() {
    super();
    this.onRandomTick = this.onRandomTick.bind(this);
  }

  getGrowthAmount(event: BlockComponentRandomTickEvent): number {
    return RandomUtils.int(2, 5);
  }

  applyGrowth(event: BlockComponentRandomTickEvent, args: CustomComponentParameters) {
    const options = create(args.params, this.struct) as CropOptions;
    var state = event.block.permutation.getState(options.growth_state) as number;
    var i = state + this.getGrowthAmount(event);
    event.block.setPermutation(
      event.block.permutation.withState(options.growth_state, clampNumber(i, 0, options.max_stage)),
    );
    this.update(event.block, args);
  }

  grow(event: BlockComponentRandomTickEvent, args: CustomComponentParameters) {
    this.applyGrowth(event, args);
  }

  // EVENTS

  onRandomTick(event: BlockComponentRandomTickEvent, args: CustomComponentParameters): void {
    // this.grow(event, args);
  }
}
