import {
  Block,
  BlockComponentEntityFallOnEvent,
  BlockComponentTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";

export interface FarmlandOptions {
  moisture_state: keyof BlockStateSuperset;
  block?: string;
}

export class FarmlandComponent {
  static typeId = AddonUtils.makeId("farmland");

  delay = 0;

  /**
   * Vanilla farmland block behavior.
   * @param {string} moistureState
   */
  constructor(moistureState: string = "mcutils:moisture") {
    this.onTick = this.onTick.bind(this); // onRandomTick
    this.onEntityFallOn = this.onEntityFallOn.bind(this);
  }

  hasWater(block: Block): boolean {
    for (let x = -5; x < 5; x++) {
      for (let y = -1; y < 1; y++) {
        for (let z = -5; z < 5; z++) {
          const blk = block.offset({ x: x, y: y, z: z });
          if (blk && blk.hasTag("water")) return true;
        }
      }
    }
    return false;
  }

  convertToDirt(block: Block, options: FarmlandOptions): void {
    BlockUtils.setType(
      block,
      options.block ?? block.typeId.replace("farmland", "dirt"),
    );
  }

  // EVENTS

  onTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as FarmlandOptions;
    const moisture = event.block.permutation.getState(
      options.moisture_state,
    ) as number;
    const water = this.hasWater(event.block);
    if (water && moisture < 7) {
      if (this.delay == 0) {
        this.delay = 60;
      } else {
        this.delay--;
        if (this.delay == 0) {
          BlockUtils.setState(
            event.block,
            options.moisture_state,
            moisture + 1,
          );
        }
      }
      return;
    }

    if (!water && moisture > 0) {
      if (this.delay == 0) {
        this.delay = 60;
      } else {
        this.delay--;
        if (this.delay == 0) {
          BlockUtils.setState(
            event.block,
            options.moisture_state,
            moisture - 1,
          );
        }
      }
      return;
    }

    if (!water && moisture == 0) {
      if (this.delay == 0) {
        this.delay = 1200;
      } else {
        this.delay--;
        if (this.delay == 0) {
          this.convertToDirt(event.block, options);
        }
      }
      return;
    }
  }

  onEntityFallOn(
    event: BlockComponentEntityFallOnEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as FarmlandOptions;
    if (event.fallDistance > 1) {
      this.convertToDirt(event.block, options);
      return;
    }
  }
}
