import {
  ItemStack,
  world,
  Player,
  EquipmentSlot,
  ItemComponentBeforeDurabilityDamageEvent,
  CustomComponentParameters,
  ItemComponentCompleteUseEvent,
  ItemComponentConsumeEvent,
  ItemComponentHitEntityEvent,
  ItemComponentMineBlockEvent,
  ItemComponentUseEvent,
  ItemComponentUseOnEvent,
} from "@minecraft/server";
import { Ticking } from "../misc/Ticking";

export class CustomItemEvent {
  constructor(itemStack: ItemStack) {
    this.itemStack = itemStack;
  }
  readonly itemStack: ItemStack;
}

export class ItemEquipEvent extends CustomItemEvent {
  constructor(player: Player, itemStack: ItemStack) {
    super(itemStack);
    this.player = player;
  }

  readonly player: Player;
}

export class ItemHoldEvent extends CustomItemEvent {
  constructor(player: Player, itemStack: ItemStack) {
    super(itemStack);
    this.player = player;
  }

  readonly player: Player;
}

export abstract class ItemBaseComponent extends Ticking {
  static components: ItemBaseComponent[] = [];

  /**
   * Custom item component containing additional item events.
   */
  constructor() {
    super();
  }

  #init() {}

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
      const onHoldEvent = new ItemHoldEvent(player, mainStack);
      // TODO: Check if item has this component?
      if (mainStack) {
        const event = new ItemHoldEvent(player, mainStack);
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

  onHold?(event: CustomItemEvent): void;
  onReleaseHold?(event: CustomItemEvent): void;
  onHoldTick?(event: CustomItemEvent): void;

  // EVENTS

  /**
   * This function will be called when an item containing this component is hitting an entity and about to take durability damage.
   */
  onBeforeDurabilityDamage?(
    event: ItemComponentBeforeDurabilityDamageEvent,
    args: CustomComponentParameters
  ): void;

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
