import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockCustomComponent,
  BlockPermutation,
  CustomComponentParameters,
} from "@minecraft/server";
import { LRUCache } from "../cache";
import { Identifier } from "../identifier";
import { ItemUtils } from "../item/utils";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, object, optional, string, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface StrippableComponentOptions {
  block?: string;
  sound_event: string;
}

export class StrippableComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("strippable");
  struct: Struct<any, any> = object({
    block: optional(isBlock),
    sound_event: defaulted(string(), "dig.wood"),
  });

  static CACHE = new LRUCache<string, string>();

  /**
   * Vanilla strippable block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getStrippedBlock(block: Block, options: StrippableComponentOptions): string {
    return (
      options.block ??
      StrippableComponent.CACHE.getOrCompute(block.typeId, (key) => {
        const id = Identifier.parse(key);
        return id.prefix("stripped_").toString();
      })
    );
  }

  stripBlock(block: Block, options: StrippableComponentOptions): void {
    block.setPermutation(
      BlockPermutation.resolve(this.getStrippedBlock(block, options), block.permutation.getAllStates()),
    );
    block.dimension.playSound(options.sound_event ?? "dig.wood", block.location);
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as StrippableComponentOptions;
    if (!event.player || !ItemUtils.holding(event.player, "#is_axe")) return;

    this.stripBlock(event.block, options);
  }
}
