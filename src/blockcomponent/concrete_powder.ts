import {
  Block,
  BlockComponentTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockUtils } from "../block/utils";
import { BlockBaseComponent } from "./base";
import { AddonUtils } from "../addon";

export interface ConcretePowderOptions {
  block?: string;
}

// TODO: Add gravity
export class ConcretePowderComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("concrete_powder");

  /**
   * Vanilla concrete powder block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  hasWater(block: Block): boolean {
    let north = block.north();
    if (north && north.hasTag("water")) return true;
    let south = block.south();
    if (south && south.hasTag("water")) return true;
    let east = block.east();
    if (east && east.hasTag("water")) return true;
    let west = block.west();
    if (west && west.hasTag("water")) return true;
    let above = block.above();
    if (above && above.hasTag("water")) return true;
    let below = block.below();
    if (below && below.hasTag("water")) return true;
    return false;
  }

  getConcreteBlock(block: Block, options: ConcretePowderOptions) {
    return options.block ?? block.typeId.replace("_powder", "");
  }

  // EVENTS

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters) {
    const options = args.params as ConcretePowderOptions;
    if (!this.hasWater(event.block)) return;
    BlockUtils.setType(
      event.block,
      this.getConcreteBlock(event.block, options),
    );
  }
}
