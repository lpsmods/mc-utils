import {
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
import { Registry } from "../registry";
import { VersionedDataStorage } from "../data";
import { ItemEvent, ItemEvents, ItemHoldEvent, ItemHoldTickEvent, ItemReleaseHoldEvent } from "../event";
import { TextUtils } from "../text";
import { defaulted, min, number, object, string, Struct } from "superstruct";

let initialized = false;

export interface CustomEnchantmentInstance {
  enchant: string;
  level: number;
  params: { [key: string]: any };
}

export class CustomEnchantmentEvent extends ItemEvent {
  cancel: boolean = false;

  constructor(itemStack: ItemStack, enchantment: CustomEnchantmentInstance) {
    super(itemStack);
    this.enchantment = enchantment;
  }

  readonly enchantment: CustomEnchantmentInstance;
}

export class ItemCustomEnchantEvent extends CustomEnchantmentEvent {}

export class ItemCustomDisenchantEvent extends CustomEnchantmentEvent {}

export class CustomEnchantmentUtils {
  private static struct: Struct<any, any> = object({
    enchant: string(),
    level: defaulted(min(number(), 1), 1),
    params: defaulted(object(), {}),
  });

  static getStorage(itemStack: ItemStack): VersionedDataStorage {
    return new VersionedDataStorage("mcutils:custom_enchantments", 1, itemStack);
  }
  /**
   * All enchantments the item has.
   * @param {ItemStack} itemStack
   * @returns {CustomEnchantmentInstance[]}
   */
  static getAll(itemStack: ItemStack): CustomEnchantmentInstance[] {
    const store = this.getStorage(itemStack);
    return store.get("enchantments", []);
  }

  /**
   * Add a custom enchantment to this item.
   * @param {ItemStack} itemStack
   * @param {string} enchantmentType Custom enchantment id.
   * @param {number} level The enchantment level.
   * @returns {ItemStack} The enchanted item stack.
   */
  static add(itemStack: ItemStack, enchantmentType: string, level?: number): ItemStack {
    if (this.has(itemStack, enchantmentType)) throw new Error(`Item already has enchantment "${enchantmentType}"`);
    const enchant = customEnchantmentRegistry.get(enchantmentType);
    if (!enchant) return itemStack;
    if ((level ?? 1) > enchant.getMaxLevel()) throw new Error(`Level must be at most ${enchant.getMaxLevel()}`);
    const enchants = this.getAll(itemStack);
    const instance: CustomEnchantmentInstance = this.struct.create({ enchant: enchantmentType, level: level ?? 1 });
    enchants.push(instance);
    const event = new ItemCustomEnchantEvent(itemStack, instance);
    if (enchant?.onEnchant) enchant.onEnchant(event);
    if (event.cancel) return itemStack;
    const store = this.getStorage(itemStack);
    store.set("enchantments", enchants);

    // Add Lore
    const lore = itemStack.getLore();
    lore.unshift(enchant.getLoreName(instance));
    itemStack.setLore(lore);
    return itemStack;
  }

  /**
   * Remove a custom enchantment from this item.
   * @param {ItemStack} itemStack
   * @param {string} enchantmentType Custom enchantment id.
   * @returns {ItemStack}
   */
  static remove(itemStack: ItemStack, enchantmentType: string): ItemStack {
    if (!customEnchantmentRegistry.has(enchantmentType)) throw new Error(`Enchant "${enchantmentType}" not found!`);
    let enchants = this.getAll(itemStack);
    enchants = enchants.filter((instance) => {
      if (instance.enchant !== enchantmentType) return true;
      const enchant = customEnchantmentRegistry.get(instance.enchant);
      const event = new ItemCustomEnchantEvent(itemStack, instance);
      if (enchant?.onDisenchant) enchant.onDisenchant(event);

      // Remove lore
      if (!event.cancel) {
        const lore = enchant?.getLoreName(instance);
        const data = itemStack.getLore().filter((text) => text !== lore);
        itemStack.setLore(data);
      }
      return !event.cancel;
    });
    const store = this.getStorage(itemStack);
    store.set("enchantments", enchants);
    return itemStack;
  }

  /**
   * Remove all custom enchantments from this item.
   * @param {ItemStack} itemStack
   * @returns {ItemStack}
   */
  static removeAll(itemStack: ItemStack): ItemStack {
    let enchants = this.getAll(itemStack);
    enchants = enchants.filter((instance) => {
      const enchant = customEnchantmentRegistry.get(instance.enchant);
      const event = new ItemCustomDisenchantEvent(itemStack, instance);
      if (enchant?.onDisenchant) enchant.onDisenchant(event);

      // Remove lore
      if (!event.cancel) {
        const lore = enchant?.getLoreName(instance);
        const data = itemStack.getLore().filter((text) => text !== lore);
        itemStack.setLore(data);
      }
      return event.cancel;
    });
    const store = this.getStorage(itemStack);
    store.set("enchantments", enchants);
    return itemStack;
  }

  /**
   * Whether or not the item has the custom enchantment.
   * @param {ItemStack} itemStack
   * @param {string} enchantmentType Custom enchantment id.
   * @returns {boolean}
   */
  static has(itemStack: ItemStack, enchantmentType: string): boolean {
    return this.getAll(itemStack).some((instance) => instance.enchant === enchantmentType);
  }
}

class CustomEnchantments extends Registry<CustomEnchantment> {
  static readonly registryId = "custom_enchantment";

  register(name: string, customEnchantment: CustomEnchantment): CustomEnchantment | undefined {
    if (!initialized) init();
    return super.register(name, customEnchantment);
  }
}

export const customEnchantmentRegistry = new CustomEnchantments();

export abstract class CustomEnchantment {
  static readonly enchantmentId: string;

  getDisplayName(): string {
    return "Unknown";
  }

  getLoreName(instance: CustomEnchantmentInstance): string {
    return `§r§7${this.getDisplayName() ?? "Unknown"} ${TextUtils.toRoman(instance.level)}§r`;
  }

  getMaxLevel(): number {
    return 1;
  }

  // ENCHANT EVENTS

  onEnchant?(event: ItemCustomEnchantEvent): void {}

  onDisenchant?(event: ItemCustomDisenchantEvent): void {}

  // CUSTOM ITEM EVENTS

  /**
   * This event fires when a player holds an item.
   * @param {ItemHoldEvent} event
   */
  onPlayerHold?(event: ItemHoldEvent): void;

  /**
   * This event fires when a player stops holding an item.
   * @param {ItemReleaseHoldEvent} event
   */
  onPlayerReleaseHold?(event: ItemReleaseHoldEvent): void;

  /**
   * This event fires every tick the player is holding an item.
   * @param {ItemHoldTickEvent} event
   */
  onPlayerHoldTick?(event: ItemHoldTickEvent): void;

  // ITEM EVENTS

  /**
   * This event fires when a chargeable item completes charging.
   * @param {ItemCompleteUseAfterEvent} event
   */
  onCompleteUse?(event: ItemCompleteUseAfterEvent): void;

  /**
   * This event fires when a chargeable item is released from
   * @param {ItemReleaseUseAfterEvent} event
   * charging.
   */
  onReleaseUse?(event: ItemReleaseUseAfterEvent): void;

  /**
   * This event fires when a chargeable item starts charging.
   * @param {ItemStartUseAfterEvent} event
   */
  onStartUse?(event: ItemStartUseAfterEvent): void;

  /**
   * This event fires when a player successfully uses an item or
   * places a block by pressing the Use Item / Place Block
   * button. If multiple blocks are placed, this event will only
   * occur once at the beginning of the block placement. Note:
   * This event cannot be used with Hoe or Axe items.
   * @param {ItemStartUseOnAfterEvent} event
   */
  onStartUseOn?(event: ItemStartUseOnAfterEvent): void;

  /**
   * This event fires when a chargeable item stops charging.
   * @param {ItemStopUseAfterEvent} event
   */
  onStopUse?(event: ItemStopUseAfterEvent): void;

  /**
   * This event fires when a player releases the Use Item / Place
   * Block button after successfully using an item. Note: This
   * event cannot be used with Hoe or Axe items.
   * @param {ItemStopUseOnAfterEvent} event
   */
  onStopUseOn?(event: ItemStopUseOnAfterEvent): void;

  /**
   * This event fires when an item is successfully used by a
   * player.
   * @param {ItemUseAfterEvent} event
   */
  onUse?(event: ItemUseAfterEvent): void;

  /**
   * This event fires when an item is successfully used by a
   * player.
   * @param {ItemUseBeforeEvent} event
   */
  beforeUse?(event: ItemUseBeforeEvent): void;
}

function callHandle(name: string, itemStack: ItemStack | undefined, event: any): void {
  if (!itemStack) return;
  for (const k of customEnchantmentRegistry.keys()) {
    const enchant = customEnchantmentRegistry.get(k);
    if (!enchant || !itemStack) continue;
    if (!CustomEnchantmentUtils.has(itemStack, k)) continue;
    const func = enchant[name as keyof CustomEnchantment];
    if (!func) continue;
    if (typeof func !== "function") continue;
    func(event);
  }
}

function init() {
  initialized = true;

  // CUSTOM EVENTS

  ItemEvents.playerHold.subscribe((event) => {
    callHandle("onPlayerHold", event.itemStack, event);
  });
  ItemEvents.playerReleaseHold.subscribe((event) => {
    callHandle("onPlayerReleaseHold", event.itemStack, event);
  });
  ItemEvents.playerHoldTick.subscribe((event) => {
    callHandle("onPlayerHoldTick", event.itemStack, event);
  });

  // EVENTS

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
