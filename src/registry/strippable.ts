import { Block, BlockType, BlockTypes, ItemUseAfterEvent, system, world } from "@minecraft/server";
import { Registry } from "./registry";
import { ItemUtils } from "../item";
import { BlockUtils } from "../block";

let initialized = false;

export interface StrippableOptions {
  /**
   * The stripped block. (like stripped_oak_log)
   */
  block: BlockType | string;
  soundEvent?: string;
  onConvert?: (block: Block, event: ItemUseAfterEvent) => void;
}

export class StrippableBlockRegistry extends Registry<StrippableOptions> {
  /**
   * Register a new strippable block interaction.
   *
   * Handles stripping (axe).
   *
   * @param {BlockType|string} input The unstripped block. (like oak_log)
   * @param {StrippableOptions} options
   * @returns {StrippableOptions}
   *
   * @example strippable.ts
   * ```typescript
   * import { strippableBlocks } from "@lpsmods/mc-utils";
   *
   * strippableBlocks.register("oak_log", {block: "stripped_oak_log"});
   * strippableBlocks.register("oak_wood", {block: "stripped_oak_wood"});
   * ```
   */
  register(input: BlockType | string, options: StrippableOptions): StrippableOptions | undefined {
    if (!initialized) init();
    const id = input instanceof BlockType ? input.id : input;
    return super.register(id, options);
  }

  get(name: string): StrippableOptions | undefined {
    const k = [...this.keys()].find((k) => {
      let b = BlockTypes.get(k);
      return !b || b.id === name;
    });
    if (!k) return undefined;
    return super.get(k);
  }
}

/**
 * Default strippable block registry.
 */
export const strippableBlocks = new StrippableBlockRegistry();

function init(): void {
  initialized = true;

  world.beforeEvents.itemUse.subscribe((event) => {
    if (!event.itemStack || !ItemUtils.matches(event.itemStack, "#is_axe")) return;
    const source = event.source.getBlockFromViewDirection({ maxDistance: 6 })?.block;
    if (!source) return;
    const options = strippableBlocks.get(source.typeId);
    if (!options) return;
    system.run(() => {
      if (options.onConvert) options.onConvert(source, event);
      source.dimension.playSound(options.soundEvent ?? "use.wood", source.location);
      BlockUtils.setType(source, options.block);
    });
  });
}
