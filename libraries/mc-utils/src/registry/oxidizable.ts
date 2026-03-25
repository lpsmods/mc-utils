import { Block, BlockType, BlockTypes, ItemUseAfterEvent, system, world } from "@minecraft/server";

import { Registry } from "./registry";
import { ItemUtils } from "../item";
import { BlockUtils } from "../block";

let initialized = false;

export interface OxidizableOptions {
  /**
   * The oxidized block. (like exposed_copper)
   */
  block: BlockType | string;
  soundEvent?: string;
  onConvert?: (block: Block, event: ItemUseAfterEvent) => void;
}

export class OxidizableBlocksRegistry extends Registry<OxidizableOptions> {
  /**
   * Register a new oxidizable block interaction.
   *
   * Handles oxidizing (random tick) and scrape oxidization (axe).
   *
   * @param {BlockType|string} input The unoxidized block. (like copper_block)
   * @param {OxidizableOptions} options
   * @returns {OxidizableOptions}
   *
   * @example oxidizable.ts
   * ```typescript
   * import { oxidizableBlocks } from "@lpsmods/mc-utils";
   *
   * oxidizableBlocks.register("copper_block", {block: "exposed_copper"});
   * oxidizableBlocks.register("exposed_copper", {block: "weathered_copper"});
   * oxidizableBlocks.register("weathered_copper", {block: "oxidized_copper"});
   * ```
   */
  register(input: BlockType | string, options: OxidizableOptions): OxidizableOptions | undefined {
    if (!initialized) init();
    const id = input instanceof BlockType ? input.id : input;
    return super.register(id, options);
  }

  get(name: string): OxidizableOptions | undefined {
    const k = [...this.keys()].find((k) => {
      let b = BlockTypes.get(k);
      return !b || b.id === name;
    });
    if (!k) return undefined;
    return super.get(k);
  }
}

/**
 * Default oxidizable block registry.
 */
export const oxidizableBlocks = new OxidizableBlocksRegistry();

// TODO: Add oxidizable
function init(): void {
  initialized = true;

  // TODO: Invert
  world.beforeEvents.itemUse.subscribe((event) => {
    if (!event.itemStack || !ItemUtils.matches(event.itemStack, "#is_axe")) return;
    const source = event.source.getBlockFromViewDirection({
      maxDistance: 6,
    })?.block;
    if (!source) return;
    const options = oxidizableBlocks.get(source.typeId);
    if (!options) return;
    system.run(() => {
      if (options.onConvert) options.onConvert(source, event);
      source.dimension.playSound(options.soundEvent ?? "scrape", source.location);
      BlockUtils.setType(source, options.block);
      // TODO: Particle
    });
  });
}
