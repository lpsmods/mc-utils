import { ItemUseOnEvent, Block, CustomComponentParameters, ItemCustomComponent } from "@minecraft/server";
import { ToolComponent } from "./tool";
import { offsetVolume } from "../utils";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, number, object, optional, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface FlintAndSteelOptions {
  block?: string;
  size: number;
}

export class FlintAndSteelComponent extends ToolComponent implements ItemCustomComponent {
  static readonly componentId = AddonUtils.makeId("flint_and_steel");
  struct: Struct<any, any> = object({
    block: optional(isBlock),
    size: defaulted(number(), 1),
  });

  /**
   * Makes this item place fire like a flint and steel.
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
  convertBlock(block: Block, event: ItemUseOnEvent, options: FlintAndSteelOptions): void {
    const target = block.above();
    if (!target || !target.isAir) return;
    target.setType(this.getBlock(block, options));
  }

  #tillBlock(event: ItemUseOnEvent, options: FlintAndSteelOptions): void {
    event.block.dimension.playSound("fire.ignite", event.block.location, {
      volume: 1,
    });
    offsetVolume({ x: options.size, y: 0, z: options.size }, (pos) => {
      try {
        const target = event.block.offset(pos);
        if (!target) return;
        this.convertBlock(target, event, options);
      } catch (err) {}
    });
  }

  canBeTilled(block: Block, options: FlintAndSteelOptions): boolean {
    const target = this.getBlock(block, options);
    return (block.hasTag("dirt") && !block.matches(target)) || block.matches("grass_path");
  }

  // EVENTS

  onUseOn(event: ItemUseOnEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FlintAndSteelOptions;
    if (!this.canBeTilled(event.block, options)) return;
    this.#tillBlock(event, options);
  }
}
