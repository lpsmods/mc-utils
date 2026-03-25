import { describe, expect, it } from "vitest";

import { BiomeUtils } from "./utils";

describe("Biome Utils", () => {
  const BIOME = "minecraft:plains";
  it("Returns true for any biome", () => {
    const resultA = BiomeUtils.matchAny(BIOME, ["plains"]);
    const resultB = BiomeUtils.matchAny(BIOME, ["minecraft:plains"]);

    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
  });

  it("Returns false for any invalid biome", () => {
    const resultA = BiomeUtils.matchAny(BIOME, ["!plains"]);
    const resultB = BiomeUtils.matchAny(BIOME, ["!minecraft:plains"]);

    expect(resultA).toBe(false);
    expect(resultB).toBe(false);
  });

  it("Returns true for a biome", () => {
    const resultA = BiomeUtils.matches(BIOME, "plains");
    const resultB = BiomeUtils.matches(BIOME, "minecraft:plains");

    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
  });

  it("Returns false for an invalid biome", () => {
    const resultA = BiomeUtils.matches(BIOME, "!plains");
    const resultB = BiomeUtils.matches(BIOME, "!minecraft:plains");

    expect(resultA).toBe(false);
    expect(resultB).toBe(false);
  });
});
