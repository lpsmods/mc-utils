import { Entity, ItemLockMode, Vector3 } from "@minecraft/server";

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
}
