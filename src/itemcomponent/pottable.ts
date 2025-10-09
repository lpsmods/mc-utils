import { CustomComponentParameters, ItemComponentUseOnEvent, ItemCustomComponent, ItemStack } from "@minecraft/server";
import { Identifier } from "../identifier";
import { AddonUtils } from "../addon";
import { create, defaulted, object, optional, Struct } from "superstruct";
import { isBlock, isItem } from "../validation";

export interface PottableOptions {
  block?: string;
  flower_pot: string;
}

export class PottableComponent implements ItemCustomComponent {
  static readonly componentId = AddonUtils.makeId("pottable");

  struct: Struct<any, any> = object({
    block: optional(isBlock),
    flower_pot: defaulted(isItem, "flower_pot"),
  });

  /**
   * Makes this item pottable.
   */
  constructor() {
    this.onUseOn = this.onUseOn.bind(this);
  }

  getPottedBlock(stack: ItemStack, options: PottableOptions): string {
    const id = Identifier.parse(stack.typeId);
    return options.block ?? id.prefix("potted_").toString();
  }

  onUseOn(event: ItemComponentUseOnEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as PottableOptions;
    if (event.usedOnBlockPermutation.type.id != options.flower_pot) return;
    event.source.getBlockFromViewDirection()?.block.setType(this.getPottedBlock(event.itemStack, options));
  }
}
