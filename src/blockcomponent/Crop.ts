import { BlockComponentRandomTickEvent, CustomComponentParameters } from "@minecraft/server";
import { MathUtils } from "../MathUtils";
import { RandomUtils } from "../RandomUtils";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent } from "./BlockBase";

export interface CropOptions {
  growth_state: keyof BlockStateSuperset;
  max_stage?: number;
}

export class CropComponent extends BlockBaseComponent {
  static typeId = "mcutils:crop";

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
    const options = args.params as CropOptions;
    var state = event.block.permutation.getState(options.growth_state) as number;
    var i = state + this.getGrowthAmount(event);
    event.block.setPermutation(
      event.block.permutation.withState(options.growth_state, MathUtils.clamp(i, 0, options.max_stage ?? 7))
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
