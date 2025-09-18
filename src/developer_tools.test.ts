import { CustomCommandOrigin, Player, world } from "@minecraft/server";
import { DeveloperTools } from "./developer_tools";
import { unitTestMap } from "./command/test";

export default (units: unitTestMap) => {
  const dev = new DeveloperTools();

  units.set("dev", (ctx: CustomCommandOrigin) => {
    const entity = ctx.sourceEntity;
    if (!entity || !(entity instanceof Player)) return;
    dev.show(entity);
  });
};
