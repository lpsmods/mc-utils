import {
  BiomeType,
  Block,
  BlockPermutation,
  BlockType,
  EffectType,
  EnchantmentType,
  Entity,
  EntityType,
  ItemStack,
  ItemType,
} from "@minecraft/server";

export type Id =
  | string
  | Identifier
  | Block
  | BlockPermutation
  | ItemStack
  | Entity
  | BiomeType
  | BlockType
  | EntityType
  | ItemType
  | EffectType
  | EnchantmentType;

export class Identifier {
  namespace: string;
  path: string;

  constructor(namespace: string, path: string) {
    this.namespace = namespace;
    this.path = path;
  }

  equals(other: Id): boolean {
    const id = Identifier.parse(other);
    return this.namespace === id.namespace && this.path === id.path;
  }

  matches = this.equals;

  /**
   * Add text to the end of the path.
   * @param {string} value
   * @returns {Identifier}
   */
  suffix(value: string): Identifier {
    this.path = this.path + value;
    return this;
  }

  /**
   * Add text to the start of the path.
   * @param {string} value
   * @returns {Identifier}
   */
  prefix(value: string): Identifier {
    this.path = value + this.path;
    return this;
  }

  /**
   * Replace text in the path.
   * @param {string|RegExp} searchValue
   * @param {string} replaceValue
   * @returns {Identifier}
   */
  replace(searchValue: string | RegExp, replaceValue: string): Identifier {
    this.path = this.path.replace(searchValue, replaceValue);
    return this;
  }

  /**
   * A custom function to transform the path.
   * @param fn Function containing the logic to convert the path.
   * @returns {Identifier}
   */
  transform(fn: (path: string) => string): Identifier {
    this.path = fn(this.path);
    return this;
  }

  static parse(value: Id): Identifier {
    if (!value) return new Identifier("minecraft", "unknown");
    if (value instanceof BlockPermutation) return Identifier.parse(value.type.id);
    if (value instanceof Block) return Identifier.parse(value.typeId);
    if (value instanceof ItemStack) return Identifier.parse(value.typeId);
    if (value instanceof Entity) return Identifier.parse(value.typeId);
    if (value instanceof BiomeType) return Identifier.parse(value.id);
    if (value instanceof BlockType) return Identifier.parse(value.id);
    if (value instanceof ItemType) return Identifier.parse(value.id);
    if (value instanceof EntityType) return Identifier.parse(value.id);
    if (value instanceof EffectType) return Identifier.parse(value.getName());
    if (value instanceof EnchantmentType) return Identifier.parse(value.id);
    if (value instanceof Identifier) return value;
    let parts = value.split(":");
    let namespace = "minecraft";
    let path = "";
    if (parts.length >= 2) {
      namespace = parts[0];
      path = parts.slice(1).join(":");
    } else {
      path = parts[0];
    }
    return new Identifier(namespace, path);
  }

  static string(value: Id): string {
    return this.parse(value).toString();
  }

  toString(): string {
    return `${this.namespace}:${this.path}`;
  }

  /**
   * Change the path while keeping the same namespace.
   * @param {string} path
   * @returns {Identifier}
   */
  withPath(path: string): Identifier {
    this.path = path;
    return this;
  }
}
