import { Vector3, VectorXZ } from "@minecraft/server";

/**
 * Converts a block pos to a chunk pos.
 * @param {Vector3} location
 * @returns {VectorXZ}
 */
export function locationToChunk(location: Vector3): VectorXZ {
  return {
    x: Math.floor(location.x / 16),
    z: Math.floor(location.z / 16),
  };
}
