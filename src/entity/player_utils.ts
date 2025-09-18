/**
 * Generic player functions.
 */

import { Block, EquipmentSlot, ItemStack, Player, system, Vector2, Vector3, world } from "@minecraft/server";
import { Chunk } from "../world/chunk";
import { MathUtils } from "../math";

export class ArmorSetEvent {
  constructor(player: Player, itemStack: ItemStack, equipmentSlot: EquipmentSlot, beforeItemStack?: ItemStack) {
    this.player = player;
    this.itemStack = itemStack;
    this.beforeItemStack = beforeItemStack;
    this.equipmentSlot = equipmentSlot;
  }

  readonly player: Player;
  readonly itemStack: ItemStack;
  readonly beforeItemStack?: ItemStack;
  readonly equipmentSlot: EquipmentSlot;
}

export interface ArmorSet {
  head?: ItemStack;
  chest?: ItemStack;
  legs?: ItemStack;
  feet?: ItemStack;
  mainhand?: ItemStack;
  offhand?: ItemStack;
}

export class PlayerUtils {
  /**
   * Get all loaded chunks by the player.
   * @param {player} player
   * @param {number} simulationDistance
   * @returns
   */
  static getLoadedChunks(player: Player, simulationDistance: number = 4): Chunk[] {
    const px = Math.floor(player.location.x);
    const pz = Math.floor(player.location.z);
    const chunkX = Math.floor(px / 16);
    const chunkZ = Math.floor(pz / 16);

    const chunks: Chunk[] = [];

    const maxDistance = simulationDistance + 1;

    for (let dx = -maxDistance; dx <= maxDistance; dx++) {
      for (let dz = -maxDistance; dz <= maxDistance; dz++) {
        const taxicab = Math.abs(dx) + Math.abs(dz);

        // Cardinal edge: allow distance up to simulationDistance
        const isCardinal =
          (dx === 0 && Math.abs(dz) === simulationDistance) || (dz === 0 && Math.abs(dx) === simulationDistance);

        if (taxicab <= simulationDistance + 1 && (taxicab <= simulationDistance || isCardinal)) {
          const x = chunkX + dx;
          const z = chunkZ + dz;
          chunks.push(new Chunk(player.dimension, { x, z }));
        }
      }
    }

    return chunks;
  }

  // TODO: radius should default to simulation distance.
  /**
   * Gets all blocks around a player within the specified radius.
   * @param {Player} player - The player to search around.
   * @param {number} radius - The radius to check blocks in all directions.
   * @returns {Block[]} List of blocks and their positions.
   */
  static getBlocksAroundPlayer(player: Player, radius?: number): Block[] {
    const size = radius ?? 5;
    const blocks = [];
    const dimension = player.dimension;
    const center = player.location;

    for (let x = -size; x <= size; x++) {
      for (let y = -size; y <= size; y++) {
        for (let z = -size; z <= size; z++) {
          const pos = {
            x: Math.floor(center.x + x),
            y: Math.floor(center.y + y),
            z: Math.floor(center.z + z),
          };

          try {
            const block = dimension.getBlock(pos);
            if (block) {
              blocks.push(block);
            }
          } catch (e) {
            // Skip invalid positions (like out of world)
          }
        }
      }
    }

    return blocks;
  }

  /**
   * Shortcut function for adding armor to the player.
   * @param {PLayer} player
   * @param {ArmorSet} armorSet
   * @param condition
   * @returns
   */
  static applyArmor(player: Player, armorSet: ArmorSet, condition?: (event: ArmorSetEvent) => boolean): void {
    const equ = player.getComponent("equippable");
    if (!equ) return;
    for (const key in EquipmentSlot) {
      const slot = EquipmentSlot[key as keyof typeof EquipmentSlot];
      const itemStack = armorSet[key.toLowerCase() as keyof ArmorSet];
      if (!itemStack) continue;
      const event = new ArmorSetEvent(player, itemStack, slot, equ.getEquipment(slot));
      if (condition === undefined || condition(event)) {
        equ.setEquipment(event.equipmentSlot, event.itemStack);
      }
    }
  }

  // TODO: reloading the world makes you stuck.

  /**
   * Make the player sit.
   * @param {Player} player
   */
  static sit(
    player: Player,
    location: Vector3,
    rotation?: Vector2,
    callback?: (cancel: boolean) => void,
    animations?: string[],
  ): void {
    player.inputPermissions.setPermissionCategory(9, false);
    player.inputPermissions.setPermissionCategory(10, false);
    player.inputPermissions.setPermissionCategory(11, false);
    player.inputPermissions.setPermissionCategory(12, false);
    player.teleport(location, { rotation: rotation });
    for (const anim of animations ?? ["animation.player.riding.arms", "animation.player.riding.legs"]) {
      player.playAnimation(anim, {
        stopExpression: "q.is_sneaking||q.is_jumping",
      });
    }
    const runId = system.runInterval(() => {
      if (!player.isSneaking && !player.isJumping) return;
      var cancel = false;
      try {
        if (callback) callback(cancel);
      } finally {
        if (cancel) return;
        player.inputPermissions.setPermissionCategory(9, true);
        player.inputPermissions.setPermissionCategory(10, true);
        player.inputPermissions.setPermissionCategory(11, true);
        player.inputPermissions.setPermissionCategory(12, true);
        system.clearRun(runId);
      }
    });
  }

  /**
   * Make the player sleep.
   * @param {Player} player
   */
  static sleep(
    player: Player,
    location: Vector3,
    rotation?: Vector2,
    callback?: (cancel: boolean) => void,
    animations?: string[],
  ): void {
    player.inputPermissions.setPermissionCategory(9, false);
    player.inputPermissions.setPermissionCategory(10, false);
    player.inputPermissions.setPermissionCategory(11, false);
    player.inputPermissions.setPermissionCategory(12, false);
    player.teleport(location, { rotation: rotation });
    for (const anim of animations ?? ["animation.player.sleeping"]) {
      player.playAnimation(anim, {
        stopExpression: "q.is_sneaking||q.is_jumping",
      });
    }
    const runId = system.runInterval(() => {
      if (!player.isSneaking && !player.isJumping) return;
      var cancel = false;
      try {
        if (callback) callback(cancel);
      } finally {
        if (cancel) return;
        player.inputPermissions.setPermissionCategory(9, true);
        player.inputPermissions.setPermissionCategory(10, true);
        player.inputPermissions.setPermissionCategory(11, true);
        player.inputPermissions.setPermissionCategory(12, true);
        system.clearRun(runId);
      }
    });
  }
}
