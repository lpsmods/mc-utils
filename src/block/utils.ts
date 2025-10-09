/**
 * Generic block functions.
 */

import {
  Block,
  BlockComponentTickEvent,
  BlockPermutation,
  BlockType,
  Direction,
  GameMode,
  MolangVariableMap,
  Player,
  Vector3,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { MathUtils } from "../math";
import { WorldUtils } from "../world/utils";
import { Oxidization } from "../constants";
import { Identifier } from "../identifier";
import { Hasher } from "../type";
import { Vector3Utils } from "@minecraft/math";
import { CustomTags } from "../registry";

export enum ExposedDirection {
  Above = "above",
  Below = "below",
  Side = "side",
}

export abstract class BlockUtils {
  /**
   * Changes the block type, but preserves the states.
   * @param {Block} block
   * @param {string} typeId
   * @returns {Block}
   */
  static setType(block: Block, typeId?: string | BlockType, excludeStates?: string[]): void {
    const blockName = typeId instanceof BlockType ? typeId.id : typeId;
    const states = block.permutation.getAllStates();
    for (const state of excludeStates ?? []) {
      delete states[state];
    }
    try {
      block.setPermutation(BlockPermutation.resolve(blockName ?? "air", states));
    } catch (err) {
      block.setType(blockName ?? "air");
    }
  }

  /**
   * Changes the block state value.
   * @param {Block} block
   * @param {string} stateName
   * @param {any} stateValue
   * @returns {Block}
   */
  static setState(block: Block, stateName: keyof BlockStateSuperset, stateValue: any): void {
    block.setPermutation(block.permutation.withState(stateName, stateValue));
  }

  /**
   * Increase a number block state.
   * @param block
   * @param stateName
   * @param amount
   */
  static incrementState(block: Block, stateName: keyof BlockStateSuperset, amount: number = 1): number {
    const value = (block.permutation.getState(stateName) as number) + amount;
    BlockUtils.setState(block, stateName, value);
    return value;
  }

  /**
   * Decrease a number block state.
   * @param block
   * @param stateName
   * @param amount
   */
  static decrementState(block: Block, stateName: keyof BlockStateSuperset, amount: number = 1): number {
    const value = (block.permutation.getState(stateName) as number) - amount;
    BlockUtils.setState(block, stateName, value);
    return value;
  }

  /**
   * Toggle a boolean block state.
   * @param block
   * @param stateName
   */
  static toggleState(block: Block, stateName: keyof BlockStateSuperset): boolean {
    const value = block.permutation.getState(stateName) as boolean;
    BlockUtils.setState(block, stateName, !value);
    return !value;
  }

  /**
   * Checks if both blocks have a matching block state.
   * @param {Block} block First block to compare.
   * @param {Block} block2 Second block to compare.
   * @param {string} stateName The block property name to compare.
   * @returns {boolean} Whether or no the properties match.
   */
  static matchState(block: Block, block2: Block, stateName: string): boolean {
    return (
      block.permutation.getState(stateName as keyof BlockStateSuperset) ===
      block2.permutation.getState(stateName as keyof BlockStateSuperset)
    );
  }

  static MAX_CACHE: number = 512;
  static CACHE: { [key: string]: Array<BlockPermutation | undefined> } = {};
  /**
   * Checks if the block has neighbor updates.
   * @param {BlockComponentTickEvent} e
   * @returns {undefined}
   */
  static getNeighborUpdate(e: BlockComponentTickEvent): Direction | undefined {
    var size = Object.keys(BlockUtils.CACHE).length;
    if (size > BlockUtils.MAX_CACHE) {
      BlockUtils.CACHE = {};
    }
    var key = `${e.block.location.x},${e.block.location.y},${e.block.location.z}`;
    const cached = BlockUtils.CACHE[key];
    const perms = [
      e.block.north()?.permutation ?? undefined,
      e.block.south()?.permutation ?? undefined,
      e.block.east()?.permutation ?? undefined,
      e.block.west()?.permutation ?? undefined,
      e.block.above()?.permutation ?? undefined,
      e.block.below()?.permutation ?? undefined,
    ];
    if (!perms) return undefined;
    if (!cached) {
      BlockUtils.CACHE[key] = perms;
      return undefined;
    }
    for (let i = 0; i < perms.length; i++) {
      if (cached[i] != perms[i]) {
        BlockUtils.CACHE[key] = perms;
        return WorldUtils.num2dir(i);
      }
    }
    return undefined;
  }

  /**
   * Checks if a given BlockPermutation exists within a specified taxicab distance.
   * @param {Block} origin - The starting location.
   * @param {number} maxDistance - The maximum taxicab distance to check.
   * @param condition - Function to test.
   * @returns {boolean} - True if the block is found within range, false otherwise.
   */
  static isWithinTaxicabDistance(origin: Block, maxDistance: number, condition: (block: Block) => boolean): boolean {
    return (
      MathUtils.taxicabDistance<boolean>(origin, maxDistance, (location) => {
        const blk = origin.dimension.getBlock(location);
        if (blk && condition(blk)) return true;
      }) ?? false
    );
  }

  /**
   * Checks if a given BlockPermutation exists within a specified chebyshev distance.
   * @param {Block} origin - The starting block.
   * @param {number} maxDistance - The maximum chebyshev distance to check.
   * @param condition - Function to test.
   * @returns {boolean} - True if the block is found within range, false otherwise.
   */
  static isWithinChebyshevDistance(origin: Block, maxDistance: number, condition: (block: Block) => boolean): boolean {
    return (
      MathUtils.chebyshevDistance<boolean>(origin, maxDistance, (location) => {
        const blk = origin.dimension.getBlock(location);
        if (blk && condition(blk)) return true;
      }) ?? false
    );
  }

  /**
   * Tests if the block is water or is waterlogged.
   * @param {Block} block
   * @returns {boolean}
   */
  static isWater(block: Block): boolean {
    return block.matches("water");
  }

  /**
   * Breaks this block like if a player has broken it.
   * @param {Block} block
   * @param {Player} player
   * @returns
   */
  static destroy(block: Block, player?: Player): void {
    if (player && player.getGameMode() === GameMode.Creative) return block.setType("air");
    block.dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air destroy`);
  }

  /**
   * Guess the oxidized state of the block or block name.
   * @param {Block|string} block
   * @returns {Oxidization}
   */
  static guessOxidization(block: Block | string | BlockType): Oxidization {
    const typeId = Identifier.parse(block);
    const p = typeId.path.toLowerCase();
    if (p.includes("exposed")) return Oxidization.Exposed;
    if (p.includes("weathered")) return Oxidization.Weathered;
    if (p.includes("oxidized")) return Oxidization.Oxidized;
    return Oxidization.Normal;
  }

  /**
   * Filter positions to only those without another block directly above.
   * @param {Vector3[]} positions
   * @returns {Vector3[]}
   */
  static getExposedBlocks(positions: Vector3[], direction: ExposedDirection = ExposedDirection.Above) {
    const posSet = new Set(positions.map((p) => Hasher.stringify(p)));

    return positions.filter((p) => {
      if (direction === "above") {
        return !posSet.has(Hasher.stringify(Vector3Utils.add(p, { x: 0, y: 1, z: 0 })));
      }
      if (direction === "below") {
        return !posSet.has(Hasher.stringify(Vector3Utils.add(p, { x: 0, y: -1, z: 0 })));
      }
      if (direction === "side") {
        const sides = [
          Hasher.stringify(Vector3Utils.add(p, { x: 1, y: 0, z: 0 })),
          Hasher.stringify(Vector3Utils.add(p, { x: -1, y: 0, z: 0 })),
          Hasher.stringify(Vector3Utils.add(p, { x: 0, y: 0, z: 1 })),
          Hasher.stringify(Vector3Utils.add(p, { x: 0, y: 0, z: -1 })),
        ];
        return sides.some((sideKey) => !posSet.has(sideKey));
      }
      throw new Error(`Invalid direction: ${direction}`);
    });
  }

  /**
   * Match any block name.
   * @param {Block} block The block to match.
   * @param {string[]} blockPredicates An array of block names. Prefix with '#' for block tag or "!" to ignore.
   * @returns {boolean} Whether or not the block matched any of the block names.
   */
  static matchAny(
    block: Block,
    blockPredicates: string[],
    states?: Record<string, string | number | boolean>,
  ): boolean {
    const blockSet = [...new Set(blockPredicates)];
    return blockSet.some((blockPredicate) => {
      return BlockUtils.matches(block, blockPredicate, states);
    });
  }

  /**
   * Match this block.
   * @param {Block} block The block to match.
   * @param {string} blockPredicate A block name. Prefix with '#' for block tag or "!" to ignore.
   * @returns {boolean}
   */
  static matches(block: Block, blockPredicate: string, states?: Record<string, string | number | boolean>): boolean {
    if (blockPredicate.charAt(0) === "#") {
      const tag = blockPredicate.slice(1);
      return block.hasTag(tag) || CustomTags.blocks.matches(tag, block.typeId);
    }
    if (blockPredicate.charAt(0) === "!") {
      return !block.matches(blockPredicate.slice(1), states);
    }
    return block.matches(blockPredicate, states);
  }

  /**
   * Whether or not the block is a wall block.
   * @param {Block} block
   * @returns {boolean}
   */
  static isWall(block?: Block): boolean {
    if (!block) return false;
    return block.hasTag("wall") || Identifier.parse(block).path.includes("wall");
  }
}
