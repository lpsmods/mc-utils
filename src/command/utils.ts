import { Block, CustomCommandOrigin, CustomCommandSource, Dimension, Entity, world } from "@minecraft/server";

export class CustomCommandUtils {
  static getSource(ctx: CustomCommandOrigin): Entity | Block | undefined {
    switch (ctx.sourceType) {
      case CustomCommandSource.Block:
        return ctx.sourceBlock;
      case CustomCommandSource.Entity:
        return ctx.sourceEntity;
      case CustomCommandSource.NPCDialogue:
        return ctx.initiator;
    }
    return undefined;
  }

  static getDimension(ctx: CustomCommandOrigin): Dimension {
    const source = this.getSource(ctx);
    if (!source) return world.getDimension("overworld");
    return source.dimension;
  }
}
