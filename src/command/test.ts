import { CustomCommandParamType } from "@minecraft/server";

export const testCommand = {
  name: "mcutils:test",
  description: "Celebration size",
  permissionLevel: 1,
  optionalParameters: [{ type: CustomCommandParamType.Integer, name: "celebrationSize" }],
};

export function executeTestCommand(): void {
  console.warn("WORKED!");
}
