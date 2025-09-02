import { Vector3Utils } from "@minecraft/math";
import { Entity, Vector3 } from "@minecraft/server";

export class MathUtils {
  /**
   * Whether or not the VALUE is within MIN and MAX.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static inRange(value: number, min: number, max: number): boolean {
    return min <= value && max >= value;
  }

  /**
   * Calculate the distance between two locations
   * @param {Vector3} location1
   * @param {Vector3} location2
   * @returns
   */
  static distanceFromPoints(location1: Vector3, location2: Vector3): number {
    const e = location2.x - location1.x;
    const o = location2.y - location1.y;
    const r = location2.z - location1.z;
    return Math.floor(Math.sqrt(e * e + o * o + r * r));
  }

  /**
   * Expands a region by amount.
   * @param {Vector3} from
   * @param {Vector3} to
   * @param {number} amount
   * @returns {{from: Vector3, to: Vector3}}
   */
  static expandRegion(
    from: Vector3,
    to: Vector3,
    amount: number = 1,
  ): { from: Vector3; to: Vector3 } {
    const min = {
      x: Math.min(from.x, to.x) - amount,
      y: Math.min(from.y, to.y) - amount,
      z: Math.min(from.z, to.z) - amount,
    };

    const max = {
      x: Math.max(from.x, to.x) + amount,
      y: Math.max(from.y, to.y) + amount,
      z: Math.max(from.z, to.z) + amount,
    };

    return { from: min, to: max };
  }

  /**
   * Whether or not the entity is in a rectangle.
   * @param {Entity|Vector} origin
   * @param {Vector3} from
   * @param {Vector3} to
   * @returns {boolean}
   */
  static isInRect(
    origin: Entity | Vector3,
    from: Vector3,
    to: Vector3,
  ): boolean {
    const minX = Math.min(from.x, to.x);
    const maxX = Math.max(from.x, to.x);
    const minY = Math.min(from.y, to.y);
    const maxY = Math.max(from.y, to.y);
    const minZ = Math.min(from.z, to.z);
    const maxZ = Math.max(from.z, to.z);
    let loc = origin instanceof Entity ? origin.location : origin;
    return (
      loc.x >= minX &&
      loc.x <= maxX &&
      loc.y >= minY &&
      loc.y <= maxY &&
      loc.z >= minZ &&
      loc.z <= maxZ
    );
  }

  // TODO: Use Vector3Utils.add instead of this function
  static vecOffset(pos: Vector3, offset: Vector3 = { x: 0, y: 0, z: 0 }) {
    return Vector3Utils.add(pos, offset);
  }

  /**
   * Applies a bouncing effect to an entity, with decaying vertical strength.
   * Call this function when the entity lands on a block.
   * @param entity
   * @param initialStrength
   * @returns
   */
  static applyBounce(
    entity: Entity,
    initialStrength: number = 1.0,
    decayRate: number = 0.8,
  ): void {
    let strength = entity.getDynamicProperty("mcutils:bounce_strength") as
      | number
      | undefined;
    if (strength === undefined) {
      strength = initialStrength;
    }
    if (strength <= 0.1) {
      entity.setDynamicProperty("mcutils:bounce_strength");
      return;
    }
    entity.applyImpulse({ x: 0, y: strength, z: 0 });
    entity.setDynamicProperty("mcutils:bounce_strength", strength * decayRate);
  }

  // TODO: Modify so size can be a number or Vector3
  /**
   * Scans in a taxicab (Manhattan) pattern from the origin up to a max distance.
   * Calls the callback for each position.
   * If the callback returns a value (non-undefined), scanning stops and that value is returned.
   *
   * @param origin - Starting point for the scan.
   * @param size - Maximum taxicab distance.
   * @param callback - Function called for each position. Return a value to stop scanning early.
   * @returns The first non-undefined result from the callback, or undefined if nothing was found.
   */
  static taxicabDistance<T>(
    origin: Vector3,
    size: number,
    callback: (location: Vector3) => T | undefined,
  ): T | undefined {
    for (let dx = -size; dx <= size; dx++) {
      for (let dy = -size; dy <= size; dy++) {
        for (let dz = -size; dz <= size; dz++) {
          const distance = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
          if (distance > size) continue;

          const pos = {
            x: origin.x + dx,
            y: origin.y + dy,
            z: origin.z + dz,
          };

          const result = callback(pos);
          if (result !== undefined) return result;
        }
      }
    }
    return undefined;
  }

  // TODO: Modify so size can be a number or Vector3
  /**
   * Scans in a Chebyshev (king-move) pattern from the origin up to a max distance.
   * Calls the callback for each position.
   * If the callback returns a value (non-undefined), scanning stops and that value is returned.
   *
   * @param origin - Starting point for the scan.
   * @param size - Maximum Chebyshev distance.
   * @param callback - Function called for each position. Return a value to stop scanning early.
   * @returns The first non-undefined result from the callback, or undefined if nothing was found.
   */
  static chebyshevDistance<T>(
    origin: Vector3,
    size: number,
    callback: (pos: Vector3) => T | undefined,
  ): T | undefined {
    for (let dx = -size; dx <= size; dx++) {
      for (let dy = -size; dy <= size; dy++) {
        for (let dz = -size; dz <= size; dz++) {
          const distance = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
          if (distance > size) continue;

          const pos: Vector3 = {
            x: origin.x + dx,
            y: origin.y + dy,
            z: origin.z + dz,
          };

          const result = callback(pos);
          if (result !== undefined) return result;
        }
      }
    }

    return undefined;
  }

  /**
   * Rotates all points around the origin.
   * @param {Vector3[]} points
   * @param {Vector3} origin
   * @param {Vector3} rotation
   * @returns {Vector3[]}
   */
  static rotatePoints(
    points: Vector3[],
    origin: Vector3,
    rotation: Vector3,
  ): Vector3[] {
    // Convert degrees to radians
    const rx = (rotation.x * Math.PI) / 180;
    const ry = (rotation.y * Math.PI) / 180;
    const rz = (rotation.z * Math.PI) / 180;

    const sinX = Math.sin(rx),
      cosX = Math.cos(rx);
    const sinY = Math.sin(ry),
      cosY = Math.cos(ry);
    const sinZ = Math.sin(rz),
      cosZ = Math.cos(rz);

    return points.map((pt) => {
      // Translate point to origin
      let x = pt.x - origin.x;
      let y = pt.y - origin.y;
      let z = pt.z - origin.z;

      // Rotate around X axis
      let y1 = y * cosX - z * sinX;
      let z1 = y * sinX + z * cosX;
      y = y1;
      z = z1;

      // Rotate around Y axis
      let x1 = x * cosY + z * sinY;
      let z2 = -x * sinY + z * cosY;
      x = x1;
      z = z2;

      // Rotate around Z axis
      let x2 = x * cosZ - y * sinZ;
      let y2 = x * sinZ + y * cosZ;
      x = x2;
      y = y2;

      // Translate back
      return {
        x: x + origin.x,
        y: y + origin.y,
        z: z + origin.z,
      };
    });
  }
}
