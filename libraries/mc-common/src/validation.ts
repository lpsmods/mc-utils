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

export class ConditionUtils {
  static isGzipped(value: any): boolean {
    if (typeof value !== "string") return false;
    return value.toString().startsWith("H4sIAAAAAAAA");
  }

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

  static isVec(value: any, size: number) {
    if (!Array.isArray(value)) return false;
    if (value.length !== size) return false;
    return value.every((x) => typeof x === "number");
  }

  static isVec3(value: any): boolean {
    return ConditionUtils.isVec(value, 3);
  }

  static isVec2(value: any): boolean {
    return ConditionUtils.isVec(value, 2);
  }

  static isVecXZ(value: any): boolean {
    return ConditionUtils.isVec(value, 2);
  }
}
