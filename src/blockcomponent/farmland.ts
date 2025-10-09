import {
  Block,
  BlockComponentEntityFallOnEvent,
  BlockComponentRandomTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, string, Struct } from "superstruct";
import { isBlock } from "../validation";
import { BlockBaseComponent } from "./base";

export interface FarmlandOptions {
  moisture_state: keyof BlockStateSuperset;
  max_moisture: number;
  moist_block: string;
  block: string;
}

export class FarmlandComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("farmland");
  struct: Struct<any, any> = object({
    moisture_state: defaulted(string(), "mcutils:moisture"),
    block: defaulted(isBlock, "dirt"),
    max_moisture: defaulted(number(), 7),
    moist_block: defaulted(string(), "#water"),
  });

  delay = 0;

  /**
   * Vanilla farmland block behavior.
   */
  constructor() {
    super();
    this.onRandomTick = this.onRandomTick.bind(this);
    this.onEntityFallOn = this.onEntityFallOn.bind(this);
  }

  isMoist(block: Block, options: FarmlandOptions): boolean {
    for (let x = -5; x < 5; x++) {
      for (let y = -1; y < 1; y++) {
        for (let z = -5; z < 5; z++) {
          const blk = block.offset({ x: x, y: y, z: z });
          if (blk && BlockUtils.matches(blk, options.moist_block)) return true;
        }
      }
    }
    return false;
  }

  // EVENTS

  onRandomTick(event: BlockComponentRandomTickEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FarmlandOptions;
    const moisture = event.block.permutation.getState(options.moisture_state) as number;
    const water = this.isMoist(event.block, options);
    if (water && moisture < options.max_moisture) {
      BlockUtils.setState(event.block, options.moisture_state, moisture + 1);
      return;
    }

    if (!water && moisture > 0) {
      BlockUtils.setState(event.block, options.moisture_state, moisture - 1);
      return;
    }

    if (!water && moisture == 0) {
      if (this.delay == 0) {
        this.delay = 1;
      } else {
        this.delay--;
        if (this.delay == 0) {
          BlockUtils.setType(event.block, options.block);
        }
      }
      return;
    }
  }

  onEntityFallOn(event: BlockComponentEntityFallOnEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FarmlandOptions;
    if (event.fallDistance > 1) {
      BlockUtils.setType(event.block, options.block);
      return;
    }
  }
}
