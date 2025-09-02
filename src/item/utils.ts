/**
 * Generic item functions.
 */

import {
  Entity,
  EquipmentSlot,
  GameMode,
  ItemStack,
  Player,
  Vector3,
} from "@minecraft/server";

export abstract class ItemUtils {
  /**
   * Tests if the itemStack is an axe.
   * @param {ItemStack} itemStack
   * @returns {boolean|undefined}
   */
  static isAxe(itemStack: ItemStack | undefined): boolean {
    if (!itemStack) {
      return false;
    }
    return (
      itemStack.hasTag("axe") ||
      itemStack.hasTag("minecraft:is_axe") ||
      itemStack.typeId.endsWith("_axe")
    );
  }

  // TODO: Remove and replace with isHolding + isAxe
  /**
   * Whether or not the player is holding an axe.
   * @param {Player} player
   * @returns {boolean|undefined}
   */
  static holdingAxe(player: Player): boolean {
    if (!player) return false;
    let eq = player.getComponent("equippable");
    if (!eq) return false;
    let stack = eq.getEquipment(EquipmentSlot.Mainhand);
    return ItemUtils.isAxe(stack);
  }

  /**
   * Whether or not the player is holding this item.
   * @param {Player} player
   * @param {string} item
   * @returns {Boolean}
   */
  static isHolding(
    player: Player | undefined,
    item: string | ItemStack | string[],
    equipmentSlot?: EquipmentSlot,
  ): boolean | undefined {
    if (!player || !item) return false;
    let eq = player.getComponent("equippable");
    if (!eq) return false;
    let stack = eq.getEquipment(equipmentSlot ?? EquipmentSlot.Mainhand);
    if (!stack) return false;
    if (typeof item === "string") {
      return stack.matches(item);
    }
    if (Array.isArray(item)) {
      return item.some((item) => stack.matches(item));
    }
    return stack.matches(item.typeId);
  }

  /**
   * Replace slot with itemStack.
   * @param {Player} player
   * @param {number} slot
   * @param {ItemStack} resultStack
   */
  static setStack(
    player: Player,
    slot: EquipmentSlot,
    resultStack: ItemStack,
  ): void {
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
    slot: EquipmentSlot,
    amount: number = 1,
    gameModeCheck: boolean = true,
    emptyStack?: ItemStack,
  ): boolean {
    if (gameModeCheck && player.getGameMode() == GameMode.Creative)
      return false;
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
   */
  static give(player: Player, itemStack: ItemStack): void {
    const inv = player.getComponent("inventory");
    if (!inv || !inv.container) return;
    if (inv.container.emptySlotsCount === 0) {
      player.dimension.spawnItem(itemStack, player.location);
      return;
    }
    inv.container.addItem(itemStack);
  }

  // TODO: Remove and replace with isHolding + isIgnitable
  /**
   * Whether or not the player is holding an ignitable.
   * @param {Player} player
   * @returns {boolean|undefined}
   */
  static hasIgnitable(player: Player): boolean {
    if (!player) return false;
    let eq = player.getComponent("minecraft:equippable");
    if (!eq) return false;
    let stack = eq.getEquipment(EquipmentSlot.Mainhand);
    if (!stack) return false;
    return ItemUtils.isIgnitable(stack);
  }

  /**
   * Checks if an item can ignite fire.
   * @param {ItemStack} itemStack The stack to check if it can ignite fire.
   * @returns {boolean} Whether or not it can ignite fire.
   */
  static isIgnitable(itemStack: ItemStack | undefined): boolean {
    if (!itemStack) return false;
    return (
      itemStack.matches("flint_and_steel") || itemStack.matches("fire_charge")
    );
  }

  static usedIgnitable(
    player: Player,
    itemStack: ItemStack,
    soundLocation?: Vector3,
  ): void {
    if (itemStack.matches("fire_charge")) {
      player.dimension.playSound(
        "mob.ghast.fireball",
        soundLocation ?? player.location,
      );
      ItemUtils.decrementStack(player, EquipmentSlot.Mainhand);
      return;
    }
    if (itemStack.matches("flint_and_steel")) {
      player.dimension.playSound(
        "fire.ignite",
        soundLocation ?? player.location,
      );
      // Damage
      ItemUtils.applyDamage(player, itemStack, 1);
      return;
    }
  }

  /**
   * Deals damage to this item's durability, considering unbreaking enchantment.
   * If the item's durability exceeds the maximum, it will break.
   * @param itemStack The item stack to deal damage to.
   * @param amount The amount of damage to apply (default is 1).
   */
  static applyDamage(
    source: Entity,
    itemStack: ItemStack,
    amount: number = 1,
    slot?: EquipmentSlot,
  ): void {
    if (source instanceof Player && source?.getGameMode() === GameMode.Creative)
      return;
    const equ = source.getComponent("equippable");
    if (!equ) return;
    const durability = itemStack.getComponent("durability");
    if (!durability) return; // If the item has no durability, do nothing.

    const unbreakingLevel =
      itemStack.getComponent("enchantable")?.getEnchantment("unbreaking")
        ?.level ?? 0;

    const shouldApplyDamage = Math.random() < 1 / (unbreakingLevel + 1);

    if (shouldApplyDamage) {
      durability.damage += amount;
      if (durability.damage >= durability.maxDurability) {
        equ.setEquipment(slot ?? EquipmentSlot.Mainhand);
        source.dimension.playSound("random.break", source.location);
        return;
      }

      // Update the item stack.
      equ.setEquipment(slot ?? EquipmentSlot.Mainhand, itemStack);
    }
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
   * @returns {boolean}
   */
  static convert(
    player: Player,
    slot: EquipmentSlot,
    itemStack: ItemStack,
    amount: number = 1,
    gameModeCheck: boolean = true,
  ): void {
    const con = player.getComponent("equippable");
    if (!con) return;
    const main = con.getEquipment(slot);
    if (!main) return;
    const res = ItemUtils.decrementStack(
      player,
      slot,
      amount,
      gameModeCheck,
      itemStack,
    );
    if (!res) return;
    if (ItemUtils.has(player, itemStack)) return;
    ItemUtils.give(player, itemStack);
  }

  /**
   * Match any item name.
   * @param {ItemStack} item
   * @param {string[]} itemNames
   * @returns {boolean} Whether or not the item matched any of the item names.
   */
  static matchAny(item: ItemStack, itemNames: string[]): boolean {
    const items = [...new Set(itemNames)];
    return items.some((itemName) => {
      if (itemName.charAt(0) === "#") {
        return item.hasTag(itemName.slice(1));
      }
      if (itemName.charAt(0) === "!") {
        return !item.matches(itemName.slice(1));
      }
      return item.matches(itemName);
    });
  }
}
