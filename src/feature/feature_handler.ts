import {
  Dimension,
  EntityQueryOptions,
  EntitySpawnAfterEvent,
  ScriptEventCommandMessageAfterEvent,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { EntityHandler } from "../entity/entity_handler";
import { Vector3Utils } from "@minecraft/math";
import { ChunkEvents, PlayerChunkLoadEvent } from "../event/chunk";
import { CustomFeature, CustomFeatureOptions } from "./feature";
import { CustomFeatureRule, CustomFeatureRuleOptions, PlacementPass } from "./feature_rule";
import { RandomUtils } from "../random";
import { BIOME_MAP } from "../constants";

let initialized = false;

export abstract class FeatureEvent {
  constructor(handle: FeatureHandler, dimension: Dimension, location: Vector3, options?: CustomFeatureOptions) {
    this.handle = handle;
    this.dimension = dimension;
    this.options = options ?? {};
    this.location = location;
  }

  readonly handle: FeatureHandler;
  readonly dimension: Dimension;
  readonly location: Vector3;
  readonly options: CustomFeatureOptions;
}

export class FeaturePlaceEvent extends FeatureEvent {}

export abstract class FeatureRuleEvent {
  constructor(handle: FeatureHandler, dimension: Dimension, location: Vector3, options?: CustomFeatureRuleOptions) {
    this.handle = handle;
    this.dimension = dimension;
    this.options = options ?? {};
    this.location = location;
  }

  readonly handle: FeatureHandler;
  readonly dimension: Dimension;
  readonly location: Vector3;
  readonly options: CustomFeatureRuleOptions;
}

export class FeatureRulePlaceEvent extends FeatureRuleEvent {}

export class FeatureRuleCanPlaceEvent extends FeatureRulePlaceEvent {}

export class FeatureHandler extends EntityHandler {
  static handles = new Set<FeatureHandler>();
  featurePropertyName: string;
  biomeMap: { [key: string]: number };
  biomeEntityId?: string;
  biomePropertyName?: string;
  debug?: boolean;

  features = new Map<string, CustomFeature>();
  featureRules = new Map<string, CustomFeatureRule>();

  constructor(
    options: EntityQueryOptions,
    featurePropertyName?: string,
    biomeMap?: { [key: string]: number },
    biomeEntityId?: string,
    biomePropertyName?: string,
  ) {
    super(options);
    this.featurePropertyName = featurePropertyName ?? "mcutils:feature";
    this.biomeMap = biomeMap ?? BIOME_MAP;
    this.biomeEntityId = biomeEntityId;
    this.biomePropertyName = biomePropertyName;
    this.onSpawn = this.onSpawn.bind(this);

    FeatureHandler.handles.add(this);

    // Setup
    if (!initialized) init();
  }

  delete(): void {
    FeatureHandler.handles.delete(this);
    super.delete();
  }
  /**
   * The size of the structure.
   */
  getSize(): Vector3 {
    return { x: 0, y: 0, z: 0 };
  }

  // FEATURE

  /**
   * Register a new feature for this handler.
   * @param {CustomFeature} feature
   */
  addFeature(identifier: string, feature: CustomFeature): CustomFeature {
    feature.id = identifier;
    feature.handler = this;
    this.features.set(identifier, feature);
    return feature;
  }

  /**
   * Unregister a feature for this handler.
   * @param {string} identifier
   */
  removeFeature(identifier: string): void {
    this.features.delete(identifier);
  }

  /**
   * Places the custom feature.
   * @param {string} identifier
   * @param {Dimension} dimension
   * @param {Vector3} location
   */
  placeFeature(identifier: string, dimension: Dimension, location: Vector3): boolean {
    const feature = this.features.get(identifier);
    if (!feature) {
      console.warn(`Custom feature ${identifier} not found!`);
      return false;
    }
    if (feature.beforePlace) feature.beforePlace();
    const pos = feature.getPos(dimension, location);
    const event = new FeaturePlaceEvent(this, dimension, Vector3Utils.floor(pos), feature.options);
    system.runJob(feature.place(event));
    return true;
  }

  // FEATURE RULE

  /**
   * Register a new feature rule for this handler.
   * @param {CustomFeature} featureRule
   */
  addFeatureRule(identifier: string, featureRule: CustomFeatureRule): CustomFeatureRule {
    featureRule.id = identifier;
    featureRule.handler = this;
    this.featureRules.set(identifier, featureRule);
    return featureRule;
  }

  /**
   * Unregister a feature rule for this handler.
   * @param {string} identifier
   */
  removeFeatureRule(identifier: string): void {
    this.featureRules.delete(identifier);
  }

  /**
   * Places the custom feature rule.
   * @param {string} identifier
   * @param {Dimension} dimension
   * @param {Vector3} location
   */
  placeFeatureRule(identifier: string, dimension: Dimension, location: Vector3): boolean {
    const rule = this.featureRules.get(identifier);
    if (!rule) {
      console.warn(`Custom feature rule ${identifier} not found!`);
      return false;
    }
    if (rule.beforePlace) rule.beforePlace();
    const event = new FeatureRulePlaceEvent(this, dimension, Vector3Utils.floor(location), rule.options);
    rule.place(event);
    return true;
  }

  // EVENTS

  onSpawn(event: EntitySpawnAfterEvent): void {
    try {
      const featureName = event.entity.getTags()[0];
      if (!featureName) return;
      this.placeFeature(featureName, event.entity.dimension, event.entity.location);
    } finally {
      event.entity.remove();
    }
  }
}

// TODO: replace with /mcutils:custom-place command.
function scriptEventReceive(event: ScriptEventCommandMessageAfterEvent): void {
  const pos = event.sourceEntity?.location ?? event.sourceBlock?.location ?? { x: 0, y: 0, z: 0 };
  const dimension = event.sourceEntity?.dimension ?? event.sourceBlock?.dimension ?? world.getDimension("overworld");
  switch (event.id) {
    case "mcutils:place_feature":
      for (const handle of FeatureHandler.handles) {
        handle.placeFeature(event.message, dimension, pos);
      }
      break;

    case "mcutils:clear_storage":
      world.sendMessage("§cCleared world storage");
      world.clearDynamicProperties();
      break;
  }
}

function generateFeature(pos: Vector3, id: string, handle: FeatureHandler, event: PlayerChunkLoadEvent): boolean {
  const rule = handle.featureRules.get(id);
  if (!rule) return false;
  const feature = handle.features.get(rule.placesFeature);
  if (!feature) return false;

  // placement_pass
  let block = null;
  switch (rule?.options.placement_pass ?? PlacementPass.surface_pass) {
    case PlacementPass.surface_pass:
      block = event.chunk.dimension.getTopmostBlock({ x: pos.x, z: pos.z });
      let above = block?.above();
      if (above) pos = above.location;
      break;
    case PlacementPass.before_surface_pass:
      block = event.chunk.dimension.getTopmostBlock({ x: pos.x, z: pos.z });
      if (block) pos = block.location;
      break;
    case PlacementPass.underground_pass:
      break;
  }
  // RNG
  pos = Vector3Utils.add(pos, {
    x: RandomUtils.int(0, 15),
    y: 0,
    z: RandomUtils.int(0, 15),
  });

  // Adjust using feature.
  pos = feature.getPos(event.dimension, pos);

  // Placement check
  const pEvent = new FeatureRuleCanPlaceEvent(handle, event.dimension, pos, rule.options);
  if (!rule.canPlace(pEvent)) return false;
  handle.placeFeatureRule(id, event.chunk.dimension, pos);
  return true;
}

function loadChunk(event: PlayerChunkLoadEvent): void {
  if (!event.initial) return;
  let pos = event.chunk.origin;
  for (const handle of FeatureHandler.handles) {
    for (const [id, rule] of handle.featureRules.entries()) {
      const iter = rule.options.distribution?.iterations ?? 1;
      for (let i = 0; i < iter; i++) {
        generateFeature(pos, id, handle, event);
      }
    }
  }
}

function init(): void {
  console.warn("@lpsmods/mc-utils - Custom features are experimental!");

  initialized = true;
  system.afterEvents.scriptEventReceive.subscribe(scriptEventReceive, {
    namespaces: ["mcutils"],
  });
  ChunkEvents.playerLoad.subscribe(loadChunk);
}
