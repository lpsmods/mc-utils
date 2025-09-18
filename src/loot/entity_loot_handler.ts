import { EntityDieAfterEvent, world } from "@minecraft/server";
import { LootTableHandler } from "./loot_table_handler";
import { Identifier, id } from "../identifier";

let initialized = false;

export class EntityLootHandler extends LootTableHandler {
  entityId: Identifier;

  constructor(entityId: id) {
    super();
    this.entityId = Identifier.parse(entityId);
    this.tables.push(this.getDefaultTable());
    if (!initialized) init();
  }

  getDefaultTable(): string {
    return `loot_tables/entities/${this.entityId.path}`;
  }
}

function entityDie(event: EntityDieAfterEvent): void {
  const entity = event.deadEntity;
  for (const handler of EntityLootHandler.all.values()) {
    if (handler instanceof EntityLootHandler) {
      if (entity.matches({ type: handler.entityId.toString() })) {
        handler.generate(entity.dimension, entity.location);
      }
    }
  }
}

function init() {
  initialized = true;
  world.afterEvents.entityDie.subscribe(entityDie);
}
