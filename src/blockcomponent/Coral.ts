import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockComponentTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { LRUCache } from "../cache";
import { Identifier } from "../misc/identifier";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";

export interface CoralOptions {
  delay?: number;
  block?: string;
}

export class CoralComponent {
  static typeId = AddonUtils.makeId("coral");

  static CACHE = new LRUCache<string, string>();

  /**
   * Vanilla coral block behavior.
   */
  constructor() {
    this.onTick = this.onTick.bind(this);
  }

  getDeadCoralBlock(block: Block, options: CoralOptions) {
    return (
      options.block ??
      CoralComponent.CACHE.getOrCompute(block.typeId, (key) => {
        const id = Identifier.parse(key);
        return id.prefix("dead_").toString();
      })
    );
  }

  hasWater(block: Block): boolean {
    let north = block.north();
    if (north && north.hasTag("water")) return true;
    let south = block.south();
    if (south && south.hasTag("water")) return true;
    let east = block.east();
    if (east && east.hasTag("water")) return true;
    let west = block.west();
    if (west && west.hasTag("water")) return true;
    let above = block.above();
    if (above && above.hasTag("water")) return true;
    let below = block.below();
    if (below && below.hasTag("water")) return true;
    return false;
  }

  killBlock(block: Block, options: CoralOptions): void {
    const blk = this.getDeadCoralBlock(block, options);
    BlockUtils.setType(block, blk);
  }

  // EVENTS

  onTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as CoralOptions;
    const blk = event.block;
    const water = this.hasWater(blk);
    let delay = (blk.getDynamicProperty("mcutils:delay") as number) ?? 0;

    if (water && delay != 0) {
      blk.setDynamicProperty("mcutils:delay", 0);
      return;
    }

    if (!water && delay == 0) {
      blk.setDynamicProperty("mcutils:delay", options.delay ?? 60);
      return;
    }

    if (delay > 0) {
      delay--;
      if (delay <= 0) {
        this.killBlock(event.block, options);
      }
      return blk.setDynamicProperty("mcutils:delay", delay);
    }
  }
}
