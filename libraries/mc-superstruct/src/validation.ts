import { array, assign, boolean, define, number, object, optional, string } from "superstruct";
import { ConditionUtils } from "@lpsmods/mc-common";

export const isUuid4 = define("uuid4", ConditionUtils.isUuid4);

export const isBlock = define("BlockType", ConditionUtils.isBlock);

export const isItem = define("ItemType", ConditionUtils.isItem);

export const isEntity = define("EntityType", ConditionUtils.isEntity);

export const isEffect = define("EffectType", ConditionUtils.isEffect);

export const isEnchant = define("EnchantmentType", ConditionUtils.isEnchant);

export const isDimension = define("DimensionType", ConditionUtils.isDimension);

export const vec3 = define("Vector3", ConditionUtils.isVec3);

export const vec2 = define("Vector2", ConditionUtils.isVec2);

export const entityFilterPropertyOptions = object({
  propertyId: string(),
  exclude: optional(boolean()),
  value: optional(string()),
});

export const entityFilterScoreOptions = object({
  exclude: optional(boolean()),
  maxScore: optional(number()),
  minScore: optional(number()),
  objective: optional(string()),
});

export const entityFilter = object({
  excludeFamilies: optional(array(string())),
  excludeGameModes: optional(array(string())),
  excludeNames: optional(array(string())),
  excludeTags: optional(array(string())),
  excludeTypes: optional(array(string())),
  families: optional(array(string())),
  gameMode: optional(string()),
  maxHorizontalRotation: optional(number()),
  maxLevel: optional(number()),
  maxVerticalRotation: optional(number()),
  minHorizontalRotation: optional(number()),
  minLevel: optional(number()),
  minVerticalRotation: optional(number()),
  name: optional(string()),
  propertyOptions: optional(array(entityFilterPropertyOptions)),
  scoreOptions: optional(array(entityFilterScoreOptions)),
  tags: optional(array(string())),
  type: optional(string()),
});

export const entityQuery = assign(
  entityFilter,
  object({
    closest: optional(number()),
    farthest: optional(number()),
    location: optional(vec3),
    maxDistance: optional(number()),
    minDistance: optional(number()),
    volume: optional(vec3),
  }),
);
