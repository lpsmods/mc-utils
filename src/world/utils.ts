import {
  BlockFillOptions,
  BlockPermutation,
  BlockType,
  BlockVolume,
  Dimension,
  LocationInUnloadedChunkError,
  ScoreboardIdentity,
  ScoreboardObjective,
  Vector3,
} from "@minecraft/server";
import { ErrorUtils } from "../utils/error";

export abstract class WorldUtils {
  /**
   * The world seed. (Returns 0)
   * @returns {number}
   */
  static getSeed(): number {
    return 0;
  }

  /**
   * Get score from objective. Otherwise return undefined.
   * @param {ScoreboardObjective} objective
   * @param {ScoreboardIdentity} name
   * @param {*} defaultValue
   * @returns
   */
  static tryGetScore(objective: ScoreboardObjective, name: ScoreboardIdentity, defaultValue?: any): number {
    try {
      var o = objective.getScore(name);
      if (o == undefined) return defaultValue;
      return o;
    } catch (err) {
      return defaultValue;
    }
  }

  /**
   * Like {Dimension.setBlockType} but wrapped in a try-catch LocationInUnloadedChunkError.
   * @param {Dimension} dimension
   * @param {Vector3} location
   * @param {Block} block
   * @returns {boolean}
   */
  static trySetBlockType(dimension: Dimension, location: Vector3, block: string): void | undefined {
    return ErrorUtils.wrapCatch<void>(LocationInUnloadedChunkError, () => dimension.setBlockType(location, block));
  }

  /**
   * Like {Dimension.setBlockPermutation} but wrapped in a try-catch LocationInUnloadedChunkError.
   * @param {Dimension} dimension
   * @param {Vector3} location
   * @param {BlockPermutation} blockPermutation
   * @returns {boolean}
   */
  static trySetBlockPermutation(
    dimension: Dimension,
    location: Vector3,
    blockPermutation: BlockPermutation,
  ): void | undefined {
    return ErrorUtils.wrapCatch<void>(LocationInUnloadedChunkError, () =>
      dimension.setBlockPermutation(location, blockPermutation),
    );
  }

  /**
   * Splits a block volume into smaller chunks.
   * @param {BlockVolume} volume
   * @param {number} maxBlocks
   * @returns {BlockVolume[]}
   */
  static chunkVolume(volume: BlockVolume, maxBlocks: number = 32000): BlockVolume[] {
    const min = volume.getMin();
    const max = volume.getMax();
    const sizeX = max.x - min.x + 1;
    const sizeY = max.y - min.y + 1;
    const sizeZ = max.z - min.z + 1;
    const total = sizeX * sizeY * sizeZ;
    if (total <= maxBlocks) return [volume];
    const maxDim = Math.floor(Math.cbrt(maxBlocks));
    const chunks = [];
    for (let x = min.x; x <= max.x; x += maxDim) {
      for (let y = min.y; y <= max.y; y += maxDim) {
        for (let z = min.z; z <= max.z; z += maxDim) {
          const to = {
            x: Math.min(x + maxDim - 1, max.x),
            y: Math.min(y + maxDim - 1, max.y),
            z: Math.min(z + maxDim - 1, max.z),
          };
          chunks.push(new BlockVolume({ x, y, z }, to));
        }
      }
    }

    return chunks;
  }

  /**
   * Like Dimension.fillBlocks but splits it up to override the max blocks.
   * @param {Dimension} dimension
   * @param {BlockVolume} volume
   * @param {BlockType | BlockPermutation | string} block
   * @param {BlockFillOptions} options
   */
  static *fillBlocks(
    dimension: Dimension,
    volume: BlockVolume,
    block: BlockType | BlockPermutation | string,
    options?: BlockFillOptions,
  ): Generator<any> {
    const chunks = this.chunkVolume(volume);
    for (const chunk of chunks) {
      dimension.fillBlocks(chunk, block, options);
      yield;
    }
  }
}
