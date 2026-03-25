import { describe, expect, it } from "vitest";
import { ConditionUtils } from "./validation";

describe("Validation", () => {
  describe("isGzipped", () => {
    it("validates a valid gzipped string", () => {
      const valid = ConditionUtils.isGzipped("H4sIAAAAAAAAC8tIzcnJL88vykkBAK0g6/kKAAAA");
      expect(valid).toBe(true);
    });
    it("rejects an invalid gzipped string ", () => {
      const invalid = ConditionUtils.isGzipped("notGzippedString");
      expect(invalid).toBe(false);
    });
  });
  describe("isUuid4", () => {
    it("validates a valid uuid", () => {
      const valid = ConditionUtils.isUuid4("7b5ffc03-3217-47d4-8fcc-44d1b3386e7d");
      expect(valid).toBe(true);
    });
    it("rejects an invalid uuid", () => {
      const invalid = ConditionUtils.isUuid4("not-a-uuid");
      expect(invalid).toBe(false);
    });
  });
  describe("isBlock", () => {
    it("validates a valid block identifier", () => {
      const valid = ConditionUtils.isBlock("minecraft:air");
      expect(valid).toBe(true);
    });
    it("rejects an invalid block identifier", () => {
      const invalid = ConditionUtils.isBlock("invalid:block");
      expect(invalid).toBe(false);
    });
  });
  describe("isItem", () => {
    it("validates a valid item identifier", () => {
      const valid = ConditionUtils.isItem("minecraft:paper");
      expect(valid).toBe(true);
    });
    it("rejects an invalid item identifier", () => {
      const invalid = ConditionUtils.isItem("invalid:item");
      expect(invalid).toBe(false);
    });
  });
  describe("isEntity", () => {
    it("validates a valid entity identifier", () => {
      const valid = ConditionUtils.isEntity("minecraft:creeper");
      expect(valid).toBe(true);
    });
    it("rejects an invalid entity identifier", () => {
      const invalid = ConditionUtils.isEntity("invalid:entity");
      expect(invalid).toBe(false);
    });
  });
  describe("isEffect", () => {
    it("validates a valid effect identifier", () => {
      const valid = ConditionUtils.isEffect("minecraft:haste");
      expect(valid).toBe(true);
    });
    it("rejects an invalid effect identifier", () => {
      const invalid = ConditionUtils.isEffect("invalid:effect");
      expect(invalid).toBe(false);
    });
  });
  describe("isEnchant", () => {
    it("validates a valid enchantment identifier", () => {
      const valid = ConditionUtils.isEnchant("minecraft:mending");
      expect(valid).toBe(true);
    });
    it("rejects an invalid enchantment identifier", () => {
      const invalid = ConditionUtils.isEnchant("invalid:enchant");
      expect(invalid).toBe(false);
    });
  });
  describe("isDimension", () => {
    it("validates a valid dimension identifier", () => {
      const valid = ConditionUtils.isDimension("minecraft:overworld");
      expect(valid).toBe(true);
    });
    it("rejects an invalid dimension identifier", () => {
      const invalid = ConditionUtils.isDimension("invalid:dimension");
      expect(invalid).toBe(false);
    });
  });
  describe("isVec3", () => {
    it("validates a valid 3D vector", () => {
      const valid = ConditionUtils.isVec3([1, 2, 3]);
      expect(valid).toBe(true);
    });
    it("validates a valid 3D vector with decimals", () => {
      const valid = ConditionUtils.isVec3([1.5, 2.7, -3.2]);
      expect(valid).toBe(true);
    });
    it("rejects a 2D vector", () => {
      const invalid = ConditionUtils.isVec3([1, 2]);
      expect(invalid).toBe(false);
    });
    it("rejects a 4D vector", () => {
      const invalid = ConditionUtils.isVecXZ([1, 2, 3, 4]);
      expect(invalid).toBe(false);
    });
    it("rejects non-numeric 3D vector", () => {
      const invalid = ConditionUtils.isVec3([1, "two", 3]);
      expect(invalid).toBe(false);
    });
  });
  describe("isVec2", () => {
    it("validates a valid 2D vector", () => {
      const valid = ConditionUtils.isVec2([1, 2]);
      expect(valid).toBe(true);
    });
    it("validates a valid 2D vector with decimals", () => {
      const valid = ConditionUtils.isVec2([1.5, 2.7]);
      expect(valid).toBe(true);
    });
    it("rejects a 3D vector", () => {
      const invalid = ConditionUtils.isVec2([1, 2, 3]);
      expect(invalid).toBe(false);
    });
    it("rejects a 1D vector", () => {
      const invalid = ConditionUtils.isVec2([1]);
      expect(invalid).toBe(false);
    });
    it("rejects non-numeric 2D vector", () => {
      const invalid = ConditionUtils.isVec2([1, "two"]);
      expect(invalid).toBe(false);
    });
  });
  describe("isVecXZ", () => {
    it("validates a valid vectorxz", () => {
      const valid = ConditionUtils.isVecXZ([1, 2]);
      expect(valid).toBe(true);
    });
    it("validates a valid vectorxz with decimals", () => {
      const valid = ConditionUtils.isVecXZ([1.5, 2.7]);
      expect(valid).toBe(true);
    });
    it("rejects a vector3", () => {
      const invalid = ConditionUtils.isVecXZ([1, 2, 3]);
      expect(invalid).toBe(false);
    });
    it("rejects a vector1", () => {
      const invalid = ConditionUtils.isVecXZ([1]);
      expect(invalid).toBe(false);
    });
    it("rejects non-numeric vectorxz", () => {
      const invalid = ConditionUtils.isVecXZ([1, "two"]);
      expect(invalid).toBe(false);
    });
  });
});
