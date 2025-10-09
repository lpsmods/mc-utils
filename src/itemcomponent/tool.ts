import {
  ItemComponentMineBlockEvent,
  ItemComponentHitEntityEvent,
  CustomComponentParameters,
  ItemCustomComponent,
} from "@minecraft/server";
import { ItemUtils } from "../item/utils";
import { AddonUtils } from "../addon";
import { boolean, create, defaulted, object, Struct } from "superstruct";

export interface ToolOptions {
  damage_when_mined: boolean;
  damage_when_hit: boolean;
}

export class ToolComponent implements ItemCustomComponent {
  static readonly componentId = AddonUtils.makeId("tool");
  struct: Struct<any, any> = object({
    damage_when_mined: defaulted(boolean(), false),
    damage_when_hit: defaulted(boolean(), false),
  });

  /**
   * Deals damage to the item when you break a block or hit an entity.
   */
  constructor() {
    this.onMineBlock = this.onMineBlock.bind(this);
    this.onHitEntity = this.onHitEntity.bind(this);
  }

  onMineBlock(event: ItemComponentMineBlockEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as ToolOptions;
    if (options.damage_when_mined != undefined && !options.damage_when_mined) return;
    if (!event.itemStack) return;
    ItemUtils.applyDamage(event.source, event.itemStack, 1);
  }

  onHitEntity(event: ItemComponentHitEntityEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as ToolOptions;
    if (options.damage_when_hit != undefined && !options.damage_when_hit) return;
    if (!event.itemStack) return;
    ItemUtils.applyDamage(event.attackingEntity, event.itemStack, 1);
  }
}
