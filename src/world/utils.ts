import {
  BlockFillOptions,
  BlockPermutation,
  BlockType,
  BlockVolume,
  Dimension,
  Direction,
  LocationInUnloadedChunkError,
  ScoreboardIdentity,
  ScoreboardObjective,
  Vector2,
  Vector3,
} from "@minecraft/server";
import { ErrorUtils } from "../error";
import { BIOME_MAP } from "../constants";
import { Biome } from "../biome/biome";
import { LRUCache } from "../cache";
import { Hasher } from "../type";
import { Vector3Utils } from "@minecraft/math";

export abstract class WorldUtils {
  /**
   * Convert the biomeId to the name.
   * @param {number} biomeId
   * @param {object} biomeMap
   * @returns {string|undefined}
   */
  private static biome2Name(biomeId: number, biomeMap?: { [key: string]: number }): string | undefined {
    for (const [k, v] of Object.entries(biomeMap ?? BIOME_MAP)) {
      if (v === biomeId) return k;
    }
    return undefined;
  }

  /**
   * The world seed. (Returns 0)
   * @returns {number}
   */
  static getSeed(): number {
    return 0;
  }

  private static biomeCache = new LRUCache<string, Biome | undefined>({ debug: true });

  /**
   * @deprecated This will be replaced with Dimension.getBiome (2.4.0)
   * @param {Dimension} dimension
   * @param {Vector3} location
   * @param {string} entityId
   * @param {string} propertyName
   * @returns {string}
   */
  static getBiome(
    dimension: Dimension,
    location: Vector3,
    entityId?: string,
    propertyName?: string,
    biomeMap?: { [key: string]: number }
  ): Biome | undefined {
    const key = Hasher.stringify(Vector3Utils.floor({ x: location.x / 4, y: location.y / 4, z: location.z / 4 }));
    if (!key) return undefined;
    return this.biomeCache.getOrCompute(key, () => {
      const entity = dimension.spawnEntity(entityId ?? "mcutils:biome_checker", location);
      const biome = (entity.getProperty(propertyName ?? "mcutils:biome") as number) ?? 0;
      entity.remove();
      const typeId = this.biome2Name(biome, biomeMap);
      if (!typeId) return undefined;
      return new Biome(typeId);
    });
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

  static rot2dir(rotation: Vector2): Direction {
    const { x: pitch, y: yaw } = rotation;
    if (pitch <= -45) return Direction.Up;
    if (pitch >= 45) return Direction.Down;
    const norm = (((yaw % 360) + 540) % 360) - 180;
    if (norm >= -45 && norm < 45) return Direction.South;
    if (norm >= 45 && norm < 135) return Direction.West;
    if (norm >= -135 && norm < -45) return Direction.East;
    return Direction.North;
  }

  /**
   * Converts a number to a direction.
   * @param {number} num
   * @returns {Direction}
   */
  static num2dir(num: number): Direction {
    switch (num) {
      case 0:
        return Direction.North;
      case 1:
        return Direction.South;
      case 2:
        return Direction.East;
      case 3:
        return Direction.West;
      case 4:
        return Direction.Up;
      case 5:
        return Direction.Down;
      default:
        return Direction.North;
    }
  }

  /**
   * Rotates the Y direction counterclockwise.
   * @param {string} dir
   * @returns {Direction}
   */
  static rotateYCounterclockwise(dir: string | undefined): Direction {
    if (!dir) {
      return Direction.North;
    }
    if (typeof dir == "number") dir = WorldUtils.num2dir(dir);
    switch (dir.toLowerCase()) {
      case "north":
        return Direction.East;
      case "east":
        return Direction.South;
      case "south":
        return Direction.West;
      case "west":
        return Direction.North;
      default:
        return Direction.North;
    }
  }

  /**
   * Returns the primary cardinal direction from one location to another.
   * @param {Vector3} origin
   * @param {Vector3} target
   * @returns {Direction|undefined}
   */
  static relDir(origin: Vector3, target: Vector3): Direction | undefined {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    if (dx === 0 && dy === 0 && dz === 0) return undefined;
    if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) >= Math.abs(dz)) {
      return dx > 0 ? Direction.West : Direction.East;
    } else if (Math.abs(dz) >= Math.abs(dx) && Math.abs(dz) >= Math.abs(dy)) {
      return dz > 0 ? Direction.North : Direction.South;
    } else {
      return dy > 0 ? Direction.Down : Direction.Up;
    }
  }

  /**
   * Get the opposite direction.
   * @param {string|number} dir
   * @returns {Direction}
   */
  static getOpposite(dir: string | number | undefined): Direction | string {
    if (!dir) {
      return Direction.North;
    }
    if (typeof dir == "number") dir = WorldUtils.num2dir(dir);
    switch (dir.toLowerCase()) {
      case "north":
        return Direction.South;
      case "south":
        return Direction.North;
      case "east":
        return Direction.West;
      case "west":
        return Direction.East;
      case "top":
        return "bottom";
      case "above":
        return Direction.Down;
      case "bottom":
        return "top";
      case "below":
        return Direction.Up;
      default:
        return Direction.North;
    }
  }

  /**
   * Convert direction to an axis.
   * @param {string} dir
   * @returns {string}
   */
  static dir2Axis(dir: string | undefined): string {
    if (!dir) {
      return "x";
    }
    if (typeof dir == "number") dir = WorldUtils.num2dir(dir);
    switch (dir.toLowerCase()) {
      case "north":
      case "south":
        return "x";
      case "east":
      case "west":
        return "z";
      case "top":
      case "bottom":
        return "y";
      default:
        return "x";
    }
  }

  /**
   * Convert a direction to offset location.
   * @param {string|number} dir
   * @returns {Vector3}
   */
  static dir2Offset(dir: string | number | undefined): Vector3 {
    if (!dir) {
      return { x: 0, y: 0, z: -1 };
    }
    if (typeof dir == "number") dir = WorldUtils.num2dir(dir);
    switch (dir.toLowerCase()) {
      case "north":
        return { x: 0, y: 0, z: -1 };
      case "south":
        return { x: 0, y: 0, z: 1 };
      case "east":
        return { x: 1, y: 0, z: 0 };
      case "west":
        return { x: -1, y: 0, z: 0 };
      case "top":
      case "above":
      case "up":
        return { x: 0, y: 1, z: 0 };
      case "bottom":
      case "below":
      case "down":
        return { x: 0, y: -1, z: 0 };
      default:
        return { x: 0, y: 0, z: 0 };
    }
  }

  /**
   * Convert a direction to rotation.
   * @param {string|number} dir
   * @returns {Vector2}
   */
  static dir2Rot(dir: string | number | undefined): Vector2 {
    if (!dir) {
      return { x: 0, y: 0 };
    }
    if (typeof dir == "number") dir = WorldUtils.num2dir(dir);
    switch (dir.toLowerCase()) {
      case "north":
        return { x: 0, y: 180 };
      case "south":
        return { x: 0, y: 0 };
      case "east":
        return { x: 0, y: -90 };
      case "west":
        return { x: 0, y: 90 };
      case "above":
      case "up":
        return { x: -90, y: 0 };
      case "below":
      case "down":
        return { x: 90, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }

  /**
   * Returns world offset vector from a local (^ ^ ^) offset and direction
   * @param local Local offset in ^ ^ ^ space
   * @param direction Cardinal direction (north, south, east, west)
   * @returns Offset in world space
   */
  static offsetFromDirection(local: Vector3, direction: Direction): Vector3 {
    let forward: Vector3;
    let left: Vector3;
    const up: Vector3 = { x: 0, y: 1, z: 0 };

    switch (direction.toLowerCase()) {
      case "north":
        forward = { x: 0, y: 0, z: -1 };
        left = { x: 1, y: 0, z: 0 };
        break;
      case "south":
        forward = { x: 0, y: 0, z: 1 };
        left = { x: -1, y: 0, z: 0 };
        break;
      case "east":
        forward = { x: 1, y: 0, z: 0 };
        left = { x: 0, y: 0, z: 1 };
        break;
      case "west":
        forward = { x: -1, y: 0, z: 0 };
        left = { x: 0, y: 0, z: -1 };
        break;
      default:
        throw new Error("Unsupported direction: " + direction);
    }

    return {
      x: local.x * left.x + local.y * up.x + local.z * forward.x,
      y: local.x * left.y + local.y * up.y + local.z * forward.y,
      z: local.x * left.z + local.y * up.z + local.z * forward.z,
    };
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
    blockPermutation: BlockPermutation
  ): void | undefined {
    return ErrorUtils.wrapCatch<void>(LocationInUnloadedChunkError, () =>
      dimension.setBlockPermutation(location, blockPermutation)
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
    options?: BlockFillOptions
  ): Generator<any> {
    const chunks = this.chunkVolume(volume);
    for (const chunk of chunks) {
      dimension.fillBlocks(chunk, block, options);
      yield;
    }
  }
}
