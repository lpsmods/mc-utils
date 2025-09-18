import { unitTestMap } from "./command/test";
import { MolangUtils } from "./molang";

export default (units: unitTestMap) => {
  units.set("block_molang", (ctx, message) => {
    const block = ctx.sourceBlock ?? ctx.sourceEntity?.dimension.getBlock(ctx.sourceEntity.location)?.below();
    if (!block) return;
    let bRes = MolangUtils.block(block, message ?? "'worked'");
    console.warn(bRes);
  });
  units.set("entity_molang", (ctx, message) => {
    const entity = ctx.sourceEntity;
    if (!entity) return;
    let eRes = MolangUtils.entity(entity, message ?? "'worked'");
    console.warn(eRes);
  });
};
