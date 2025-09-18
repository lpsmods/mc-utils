import { EntityLootHandler } from "./entity_loot_handler";

export default () => {
  const creeper = new EntityLootHandler("creeper");
  creeper.replaceTable("loot_tables/lpsmods/custom/creeper");
};
