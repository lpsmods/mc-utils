import { describe, expect, it } from "vitest";
import { BlockUtils } from "./utils";
import { world } from "@minecraft/server";
import { VECTOR3_ZERO } from "@minecraft/math";

describe("Block Utils", () => {
  const dim = world.getDimension("overworld");
  const BLOCK = dim.getBlock(VECTOR3_ZERO);
  if (!BLOCK) throw new Error("Block not found!");
  it("Returns true for any block", () => {
    const resultA = BlockUtils.matchAny(BLOCK, ["stone"]);
    const resultB = BlockUtils.matchAny(BLOCK, ["minecraft:stone"]);

    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
  });

  it("Returns false for any invalid block", () => {
    const resultA = BlockUtils.matchAny(BLOCK, ["!stone"]);
    const resultB = BlockUtils.matchAny(BLOCK, ["!minecraft:stone"]);

    expect(resultA).toBe(false);
    expect(resultB).toBe(false);
  });

  it("Returns true for a block", () => {
    const resultA = BlockUtils.matches(BLOCK, "stone");
    const resultB = BlockUtils.matches(BLOCK, "minecraft:stone");

    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
  });

  it("Returns false for an invalid block", () => {
    const resultA = BlockUtils.matches(BLOCK, "!stone");
    const resultB = BlockUtils.matches(BLOCK, "!minecraft:stone");

    expect(resultA).toBe(false);
    expect(resultB).toBe(false);
  });
});
