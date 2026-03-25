/**
 * @internal Used to test units at runtime.
 */

import {
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandRegistry,
  CustomCommandResult,
  system,
} from "@minecraft/server";

export type UnitTestMap = Map<string, (ctx: CustomCommandOrigin, message?: string) => void>;

export class TestCommand {
  private static registered: boolean = false;

  static unitTests: UnitTestMap = new Map();

  static options: CustomCommand = {
    name: "mcutils:test",
    description: "Runs a unit test",
    permissionLevel: 1,
    mandatoryParameters: [{ name: "mcutils:units", type: CustomCommandParamType.Enum }],
    optionalParameters: [{ name: "message", type: CustomCommandParamType.String }],
  };

  static execute(ctx: CustomCommandOrigin, unit: string, message?: string): CustomCommandResult | undefined {
    const func = TestCommand.unitTests.get(unit);
    if (!func) return { status: 0, message: `§c'${unit}' is not a valid unit test!` };
    system.run(() => {
      func(ctx, message);
    });
    return { status: 1, message: "§aRan without errors" };
  }

  static register(registry: CustomCommandRegistry): void {
    if (this.registered) return;
    registry.registerEnum("mcutils:units", [...TestCommand.unitTests.keys()]);
    registry.registerCommand(this.options, this.execute);
    this.registered = true;
  }
}
