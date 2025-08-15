import { Dimension, Vector3 } from "@minecraft/server";
import { RandomUtils } from "../RandomUtils";

export abstract class LootTableHandler {
  static all: Map<string, LootTableHandler> = new Map<string, LootTableHandler>();
  readonly id: string;
  tables: string[];

  constructor(id?: string) {
    this.id = id ?? RandomUtils.id(4);
    LootTableHandler.all.set(this.id, this);
    this.tables = [];
  }

  getDefaultTable(): string {
    return ``;
  }

  remove() {
    LootTableHandler.all.delete(this.id);
  }

  addTable(table: string): void {
    this.tables.push(table);
  }

  replaceTable(table: string): void {
    this.tables = [table];
  }

  removeTable(table: string): void {
    this.tables.splice(this.tables.indexOf(table), 1);
  }

  // TODO: Only replace items that are dropped.
  removeDrops(dimension: Dimension, location: Vector3): void {
    for (const item of dimension.getEntities({
      type: "item",
      location: location,
      maxDistance: 1.5,
    })) {
      item.remove();
    }
  }

  drop(dimension: Dimension, location: Vector3): void {
    if (!this.tables.includes(this.getDefaultTable())) {
      this.removeDrops(dimension, location);
    }

    for (const table of this.tables) {
      if (table === this.getDefaultTable()) continue;
      const arg = table.replace(/^loot_tables\//m, "");
      dimension.runCommand(`loot spawn ${location.x} ${location.y} ${location.z} loot "${arg}"`);
    }
  }
}
