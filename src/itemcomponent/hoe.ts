import { ItemUseOnEvent, Block, CustomComponentParameters, ItemCustomComponent } from "@minecraft/server";
import { ToolComponent } from "./tool";
import { offsetVolume } from "../utils";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, optional, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface HoeOptions {
  size: number;
  block: string;
}

export class HoeComponent extends ToolComponent implements ItemCustomComponent {
  static readonly componentId = AddonUtils.makeId("hoe");
  struct: Struct<any, any> = object({
    size: defaulted(number(), 1),
    block: defaulted(isBlock, "farmland"),
  });

  /**
   * Makes this item till dirt like a hoe.
   */
  constructor() {
    super();
    this.onUseOn = this.onUseOn.bind(this);
  }

  getBlock(block: Block, options: HoeOptions): string {
    return options.block;
  }

  /**
   * Convert the block to farmland.
   * @param {Block} block The block that should be converted to farmland.
   * @param {ItemUseOnEvent} event The item event for context.
   */
  convertBlock(block: Block, event: ItemUseOnEvent, options: HoeOptions): boolean | undefined {
    if (!this.canBeTilled(block, options)) return;
    block.setType(this.getBlock(block, options));
  }

  #tillBlock(event: ItemUseOnEvent, options: HoeOptions): void {
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

  canBeTilled(block: Block, options: HoeOptions): boolean {
    const target = this.getBlock(block, options);
    return (block.hasTag("dirt") && !block.matches(target)) || block.matches("grass_path");
  }

  // EVENTS

  onUseOn(event: ItemUseOnEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as HoeOptions;
    if (!this.canBeTilled(event.block, options)) return;
    this.#tillBlock(event, options);
  }
}
