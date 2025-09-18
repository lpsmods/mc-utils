import { BlockType, BlockTypes, EntityType, EntityTypes, ItemType, ItemTypes } from "@minecraft/server";

export abstract class AddonUtils {
  static addonId: string = "mcutils";

  /**
   * Returns a identifier with the PROJECT_ID as the namespace.
   * @param {string} path
   * @returns {string}
   */
  static makeId(path: string): string {
    return `${this.addonId}:${path}`;
  }

  /**
   * All blocks added by this Add-On.
   * @returns {BlockType[]}
   */
  static getBlockTypes(): BlockType[] {
    return BlockTypes.getAll().filter((block) => block.id.startsWith(this.addonId + ":"));
  }

  /**
   * All blocks added by this Add-On.
   * @returns {ItemType[]}
   */
  static getItemTypes(): ItemType[] {
    return ItemTypes.getAll().filter((item) => item.id.startsWith(this.addonId + ":"));
  }

  /**
   * All entities added by this Add-On.
   * @returns {EntityType[]}
   */
  static getEntityTypes(): EntityType[] {
    return EntityTypes.getAll().filter((entity) => entity.id.startsWith(this.addonId + ":"));
  }
}
