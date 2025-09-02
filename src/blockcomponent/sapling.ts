import {
  BlockComponentRandomTickEvent,
  BlockEvent,
  Block,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockBaseComponent } from "./base";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";

export interface SaplingOptions {
  growth_state: keyof BlockStateSuperset;
  max_stage: number;
  feature?: string;
}

export class SaplingComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("sapling");

  /**
   * Vanilla sapling block behavior.
   */
  constructor() {
    super();
    this.onRandomTick = this.onRandomTick.bind(this);
  }

  getFeature(block: Block, options: SaplingOptions): string {
    return options.feature ?? "minecraft:oak_tree_feature";
  }

  // EVENTS

  grow(event: BlockEvent, args: CustomComponentParameters): void {
    const options = args.params as SaplingOptions;
    const STAGE = event.block.permutation.getState(
      options.growth_state,
    ) as number;
    if (STAGE == 0) {
      BlockUtils.incrementState(event.block, options.growth_state);
      this.update(event.block, args);
      return;
    }
    const perm = event.block.permutation;
    event.block.setType("air");
    let bool = event.dimension.placeFeature(
      this.getFeature(event.block, options),
      event.block.location,
      false,
    );
    if (!bool) {
      event.block.setPermutation(perm);
    }
  }

  onRandomTick(
    event: BlockComponentRandomTickEvent,
    args: CustomComponentParameters,
  ): void {
    // this.grow(event, args);
  }
}
