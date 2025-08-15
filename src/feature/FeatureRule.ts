import { WorldUtils } from "../world/WorldUtils";
import { FeatureHandler, FeatureRuleCanPlaceEvent, FeatureRulePlaceEvent } from "./FeatureHandler";

export enum PlacementPass {
  surface_pass = 1,
  before_surface_pass = 2,
  underground_pass = 3,
}

export interface FeatureRuleOptions {
  placement_pass?: PlacementPass;
  scatter_chance?: number;
  min_y?: number;
  max_y?: number;
  biomes?: string[];
  blocks?: string[];
  condition?: (event: FeatureRuleCanPlaceEvent) => boolean;
  distribution?: {
    iterations?: number;
    x?: number;
    y?: number;
    z?: number;
  };
}

export class FeatureRule {
  typeId: string | null = null;
  handler: FeatureHandler | null = null;

  placesFeature: string;
  options: FeatureRuleOptions;

  constructor(placesFeature: string, options?: FeatureRuleOptions) {
    this.placesFeature = placesFeature;
    this.options = options ?? {};
  }

  // canPlace(event: ChunkLoadEvent): boolean {
  //   if (this.options.scatter_chance !== undefined) {
  //     if (Math.random() > this.options.scatter_chance) return false;
  //   }
  //   return true;
  // }

  /**
   * Checks if the feature can be placed at this location.
   * @param {ChunkLoadEvent} event
   * @returns {boolean}
   */
  canPlace(event: FeatureRuleCanPlaceEvent): boolean {
    const dim = event.dimension;
    const loc = event.location;

    if (this.options.condition && !this.options.condition(event)) return false;
    const block = dim.getBlock(loc);
    if (!block) return false;
    const onBlock = block.below();
    if (!onBlock) return false;

    // console.warn("canPlace", JSON.stringify(loc));

    // Distribution check (like vanilla: only allow at intervals)
    if (this.options.distribution) {
      const { x, y, z } = this.options.distribution;
      if (x !== undefined && loc.x % x !== 0) return false;
      if (y !== undefined && loc.y % y !== 0) return false;
      if (z !== undefined && loc.z % z !== 0) return false;
    }

    // Scatter chance (random chance to place)
    if (this.options.scatter_chance !== undefined) {
      if (Math.random() > this.options.scatter_chance) return false;
    }

    // Y-level restriction
    if (this.options.min_y !== undefined && loc.y < this.options.min_y) return false;
    if (this.options.max_y !== undefined && loc.y > this.options.max_y) return false;

    // Biome restriction
    if (this.options.biomes) {
      if (!this.handler)
        throw new Error(`FeatureHandler not found for feature rule '${this.typeId}'`);
      const biome = WorldUtils.getBiomeType(
        dim,
        loc,
        this.handler.biomeEntityId,
        this.handler.biomePropertyName,
        this.handler.biomeMap
      );
      for (const b of this.options.biomes) {
        if (b.charAt(0) === "!") {
          if (biome === b.slice(1)) return false;
          continue;
        }
        if (biome !== b) return false;
      }
    }

    // Block restriction
    if (this.options.blocks) {
      for (const b of this.options.blocks) {
        if (b.charAt(0) === "!") {
          if (onBlock.matches(b.slice(1))) return false;
          continue;
        }
        if (!onBlock.matches(b)) return false;
      }
    }

    return true;
  }

  canPlace_legacy(event: FeatureRuleCanPlaceEvent): boolean {
    const block = event.dimension.getBlock(event.location);
    if (!block) return false;
    const onBlock = block.below();
    if (!onBlock) return false;
    // Scatter chance (random chance to place)
    if (this.options.scatter_chance !== undefined) {
      if (Math.random() > this.options.scatter_chance) return false;
    }

    // Y-level restriction
    if (this.options.min_y !== undefined && event.location.y < this.options.min_y) return false;
    if (this.options.max_y !== undefined && event.location.y > this.options.max_y) return false;

    // Biome restriction
    // if (this.options.allowed_biomes && this.options.allowed_biomes.length > 0) {
    //   const biome = event.dimension.getBiome(event.location);
    //   if (!this.options.allowed_biomes.includes(biome?.id ?? "")) return false;
    // }

    if (this.options.biomes) {
      // for (const b of this.options.biomes) {
      //   // not
      //   if (b.charAt(0) === '!') {
      //     if (biome.matches(b.slice(1))) {
      //       return false;
      //     }
      //     continue;
      //   if (!biome.matches(b)) return false;
      // }
    }

    // Block restriction
    if (this.options.blocks) {
      for (const b of this.options.blocks) {
        // not
        if (b.charAt(0) === "!") {
          if (onBlock.matches(b.slice(1))) {
            return false;
          }
          continue;
        }
        if (!onBlock.matches(b)) return false;
      }
    }

    return true;
  }

  place(event: FeatureRulePlaceEvent): void {
    const dim = event.dimension;
    const entity = dim.spawnEntity(
      event.handle.options?.type ?? "mcutils:custom_feature",
      event.location
    );
    entity.addTag(this.placesFeature);
  }
}
