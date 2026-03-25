import {
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandRegistry,
  CustomCommandResult,
  Entity,
  Player,
  system,
  world,
} from "@minecraft/server";
import { DataUtils } from "@lpsmods/mc-common";

import { CustomCommandUtils } from "./utils";
import { EntityUtils } from "../entity";

export class DataInspectorCommand {
  private static registered: boolean = false;

  static options: CustomCommand = {
    name: "mcutils:data-inspector",
    description: "Inspect dynamic properties.",
    permissionLevel: 1,
    optionalParameters: [
      { type: CustomCommandParamType.Enum, name: "mcutils:dynamic" },
      { type: CustomCommandParamType.EntitySelector, name: "entities" },
    ],
  };

  private static executeWorld(player: Player): CustomCommandResult | undefined {
    system.run(() => DataUtils.showInspector(world, player));
    return { status: 0 };
  }

  private static executeItem(player: Player, entities?: Entity[]): CustomCommandResult | undefined {
    const entity = !entities || entities.length === 0 ? player : entities[0];
    const stack = EntityUtils.getSelectedItem(entity);
    if (!stack) return { status: 1, message: "Entity has no selected item." };
    system.run(() => DataUtils.showInspector(stack, player));
    return { status: 0 };
  }

  private static executeEntity(player: Player, entities?: Entity[]): CustomCommandResult | undefined {
    const entity = !entities || entities.length === 0 ? player : entities[0];
    system.run(() => DataUtils.showInspector(entity, player));
    return { status: 0 };
  }

  static execute(ctx: CustomCommandOrigin, dynamic?: string, entities?: Entity[]): CustomCommandResult | undefined {
    const player = CustomCommandUtils.getPlayer(ctx);
    switch (dynamic) {
      case "world":
        return this.executeWorld(player);
      case "item":
        return this.executeItem(player, entities);
      default:
        return this.executeEntity(player, entities);
    }
  }

  static register(registry: CustomCommandRegistry): void {
    if (this.registered) return;
    registry.registerEnum("mcutils:dynamic", ["world", "entity", "item"]);
    registry.registerCommand(this.options, this.execute.bind(this));
    this.registered = true;
  }
}
