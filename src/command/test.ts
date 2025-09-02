import {
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandResult,
} from "@minecraft/server";

export const testCommand = {
  name: "mcutils:test",
  description: "Celebration size",
  permissionLevel: 1,
  optionalParameters: [
    { type: CustomCommandParamType.Integer, name: "celebrationSize" },
  ],
};

export function executeTestCommand(
  ctx: CustomCommandOrigin,
  celebrationSize: number,
): CustomCommandResult | undefined {
  console.warn("WORKED!");
  return undefined;
}
