import { ItemStack, world } from "@minecraft/server";
import { VECTOR3_ZERO } from "@minecraft/math";
import { describe, expect, it } from "vitest";

import { MolangUtils } from "./molang";

describe("Molang Utils", () => {
  const dim = world.getDimension("overworld");
  const block = dim.getBlock(VECTOR3_ZERO);
  if (!block) throw new Error("Block not found!");
  const entity = world.getEntity("1");
  if (!entity) throw new Error("Entity not found!");
  const item = new ItemStack("paper");

  it("Eval simple block molang", () => {
    const expr = "5 + 5";
    expect(MolangUtils.block(block, expr)).toBe(10);
  });

  it("Eval simple entity molang", () => {
    const expr = "5 + 5";
    expect(MolangUtils.entity(entity, expr)).toBe(10);
  });

  it("Eval simple item molang", () => {
    const expr = "5 + 5";
    expect(MolangUtils.item(item, expr)).toBe(10);
  });
});
