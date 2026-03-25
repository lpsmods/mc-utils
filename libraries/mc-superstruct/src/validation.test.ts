import { describe, expect, it } from "vitest";
import { assert } from "superstruct";
import {
  isUuid4,
  isBlock,
  isItem,
  isEntity,
  isEffect,
  isEnchant,
  isDimension,
  vec3,
  vec2,
  entityFilterPropertyOptions,
  entityFilterScoreOptions,
  entityFilter,
  entityQuery,
} from "./validation";

describe("Validation superstruct", () => {
  describe("Custom validators", () => {
    describe("isUuid4", () => {
      it("validates a valid UUID v4", () => {
        const validUuid = "123e4567-e89b-42d3-a456-426614174000";
        expect(() => assert(validUuid, isUuid4)).not.toThrow();
      });

      it("rejects an invalid UUID", () => {
        const invalidUuid = "not-a-uuid";
        expect(() => assert(invalidUuid, isUuid4)).toThrow();
      });

      it("rejects UUID v1", () => {
        const invalid = "12345678-1234-1234-1234-123456789012";
        expect(() => assert(invalid, isUuid4)).toThrow();
      });
    });

    describe("isBlock", () => {
      it("validates a valid block identifier", () => {
        const validBlock = "minecraft:air";
        expect(() => assert(validBlock, isBlock)).not.toThrow();
      });

      it("rejects an invalid block identifier", () => {
        const invalidBlock = "invalid:block";
        expect(() => assert(invalidBlock, isBlock)).toThrow();
      });
    });

    describe("isItem", () => {
      it("validates a valid item identifier", () => {
        const validItem = "minecraft:paper";
        expect(() => assert(validItem, isItem)).not.toThrow();
      });

      it("rejects an invalid item identifier", () => {
        const invalidItem = "invalid:item";
        expect(() => assert(invalidItem, isItem)).toThrow();
      });
    });

    describe("isEntity", () => {
      it("validates a valid entity identifier", () => {
        const validEntity = "minecraft:creeper";
        expect(() => assert(validEntity, isEntity)).not.toThrow();
      });

      it("rejects an invalid entity identifier", () => {
        const invalidEntity = "invalid:entity";
        expect(() => assert(invalidEntity, isEntity)).toThrow();
      });
    });

    describe("isEffect", () => {
      it("validates a valid effect identifier", () => {
        const validEffect = "minecraft:haste";
        expect(() => assert(validEffect, isEffect)).not.toThrow();
      });

      it("rejects an invalid effect identifier", () => {
        const invalidEffect = "invalid:effect";
        expect(() => assert(invalidEffect, isEffect)).toThrow();
      });
    });

    describe("isEnchant", () => {
      it("validates a valid enchantment identifier", () => {
        const validEnchant = "minecraft:mending";
        expect(() => assert(validEnchant, isEnchant)).not.toThrow();
      });

      it("rejects an invalid enchantment identifier", () => {
        const invalidEnchant = "invalid:enchant";
        expect(() => assert(invalidEnchant, isEnchant)).toThrow();
      });
    });

    describe("isDimension", () => {
      it("validates a valid dimension identifier", () => {
        const validDimension = "minecraft:overworld";
        expect(() => assert(validDimension, isDimension)).not.toThrow();
      });

      it("rejects an invalid dimension identifier", () => {
        const invalidDimension = "invalid:dimension";
        expect(() => assert(invalidDimension, isDimension)).toThrow();
      });
    });

    describe("vec3", () => {
      it("validates a valid 3D vector", () => {
        const validVec3 = [1, 2, 3];
        expect(() => assert(validVec3, vec3)).not.toThrow();
      });

      it("validates a valid 3D vector with decimals", () => {
        const validVec3 = [1.5, 2.7, -3.2];
        expect(() => assert(validVec3, vec3)).not.toThrow();
      });

      it("rejects a 2D vector", () => {
        const invalidVec3 = [1, 2];
        expect(() => assert(invalidVec3, vec3)).toThrow();
      });

      it("rejects a 4D vector", () => {
        const invalidVec3 = [1, 2, 3, 4];
        expect(() => assert(invalidVec3, vec3)).toThrow();
      });

      it("rejects non-numeric values", () => {
        const invalidVec3 = [1, "two", 3];
        expect(() => assert(invalidVec3, vec3)).toThrow();
      });
    });

    describe("vec2", () => {
      it("validates a valid 2D vector", () => {
        const validVec2 = [1, 2];
        expect(() => assert(validVec2, vec2)).not.toThrow();
      });

      it("validates a valid 2D vector with decimals", () => {
        const validVec2 = [1.5, -2.7];
        expect(() => assert(validVec2, vec2)).not.toThrow();
      });

      it("rejects a 1D vector", () => {
        const invalidVec2 = [1];
        expect(() => assert(invalidVec2, vec2)).toThrow();
      });

      it("rejects a 3D vector", () => {
        const invalidVec2 = [1, 2, 3];
        expect(() => assert(invalidVec2, vec2)).toThrow();
      });

      it("rejects non-numeric values", () => {
        const invalidVec2 = [1, "two"];
        expect(() => assert(invalidVec2, vec2)).toThrow();
      });
    });
  });

  describe("Entity filter structs", () => {
    describe("entityFilterPropertyOptions", () => {
      it("validates valid property options", () => {
        const validOptions = {
          propertyId: "minecraft:health",
          exclude: true,
          value: "20",
        };
        expect(() => assert(validOptions, entityFilterPropertyOptions)).not.toThrow();
      });

      it("validates minimal property options", () => {
        const minimalOptions = {
          propertyId: "minecraft:health",
        };
        expect(() => assert(minimalOptions, entityFilterPropertyOptions)).not.toThrow();
      });

      it("rejects missing propertyId", () => {
        const invalidOptions = {
          exclude: true,
        };
        expect(() => assert(invalidOptions, entityFilterPropertyOptions)).toThrow();
      });

      it("rejects invalid propertyId type", () => {
        const invalidOptions = {
          propertyId: 123,
        };
        expect(() => assert(invalidOptions, entityFilterPropertyOptions)).toThrow();
      });
    });

    describe("entityFilterScoreOptions", () => {
      it("validates valid score options", () => {
        const validOptions = {
          exclude: false,
          maxScore: 100,
          minScore: 0,
          objective: "kills",
        };
        expect(() => assert(validOptions, entityFilterScoreOptions)).not.toThrow();
      });

      it("validates empty score options", () => {
        const emptyOptions = {};
        expect(() => assert(emptyOptions, entityFilterScoreOptions)).not.toThrow();
      });

      it("rejects invalid exclude type", () => {
        const invalidOptions = {
          exclude: "true",
        };
        expect(() => assert(invalidOptions, entityFilterScoreOptions)).toThrow();
      });

      it("rejects invalid score type", () => {
        const invalidOptions = {
          maxScore: "100",
        };
        expect(() => assert(invalidOptions, entityFilterScoreOptions)).toThrow();
      });
    });

    describe("entityFilter", () => {
      it("validates a complex entity filter", () => {
        const validFilter = {
          excludeFamilies: ["monster"],
          families: ["humanoid"],
          gameMode: "survival",
          maxLevel: 50,
          minLevel: 10,
          name: "Steve",
          tags: ["player"],
          type: "minecraft:player",
          propertyOptions: [
            {
              propertyId: "minecraft:health",
              value: "20",
            },
          ],
          scoreOptions: [
            {
              objective: "kills",
              minScore: 5,
            },
          ],
        };
        expect(() => assert(validFilter, entityFilter)).not.toThrow();
      });

      it("validates minimal entity filter", () => {
        const minimalFilter = {};
        expect(() => assert(minimalFilter, entityFilter)).not.toThrow();
      });

      it("rejects invalid array types", () => {
        const invalidFilter = {
          excludeFamilies: "monster", // should be array
        };
        expect(() => assert(invalidFilter, entityFilter)).toThrow();
      });

      it("rejects invalid nested objects", () => {
        const invalidFilter = {
          propertyOptions: [
            {
              // missing propertyId
              exclude: true,
            },
          ],
        };
        expect(() => assert(invalidFilter, entityFilter)).toThrow();
      });
    });

    describe("entityQuery", () => {
      it("validates a complete entity query", () => {
        const validQuery = {
          location: [100, 64, 200],
          maxDistance: 50,
          minDistance: 10,
          volume: [10, 10, 10],
          closest: 5,
          type: "minecraft:zombie",
          tags: ["hostile"],
        };
        expect(() => assert(validQuery, entityQuery)).not.toThrow();
      });

      it("validates entity query with filter properties", () => {
        const validQuery = {
          gameMode: "creative",
          maxLevel: 30,
          farthest: 10,
        };
        expect(() => assert(validQuery, entityQuery)).not.toThrow();
      });

      it("rejects invalid location vector", () => {
        const invalidQuery = {
          location: [100, 64], // should be 3D
        };
        expect(() => assert(invalidQuery, entityQuery)).toThrow();
      });

      it("rejects invalid distance types", () => {
        const invalidQuery = {
          maxDistance: "50", // should be number
        };
        expect(() => assert(invalidQuery, entityQuery)).toThrow();
      });
    });
  });
});
