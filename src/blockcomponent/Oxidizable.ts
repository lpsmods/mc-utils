import {
  Block,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { Identifier } from "../misc/Identifier";
import { BlockUtils } from "../block/BlockUtils";
import { Oxidization } from "../constants";

export interface OxidizableOptions {
  block?: string;
}

// TODO: Make waaaay slower.
export class OxidizableComponent {
  static typeId = "mcutils:oxidizable";

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

  onRandomTick(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = args.params as OxidizableOptions;
    this.convertBlock(event.block, options);
  }
}
