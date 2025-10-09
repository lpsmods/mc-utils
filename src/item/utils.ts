/**
 * Generic item functions.
 */

import {
  EnchantmentType,
  EnchantmentTypes,
  Entity,
  EquipmentSlot,
  GameMode,
  ItemStack,
  Player,
  Vector3,
} from "@minecraft/server";
import { CustomTags } from "../registry";

export abstract class ItemUtils {
  /**
   * Replace slot with itemStack.
   * @param {Player} player
   * @param {number} slot
   * @param {ItemStack} resultStack
   */
  static setStack(player: Player, slot: EquipmentSlot, resultStack: ItemStack): void {
    const inv = player.getComponent("inventory");
    const equ = player.getComponent("equippable");
    if (!equ) return;
    const stack = equ.getEquipment(slot);
    if (!stack) return;
    if (stack.amount === 1) {
      equ.setEquipment(slot, resultStack);
    } else {
      if (!inv || !inv.container) return;
      inv.container.addItem(resultStack);
      stack.amount -= 1;
      equ.setEquipment(slot, stack);
    }
  }

  /**
   * Decrease the number of items in slot.
   * @param {Player} player
   * @param {number} slot
   * @param {number} amount
   * @returns {boolean} True if it used emptyStack.
   */
  static decrementStack(
    player: Player,
    slot: EquipmentSlot = EquipmentSlot.Mainhand,
    amount: number = 1,
    gameModeCheck: boolean = true,
    emptyStack?: ItemStack,
  ): boolean {
    if (gameModeCheck && player.getGameMode() == GameMode.Creative) return false;
    const equ = player.getComponent("equippable");
    if (!equ) return false;
    const stack = equ.getEquipment(slot);
    if (!stack) return false;
    if (stack.amount <= amount) {
      equ.setEquipment(slot, emptyStack);
      return true;
    }
    stack.amount -= amount;
    equ.setEquipment(slot, stack);
    return false;
  }

  /**
   * Whether or not the itemName is in the players inventory.
   * @param {Player} player
   * @param {string} item
   * @returns
   */
  static has(player: Player, item: ItemStack | string): boolean {
    const inv = player.getComponent("minecraft:inventory");
    const itemName = item instanceof ItemStack ? item.typeId : item;
    if (!inv || !inv.container) return false;
    for (let slot = 0; slot < inv.container.size; slot++) {
      const itemStack = inv.container.getItem(slot);
      if (itemStack && itemStack.matches(itemName)) return true;
    }
    return false;
  }

  /**
   * Give or drop the item.
   * @param {Player} player
   * @param {ItemStack} itemStack
   * @returns {ItemStack}
   */
  static give(player: Player, itemStack: ItemStack): ItemStack {
    const inv = player.getComponent("inventory");
    if (!inv || !inv.container) return itemStack;
    if (inv.container.emptySlotsCount === 0) {
      player.dimension.spawnItem(itemStack, player.location);
      return itemStack;
    }
    inv.container.addItem(itemStack);
    return itemStack;
  }

  /**
   * Deals damage or decreases an item stack.
   * @param {Player} player
   * @param {ItemStack} itemStack
   * @param {Vector3} soundLocation
   */
  static usedIgnitable(player: Player, itemStack: ItemStack, soundLocation?: Vector3): void {
    if (itemStack.matches("fire_charge")) {
      player.dimension.playSound("mob.ghast.fireball", soundLocation ?? player.location);
      ItemUtils.decrementStack(player, EquipmentSlot.Mainhand);
      return;
    }
    if (itemStack.matches("flint_and_steel")) {
      player.dimension.playSound("fire.ignite", soundLocation ?? player.location);
      // Damage
      ItemUtils.applyDamage(player, itemStack, 1);
      return;
    }
  }

  /**
   * Deals damage to this item's durability, considering unbreaking enchantment.
   * If the item's durability exceeds the maximum, it will break.
   * @param {ItemStack} itemStack The item stack to deal damage to.
   * @param {number} amount The amount of damage to apply (default is 1).
   * @returns {ItemStack}
   */
  static applyDamage(source: Entity, itemStack: ItemStack, amount: number = 1, slot?: EquipmentSlot): ItemStack {
    if (source instanceof Player && source?.getGameMode() === GameMode.Creative) return itemStack;
    const equ = source.getComponent("equippable");
    if (!equ) return itemStack;
    const durability = itemStack.getComponent("durability");
    if (!durability) return itemStack; // If the item has no durability, do nothing.

    const unbreakingLevel = itemStack.getComponent("enchantable")?.getEnchantment("unbreaking")?.level ?? 0;

    const shouldApplyDamage = Math.random() < 1 / (unbreakingLevel + 1);

    if (shouldApplyDamage) {
      durability.damage += amount;
      if (durability.damage >= durability.maxDurability) {
        equ.setEquipment(slot ?? EquipmentSlot.Mainhand);
        source.dimension.playSound("random.break", source.location);
        return itemStack;
      }

      // Update the item stack.
      equ.setEquipment(slot ?? EquipmentSlot.Mainhand, itemStack);
    }
    return itemStack;
  }

  /**
   * Starts the cooldown timer for this players item.
   * @param itemStack The item stack to start the cooldown.
   * @param player The player to cooldown.
   * @returns
   */
  static startCooldown(itemStack: ItemStack, player: Player): void {
    const cooldown = itemStack.getComponent("cooldown");
    if (!cooldown) return;
    cooldown.startCooldown(player);
  }

  /**
   * Converts a number of items in slot to another item.
   * @param {Players} player
   * @param {EquipmentSlot} slot
   * @param {ItemStack} itemStack
   * @param {number} amount
   * @param {boolean} gameModeCheck
   * @returns {ItemStack}
   */
  static convert(
    player: Player,
    slot: EquipmentSlot,
    itemStack: ItemStack,
    amount: number = 1,
    gameModeCheck: boolean = true,
  ): ItemStack {
    const con = player.getComponent("equippable");
    if (!con) return itemStack;
    const main = con.getEquipment(slot);
    if (!main) return itemStack;
    const res = ItemUtils.decrementStack(player, slot, amount, gameModeCheck, itemStack);
    if (!res) return itemStack;
    if (ItemUtils.has(player, itemStack)) return itemStack;
    ItemUtils.give(player, itemStack);
    return itemStack;
  }

  /**
   * Whether or not the entity is holding this item.
   * @param {Entity} entity
   * @param {string} itemPredicate An item name. Prefix with '#' for item tag or "!" to ignore.
   */
  static holding(entity: Entity, itemPredicate: string | string[], equipmentSlot?: EquipmentSlot): boolean {
    if (!entity || !entity.isValid) return false;
    const equ = entity.getComponent("equippable");
    if (!equ) return false;
    const itemStack = equ.getEquipment(equipmentSlot ?? EquipmentSlot.Mainhand);
    if (!itemStack) return false;
    return Array.isArray(itemPredicate)
      ? this.matchAny(itemStack, itemPredicate)
      : this.matches(itemStack, itemPredicate);
  }

  /**
   * Match any item name.
   * @param {ItemStack} itemStack The item to match.
   * @param {string[]} itemPredicates An array of item names. Prefix with '#' for item tag or "!" to ignore.
   * @returns {boolean} Whether or not the item matched any of the item names.
   */
  static matchAny(
    itemStack: ItemStack,
    itemPredicates: string[],
    states?: Record<string, string | number | boolean>,
  ): boolean {
    const itemSet = [...new Set(itemPredicates)];
    return itemSet.some((itemPredicate) => {
      return ItemUtils.matches(itemStack, itemPredicate, states);
    });
  }

  /**
   * Match this item.
   * @param {ItemStack} itemStack The item to match.
   * @param {string} itemPredicate An item name. Prefix with '#' for item tag or "!" to ignore.
   * @returns {boolean}
   */
  static matches(
    itemStack: ItemStack,
    itemPredicate: string,
    states?: Record<string, string | number | boolean>,
  ): boolean {
    if (itemPredicate.charAt(0) === "#") {
      const tag = itemPredicate.slice(1);
      return itemStack.hasTag(tag) || CustomTags.items.matches(tag, itemStack.typeId);
    }
    if (itemPredicate.charAt(0) === "!") {
      return !itemStack.matches(itemPredicate.slice(1), states);
    }
    return itemStack.matches(itemPredicate, states);
  }

  /**
   * Remove item(s) from the entities inventory.
   * @param {Entity} entity
   * @param {string} itemPredicate An item name. Prefix with '#' for item tag or "!" to ignore.
   */
  static clear(entity: Entity, itemPredicate: string): void {
    const container = entity.getComponent("inventory")?.container;
    if (!container) return;
    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (!item) continue;
      if (!ItemUtils.matches(item, itemPredicate)) continue;
      container.setItem(i);
    }
  }

  /**
   * Enchants this item.
   * @param {ItemStack} itemStack
   * @param {EnchantmentType|string} enchantmentType
   * @param {number} level
   * @returns {ItemStack}
   */
  static enchant(itemStack: ItemStack, enchantmentType: EnchantmentType | string, level?: number): ItemStack {
    const enchant = itemStack.getComponent("enchantable");
    if (!enchant) return itemStack;
    const type = enchantmentType instanceof EnchantmentType ? enchantmentType : EnchantmentTypes.get(enchantmentType);
    if (!type) return itemStack;
    enchant.addEnchantment({ type, level: level ?? 1 });
    return itemStack;
  }
}
