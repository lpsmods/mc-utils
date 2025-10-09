import { CustomCommand, CustomCommandOrigin, CustomCommandRegistry, CustomCommandResult } from "@minecraft/server";

// feature
// featurerule

export class PlaceCommand {
  static options: CustomCommand = {
    name: "mcutils:custom-place",
    description: "Places a custom feature, or feature rule in the world.",
    permissionLevel: 1,
    //   optionalParameters: [{ type: CustomCommandParamType.Integer, name: "celebrationSize" }],
  };

  static execute(ctx: CustomCommandOrigin): CustomCommandResult | undefined {
    console.warn("PLACE");
    return undefined;
  }

  static register(registry: CustomCommandRegistry): void {
    registry.registerCommand(this.options, this.execute);
  }
}
