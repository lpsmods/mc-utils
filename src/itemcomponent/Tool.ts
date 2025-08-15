import {
  ItemComponentMineBlockEvent,
  ItemComponentHitEntityEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { ItemUtils } from "../item/ItemUtils";

export interface ToolOptions {
  damage_when_mined?: boolean;
  damage_when_hit?: boolean;
}

export class ToolComponent {
  static typeId = 'mcutils:tool';

  /**
   * Deals damage to the item when you break a block or hit an entity.
   */
  constructor() {
    this.onMineBlock = this.onMineBlock.bind(this);
    this.onHitEntity = this.onHitEntity.bind(this);
  }

  onMineBlock(event: ItemComponentMineBlockEvent, args: CustomComponentParameters): void {
    const options = args.params as ToolOptions;
    if (options.damage_when_mined != undefined && !options.damage_when_mined) return;
    if (!event.itemStack) return;
    ItemUtils.applyDamage(event.source, event.itemStack, 1);
  }

  onHitEntity(event: ItemComponentHitEntityEvent, args: CustomComponentParameters): void {
    const options = args.params as ToolOptions;
    if (options.damage_when_hit != undefined && !options.damage_when_hit) return;
    if (!event.itemStack) return;
    ItemUtils.applyDamage(event.attackingEntity, event.itemStack, 1);
  }
}
