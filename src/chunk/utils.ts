import { Block, Dimension, Entity, Vector3, VectorXZ } from "@minecraft/server";
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
}
