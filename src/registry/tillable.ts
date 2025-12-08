import { Block, BlockType, BlockTypes, ItemUseAfterEvent, system, world } from "@minecraft/server";
import { Registry } from "./registry";
import { ItemUtils } from "../item";
import { BlockUtils } from "../block";

let initialized = false;

export interface TillableBlockOptions {
  /**
   * The tilled block. (like farmland)
   */
  block: BlockType | string;
  soundEvent?: string;
  onConvert?: (block: Block, event: ItemUseAfterEvent) => void;
}

export class TillableBlockRegistry extends Registry<TillableBlockOptions> {
  /**
   * Register a new tillable block interaction.
   *
   * Handles tilling (hoe).
   *
   * @param {BlockType|string} input The untilled block. (like dirt)
   * @param {TillableBlockOptions} options
   * @returns {TillableBlockOptions}
   *
   * @example tillable.ts
   * ```typescript
   * import { tillableBlocks } from "@lpsmods/mc-utils";
   *
   * tillableBlocks.register("#dirt", {block: "farmland"});
   * ```
   */
  register(input: BlockType | string, options: TillableBlockOptions): TillableBlockOptions | undefined {
    if (!initialized) init();
    const id = input instanceof BlockType ? input.id : input;
    return super.register(id, options);
  }

  get(name: string): TillableBlockOptions | undefined {
    const k = [...this.keys()].find((k) => {
      let b = BlockTypes.get(k);
      return !b || b.id === name;
    });
    if (!k) return undefined;
    return super.get(k);
  }
}

/**
 * Default tillable block registry.
 */
export const tillableBlocks = new TillableBlockRegistry();

function init(): void {
  initialized = true;

  world.beforeEvents.itemUse.subscribe((event) => {
    if (!event.itemStack || !ItemUtils.matches(event.itemStack, "#is_hoe")) return;
    const source = event.source.getBlockFromViewDirection({ maxDistance: 6 })?.block;
    if (!source) return;
    const options = tillableBlocks.get(source.typeId);
    if (!options) return;
    system.run(() => {
      if (options.onConvert) options.onConvert(source, event);
      source.dimension.playSound(options.soundEvent ?? "use.gravel", source.location);
      BlockUtils.setType(source, options.block);
    });
  });
}
