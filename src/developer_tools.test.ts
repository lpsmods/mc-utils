import { CustomCommandOrigin, Player } from "@minecraft/server";
import { DeveloperTools } from "./developer_tools";
import { UnitTestMap } from "./command/test";

export default (units: UnitTestMap) => {
  const dev = new DeveloperTools();

  units.set("dev", (ctx: CustomCommandOrigin) => {
    const entity = ctx.sourceEntity;
    if (!entity || !(entity instanceof Player)) return;
    dev.show(entity);
  });
};
