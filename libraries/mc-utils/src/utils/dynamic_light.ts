import { Entity } from "@minecraft/server";
import { VECTOR3_ZERO, Vector3Utils } from "@minecraft/math";

import { EntityEvents, EntityMovedEvent } from "../event";

export class DynamicLight {
  blockType: string;
  entity: Entity;

  /**
   * Light that follows the entity.
   * @param {Entity} entity
   * @param {string} blockType
   */
  constructor(entity: Entity, blockType: string = "light_block_15") {
    this.entity = entity;
    this.blockType = blockType;
    EntityEvents.moved.subscribe(this.moved.bind(this));
  }

  /**
   * Clean and untrack this dynamic light.
   */
  remove(): void {
    this.cleanup();
    const block = this.entity.dimension.getBlock(this.entity.location);
    if (block && block.matches(this.blockType)) {
      block.setType(block.isWaterlogged ? "water" : "air");
    }
    EntityEvents.moved.unsubscribe(this.moved);
  }

  private cleanup(): void {
    for (let x = -2; x < 2; x++) {
      for (let y = -2; y < 2; y++) {
        for (let z = -2; z < 2; z++) {
          if (Vector3Utils.equals(VECTOR3_ZERO, { x, y, z })) continue;
          const block = this.entity.dimension.getBlock(Vector3Utils.add(this.entity.location, { x, y, z }));
          if (block && block.matches(this.blockType)) {
            block.setType(block.isWaterlogged ? "water" : "air");
          }
        }
      }
    }
  }

  private moved(event: EntityMovedEvent): void {
    if (event.entity.id !== this.entity.id) return;
    if (!event.movedBlock) return;
    this.cleanup();
    const block = event.entity.dimension.getBlock(event.entity.location);
    if (block && (block.isAir || block.matches("water"))) {
      const bl = block.matches("water");
      block.setType(this.blockType);
      block.setWaterlogged(bl);
    }
  }
}
