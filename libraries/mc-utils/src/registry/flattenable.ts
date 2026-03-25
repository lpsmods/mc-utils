import { Block, BlockType, BlockTypes, ItemUseAfterEvent, system, world } from "@minecraft/server";

import { Registry } from "./registry";
import { ItemUtils } from "../item";
import { BlockUtils } from "../block";

let initialized = false;

export interface FlattenableOptions {
  /**
   * The flattened block. (like grass_path)
   */
  block: BlockType | string;
  soundEvent?: string;
  onConvert?: (block: Block, event: ItemUseAfterEvent) => void;
}

export class FlattenableBlockRegistry extends Registry<FlattenableOptions> {
  /**
   * Register a new flattenable block interaction.
   *
   * Handles flattening (shovel).
   *
   * @param {BlockType|string} input The unflattened block. (like dirt)
   * @param {TillableBlockOptions} options
   * @returns {TillableBlockOptions}
   *
   * @example flattenable.ts
   * ```typescript
   * import { flattenableBlocks } from "@lpsmods/mc-utils";
   *
   * flattenableBlocks.register("#dirt", {block: "grass_path"});
   * ```
   */
  register(input: BlockType | string, options: FlattenableOptions): FlattenableOptions | undefined {
    if (!initialized) init();
    const id = input instanceof BlockType ? input.id : input;
    return super.register(id, options);
  }

  get(name: string): FlattenableOptions | undefined {
    const k = [...this.keys()].find((k) => {
      let b = BlockTypes.get(k);
      return !b || b.id === name;
    });
    if (!k) return undefined;
    return super.get(k);
  }
}

/**
 * Default flattenable block registry.
 */
export const flattenableBlocks = new FlattenableBlockRegistry();

function init(): void {
  initialized = true;

  world.beforeEvents.itemUse.subscribe((event) => {
    if (!event.itemStack || !ItemUtils.matches(event.itemStack, "#is_shovel")) return;
    const source = event.source.getBlockFromViewDirection({
      maxDistance: 6,
    })?.block;
    if (!source) return;
    const options = flattenableBlocks.get(source.typeId);
    if (!options) return;
    system.run(() => {
      if (options.onConvert) options.onConvert(source, event);
      source.dimension.playSound(options.soundEvent ?? "use.grass", source.location);
      BlockUtils.setType(source, options.block);
    });
  });
}
