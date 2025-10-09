import { Block, BlockType, BlockTypes, ItemUseAfterEvent, system, world } from "@minecraft/server";
import { Registry } from "./registry";
import { ItemUtils } from "../item";
import { BlockUtils } from "../block";

let initialized = false;

export interface StrippableOptions {
  block: BlockType | string;
  sound_event?: string;
  onConvert?: (block: Block, event: ItemUseAfterEvent) => void;
}

export class StrippableBlockRegistry extends Registry<StrippableOptions> {
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
      source.dimension.playSound(options.sound_event ?? "use.wood", source.location);
      BlockUtils.setType(source, options.block);
    });
  });
}
