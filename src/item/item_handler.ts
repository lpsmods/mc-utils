import {
  Entity,
  EquipmentSlot,
  ItemCompleteUseAfterEvent,
  ItemReleaseUseAfterEvent,
  ItemStack,
  ItemStartUseAfterEvent,
  ItemStartUseOnAfterEvent,
  ItemStopUseAfterEvent,
  ItemStopUseOnAfterEvent,
  ItemUseAfterEvent,
  ItemUseBeforeEvent,
  world,
} from "@minecraft/server";
import { id, Identifier } from "../identifier";

let initialized = false;

export abstract class ItemHandler {
  static all = new Map<string, ItemHandler>();

  itemId: Identifier;
  equipmentSlot?: EquipmentSlot;

  constructor(itemId: id, equipmentSlot?: EquipmentSlot) {
    this.itemId = Identifier.parse(itemId);
    this.equipmentSlot = equipmentSlot;
    if (!initialized) init();
  }

  /**
   * This event fires when a chargeable item completes charging.
   * @param {ItemCompleteUseAfterEvent} event
   */
  abstract onCompleteUse?(event: ItemCompleteUseAfterEvent): void;

  /**
   * This event fires when a chargeable item is released from
   * @param {ItemReleaseUseAfterEvent} event
   * charging.
   */
  abstract onReleaseUse?(event: ItemReleaseUseAfterEvent): void;

  /**
   * This event fires when a chargeable item starts charging.
   * @param {ItemStartUseAfterEvent} event
   */
  abstract onStartUse?(event: ItemStartUseAfterEvent): void;

  /**
   * This event fires when a player successfully uses an item or
   * places a block by pressing the Use Item / Place Block
   * button. If multiple blocks are placed, this event will only
   * occur once at the beginning of the block placement. Note:
   * This event cannot be used with Hoe or Axe items.
   * @param {ItemStartUseOnAfterEvent} event
   */
  abstract onStartUseOn?(event: ItemStartUseOnAfterEvent): void;

  /**
   * This event fires when a chargeable item stops charging.
   * @param {ItemStopUseAfterEvent} event
   */
  abstract onStopUse?(event: ItemStopUseAfterEvent): void;

  /**
   * This event fires when a player releases the Use Item / Place
   * Block button after successfully using an item. Note: This
   * event cannot be used with Hoe or Axe items.
   * @param {ItemStopUseOnAfterEvent} event
   */
  abstract onStopUseOn?(event: ItemStopUseOnAfterEvent): void;

  /**
   * This event fires when an item is successfully used by a
   * player.
   * @param {ItemUseAfterEvent} event
   */
  abstract onUse?(event: ItemUseAfterEvent): void;

  /**
   * This event fires when an item is successfully used by a
   * player.
   * @param {ItemUseBeforeEvent} event
   */
  abstract beforeUse?(event: ItemUseBeforeEvent): void;

  matches(itemStack: ItemStack, entity?: Entity): boolean {
    return itemStack.matches(this.itemId.toString());
  }
}

function callHandle(name: string, itemStack: ItemStack | undefined, event: any): void {
  if (!itemStack) return;
  for (const handler of ItemHandler.all.values()) {
    const func = handler[name as keyof ItemHandler];
    if (!func) continue;
    if (!handler.matches(itemStack)) continue;
    if (typeof func !== "function") continue;
    func(event);
  }
}

function init() {
  world.afterEvents.itemCompleteUse.subscribe((event) => {
    callHandle("onCompleteUse", event.itemStack, event);
  });
  world.afterEvents.itemReleaseUse.subscribe((event) => {
    callHandle("onReleaseUse", event.itemStack, event);
  });
  world.afterEvents.itemStartUse.subscribe((event) => {
    callHandle("onStartUse", event.itemStack, event);
  });
  world.afterEvents.itemStartUseOn.subscribe((event) => {
    callHandle("onStartUseOn", event.itemStack, event);
  });
  world.afterEvents.itemStopUse.subscribe((event) => {
    callHandle("onStopUse", event.itemStack, event);
  });
  world.afterEvents.itemStopUseOn.subscribe((event) => {
    callHandle("onStopUseOn", event.itemStack, event);
  });
  world.afterEvents.itemUse.subscribe((event) => {
    callHandle("onUse", event.itemStack, event);
  });
  world.beforeEvents.itemUse.subscribe((event) => {
    callHandle("beforeUse", event.itemStack, event);
  });
}
