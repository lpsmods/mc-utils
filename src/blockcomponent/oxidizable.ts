import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockComponentRandomTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { Identifier } from "../misc/identifier";
import { BlockUtils } from "../block/utils";
import { Oxidization } from "../constants";
import { AddonUtils } from "../addon";

export interface OxidizableOptions {
  block?: string;
}

// TODO: Make way slower.
export class OxidizableComponent {
  static typeId = AddonUtils.makeId("oxidizable");

  constructor() {
    this.onRandomTick = this.onRandomTick.bind(this);
  }

  getBlock(block: Block, options: OxidizableOptions) {
    if (options.block) return options.block;
    const typeId = Identifier.parse(block.typeId);
    const age = BlockUtils.guessOxidization(block);
    switch (age) {
      case Oxidization.Normal:
        return typeId.suffix("exposed_").toString();
      case Oxidization.Exposed:
        return typeId.replace("exposed_", "weathered_").toString();
      case Oxidization.Weathered:
        return typeId.replace("weathered_", "oxidized_").toString();
    }
    return typeId.toString();
  }

  convertBlock(block: Block, options: OxidizableOptions): void {
    BlockUtils.setType(block, this.getBlock(block, options));
  }

  // EVENTS

  onRandomTick(
    event: BlockComponentRandomTickEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as OxidizableOptions;
    this.convertBlock(event.block, options);
  }
}
