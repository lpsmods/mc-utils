import { Block, BlockComponentRandomTickEvent, CustomComponentParameters } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/BlockUtils";

export interface FrostedIceOptions {
  age_state: keyof BlockStateSuperset;
  max_age: number;
  converts_to?: string;
}

// TODO:
export class FrostedIceComponent {
  static typeId = "mcutils:frosted_ice";


  constructor() {
    this.onRandomTick = this.onRandomTick.bind(this);
  }

  freeze(block: Block, options:FrostedIceOptions): void {
    const age = block.permutation.getState(options.age_state) as number;
    if (age === 0) return;
    BlockUtils.decrementState(block, options.age_state);
  }

  thaw(block: Block, options:FrostedIceOptions): void {
    const age = block.permutation.getState(options.age_state) as number;
    if (age === options.max_age) {
      return block.setType(options.converts_to ?? 'water');
    }
    BlockUtils.incrementState(block, options.age_state);
  }

  // EVENTS

  onRandomTick(event: BlockComponentRandomTickEvent, args:CustomComponentParameters): void {
    const options = args.params as FrostedIceOptions;
    // TODO: Check if in cold biome.
    this.thaw(event.block, options);
  }
}
