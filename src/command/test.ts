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

export const unitTests: UnitTestMap = new Map();

export class TestCommand {
  static options: CustomCommand = {
    name: "mcutils:test",
    description: "Runs a unit test",
    permissionLevel: 1,
    mandatoryParameters: [{ name: "mcutils:units", type: CustomCommandParamType.Enum }],
    optionalParameters: [{ name: "message", type: CustomCommandParamType.String }],
  };

  static execute(ctx: CustomCommandOrigin, unit: string, message?: string): CustomCommandResult | undefined {
    const func = unitTests.get(unit);
    if (!func) return { status: 0, message: `§c'${unit}' is not a valid unit test!` };
    system.run(() => {
      func(ctx, message);
    });
    return { status: 1, message: "§aRan without errors" };
  }

  static register(registry: CustomCommandRegistry): void {
    registry.registerEnum("mcutils:units", [...unitTests.keys()]);
    registry.registerCommand(this.options, this.execute);
  }
}
