import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockPermutation,
  CustomComponentParameters,
} from "@minecraft/server";
import { LRUCache } from "../cache";
import { Identifier } from "../misc/identifier";
import { ItemUtils } from "../item/utils";
import { AddonUtils } from "../addon";

export interface StrippableOptions {
  block?: string;
  sound_event?: string;
}

export class StrippableComponent {
  static typeId = AddonUtils.makeId("strippable");

  static CACHE = new LRUCache<string, string>();

  /**
   * Vanilla strippable block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getStrippedBlock(block: Block, options: StrippableOptions): string {
    return (
      options.block ??
      StrippableComponent.CACHE.getOrCompute(block.typeId, (key) => {
        const id = Identifier.parse(key);
        return id.prefix("stripped_").toString();
      })
    );
  }

  stripBlock(block: Block, options: StrippableOptions): void {
    block.setPermutation(
      BlockPermutation.resolve(
        this.getStrippedBlock(block, options),
        block.permutation.getAllStates(),
      ),
    );
    block.dimension.playSound(
      options.sound_event ?? "dig.wood",
      block.location,
    );
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as StrippableOptions;
    if (!event.player || !ItemUtils.holdingAxe(event.player)) return;

    this.stripBlock(event.block, options);
  }
}
