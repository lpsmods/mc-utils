import {
  BlockType,
  BlockTypes,
  DimensionType,
  DimensionTypes,
  EffectType,
  EffectTypes,
  EnchantmentType,
  EnchantmentTypes,
  EntityType,
  EntityTypes,
  ItemType,
  ItemTypes,
} from "@minecraft/server";
import { array, assign, boolean, define, number, object, optional, string } from "superstruct";

export class ConditionUtils {
  static isUuid4(value: any): boolean {
    const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/gm;
    return regex.test(value);
  }

  static isBlock(value: any): boolean {
    return BlockTypes.get(value instanceof BlockType ? value.id : value) !== undefined;
  }

  static isItem(value: any): boolean {
    return ItemTypes.get(value instanceof ItemType ? value.id : value) !== undefined;
  }

  static isEntity(value: any): boolean {
    return EntityTypes.get(value instanceof EntityType ? value.id : value) !== undefined;
  }

  static isEffect(value: any): boolean {
    return EffectTypes.get(value instanceof EffectType ? value.getName() : value) !== undefined;
  }

  static isEnchant(value: any): boolean {
    return EnchantmentTypes.get(value instanceof EnchantmentType ? value.id : value) !== undefined;
  }

  static isDimension(value: any): boolean {
    return DimensionTypes.get(value instanceof DimensionType ? value.typeId : value) !== undefined;
  }

  static isVec3(value: any): boolean {
    return Array.isArray(value) && value.length >= 3 && value.length <= 3;
  }

  static isVec2(value: any): boolean {
    return Array.isArray(value) && value.length >= 2 && value.length <= 2;
  }
}

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
