import {
  ItemUseOnEvent,
  Block,
  CustomComponentParameters,
} from "@minecraft/server";
import { ToolComponent } from "./tool";
import { offsetVolume } from "../utils";
import { AddonUtils } from "../addon";

export interface HoeOptions {
  size?: number;
  block?: string;
}

export class HoeComponent extends ToolComponent {
  static typeId = AddonUtils.makeId("hoe");

  /**
   * Makes this item till dirt like a hoe.
   */
  constructor() {
    super();
    this.onUseOn = this.onUseOn.bind(this);
  }

  getBlock(block: Block, options: HoeOptions): string {
    return options.block ?? "farmland";
  }

  /**
   * Convert the block to farmland.
   * @param {Block} block The block that should be converted to farmland.
   * @param {ItemUseOnEvent} event The item event for context.
   */
  convertBlock(
    block: Block,
    event: ItemUseOnEvent,
    options: HoeOptions,
  ): boolean | undefined {
    if (!this.canBeTilled(block, options)) return;
    block.setType(this.getBlock(block, options));
  }

  #tillBlock(event: ItemUseOnEvent, options: HoeOptions): void {
    event.block.dimension.playSound("use.gravel", event.block.location, {
      volume: 1,
    });
    offsetVolume<boolean>(
      { x: options.size ?? 1, y: 0, z: options.size ?? 1 },
      (pos) => {
        try {
          const target = event.block.offset(pos);
          if (!target) return;
          return this.convertBlock(target, event, options);
        } catch (err) {}
      },
    );
  }

  canBeTilled(block: Block, options: HoeOptions): boolean {
    const target = this.getBlock(block, options);
    return (
      (block.hasTag("dirt") && !block.matches(target)) ||
      block.matches("grass_path")
    );
  }

  // EVENTS

  onUseOn(event: ItemUseOnEvent, args: CustomComponentParameters): void {
    const options = args.params as HoeOptions;
    if (!this.canBeTilled(event.block, options)) return;
    this.#tillBlock(event, options);
  }
}
