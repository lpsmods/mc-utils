import { Block, BlockType, BlockTypes, ItemUseAfterEvent, system, world } from "@minecraft/server";
import { Registry } from "./registry";
import { ItemUtils } from "../item";
import { BlockUtils } from "../block";

let initialized = false;

export interface ShearableOptions {
  /**
   * The sheared block. (like carved_pumpkin)
   */
  block: BlockType | string;
  soundEvent?: string;
  onConvert?: (block: Block, event: ItemUseAfterEvent) => void;
}

export class ShearableBlocksRegistry extends Registry<ShearableOptions> {
  /**
   * Register a new shearable block interaction.
   *
   * Handles shearing (shears).
   *
   * @param {BlockType|string} input The unsheared block. (like pumpkin)
   * @param {ShearableOptions} options
   * @returns {ShearableOptions}
   *
   * @example shearable.ts
   * ```typescript
   * import { shearableBlocks } from "@lpsmods/mc-utils";
   *
   * shearableBlocks.register("pumpkin", {block: "carved_pumpkin"});
   * ```
   */
  register(input: BlockType | string, options: ShearableOptions): ShearableOptions | undefined {
    if (!initialized) init();
    const id = input instanceof BlockType ? input.id : input;
    return super.register(id, options);
  }

  get(name: string): ShearableOptions | undefined {
    const k = [...this.keys()].find((k) => {
      let b = BlockTypes.get(k);
      return !b || b.id === name;
    });
    if (!k) return undefined;
    return super.get(k);
  }
}

/**
 * Default shearable block registry.
 */
export const shearableBlocks = new ShearableBlocksRegistry();

function init(): void {
  initialized = true;

  world.beforeEvents.itemUse.subscribe((event) => {
    if (!event.itemStack || !ItemUtils.matches(event.itemStack, "#is_shears")) return;
    const source = event.source.getBlockFromViewDirection({ maxDistance: 6 })?.block;
    if (!source) return;
    const options = shearableBlocks.get(source.typeId);
    if (!options) return;
    system.run(() => {
      if (options.onConvert) options.onConvert(source, event);
      source.dimension.playSound(options.soundEvent ?? "pumpkin.carve", source.location);
      BlockUtils.setType(source, options.block);
    });
  });
}
