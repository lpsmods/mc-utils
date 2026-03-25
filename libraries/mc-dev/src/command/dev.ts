import { CustomCommandUtils } from "@lpsmods/mc-utils";
import { DeveloperTools } from "../developer_tools";
import {
  CommandPermissionLevel,
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandRegistry,
  CustomCommandResult,
  system,
} from "@minecraft/server";

export enum DevCommandAction {
  Show = "show",
}

export class DevCommand {
  private static registered: boolean = false;

  static options: CustomCommand = {
    name: "mcdev:dev",
    description: "A command for development purposes",
    permissionLevel: CommandPermissionLevel.Host,
    mandatoryParameters: [{ name: "mcdev:dev_action", type: CustomCommandParamType.Enum }],
  };

  static execute(ctx: CustomCommandOrigin, action: DevCommandAction): CustomCommandResult | undefined {
    const player = CustomCommandUtils.getPlayer(ctx);
    switch (action) {
      case DevCommandAction.Show:
        if (!DeveloperTools.instance) return { status: 1, message: "DeveloperTools not initialized." };
        system.run(() => {
          if (!DeveloperTools.instance) return;
          DeveloperTools.instance.show(player);
        });
        return { status: 0, message: "Opened developer tools UI." };
    }
  }

  static register(registry: CustomCommandRegistry): void {
    if (this.registered) return;
    registry.registerEnum("mcdev:dev_action", ["show"]);
    registry.registerCommand(this.options, this.execute.bind(this));
  }
}
