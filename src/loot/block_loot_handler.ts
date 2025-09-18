import { GameMode, PlayerBreakBlockBeforeEvent, system, world } from "@minecraft/server";
import { LootTableHandler } from "./loot_table_handler";
import { Vector3Utils } from "@minecraft/math";
import { Identifier, id } from "../identifier";

let initialized = false;

export class BlockLootHandler extends LootTableHandler {
  blockId: Identifier;

  constructor(blockId: id) {
    super();
    this.blockId = Identifier.parse(blockId);
    this.tables.push(this.getDefaultTable());
    if (!initialized) init();
  }

  getDefaultTable(): string {
    return `loot_tables/blocks/${this.blockId.path}`;
  }
}

function playerBreakBlock(event: PlayerBreakBlockBeforeEvent): void {
  if (event.player.getGameMode() === GameMode.Creative) return;
  for (const handler of BlockLootHandler.all.values()) {
    if (handler instanceof BlockLootHandler) {
      if (event.block.matches(handler.blockId.toString())) {
        system.run(() => {
          const dim = world.getDimension(event.block.dimension.id);
          const pos = Vector3Utils.add(event.block.location, {
            x: 0.5,
            y: 0,
            z: 0.5,
          });
          handler.generate(dim, pos);
        });
      }
    }
  }
}

function init() {
  initialized = true;
  world.beforeEvents.playerBreakBlock.subscribe(playerBreakBlock);
}
