import {
  Dimension,
  Entity,
  EntityRemoveBeforeEvent,
  ItemStack,
  Vector3,
  world,
} from "@minecraft/server";
import { EntityHandler } from "./entity_handler";

export class SpecificEntityHandler extends EntityHandler {
  constructor(entity: Entity) {
    super({ type: entity.typeId, tags: [entity.id] }, entity.id);
    entity.addTag(entity.id);
    this.onRemove = this.onRemove.bind(this);
  }

  onRemove(event: EntityRemoveBeforeEvent): void {
    super.remove();
  }

  remove(): void {
    super.remove();
    const entity = world.getEntity(this.id);
    if (!entity) return;
    entity.remove();
  }
}

export function spawnEntity(
  dimension: Dimension,
  identifier: string,
  location: Vector3,
): EntityHandler {
  const entity = dimension.spawnEntity(identifier, location);
  const handler = new SpecificEntityHandler(entity);
  return handler;
}

export function spawnItem(
  dimension: Dimension,
  itemStack: ItemStack,
  location: Vector3,
): EntityHandler {
  const entity = dimension.spawnItem(itemStack, location);
  const handler = new SpecificEntityHandler(entity);
  return handler;
}
