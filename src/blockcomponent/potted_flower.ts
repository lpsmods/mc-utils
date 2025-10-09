import {
  BlockComponentPlayerInteractEvent,
  ItemStack,
  Block,
  CustomComponentParameters,
  BlockCustomComponent,
} from "@minecraft/server";
import { AddonUtils } from "../addon";
import { create, defaulted, object, optional, Struct } from "superstruct";
import { isBlock, isItem } from "../validation";

export interface PottedFlowerOptions {
  item?: string;
  block: string;
}

export class PottedFlowerComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("potted_flower");
  struct: Struct<any, any> = object({
    item: optional(isItem),
    block: defaulted(isBlock, "flower_pot"),
  });

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

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as PottedFlowerOptions;
    const e = event.player?.getComponent("inventory");
    e && (e.container?.addItem(new ItemStack(this.getItem(event.block, options))), event.block.setType(options.block));
  }
}
