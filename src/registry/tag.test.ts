import { describe, expect, it } from "vitest";
import { CustomTags } from "./tag";

describe("Item Tags", () => {
  it("Returns true for any item", () => {
    const resultA = CustomTags.items.matches("waxable", "honeycomb");
    const resultB = CustomTags.items.matches("waxable", "minecraft:honeycomb");
    const resultC = CustomTags.items.matches("minecraft:waxable", "honeycomb");
    const resultD = CustomTags.items.matches("minecraft:waxable", "minecraft:honeycomb");
    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
    expect(resultC).toBe(true);
    expect(resultD).toBe(true);
  });

  it("Returns false for any item", () => {
    const resultA = CustomTags.items.matches("waxable", "paper");
    const resultB = CustomTags.items.matches("waxable", "minecraft:paper");
    const resultC = CustomTags.items.matches("minecraft:waxable", "paper");
    const resultD = CustomTags.items.matches("minecraft:waxable", "minecraft:paper");
    expect(resultA).toBe(false);
    expect(resultB).toBe(false);
    expect(resultC).toBe(false);
    expect(resultD).toBe(false);
  });

  it("Custom tag", () => {
    CustomTags.items.register("test:custom", ["paper"]);
    const resultA = CustomTags.items.matches("test:custom", "paper");
    const resultB = CustomTags.items.matches("test:custom", "honeycomb");
    const resultC = CustomTags.items.matches("custom", "paper");
    expect(resultA).toBe(true);
    expect(resultB).toBe(false);
    expect(resultC).toBe(false);
  });
});

describe("Block Tags", () => {
  it("Returns true for any block", () => {
    const resultA = CustomTags.blocks.matches("concrete", "orange_concrete");
    const resultB = CustomTags.blocks.matches("concrete", "minecraft:orange_concrete");
    const resultC = CustomTags.blocks.matches("minecraft:concrete", "orange_concrete");
    const resultD = CustomTags.blocks.matches("minecraft:concrete", "minecraft:orange_concrete");
    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
    expect(resultC).toBe(true);
    expect(resultD).toBe(true);
  });

  it("Returns false for any block", () => {
    const resultA = CustomTags.blocks.matches("concrete", "stone");
    const resultB = CustomTags.blocks.matches("concrete", "minecraft:stone");
    const resultC = CustomTags.blocks.matches("minecraft:concrete", "stone");
    const resultD = CustomTags.blocks.matches("minecraft:concrete", "minecraft:stone");
    expect(resultA).toBe(false);
    expect(resultB).toBe(false);
    expect(resultC).toBe(false);
    expect(resultD).toBe(false);
  });

  it("Custom tag", () => {
    CustomTags.blocks.register("test:custom", ["stone"]);
    const resultA = CustomTags.blocks.matches("test:custom", "stone");
    const resultB = CustomTags.blocks.matches("test:custom", "orange_concrete");
    const resultC = CustomTags.blocks.matches("custom", "stone");
    expect(resultA).toBe(true);
    expect(resultB).toBe(false);
    expect(resultC).toBe(false);
  });
});
