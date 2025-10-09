import { CustomCommandOrigin } from "@minecraft/server";
import { WorldUtils } from "./utils";
import { UnitTestMap } from "../command/test";

export default (units: UnitTestMap) => {
  units.set("get_biome", (ctx: CustomCommandOrigin) => {
    const entity = ctx.sourceEntity;
    if (!entity) return;
    const biome = WorldUtils.getBiome(entity.dimension, entity.location, "lpsmods:biome_checker");
    if (!biome) return console.warn("Unknown biome!");
    console.warn(biome.typeId);
  });
};
