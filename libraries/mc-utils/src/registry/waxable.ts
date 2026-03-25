import { Block, BlockType, BlockTypes, ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";

import { Registry } from "./registry";
import { ItemUtils } from "../item";
import { BlockUtils } from "../block";

let initialized = false;

export interface WaxableBlockOptions {
  /**
   * The waxed copper block. (like waxed_copper)
   */
  block: BlockType | string;
  onConvert?: (block: Block, event: ItemUseAfterEvent) => void;
  waxOnSound?: string;
  waxOffSound?: string;
}

export class WaxableBlockRegistry extends Registry<WaxableBlockOptions> {
  /**
   * Register a new waxable block interaction.
   *
   * Handles waxing (honeycomb) and scrape wax (axe).
   *
   * @param {BlockType|string} input The unwaxed block. (like copper_block)
   * @param {WaxableBlockOptions} options
   * @returns {WaxableBlockOptions}
   *
   * @example waxable.ts
   * ```typescript
   * import { waxableBlocks } from "@lpsmods/mc-utils";
   *
   * waxableBlocks.register("copper_block", {block: "waxed_copper"});
   * waxableBlocks.register("exposed_copper", {block: "waxed_exposed_copper"});
   * waxableBlocks.register("weathered_copper", {block: "waxed_weathered_copper"});
   * waxableBlocks.register("oxidized_copper", {block: "waxed_oxidized_copper"});
   * ```
   */
  register(input: BlockType | string, options: WaxableBlockOptions): WaxableBlockOptions | undefined {
    if (!initialized) init();
    const id = input instanceof BlockType ? input.id : input;
    return super.register(id, options);
  }

  get(name: string): WaxableBlockOptions | undefined {
    const k = [...this.keys()].find((k) => {
      let b = BlockTypes.get(k);
      return !b || b.id === name;
    });
    if (!k) return undefined;
    return super.get(k);
  }
}

/**
 * Default waxable block registry.
 */
export const waxableBlocks = new WaxableBlockRegistry();

// TODO: Particle
function axe(event: ItemUseBeforeEvent): void {
  const source = event.source.getBlockFromViewDirection({
    maxDistance: 6,
  })?.block;
  if (!source) return;
  for (const [k, options] of waxableBlocks.entries()) {
    const id = options.block instanceof BlockType ? options.block.id : BlockTypes.get(options.block)?.id;
    if (!id) continue;
    if (id === source.typeId) {
      system.run(() => {
        if (options.onConvert) options.onConvert(source, event);
        source.dimension.playSound(options.waxOffSound ?? "copper.wax.off", source.location);
        BlockUtils.setType(source, k);
      });
      return;
    }
  }
}

// TODO: Particle
function honeycomb(event: ItemUseBeforeEvent): void {
  const source = event.source.getBlockFromViewDirection({
    maxDistance: 6,
  })?.block;
  if (!source) return;
  const options = waxableBlocks.get(source.typeId);
  if (!options) return;
  system.run(() => {
    if (options.onConvert) options.onConvert(source, event);
    source.dimension.playSound(options.waxOnSound ?? "copper.wax.on", source.location);
    BlockUtils.setType(source, options.block);
  });
}

function init(): void {
  initialized = true;

  world.beforeEvents.itemUse.subscribe((event) => {
    if (!event.itemStack) return;
    if (ItemUtils.matches(event.itemStack, "#is_axe")) return axe(event);
    if (ItemUtils.matches(event.itemStack, "#waxable")) return honeycomb(event);
  });
}
