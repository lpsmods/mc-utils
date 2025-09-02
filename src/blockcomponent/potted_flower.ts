import {
  BlockComponentPlayerInteractEvent,
  ItemStack,
  Block,
  CustomComponentParameters,
} from "@minecraft/server";
import { AddonUtils } from "../addon";

export interface PottedFlowerOptions {
  item?: string;
  block?: string;
}

export class PottedFlowerComponent {
  static typeId = AddonUtils.makeId("potted_flower");

  /**
   * Vanilla flower pot behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getItem(block: Block, options: PottedFlowerOptions): string {
    return options.item ?? block.typeId.replace("potted_", "");
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as PottedFlowerOptions;
    const e = event.player?.getComponent("inventory");
    e &&
      (e.container?.addItem(new ItemStack(this.getItem(event.block, options))),
      event.block.setType(options.block ?? "flower_pot"));
  }
}
