import { ItemUseOnEvent, Block, CustomComponentParameters } from "@minecraft/server";
import { ToolComponent } from "./Tool";
import { offsetVolume } from "../utils";

export interface FlintAndSteelOptions {
  block?: string;
  size?: number;
}

export class FlintAndSteelComponent extends ToolComponent {
  static typeId = "mcutils:flint_and_steel";

  /**
   * Makes this item place fire like a flint and steel.
   * @param size
   */
  constructor() {
    super();
    this.onUseOn = this.onUseOn.bind(this);
  }

  getBlock(block: Block, options: FlintAndSteelOptions): string {
    return options.block ?? "fire";
  }

  /**
   * Place fire on the block.
   * @param {Block} block The block that was interacted with.
   * @param {ItemUseOnEvent} event The item event for context.
   */
  convertBlock(block: Block, event: ItemUseOnEvent, options:FlintAndSteelOptions): void {
    const target = block.above();
    if (!target || !target.isAir) return;
    target.setType(this.getBlock(block, options));
  }

  #tillBlock(event: ItemUseOnEvent, options: FlintAndSteelOptions): void {
    event.block.dimension.playSound("fire.ignite", event.block.location, {
      volume: 1,
    });
    offsetVolume({ x: options.size ?? 1, y: 0, z: options.size ?? 1 }, (pos) => {
      try {
        const target = event.block.offset(pos);
        if (!target) return;
        this.convertBlock(target, event, options);
      } catch (err) {}
    });
  }

  canBeTilled(block: Block, options:FlintAndSteelOptions): boolean {
    const target = this.getBlock(block, options);
    return (block.hasTag("dirt") && !block.matches(target)) || block.matches("grass_path");
  }

  // EVENTS

  onUseOn(event: ItemUseOnEvent, args: CustomComponentParameters): void {
    const options = args.params as FlintAndSteelOptions;
    if (!this.canBeTilled(event.block, options)) return;
    this.#tillBlock(event, options);
  }
}
