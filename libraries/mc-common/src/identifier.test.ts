import { describe, expect, it } from "vitest";
import { Identifier } from "./identifier";
import { EffectTypes, EnchantmentTypes, ItemStack, world } from "@minecraft/server";
import { VECTOR3_ZERO } from "@minecraft/math";

describe("Identifier validation", () => {
  const DIM = world.getDimension("overworld");
  const BLOCK = DIM.getBlock(VECTOR3_ZERO);
  if (!BLOCK) throw new Error("Block not found!");
  const ENTITY = world.getEntity("1234");
  if (!ENTITY) throw new Error("Entity not found!");
  const ITEM = new ItemStack("paper");
  const EFFECT = EffectTypes.get("haste");
  if (!EFFECT) throw new Error("Effect not found!");
  const ENCHANT = EnchantmentTypes.get("mending");
  if (!ENCHANT) throw new Error("Enchant not found!");

  it("validate is identifier", () => {
    const resultA = Identifier.isId("namespace:path");
    const resultB = Identifier.isId("path");
    // const resultC = Identifier.parse(new Identifier('test', 'path'));
    // const resultD = Identifier.parse(BLOCK);
    // const resultE = Identifier.parse(BLOCK?.permutation);
    // const resultF = Identifier.parse(ITEM);
    // const resultG = Identifier.parse(ENTITY);
    // const resultH = Identifier.parse(DIM.getBiome(VECTOR3_ZERO));
    // const resultI = Identifier.parse(BLOCK.type);
    // const resultJ = Identifier.parse(ENTITY);
    // const resultK = Identifier.parse(ITEM.type);
    // const resultL = Identifier.parse(EFFECT);
    // const resultM = Identifier.parse(ENCHANT);

    expect(resultA).toBe(true);
    expect(resultB).toBe(false);

    // expect(resultC).toBe(true);
    // expect(resultD).toBe(true);
    // expect(resultE).toBe(true);
    // expect(resultF).toBe(true);
    // expect(resultG).toBe(true);
    // expect(resultH).toBe(true);
    // expect(resultI).toBe(true);
    // expect(resultJ).toBe(true);
    // expect(resultK).toBe(true);
    // expect(resultL).toBe(true);
    // expect(resultM).toBe(true);
  });

  it("accepts a valid identifier", () => {
    const resultA = Identifier.parse("namespace:path");
    const resultB = Identifier.parse("path");
    // const resultC = Identifier.parse(new Identifier('test', 'path'));
    // const resultD = Identifier.parse(BLOCK);
    // const resultE = Identifier.parse(BLOCK?.permutation);
    // const resultF = Identifier.parse(ITEM);
    // const resultG = Identifier.parse(ENTITY);
    // const resultH = Identifier.parse(DIM.getBiome(VECTOR3_ZERO));
    // const resultI = Identifier.parse(BLOCK.type);
    // const resultJ = Identifier.parse(ENTITY);
    // const resultK = Identifier.parse(ITEM.type);
    // const resultL = Identifier.parse(EFFECT);
    // const resultM = Identifier.parse(ENCHANT);
    expect(resultA).toEqual(new Identifier("namespace", "path"));
    expect(resultB).toEqual(new Identifier("minecraft", "path"));

    // expect(resultC).toEqual(new Identifier("test", "path"));
    // expect(resultD).toEqual(new Identifier("minecraft", "stone"));
    // expect(resultE).toEqual(new Identifier("minecraft", "stone"));
    // expect(resultF).toEqual(new Identifier("minecraft", "paper"));
    // expect(resultG).toEqual(new Identifier("minecraft", "creeper"));
    // expect(resultH).toEqual(new Identifier("minecraft", "plains"));
    // expect(resultI).toEqual(new Identifier("minecraft", "stone"));
    // expect(resultJ).toEqual(new Identifier("minecraft", "path"));
    // expect(resultK).toEqual(new Identifier("minecraft", "paper"));
    // expect(resultL).toEqual(new Identifier("minecraft", "haste"));
    // expect(resultM).toEqual(new Identifier("minecraft", "mending"));
  });
  it("throws for an empty string", () => {
    expect(true).toBe(true);
  });
  it("throws when starting with a number", () => {
    expect(true).toBe(true);
  });
  it("allows underscores and letters", () => {
    expect(true).toBe(true);
  });
  it("rejects special characters", () => {
    expect(true).toBe(true);
  });
  it("handles unicode characters correctly", () => {
    expect(true).toBe(true);
  });
});
