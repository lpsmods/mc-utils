import {
  BlockPermutation,
  BlockTypes,
  ContainerSlot,
  DimensionTypes,
  EffectTypes,
  EnchantmentTypes,
  Entity,
  EntityTypes,
  ItemStack,
  ItemTypes,
  Player,
  world,
  World,
} from "@minecraft/server";

import { PropertyValue } from "../constants";
import { Typing, TypingTypes } from "../type";
import { Icon, ModalForm, ModalFormHandler, PageButton, PagedActionForm, PageData, Pages } from "../ui";
import { TextUtils } from "../text";
import { DecodeUtils } from "./decode";
import { EncodeUtils } from "./encode";
import { ConditionUtils } from "../validation";

/**
 * Objects that have dynamic property methods.
 */
export type DynamicObject = World | Entity | ItemStack | ContainerSlot;

export abstract class DataUtils {
  /**
   * Creates a deep copy of JSON data.
   * @param {T} input
   * @param {WeakMap} seen
   * @returns {T}
   */
  static deepCopy<T>(input: T, seen = new WeakMap()): T {
    // Handle primitives and functions directly
    if (input === null || typeof input !== "object") {
      return input;
    }

    // Preserve functions
    if (typeof input === "function") {
      return input;
    }

    // Handle circular references
    if (seen.has(input)) {
      return seen.get(input) as T;
    }

    // Handle arrays
    if (Array.isArray(input)) {
      const copy: any[] = [];
      seen.set(input, copy);
      for (const item of input) {
        copy.push(DataUtils.deepCopy(item, seen));
      }
      return copy as T;
    }

    // Handle plain objects
    const copy: Record<string, any> = {};
    seen.set(input, copy);
    for (const [key, value] of Object.entries(input)) {
      copy[key] = DataUtils.deepCopy(value, seen);
    }
    return copy as T;
  }

  static getDynamicProperty(object: DynamicObject, name: string, defaultValue?: any): any {
    const value = object.getDynamicProperty(name);
    if (value === undefined) return defaultValue;
    return this.load(value);
  }

  static setDynamicProperty(object: DynamicObject, name: string, value: any, gzip?: boolean) {
    object.setDynamicProperty(name, this.dump(value, gzip));
  }

  static getDynamicProperties(object: DynamicObject): {
    [key: string]: PropertyValue;
  } {
    const props: { [key: string]: PropertyValue } = {};
    for (const key of object.getDynamicPropertyIds()) {
      const value = this.getDynamicProperty(object, key);
      props[key] = value;
    }
    return props;
  }

  static decrementDynamicProperty(object: DynamicObject, name: string, defaultValue?: number): number {
    let value = this.getDynamicProperty(object, name) as number;
    if (value === undefined) value = defaultValue ?? 0;
    if (typeof value !== "number") throw new TypeError(`Expected a number but got ${typeof value}`);
    value--;
    this.setDynamicProperty(object, name, value);
    return value;
  }

  static incrementDynamicProperty(object: DynamicObject, name: string, defaultValue?: number): number {
    let value = this.getDynamicProperty(object, name) as number;
    if (value === undefined) value = defaultValue ?? 0;
    if (typeof value !== "number") throw new TypeError(`Expected a number but got ${typeof value}`);
    value++;
    this.setDynamicProperty(object, name, value);
    return value;
  }

  static loadJson(data: any): any {
    if (data.type === undefined) return data;
    const value = data.value;
    switch (data.type) {
      case "block_permutation":
        return BlockPermutation.resolve(value.blockName, value.states);
      case "block_type":
        return BlockTypes.get(value);
      case "item_type":
        return ItemTypes.get(value);
      case "entity_type":
        return EntityTypes.get(value);
      case "effect_type":
        return EffectTypes.get(value);
      case "dimension_type":
        return DimensionTypes.get(value);
      case "enchantment_type":
        return EnchantmentTypes.get(value);
      case "dimension":
        return world.getDimension(value);
      case "block":
        return world.getDimension(value.dimension).getBlock({ x: value.x, y: value.y, z: value.z });
      case "entity":
        return world.getEntity(value);
      case "bigint":
        return BigInt(value);
      case "undefined":
        return undefined;
      case "array":
        return value.map(DataUtils.loadJson);
      case "object":
        const result: { [key: string]: any } = {};
        for (const [k, v] of Object.entries(value)) {
          result[k] = DataUtils.loadJson(v);
        }
        return result;
    }
    return value;
  }

  /**
   * Converts a dynamic property value to any object.
   * @param {PropertyValue} value
   * @returns {any}
   */
  static load(value: PropertyValue): any {
    if (typeof value !== "string") return value;

    // Decompress if gzip
    try {
      if (ConditionUtils.isGzipped(value)) {
        const bytes = DecodeUtils.fromBase64(value);
        const res = DecodeUtils.fromGzip(bytes);
        return this.load(res);
      }
    } catch (err) {}

    try {
      const data = JSON.parse(value);
      if (!data.type) return data;
      return this.loadJson(data);
    } catch (err) {
      return value;
    }
  }

  static dumpJson(value: any): { type: string; value?: any } | PropertyValue {
    switch (Typing.get(value)) {
      case TypingTypes.BlockPermutation:
        return {
          type: "block_permutation",
          value: { blockName: value.type.id, states: value.getAllStates() },
        };
      case TypingTypes.BlockType:
        return { type: "block_type", value: value.id };
      case TypingTypes.ItemType:
        return { type: "item_type", value: value.id };
      case TypingTypes.EntityType:
        return { type: "entity_type", value: value.id };
      case TypingTypes.EffectType:
        return { type: "effect_type", value: value.getName() };
      case TypingTypes.DimensionType:
        return { type: "dimension_type", value: value.typeId };
      case TypingTypes.EnchantmentType:
        return { type: "enchantment_type", value: value.id };
      case TypingTypes.Dimension:
        return { type: "dimension", value: value.id };
      case TypingTypes.Block:
        return {
          type: "block",
          value: {
            dimension: value.dimension.id,
            x: value.x,
            y: value.y,
            z: value.z,
          },
        };
      case TypingTypes.Chunk:
        return {
          type: "chunk",
          value: { dimension: value.dimension.id, x: value.x, z: value.z },
        };
      case TypingTypes.Entity:
        return { type: "entity", value: value.id };
      case TypingTypes.Vector2:
        return { type: "vector2", value: value };
      case TypingTypes.VectorXZ:
        return { type: "vectorxz", value: value };
      case TypingTypes.BigInt:
        return { type: "bigint", value: Number(value) };
      case TypingTypes.Undefined:
        return { type: "undefined" };
      case TypingTypes.Array:
        return { type: "array", value: value.map(DataUtils.dumpJson) };
      case TypingTypes.Object:
        const result: {
          [key: string]: { type: string; value?: any } | PropertyValue;
        } = {};
        for (const [k, v] of Object.entries(value)) {
          result[k] = DataUtils.dumpJson(v);
        }
        return { type: "object", value: result };
    }
    // JSON safe.
    return value;
  }

  /**
   * Converts the value to a dynamic property safe value.
   * @param {any} value
   * @param {boolean} gzip
   * @returns {PropertyValue}
   */
  static dump(value: any, gzip?: boolean): PropertyValue {
    if (typeof value === "object") {
      value = JSON.stringify(this.dumpJson(value));
    }
    // Compress
    if (gzip && typeof value === "string") {
      value = EncodeUtils.toBase64(EncodeUtils.toGzip(value));
    }
    return value;
  }

  /**
   * Prints all properties to console.
   */
  static viewDynamicProperties(object: DynamicObject): void {
    for (const [k, v] of Object.entries(this.getDynamicProperties(object))) {
      console.warn(`${k} = ${JSON.stringify(v)}`);
    }
  }

  /**
   * Opens a UI where you can view, edit, or delete dynamic properties.
   * @param object
   * @param player
   */
  static showInspector(object: DynamicObject, player: Player, offset: number = 0, max: number = 100): void {
    const clearAction: PageButton = {
      icon: Icon.Trash,
      label: "§cDelete All",
      top_divider: true,
      onClick: (event) => {
        object.clearDynamicProperties();
      },
    };

    const pages: Pages = { home: { title: "Data Inspector", buttons: [] } };
    const props = Object.entries(this.getDynamicProperties(object));
    // Add props
    for (const [k, v] of props.slice(offset, offset + max)) {
      const pageId = `prop_${k}`;
      const buttons: PageButton[] = [];

      const printAction: PageButton = {
        icon: Icon.Copy,
        label: "Print Value",
        onClick: (event) => {
          console.log(`${k}: ${JSON.stringify(v)}`);
        },
      };

      const deleteAction: PageButton = {
        icon: Icon.Trash,
        label: "§cDelete",
        onClick: (event) => {
          object.setDynamicProperty(k, undefined);
          this.showInspector(object, player);
        },
      };

      const editAction: PageButton = {
        icon: Icon.PencilEdit,
        label: "Edit",
        onClick: (event) => {
          const form: ModalForm = {
            title: `Edit ${k}`,
            options: {
              content: {
                type: "text",
                label: "Content",
                value: JSON.stringify(DataUtils.dumpJson(v)),
              },
            },
            onSubmit: (event) => {
              const data = DataUtils.load(event.formResult.content as string);
              DataUtils.setDynamicProperty(object, k, data);
              this.showInspector(object, player);
            },
          };
          const ui = new ModalFormHandler(form, { saveValues: false });
          ui.show(event.player);
        },
      };

      const renameAction: PageButton = {
        icon: Icon.NameTag,
        label: "Rename",
        onClick: (event) => {
          const form: ModalForm = {
            title: `Rename ${k}`,
            options: { key: { type: "text", label: "Key", value: k } },
            onSubmit: (event) => {
              const newKey = event.formResult.key as string;
              if (newKey !== k) {
                DataUtils.setDynamicProperty(object, newKey, v);
                object.setDynamicProperty(k, undefined);
              }

              this.showInspector(object, player);
            },
          };
          const ui = new ModalFormHandler(form, { saveValues: false });
          ui.show(event.player);
        },
      };

      buttons.push(editAction);
      buttons.push(renameAction);
      buttons.push(printAction);
      buttons.push(deleteAction);

      // Add actions.
      const content = TextUtils.renderJSON(v);
      const rawContent = object.getDynamicProperty(k)?.toString();
      const page: PageData = {
        title: `"${k}"`,
        body: `§lType:§r ${typeof v}\n\n§lContent:§r\n${content}\n\n§lRaw Content:§r\n${rawContent}\n\n`,
        buttons: buttons,
      };
      pages.home.buttons?.push(pageId);
      pages[pageId] = page;
    }

    if (props.length === 0) {
      pages.home.body = "Object has no data.";
    } else {
      pages.home.body = `§lTotal:§r ${props.length}\n§lSize:§r ${object.getDynamicPropertyTotalByteCount().toLocaleString()} byte(s)\n\n`;
      pages.home.buttons?.push(clearAction);
    }

    const ui = new PagedActionForm(pages, {
      id: "mcutils:data_inspector",
      back_button: {},
    });
    ui.show(player);
  }
}
