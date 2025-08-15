import { CustomComponentParameters, ItemComponentUseOnEvent, ItemStack } from "@minecraft/server";
import { Identifier } from "../misc/Identifier";

export interface PottableOptions {
  block?: string;
  flower_pot?: string;
}

export class PottableComponent {
  static typeId = "mcutils:pottable";

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
    const options = args.params as PottableOptions;
    if (event.usedOnBlockPermutation.type.id != options.flower_pot) return;
    event.source
      .getBlockFromViewDirection()
      ?.block.setType(this.getPottedBlock(event.itemStack, options));
  }
}
