import {
  Block,
  BlockComponentRandomTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, string, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface FrostedIceOptions {
  age_state: keyof BlockStateSuperset;
  max_age: number;
  converts_to: string;
}

export class FrostedIceComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("frosted_ice");
  struct: Struct<any, any> = object({
    age_state: defaulted(string(), "mcutils:age"),
    max_age: defaulted(number(), 7),
    converts_to: defaulted(isBlock, "water"),
  });

  /**
   * Vanilla frosted ice block behavior.
   */
  constructor() {
    this.onRandomTick = this.onRandomTick.bind(this);
  }

  freeze(block: Block, options: FrostedIceOptions): void {
    const age = block.permutation.getState(options.age_state) as number;
    if (age === 0) return;
    BlockUtils.decrementState(block, options.age_state);
  }

  thaw(block: Block, options: FrostedIceOptions): void {
    const age = block.permutation.getState(options.age_state) as number;
    if (age === options.max_age) {
      return block.setType(options.converts_to);
    }
    BlockUtils.incrementState(block, options.age_state);
  }

  // EVENTS

  onRandomTick(event: BlockComponentRandomTickEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FrostedIceOptions;
    // TODO: Check if in cold biome.
    this.thaw(event.block, options);
  }
}
