import {
  Entity,
  StructurePlaceOptions,
  StructureRotation,
  Vector3,
  world,
} from "@minecraft/server";
import { FeatureHandler, FeaturePlaceEvent } from "./FeatureHandler";
import { Hasher } from "../type";
import { MathUtils } from "../MathUtils";
import { RandomUtils } from "../RandomUtils";

export interface FeatureOptions {
  offset?: Vector3;
  grounded?: boolean;
  debug?: boolean;
}

export class Feature {
  typeId: string | null = null;
  handler: FeatureHandler | null = null;
  options: FeatureOptions;

  constructor(options?: FeatureOptions) {
    this.options = options ?? {};
  }

  getSize(): Vector3 {
    return { x: 1, y: 1, z: 1 };
  }

  matches(entity: Entity): boolean {
    return entity.hasTag(this.typeId ?? "unknown");
  }

  debug(event: FeaturePlaceEvent): void {
    if (!this.options.debug) return;
    event.dimension.setBlockType(event.location, "lime_stained_glass");
    console.log(`Generated feature '${this.typeId}' at ${Hasher.stringify(event.location)}`);
  }

  /**
   * Generate this feature.
   * @param {FeaturePlaceEvent} event 
   */
  *place(event: FeaturePlaceEvent): Generator<void, void, void> {
    this.debug(event);
  }

  toString(): string {
    return this.typeId ?? "unknown";
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
  structureName: string;

  constructor(structureName?: string, options?: StructureTemplateOptions) {
    super(options);
    this.structureName = structureName ?? this.typeId ?? "unknown";
  }

  getSize(): Vector3 {
    const structure = world.structureManager.get(this.structureName);
    if (!structure) return super.getSize();
    return structure.size;
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

    world.structureManager.place(this.structureName, event.dimension, event.location, sOptions);
    this.debug(event);
  }
}

export interface WeightedRandomFeatureOptions extends FeatureOptions {}

export class WeightedRandomFeature extends Feature {
  features: Set<[string, number]>;

  constructor(features?: Array<[string, number]>, options?: WeightedRandomFeatureOptions) {
    super(options);
    this.features = new Set<[string, number]>(features ?? []);
  }

  addFeature(identifier: string | Feature, weight: number = 1): WeightedRandomFeature {
    this.features.add([identifier.toString(), weight]);
    return this;
  }

  removeFeature(identifier: string | Feature, weight: number = 1): WeightedRandomFeature {
    this.features.delete([identifier.toString(), weight]);
    return this;
  }

  *place(event: FeaturePlaceEvent): Generator<void, void, void> {
    const featureId = RandomUtils.weightedChoice<string>([...this.features]);
    if (!this.handler) return;
    this.handler.placeFeature(featureId, event.dimension, event.location);
  }
}
