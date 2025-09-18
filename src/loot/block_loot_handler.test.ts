import { BlockLootHandler } from "./block_loot_handler";

export default () => {
  const grass = new BlockLootHandler("short_grass");
  grass.addTable("loot_tables/lpsmods/custom/short_grass");
};
