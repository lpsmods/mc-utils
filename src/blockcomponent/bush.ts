import {
  BlockComponentPlayerInteractEvent,
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  Entity,
  EntityDamageCause,
  system,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { ItemUtils } from "../item/utils";
import { BlockUtils } from "../block/utils";
import { Identifier } from "../identifier";
import { AddonUtils } from "../utils/addon";
import { BlockBaseComponent } from "./base";
import { EntityInBlockTickEvent } from "../event";
import { array, create, defaulted, object, optional, string, Struct } from "superstruct";
import { Vector3Utils } from "@minecraft/math";

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

export class BushComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("bush");
  struct: Struct<any, any> = object({
    growth_state: defaulted(string(), "mcutils:growth"),
    loot_tables: optional(array(string())),
  });

  /**
   * Vanilla bush block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  pickBush(event: BlockComponentPlayerInteractEvent, options: BushOptions): void {
    const id = Identifier.parse(event.block);
    const growth = event.block.permutation.getState(options.growth_state);
    const lootTables = HarvestLootTable.parseAll(
      options.loot_tables ?? [`2,${id.namespace}/harvest/${id.path}_2`, `3,${id.namespace}/harvest/${id.path}_3`],
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

  moved(entity: Entity) {
    if (system.currentTick % 10 !== 0) return;
    entity.applyDamage(1, { cause: EntityDamageCause.contact });
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as BushOptions;

    if (!event.player || ItemUtils.holding(event.player, "bone_meal")) return;
    this.pickBush(event, options);
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    this.enterLeaveTick(event, args);
  }

  inBlockTick(event: EntityInBlockTickEvent, args: CustomComponentParameters): void {
    const pos = Vector3Utils.toString(event.entity.location);
    const lastPos = (event.entity.getDynamicProperty("mcutils:bush.lastPos") as string) ?? undefined;
    if (pos !== lastPos) {
      event.entity.setDynamicProperty("mcutils:bush.lastPos", pos);
      this.moved(event.entity);
    }
  }
}
