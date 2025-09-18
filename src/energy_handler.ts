import { Block, ItemStack } from "@minecraft/server";

export class EnergyHandler {
  constructor() {}

  getEnergy = EnergyHandler.getEnergy;
  setEnergy = EnergyHandler.setEnergy;
  addEnergy = EnergyHandler.addEnergy;
  removeEnergy = EnergyHandler.removeEnergy;
  transferEnergyTo = EnergyHandler.transferEnergyTo;
  canTransferTo = EnergyHandler.canTransferTo;
  energyToDurability = EnergyHandler.energyToDurability;
  durabilityToEnergy = EnergyHandler.durabilityToEnergy;

  /**
   * Get the stored amount of energy in a block or item.
   * @param {Block|ItemStack} source
   * @returns
   */
  static getEnergy(source: Block | ItemStack): number {
    return (source.getDynamicProperty("common:energy") as number) ?? 0;
  }

  /**
   * Store energy in a block or item.
   * @param {Block|ItemStack} source
   * @param {number} value
   */
  static setEnergy(source: Block | ItemStack, value: number): void {
    source.setDynamicProperty("common:energy", value);
  }

  /**
   * Add energy to this block or item.
   * @param {Block|ItemStack} source
   * @param {number} amount
   */
  static addEnergy(source: Block | ItemStack, amount: number = 1): void {
    EnergyHandler.setEnergy(source, EnergyHandler.getEnergy(source) + amount);
  }

  /**
   * Remove energy from this block or item.
   * @param {Block|ItemStack} source
   * @param {number} amount
   * @returns
   */
  static removeEnergy(source: Block | ItemStack, amount: number = 1): boolean {
    const energy = EnergyHandler.getEnergy(source);
    if (amount >= energy) return false;
    EnergyHandler.setEnergy(source, energy - amount);
    return true;
  }

  /**
   * Transfer energy from one source to another.
   * @param {Block|ItemStack} source
   * @param {Block|ItemStack} other
   * @param {number} amount
   * @returns
   */
  static transferEnergyTo(source: Block | ItemStack, other: Block | ItemStack, amount: number): boolean {
    if (!EnergyHandler.canTransferTo(source, other)) return false;
    const otherEnergy = (other.getDynamicProperty("common:energy") as number) ?? 0;
    other.setDynamicProperty("common:energy", otherEnergy + amount);
    EnergyHandler.removeEnergy(source, amount);
    return true;
  }

  /**
   * Whether or not the source and other can transfer energy.
   * @param {Block|ItemStack} source
   * @param {Block|ItemStack} other
   * @returns
   */
  static canTransferTo(source: Block | ItemStack, other: Block | ItemStack): boolean {
    return source.hasTag("energy") && other.hasTag("energy");
  }

  /**
   * Convert the energy amount to item durability.
   * @param {ItemStack} stack
   * @param {number} maxEnergy
   * @returns
   */
  static energyToDurability(stack: ItemStack, maxEnergy: number): number {
    const energy = EnergyHandler.getEnergy(stack);
    const dur = stack.getComponent("durability");
    if (!dur) return 0;
    return (energy / maxEnergy) * dur.maxDurability;
  }

  /**
   * Convert the durability amount to item energy.
   * @param {ItemStack} stack
   * @param {number} maxEnergy
   * @returns
   */
  static durabilityToEnergy(stack: ItemStack, maxEnergy: number): number {
    const dur = stack.getComponent("durability");
    if (!dur) return 0;
    return (dur.damage / dur.maxDurability) * maxEnergy;
  }
}
