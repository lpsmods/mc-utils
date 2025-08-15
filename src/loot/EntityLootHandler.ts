import { EntityDieAfterEvent, world } from "@minecraft/server";
import { LootTableHandler } from "./LootTableHandler";
import { Identifier, id } from "../misc/Identifier";

export class EntityLootHandler extends LootTableHandler {
  entityId: Identifier;

  constructor(entityId: id) {
    super();
    this.entityId = Identifier.parse(entityId);
    this.tables.push(this.getDefaultTable());
  }

  getDefaultTable(): string {
    return `loot_tables/entities/${this.entityId.path}`;
  }

  static entityDie(event: EntityDieAfterEvent): void {
    const entity = event.deadEntity;
    for (const handler of EntityLootHandler.all.values()) {
      if (handler instanceof EntityLootHandler) {
        if (entity.matches({ type: handler.entityId.toString() })) {
          handler.drop(entity.dimension, entity.location);
        }
      }
    }
  }
}

// EVENTS
world.afterEvents.entityDie.subscribe(EntityLootHandler.entityDie);
