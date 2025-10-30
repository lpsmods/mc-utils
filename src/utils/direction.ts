/**
 * Generic direction functions.
 */

import {
  VECTOR2_ZERO,
  VECTOR3_DOWN,
  VECTOR3_EAST,
  VECTOR3_NORTH,
  VECTOR3_SOUTH,
  VECTOR3_UP,
  VECTOR3_WEST,
  VECTOR3_ZERO,
} from "@minecraft/math";
import { Direction, Vector2, Vector3 } from "@minecraft/server";

export abstract class DirectionUtils {
  /**
   * Converts a {@link Vector2} rotation to facing direction.
   * @param {Vector2} rotation
   * @returns {Direction}
   */
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
  static fromNumber(num: number): Direction {
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
    if (typeof dir == "number") dir = DirectionUtils.fromNumber(dir);
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
    if (typeof dir == "number") dir = DirectionUtils.fromNumber(dir);
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
  static toAxis(dir: string | undefined): string {
    if (!dir) {
      return "x";
    }
    if (typeof dir == "number") dir = DirectionUtils.fromNumber(dir);
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
  static toOffset(dir: string | number | undefined): Vector3 {
    if (!dir) {
      return { x: 0, y: 0, z: -1 };
    }
    if (typeof dir == "number") dir = DirectionUtils.fromNumber(dir);
    switch (dir.toLowerCase()) {
      case "north":
        return VECTOR3_NORTH;
      case "south":
        return VECTOR3_SOUTH;
      case "east":
        return VECTOR3_EAST;
      case "west":
        return VECTOR3_WEST;
      case "top":
      case "above":
      case "up":
        return VECTOR3_UP;
      case "bottom":
      case "below":
      case "down":
        return VECTOR3_DOWN;
      default:
        return VECTOR3_ZERO;
    }
  }

  /**
   * Convert a direction to rotation.
   * @param {string|number} dir
   * @returns {Vector2}
   */
  static toRotation(dir: string | number | undefined): Vector2 {
    if (!dir) {
      return VECTOR2_ZERO;
    }
    if (typeof dir == "number") dir = DirectionUtils.fromNumber(dir);
    switch (dir.toLowerCase()) {
      case "north":
        return { x: 0, y: 180 };
      case "south":
        return VECTOR2_ZERO;
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
        return VECTOR2_ZERO;
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
}
