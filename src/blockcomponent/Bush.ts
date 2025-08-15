import { BlockComponentPlayerInteractEvent, CustomComponentParameters } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { ItemUtils } from "../item/ItemUtils";
import { BlockUtils } from "../block/BlockUtils";
import { Identifier } from "../misc/Identifier";

export interface BushOptions {
  growth_state: keyof BlockStateSuperset;
  loot_tables?: string[];
}

export class HarvestLootTable {
  readonly growth: number;
  readonly lootTable: string;

  constructor(growth: number, lootTable: string) {
    this.growth = growth;
    this.lootTable = lootTable;
  }

  static parse(value: string): HarvestLootTable {
    const args = value.split(",");
    return new HarvestLootTable(+args[0], args[1]);
  }

  static parseAll(values: string[]): HarvestLootTable[] {
    return values.map((x) => HarvestLootTable.parse(x));
  }
}

export class BushComponent {
  static typeId = "mcutils:bush";

  /**
   * Vanilla bush block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  // getItem(block: Block, options: BushOptions) {
  //   return options.item ?? "minecraft:sweet_berries";
  // }

  pickBush(event: BlockComponentPlayerInteractEvent, options: BushOptions): void {
    const id = Identifier.parse(event.block);
    const growth = event.block.permutation.getState(options.growth_state);
    const lootTables = HarvestLootTable.parseAll(
      options.loot_tables ?? [
        `2,${id.namespace}/harvest/${id.path}_2`,
        `3,${id.namespace}/harvest/${id.path}_3`,
      ]
    );
    const { x, y, z } = event.block.location;
    var success = false;

    for (const lootTable of lootTables) {
      if (lootTable.growth !== growth) continue;
      event.dimension.runCommand(`loot spawn ${x} ${y} ${z} loot "${lootTable.lootTable}"`);
      success = true;
    }
    if (!success) return;
    event.dimension.playSound("block.sweet_berry_bush.pick", event.block.location);
    BlockUtils.setState(event.block, options.growth_state, 1);
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): void {
    const options = args.params as BushOptions;
    if (ItemUtils.isHolding(event.player, "bone_meal")) return;
    this.pickBush(event, options);
  }
}
