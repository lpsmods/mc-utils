import { Direction, Entity, EntityQueryOptions, ItemLockMode, Player, Vector3 } from "@minecraft/server";
import { WorldUtils } from "../world";
import { forAllDimensions } from "../utils";

export abstract class EntityUtils {
  /**
   * Drops all items in the entities inventory.
   * @param {Entity} entity
   * @param {Vector3} location
   * @returns {boolean}
   */
  static dropAll(entity: Entity, location?: Vector3): boolean {
    const container = entity.getComponent("inventory")?.container;
    if (!container) return false;
    for (let slot = 0; slot < container.size; slot++) {
      const itemStack = container.getItem(slot);
      if (!itemStack || itemStack.lockMode !== ItemLockMode.none) continue;
      entity.dimension.spawnItem(itemStack, location ?? entity.location);
    }
    return true;
  }

  /**
   * Get the direction the entity is facing.
   * @param {Entity} entity
   * @returns {Direction}
   */
  static getFacingDirection(entity: Entity): Direction {
    return WorldUtils.rot2dir(entity.getRotation());
  }

  /**
   * Remove all entities from all dimensions that match options.
   * @param {EntityQueryOptions} options
   */
  static removeAll(options: EntityQueryOptions) {
    forAllDimensions((dim) => dim.getEntities(options).forEach((entity) => entity.remove()));
  }
}
