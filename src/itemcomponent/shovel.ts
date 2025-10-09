import { ItemUseOnEvent, Block, CustomComponentParameters, ItemCustomComponent } from "@minecraft/server";
import { ToolComponent } from "./tool";
import { offsetVolume } from "../utils";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, optional, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface ShovelOptions {
  size: number;
  block: string;
}

export class ShovelComponent extends ToolComponent implements ItemCustomComponent {
  static readonly componentId = AddonUtils.makeId("shovel");

  struct: Struct<any, any> = object({
    size: defaulted(number(), 1),
    block: defaulted(isBlock, "grass_path"),
  });

  /**
   * Makes this item flatten dirt like a shovel.
   */
  constructor() {
    super();
    this.onUseOn = this.onUseOn.bind(this);
  }

  getBlock(block: Block, options: ShovelOptions): string {
    return options.block;
  }

  /**
   * Convert the block to a dirt path.
   * @param {Block} block The block that should be converted to a dirt path.
   * @param {ItemUseOnEvent} event The item event for context.
   */
  convertBlock(block: Block, event: ItemUseOnEvent, options: ShovelOptions): boolean | undefined {
    if (!this.canBeFlattened(block, options)) return;
    block.setType(this.getBlock(block, options));
  }

  #flattenBlock(event: ItemUseOnEvent, options: ShovelOptions): void {
    event.block.dimension.playSound("use.gravel", event.block.location, {
      volume: 1,
    });
    offsetVolume<boolean>({ x: options.size, y: 0, z: options.size }, (pos) => {
      try {
        const target = event.block.offset(pos);
        if (!target) return;
        return this.convertBlock(target, event, options);
      } catch (err) {}
    });
  }

  canBeFlattened(block: Block, options: ShovelOptions): boolean {
    const target = this.getBlock(block, options);
    return (
      block.hasTag("dirt") && !block.matches(target) && !block.hasTag("farmland") && !block.typeId.includes("farmland")
    );
  }

  onUseOn(event: ItemUseOnEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as ShovelOptions;
    if (!this.canBeFlattened(event.block, options)) return;
    this.#flattenBlock(event, options);
  }
}
