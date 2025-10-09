import { BlockBaseComponent, NeighborUpdateEvent } from "./base";
import { BlockComponentTickEvent, BlockCustomComponent, CustomComponentParameters } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";
import { create, defaulted, object, string, Struct } from "superstruct";

export interface CopperBulbOptions {
  lit_state: keyof BlockStateSuperset;
  powered_state: keyof BlockStateSuperset;
}

export class CopperBulbComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("copper_bulb");
  struct: Struct<any, any> = object({
    lit_state: defaulted(string(), "mcutils:lit"),
    powered_state: defaulted(string(), "mcutils:powered"),
  });

  /**
   * Vanilla copper bulb block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  // EVENTS

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters) {
    super.baseTick(event, args);
  }

  onNeighborUpdate(event: NeighborUpdateEvent, args: CustomComponentParameters) {
    const options = create(args.params, this.struct) as CopperBulbOptions;
    const lit = event.block.permutation.getState(options.lit_state);
    let level = event.sourceBlock.getRedstonePower();
    if (level === undefined) return;
    if (level === 0) {
      return BlockUtils.setState(event.block, options.powered_state, false);
    }
    BlockUtils.setState(event.block, options.powered_state, true);
    BlockUtils.setState(event.block, options.lit_state, !lit);
  }
}
