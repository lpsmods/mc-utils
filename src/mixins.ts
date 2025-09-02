import {
  ItemStack,
  Block,
  ScoreboardObjective,
  Vector3,
  Player,
  Dimension,
  Entity,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { DataStorage } from "./misc/data_storage";
import { PlayerUtils, ArmorSet, ArmorSetEvent } from "./entity/player_utils";
import { ItemUtils } from "./item/utils";
import { WorldUtils } from "./world/utils";
import { BlockUtils } from "./block/utils";
import { Biome } from "./biome/biome";
import { MolangUtils } from "./molang";
import { TextUtils } from "./text";

declare module "@minecraft/server" {
  interface ItemStack {
    startCooldown(player: Player): void;
    executeMolang(expression: string): unknown;
  }

  interface Dimension {
    getBiome(
      location: Vector3,
      entityId?: string,
      propertyName?: string,
    ): Biome | undefined;
  }

  interface ScoreboardObjective {
    tryGetScore(name: ScoreboardIdentity, defaultValue?: string): number;
  }

  interface Block {
    executeMolang(expression: string): unknown;

    /**
     * @remarks
     * Clears all dynamic properties that have been set on this
     * block.
     *
     * @throws This function can throw errors.
     */
    clearDynamicProperties(): void;

    /**
     * @remarks
     * Returns a property value.
     *
     * @param identifier
     * The property identifier.
     * @returns
     * Returns the value for the property, or undefined if the
     * property has not been set.
     * @throws This function can throw errors.
     */
    getDynamicProperty(
      identifier: string,
    ): boolean | number | string | Vector3 | undefined;

    /**
     * @remarks
     * Returns the available set of dynamic property identifiers
     * that have been used on this block.
     *
     * @returns
     * A string array of the dynamic properties set on this block.
     * @throws This function can throw errors.
     */
    getDynamicPropertyIds(): string[];

    /**
     * @remarks
     * Returns the total size, in bytes, of all the dynamic
     * properties that are currently stored for this block. This
     * includes the size of both the key and the value.  This can
     * be useful for diagnosing performance warning signs - if, for
     * example, a block has many megabytes of associated dynamic
     * properties, it may be slow to load on various devices.
     *
     * @throws This function can throw errors.
     */
    getDynamicPropertyTotalByteCount(): number;

    /**
     * @remarks
     * Sets a specified property to a value.
     *
     * @param identifier
     * The property identifier.
     * @param value
     * Data value of the property to set.
     * @throws This function can throw errors.
     */
    setDynamicProperty(
      identifier: string,
      value?: boolean | number | string | Vector3,
    ): void;

    getState<T extends keyof BlockStateSuperset>(
      stateName: T,
    ): BlockStateSuperset[T] | undefined;
    setState<T extends keyof BlockStateSuperset>(
      stateName: T,
      value: any,
    ): void;
    incrementState<T extends keyof BlockStateSuperset>(
      stateName: T,
      amount?: number,
    ): number;
    decrementState<T extends keyof BlockStateSuperset>(
      stateName: T,
      amount?: number,
    ): number;

    /**
     * Get this blocks energy level.
     */
    getEnergyLevel(): number | undefined;

    /**
     * Set this blocks energy level.
     * @param amount
     */
    setEnergyLevel(amount: number): void;

    /**
     * Increase this blocks energy level.
     * @param amount
     */
    increaseEnergyLevel(amount: number): number;

    /**
     * Decrease this blocks energy level.
     * @param amount
     */
    decreaseEnergyLevel(amount: number): number;
  }

  interface Player {
    applyArmor(
      armorSet: ArmorSet,
      condition?: (event: ArmorSetEvent) => boolean,
    ): void;
  }

  interface Entity {
    executeMolang(expression: string): unknown;
  }
}

declare global {
  interface String {
    toTitleCase(): string;
  }
}

// ITEM STACK

// TODO: Port some common item stack data like "damage"
ItemStack.prototype.startCooldown = function (player) {
  ItemUtils.startCooldown(this, player);
};

ItemStack.prototype.executeMolang = function (expression) {
  return MolangUtils.item(this, expression);
};

// BLOCK

Block.prototype.executeMolang = function (expression) {
  return MolangUtils.block(this, expression);
};

Block.prototype.clearDynamicProperties = function (): void {
  const store = new DataStorage(
    `mcutils:block_${this.location.x},${this.location.y},${this.location.z}`,
  );
  store.clear();
};

Block.prototype.getDynamicProperty = function (
  identifier: string,
): boolean | number | string | Vector3 | undefined {
  const store = new DataStorage(
    `mcutils:block_${this.location.x},${this.location.y},${this.location.z}`,
  );
  return store.getItem(identifier);
};

Block.prototype.getDynamicPropertyIds = function (): string[] {
  const store = new DataStorage(
    `mcutils:block_${this.location.x},${this.location.y},${this.location.z}`,
  );
  return store.keys();
};

Block.prototype.getDynamicPropertyTotalByteCount = function (): number {
  const store = new DataStorage(
    `mcutils:block_${this.location.x},${this.location.y},${this.location.z}`,
  );
  return store.getSize();
};

Block.prototype.setDynamicProperty = function (
  identifier: string,
  value?: boolean | number | string | Vector3,
): void {
  const store = new DataStorage(
    `mcutils:block_${this.location.x},${this.location.y},${this.location.z}`,
  );
  store.setItem(identifier, value);
};

Block.prototype.getState = function (stateName) {
  return this.permutation.getState(stateName);
};

Block.prototype.setState = function (stateName, value) {
  BlockUtils.setState(this, stateName, value);
};

Block.prototype.incrementState = function (stateName, amount) {
  return BlockUtils.incrementState(this, stateName, amount);
};

Block.prototype.decrementState = function (stateName, amount) {
  return BlockUtils.decrementState(this, stateName, amount);
};

Block.prototype.getEnergyLevel = function () {
  const level = this.getDynamicProperty("api:energy_level");
  if (level === undefined) return undefined;
  return level as number;
};

Block.prototype.setEnergyLevel = function (amount) {
  this.setDynamicProperty("api:energy_level", amount as number);
};

Block.prototype.increaseEnergyLevel = function (amount) {
  const value = (this.getEnergyLevel() ?? 0) + (amount ?? 1);
  this.setEnergyLevel(value);
  return value;
};

Block.prototype.decreaseEnergyLevel = function (amount) {
  const value = (this.getEnergyLevel() ?? 0) - (amount ?? 1);
  this.setEnergyLevel(value);
  return value;
};

// ENTITY

Entity.prototype.executeMolang = function (expression) {
  return MolangUtils.entity(this, expression);
};

// MISC

Player.prototype.applyArmor = function (armorSet, condition) {
  PlayerUtils.applyArmor(this, armorSet, condition);
};

Dimension.prototype.getBiome = function (location, entityId, propertyName) {
  return WorldUtils.getBiome(this, location, entityId, propertyName);
};

ScoreboardObjective.prototype.tryGetScore = function (name, defaultValue) {
  return WorldUtils.tryGetScore(this, name, defaultValue ?? 0);
};

// Global

String.prototype.toTitleCase = function () {
  return TextUtils.titleCase(this);
};
