import { CustomCommandParamType } from "@minecraft/server";

// feature
// featurerule

export const placeCommand = {
  name: "mcutils:customplace",
  description: "Places a custom feature, or feature rule in the world.",
  permissionLevel: 1,
  //   optionalParameters: [{ type: CustomCommandParamType.Integer, name: "celebrationSize" }],
};

export function executePlaceCommand(): void {
  console.warn("PLACE");
}
