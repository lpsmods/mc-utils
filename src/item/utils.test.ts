import { describe, expect, it } from "vitest";
import { ItemStack } from "@minecraft/server";
import { ItemUtils } from "./utils";

describe("Item Utils", () => {
  const ITEM = new ItemStack("paper");
  it("Returns true for any item", () => {
    const resultA = ItemUtils.matchAny(ITEM, ["paper"]);
    const resultB = ItemUtils.matchAny(ITEM, ["minecraft:paper"]);

    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
  });

  it("Returns false for any invalid item", () => {
    const resultA = ItemUtils.matchAny(ITEM, ["!paper"]);
    const resultB = ItemUtils.matchAny(ITEM, ["!minecraft:paper"]);

    expect(resultA).toBe(false);
    expect(resultB).toBe(false);
  });

  it("Returns true for a item", () => {
    const resultA = ItemUtils.matches(ITEM, "paper");
    const resultB = ItemUtils.matches(ITEM, "minecraft:paper");

    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
  });

  it("Returns false for an invalid item", () => {
    const resultA = ItemUtils.matches(ITEM, "!paper");
    const resultB = ItemUtils.matches(ITEM, "!minecraft:paper");

    expect(resultA).toBe(false);
    expect(resultB).toBe(false);
  });
});
