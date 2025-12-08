import { describe, expect, it } from "vitest";
import { WorldUtils } from "./utils";
import { world } from "@minecraft/server";

describe("World Utils", () => {
  it("Validate position", () => {
    const dim = world.getDimension("overworld");
    const resultA = WorldUtils.isValidPos(dim, { x: 0, y: 0, z: 0 });
    const resultB = WorldUtils.isValidPos(dim, { x: 0, y: -256, z: 0 });
    const resultC = WorldUtils.isValidPos(dim, { x: 0, y: 0, z: 8388610 });
    expect(resultA).toBe(true);
    expect(resultB).toBe(false);
    expect(resultC).toBe(false);
  });
});
