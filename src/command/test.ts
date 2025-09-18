/**
 * @internal Used to test units at runtime.
*/

import {
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandResult,
  system,
} from "@minecraft/server";

export type unitTestMap = Map<string, (ctx: CustomCommandOrigin, message?: string) => void>;

export const unitTests: unitTestMap = new Map();

export const testCommand: CustomCommand = {
  name: "mcutils:test",
  description: "Runs a unit test",
  permissionLevel: 1,
  mandatoryParameters: [{ name: "mcutils:units", type: CustomCommandParamType.Enum }],
  optionalParameters: [{ name: "message", type: CustomCommandParamType.String }],
};

export function executeTestCommand(
  ctx: CustomCommandOrigin,
  unit: string,
  message?: string
): CustomCommandResult | undefined {
  const func = unitTests.get(unit);
  if (!func) return { status: 0, message: `§c'${unit}' is not a valid unit test!` };
  system.run(() => {
    func(ctx, message);
  });
  return { status: 1, message: "§aRan without errors" };
}
