import {
  Dimension,
  Entity,
  LocationInUnloadedChunkError,
  LocationOutOfWorldBoundariesError,
  Structure,
  StructurePlaceOptions,
  StructureRotation,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { FeatureHandler, FeaturePlaceEvent } from "./feature_handler";
import { Hasher } from "../type";
import { RandomUtils } from "../random";
import { Vector3Utils } from "@minecraft/math";
import { ErrorUtils } from "../error";
import { BlockUtils } from "../block/utils";
import { REPLACEABLE_BLOCKS } from "../constants";
import { FeatureUtils } from "./utils";

export interface FeatureOptions {
  offset?: Vector3;
  grounded?: boolean;
  debug?: boolean;
}

export class Feature {
  static typeId: string | null = "feature";
  id: string | null = null;
  handler: FeatureHandler | null = null;
  readonly options: FeatureOptions;

  constructor(options?: FeatureOptions) {
    this.options = options ?? {};
  }

  /**
   * Fires before this feature is placed.
   */
  beforePlace?(): void;

  #getSupported(dim: Dimension, location: Vector3): Vector3 {
    const size = this.getSize();

    function isFullySupported(pos: Vector3): boolean {
      for (let x = 0; x < size.x; x++) {
        for (let z = 0; z < size.z; z++) {
          const check = Vector3Utils.add(pos, { x, y: -1, z });
          if (check.y < dim.heightRange.min) {
            return true;
          }
          const block = dim.getBlock(check);
          if (!block) continue;
          if (block.isAir || BlockUtils.matchAny(block, REPLACEABLE_BLOCKS)) {
            return false;
          }
        }
      }
      return true;
    }
    let groundedPos = { ...location };
    while (!isFullySupported(groundedPos)) {
      groundedPos = Vector3Utils.add(groundedPos, { x: 0, y: -1, z: 0 });
      if (groundedPos.y <= dim.heightRange.min) break;
    }
    return groundedPos;
  }

  /**
   * Transforms the location from options.
   * @param {Vector3} location
   * @returns {Vector3}
   */
  getPos(dimension: Dimension, location: Vector3): Vector3 {
    let pos = location;

    // TODO: Optimize getSupported.
    // if (this.options.grounded) {
    //   pos = this.#getSupported(dimension, pos);
    // }
    // TODO: Apply offset here.
    return pos;
  }

  /**
   * Get the size of this feature.
   * @returns {Vector3}
   */
  getSize(): Vector3 {
    return { x: 1, y: 1, z: 1 };
  }

  matches(entity: Entity): boolean {
    return entity.hasTag(this.id ?? "unknown");
  }

  debug(event: FeaturePlaceEvent): void {
    if (!this.options.debug) return;
    event.dimension.setBlockType(event.location, "lime_stained_glass");
    console.log(
      `Generated feature '${this.id}' at ${Hasher.stringify(event.location)}`,
    );
  }

  /**
   * Generate this feature.
   * @param {FeaturePlaceEvent} event
   */
  *place(event: FeaturePlaceEvent): Generator<void, void, void> {
    if (!this.handler)
      throw new Error(`FeatureHandler not found for feature '${this.id}'`);
    this.debug(event);
  }

  toString(): string {
    return this.id ?? "unknown";
  }
}

export enum FacingDirection {
  North = "north",
  South = "south",
  East = "east",
  West = "west",
  Random = "random",
}

export interface StructureTemplateOptions extends FeatureOptions {
  structureOptions?: StructurePlaceOptions;
  facing_direction?: FacingDirection;
}

export class StructureTemplate extends Feature {
  static readonly typeId = "structure_template_feature";
  structureName: string;
  structure?: Structure;

  constructor(structureName?: string, options?: StructureTemplateOptions) {
    super(options);
    this.structureName = structureName ?? this.id ?? "unknown";
    system.run(() => {
      const struct = world.structureManager.get(this.structureName);
      if (!struct) throw new Error(`${this.structureName} does not exist!`);
      this.structure = struct;
    });
  }

  getSize(): Vector3 {
    if (!this.structure) return { x: 0, y: 0, z: 0 };
    return this.structure.size;
  }

  *place(event: FeaturePlaceEvent): Generator<void, void, void> {
    const options = this.options as StructureTemplateOptions;
    const sOptions = options.structureOptions ?? {};

    // Change direction
    if (options.facing_direction) {
      let dir = options.facing_direction;
      if (dir == FacingDirection.Random) {
        dir = RandomUtils.choice([
          FacingDirection.North,
          FacingDirection.East,
          FacingDirection.South,
          FacingDirection.West,
        ]);
      }
      switch (dir) {
        case FacingDirection.North:
          sOptions.rotation = StructureRotation.None;
          break;
        case FacingDirection.East:
          sOptions.rotation = StructureRotation.Rotate90;
          break;
        case FacingDirection.South:
          sOptions.rotation = StructureRotation.Rotate180;
          break;
        case FacingDirection.West:
          sOptions.rotation = StructureRotation.Rotate270;
          break;
      }
    }

    world.structureManager.place(
      this.structureName,
      event.dimension,
      event.location,
      sOptions,
    );
    this.debug(event);
  }
}

// TODO: Return the size of the feature. Choose the feature its going to place before it places it.
export class WeightedRandomFeature extends Feature {
  static readonly typeId = "weighted_random_feature";
  features: Set<[string, number]>;
  nextFeature?: Feature;

  constructor(features?: Array<[string, number]>, options?: FeatureOptions) {
    super(options);
    this.features = new Set<[string, number]>(features ?? []);
  }

  beforePlace(): void {
    const id = RandomUtils.weightedChoice<string>([...this.features]);
    if (!this.handler) return;
    const feature = this.handler.features.get(id);
    if (!feature) return;
    this.nextFeature = feature;
  }

  getPos(dimension: Dimension, location: Vector3): Vector3 {
    if (!this.nextFeature) return super.getPos(dimension, location);
    return this.nextFeature.getPos(dimension, location);
  }

  getSize(): Vector3 {
    if (!this.nextFeature) return super.getSize();
    let res = this.nextFeature.getSize();
    return res;
  }

  addFeature(
    identifier: string | Feature,
    weight: number = 1,
  ): WeightedRandomFeature {
    this.features.add([identifier.toString(), weight]);
    return this;
  }

  removeFeature(
    identifier: string | Feature,
    weight: number = 1,
  ): WeightedRandomFeature {
    this.features.delete([identifier.toString(), weight]);
    return this;
  }

  *place(event: FeaturePlaceEvent): Generator<void, void, void> {
    if (!this.handler) return;
    if (!this.nextFeature || !this.nextFeature.id) return;
    this.handler.placeFeature(
      this.nextFeature.id,
      event.dimension,
      event.location,
    );
    this.debug(event);
  }
}

// TODO:
// export class ScatterFeature extends Feature {
//   static readonly typeId = 'scatter_feature';
// }

// TODO:
export class ExtendedFeature extends Feature {
  static readonly typeId = "extended_feature";
  featureName: string;
  blockType: string;
  constructor(
    featureName: string,
    blockType?: string,
    options?: FeatureOptions,
  ) {
    super(options);
    this.featureName = featureName;
    this.blockType = blockType ?? "cobblestone";
  }

  getSize(): Vector3 {
    if (!this.handler) return super.getSize();
    const feature = this.handler.features.get(this.featureName);
    if (!feature) return super.getSize();
    return feature.getSize();
  }

  private buildSupport(event: FeaturePlaceEvent): void {
    const dim = event.dimension;
    const size = this.getSize();
    const blockType = this.blockType;
    function isFullySupported(pos: Vector3): boolean {
      for (let x = 0; x < size.x; x++) {
        for (let z = 0; z < size.z; z++) {
          const check = Vector3Utils.add(pos, { x, y: -1, z });
          ErrorUtils.wrapCatch(LocationInUnloadedChunkError, () => {
            const block = dim.getBlock(check);
            if (block && block.isAir) {
              block.setType(blockType);
            }
          });
        }
      }
      return true;
    }
    let groundedPos = { ...event.location };
    while (!isFullySupported(groundedPos)) {
      groundedPos = Vector3Utils.add(groundedPos, { x: 0, y: -1, z: 0 });
      if (groundedPos.y <= dim.heightRange.min) break;
    }
  }

  *place(event: FeaturePlaceEvent): Generator<void, void, void> {
    if (!this.handler) return;
    const feature = this.handler.features.get(this.featureName);
    if (!feature) return;
    system.runJob(feature.place(event));
    this.buildSupport(event);
  }
}
