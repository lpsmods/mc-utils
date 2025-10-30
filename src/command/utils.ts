import {
  Block,
  CustomCommandOrigin,
  CustomCommandResult,
  CustomCommandSource,
  Dimension,
  Entity,
  Player,
  world,
} from "@minecraft/server";

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

  static sendError(ctx: CustomCommandOrigin, message: string): void {
    const source = this.getSource(ctx);
    if (source instanceof Player) {
      source.sendMessage(`§c${message}`);
      return;
    }
    world.sendMessage(`§c${message}`);
  }

  static getPlayer(ctx: CustomCommandOrigin, player?: Player): Player {
    if (player && player instanceof Player) return player;
    if (!ctx.sourceEntity) throw new Error("No source entity");
    if (!(ctx.sourceEntity instanceof Player)) throw new Error("This command can only be ran by players");
    return ctx.sourceEntity;
  }

  static wrapCatch(error: Function, callback: () => CustomCommandResult | undefined): CustomCommandResult | undefined {
    try {
      return callback();
    } catch (err) {
      if (err instanceof (error as any)) return { status: 1, message: (err as Error).message };
      console.error(err);
      return { status: 1, message: "commands.generic.exception" };
    }
  }

  static wrapCatchAll(
    errors: Function[],
    callback: () => CustomCommandResult | undefined,
  ): CustomCommandResult | undefined {
    try {
      return callback();
    } catch (err) {
      if (!err) return;
      for (const error of errors) {
        if (error && typeof error === "function" && err instanceof error)
          return { status: 1, message: (err as Error).message };
      }
      console.error(err);
      return { status: 1, message: "commands.generic.exception" };
    }
  }
}
