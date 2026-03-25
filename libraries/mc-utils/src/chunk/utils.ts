import { Block, Dimension, Entity, Vector3, VectorXZ, world } from "@minecraft/server";

import { Chunk } from "./base";

export class ChunkUtils {
  /**
   * Converts a block pos to a chunk pos.
   * @param {Vector3} location
   * @returns {VectorXZ}
   */
  static pos(location: Vector3): VectorXZ {
    return {
      x: Math.floor(location.x / 16),
      z: Math.floor(location.z / 16),
    };
  }

  /**
   * Get the chunk from a position in the world.
   * @param {Dimension} dimension
   * @param {Vector3} location
   * @returns {Chunk}
   */
  static pos2Chunk(dimension: Dimension, location: Vector3): Chunk {
    const pos = this.pos(location);
    return new Chunk(dimension, pos);
  }

  /**
   * Get the chunk the block is in.
   * @param {Block} block
   * @returns {Chunk}
   */
  static block2Pos(block: Block): Chunk {
    return this.pos2Chunk(block.dimension, block.location);
  }

  /**
   * Get the chunk the entity is in.
   * @param {Entity} entity
   * @returns {Chunk}
   */
  static entity2Pos(entity: Entity): Chunk {
    return this.pos2Chunk(entity.dimension, entity.location);
  }

  /**
   * Create a string representation of a chunk
   * @returns {string}
   */
  static toString(chunk: Chunk): string {
    return `${chunk.dimension.id}_${chunk.x},${chunk.z}`;
  }

  /**
   * Gets a CHunk from the string representation produced by ChunkUtils.toString.
   */
  static fromString(str: string): Chunk {
    const parts = str.split("_");
    const pos = parts[parts.length].split(",");
    const dim = world.getDimension(parts.slice(0, -1).join("_"));
    return new Chunk(dim, {
      x: Number.parseInt(pos[0]),
      z: Number.parseInt(pos[1]),
    });
  }
}
