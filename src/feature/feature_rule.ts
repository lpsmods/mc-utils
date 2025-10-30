import { FeatureHandler, FeatureRuleCanPlaceEvent, FeatureRulePlaceEvent } from "./feature_handler";
import { Vector3Utils } from "@minecraft/math";
import { REPLACEABLE_BLOCKS } from "../constants";
import { BiomeUtils } from "../biome/utils";
import { BlockUtils } from "../block/utils";

export enum PlacementPass {
  surface_pass = 1,
  before_surface_pass = 2,
  underground_pass = 3,
}

export interface CustomFeatureRuleOptions {
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

/**
 * Defines a custom feature rule.
 */
export class CustomFeatureRule {
  static typeId: string | null = "feature_rule";
  id: string | null = null;
  handler: FeatureHandler | null = null;

  placesFeature: string;
  readonly options: CustomFeatureRuleOptions;

  constructor(placesFeature: string, options?: CustomFeatureRuleOptions) {
    this.placesFeature = placesFeature;
    this.options = options ?? {};
  }

  /**
   * Fires before this feature rule is placed.
   */
  beforePlace?(): void;

  /**
   * Checks if the feature can be placed at this location.
   * @param {ChunkLoadEvent} event
   * @returns {boolean}
   */
  canPlace(event: FeatureRuleCanPlaceEvent): boolean {
    if (!this.handler) throw new Error(`FeatureHandler not found for feature rule '${this.id}'`);
    const feature = this.handler.features.get(this.placesFeature);
    if (!feature) throw new Error(`Feature ${this.placesFeature} not found!`);
    if (feature.beforePlace) feature.beforePlace();
    const dim = event.dimension;
    const loc = event.location;

    if (this.options.condition && !this.options.condition(event)) {
      if (this.handler.debug) console.warn(`${this.id} | Condition failed`);
      return false;
    }
    const block = dim.getBlock(loc);
    if (!block) {
      if (this.handler.debug) console.warn(`${this.id} | getBlock failed (was the chunk loaded?)`);
      return false;
    }
    const onBlock = block.below();
    if (!onBlock) {
      if (this.handler.debug) console.warn(`${this.id} | below failed`);
      return false;
    }

    // console.warn("canPlace", JSON.stringify(loc));

    // Distribution check (like vanilla: only allow at intervals)
    if (this.options.distribution) {
      const { x, y, z } = this.options.distribution;
      if (x !== undefined && loc.x % x !== 0) {
        if (this.handler.debug) console.warn(`${this.id} | X distribution failed`);
        return false;
      }
      if (y !== undefined && loc.y % y !== 0) {
        if (this.handler.debug) console.warn(`${this.id} | Y distribution failed`);
        return false;
      }
      if (z !== undefined && loc.z % z !== 0) {
        if (this.handler.debug) console.warn(`${this.id} | Z distribution failed`);
        return false;
      }
    }

    // Scatter chance (random chance to place)
    if (this.options.scatter_chance !== undefined) {
      if (Math.random() > this.options.scatter_chance) {
        if (this.handler.debug) console.warn(`${this.id} | scatter chance failed`);
        return false;
      }
    }

    // Y-level restriction
    if (this.options.min_y !== undefined && loc.y < this.options.min_y) {
      if (this.handler.debug) console.warn(`${this.id} | min x failed`);
      return false;
    }
    if (this.options.max_y !== undefined && loc.y > this.options.max_y) {
      if (this.handler.debug) console.warn(`${this.id} | max y failed`);
      return false;
    }

    // Biome restriction
    if (this.options.biomes) {
      const biome = dim.getBiome(loc);
      if (!biome) return false;
      if (!BiomeUtils.matchAny(biome, this.options.biomes)) {
        if (this.handler.debug) console.warn(`${this.id} | Can't place in ${biome.id}`);
        return false;
      }
    }

    // Block intersection
    if (this.options.blocks) {
      const blocks = [...REPLACEABLE_BLOCKS, ...this.options.blocks];
      const size = feature.getSize();
      for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
          for (let z = 0; z < size.z; z++) {
            const pos = Vector3Utils.add(loc, { x, y, z });
            const block = dim.getBlock(pos);
            if (!block) continue;
            if (!BlockUtils.matchAny(block, blocks)) {
              if (this.handler.debug) console.warn(`${this.id} | Can't place on ${block.typeId}`);
              return false;
            }
          }
        }
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
    const entity = dim.spawnEntity(event.handle.options?.type ?? "mcutils:custom_feature", event.location);
    entity.addTag(this.placesFeature);
  }
}
