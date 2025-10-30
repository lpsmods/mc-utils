import {
  Block,
  BlockComponentRandomTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
} from "@minecraft/server";
import { Identifier } from "../identifier";
import { BlockUtils } from "../block/utils";
import { Oxidization } from "../constants";
import { AddonUtils } from "../utils/addon";
import { create, object, optional, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface OxidizableComponentOptions {
  block?: string;
}

// TODO: Make way slower.
export class OxidizableComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("oxidizable");
  struct: Struct<any, any> = object({
    block: optional(isBlock),
  });

  /**
   * Vanilla oxidizable block behavior.
   */
  constructor() {
    this.onRandomTick = this.onRandomTick.bind(this);
  }

  getBlock(block: Block, options: OxidizableComponentOptions) {
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

  convertBlock(block: Block, options: OxidizableComponentOptions): void {
    BlockUtils.setType(block, this.getBlock(block, options));
  }

  // EVENTS

  onRandomTick(event: BlockComponentRandomTickEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as OxidizableComponentOptions;
    this.convertBlock(event.block, options);
  }
}
