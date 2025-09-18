import { BlockType, BlockTypes, EntityType, EntityTypes, ItemType, ItemTypes } from "@minecraft/server";
import { array, assign, boolean, define, number, object, optional, string } from "superstruct";

export const isBlock = define("BlockType", (value: any) => {
  return BlockTypes.get(value instanceof BlockType ? value.id : value) !== undefined;
});

export const isItem = define("ItemType", (value: any) => {
  return ItemTypes.get(value instanceof ItemType ? value.id : value) !== undefined;
});

export const isEntity = define("EntityType", (value: any) => {
  return EntityTypes.get(value instanceof EntityType ? value.id : value) !== undefined;
});

export const vec3 = define("Vector3", (value: any) => {
  return Array.isArray(value) && value.length >= 3 && value.length <= 3;
});

export const vec2 = define("Vector2", (value: any) => {
  return Array.isArray(value) && value.length >= 2 && value.length <= 2;
});

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
  })
);
