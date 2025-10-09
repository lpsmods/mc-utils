import {
  world,
  EquipmentSlot,
  ItemComponentBeforeDurabilityDamageEvent,
  CustomComponentParameters,
  ItemComponentCompleteUseEvent,
  ItemComponentConsumeEvent,
  ItemComponentHitEntityEvent,
  ItemComponentMineBlockEvent,
  ItemComponentUseEvent,
  ItemComponentUseOnEvent,
  EntityHitBlockAfterEvent,
  ItemCustomComponent,
} from "@minecraft/server";
import { Ticking } from "../ticking";
import { ItemEvent, ItemHoldEvent } from "../event/item";
import { object, Struct } from "superstruct";

export abstract class ItemBaseComponent extends Ticking implements ItemCustomComponent {
  static readonly componentId: string;

  static components: ItemBaseComponent[] = [];
  struct: Struct<any, any> = object({});

  /**
   * Custom item component containing additional item events.
   */
  constructor() {
    super();
  }

  tick(): void {
    // Skip if no events are bound.
    if (!this.onHoldTick && !this.onHold && !this.onReleaseHold) return;
    for (const player of world.getAllPlayers()) {
      // Equip
      const equ = player.getComponent("equippable");
      if (!equ) continue;
      // TODO: Check offhand
      const mainStack = equ.getEquipment(EquipmentSlot.Mainhand);
      if (!mainStack) return;
      const onHoldEvent = new ItemHoldEvent(mainStack, player);
      // TODO: Check if item has this component?
      if (mainStack) {
        const event = new ItemHoldEvent(mainStack, player);
        if (this.onHoldTick) this.onHoldTick(event);
      }
      const holdTag = `hold.test`;
      if (mainStack && !player.hasTag(holdTag)) {
        player.addTag(holdTag);
        if (this.onHold) this.onHold(onHoldEvent);
      }
      if (!mainStack && player.hasTag(holdTag)) {
        player.removeTag(holdTag);
        if (this.onReleaseHold) this.onReleaseHold(onHoldEvent);
      }
    }
  }

  // CUSTOM EVENTS

  /**
   * This function will be called when an item containing this component is held.
   */
  onHold?(event: ItemEvent): void;

  /**
   * This function will be called when an item containing this component is no longer being held.
   */
  onReleaseHold?(event: ItemEvent): void;

  /**
   * This function will be called every tick when an item containing this component is being held.
   */
  onHoldTick?(event: ItemEvent): void;

  // EVENTS

  /**
   * This function will be called when an item containing this component is used to hit a block.
   */
  onHitBlock?(event: EntityHitBlockAfterEvent): void;

  /**
   * This function will be called when an item containing this component is hitting an entity and about to take durability damage.
   */
  onBeforeDurabilityDamage?(event: ItemComponentBeforeDurabilityDamageEvent, args: CustomComponentParameters): void;

  /**
   * This function will be called when an item containing this component's use duration was completed.
   */
  onCompleteUse?(event: ItemComponentCompleteUseEvent, args: CustomComponentParameters): void;

  /**
   * This function will be called when an item containing this component is eaten by an entity.
   */
  onConsume?(event: ItemComponentConsumeEvent, args: CustomComponentParameters): void;

  /**
   * This function will be called when an item containing this component is used to hit another entity.
   */
  onHitEntity?(event: ItemComponentHitEntityEvent, args: CustomComponentParameters): void;

  /**
   * This function will be called when an item containing this component is used to mine a block.
   */
  onMineBlock?(event: ItemComponentMineBlockEvent, args: CustomComponentParameters): void;

  /**
   * This function will be called when an item containing this component is used by a player.
   */
  onUse?(event: ItemComponentUseEvent, args: CustomComponentParameters): void;

  /**
   * This function will be called when an item containing this component is used on a block.
   */
  onUseOn?(event: ItemComponentUseOnEvent, args: CustomComponentParameters): void;
}

// TODO: Test
function init(): void {
  world.afterEvents.entityHitBlock.subscribe((event: EntityHitBlockAfterEvent) => {
    for (const com of ItemBaseComponent.components) {
      if (com.onHitBlock) com.onHitBlock(event);
    }
  });
}

init();
