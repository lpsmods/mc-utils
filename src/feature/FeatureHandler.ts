import {
  Dimension,
  EntityQueryOptions,
  EntitySpawnAfterEvent,
  ScriptEventCommandMessageAfterEvent,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { EntityHandler } from "../entity/EntityHandler";
import { Vector3Utils } from "@minecraft/math";
import { ChunkEvents, ChunkLoadEvent } from "../event/chunk";
import { Feature, FeatureOptions } from "./Feature";
import { FeatureRule, FeatureRuleOptions, PlacementPass } from "./FeatureRule";
import { MathUtils } from "../MathUtils";
import { RandomUtils } from "../RandomUtils";
import { BIOME_MAP } from "../constants";

export class FeaturePlaceEvent {
  constructor(
    handle: FeatureHandler,
    dimension: Dimension,
    location: Vector3,
    options?: FeatureOptions
  ) {
    this.handle = handle;
    this.dimension = dimension;
    this.options = options ?? {};
    this.location = this.#calcLocation(location);
  }

  readonly handle: FeatureHandler;
  readonly dimension: Dimension;
  readonly location: Vector3;
  readonly options: FeatureOptions;

  #calcLocation(location: Vector3): Vector3 {
    const offset = this.options.offset ?? { x: 0, y: 0, z: 0 };
    let loc = Vector3Utils.add(location, offset);
    if (this.options.grounded) {
      const top = this.dimension.getTopmostBlock({ x: loc.x, z: loc.z })?.location;
      if (!top) return loc;
      loc = Vector3Utils.add(top, { x: 0, y: 1, z: 0 });
      loc = Vector3Utils.add(loc, offset);
    }
    return loc;
  }
}

export class FeatureRulePlaceEvent {
  constructor(
    handle: FeatureHandler,
    dimension: Dimension,
    location: Vector3,
    options?: FeatureRuleOptions
  ) {
    this.handle = handle;
    this.dimension = dimension;
    this.options = options ?? {};
    this.location = location;
  }

  readonly handle: FeatureHandler;
  readonly dimension: Dimension;
  readonly location: Vector3;
  readonly options: FeatureRuleOptions;
}

export class FeatureRuleCanPlaceEvent extends FeatureRulePlaceEvent {}

export class FeatureHandler extends EntityHandler {
  static handles = new Set<FeatureHandler>();
  featurePropertyName: string;
  biomeMap: { [key: string]: number };
  biomeEntityId?: string;
  biomePropertyName?: string;

  features = new Map<string, Feature>();
  featureRules = new Map<string, FeatureRule>();

  constructor(
    options: EntityQueryOptions,
    featurePropertyName?: string,
    biomeMap?: { [key: string]: number },
    biomeEntityId?: string,
    biomePropertyName?: string
  ) {
    super(options);
    this.featurePropertyName = featurePropertyName ?? "mcutils:feature";
    this.biomeMap = biomeMap ?? BIOME_MAP;
    this.biomeEntityId = biomeEntityId;
    this.biomePropertyName = biomePropertyName;
    this.onSpawn = this.onSpawn.bind(this);

    FeatureHandler.handles.add(this);
  }

  remove(): void {
    FeatureHandler.handles.delete(this);
    super.remove();
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
   * @param {Feature} feature
   */
  addFeature(identifier: string, feature: Feature): Feature {
    feature.typeId = identifier;
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
    const event = new FeaturePlaceEvent(
      this,
      dimension,
      Vector3Utils.floor(location),
      feature.options
    );
    system.runJob(feature.place(event));
    return true;
  }

  // FEATURE RULE

  /**
   * Register a new feature rule for this handler.
   * @param {Feature} featureRule
   */
  addFeatureRule(identifier: string, featureRule: FeatureRule): FeatureRule {
    featureRule.typeId = identifier;
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
    const event = new FeatureRulePlaceEvent(
      this,
      dimension,
      Vector3Utils.floor(location),
      rule.options
    );
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

// TODO: replace with /mcutils:customplace command.
function scriptEventReceive(event: ScriptEventCommandMessageAfterEvent): void {
  const pos = event.sourceEntity?.location ?? event.sourceBlock?.location ?? { x: 0, y: 0, z: 0 };
  const dimension =
    event.sourceEntity?.dimension ??
    event.sourceBlock?.dimension ??
    world.getDimension("overworld");
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

function generateFeature(
  pos: Vector3,
  id: string,
  handle: FeatureHandler,
  event: ChunkLoadEvent
): boolean {
  const rule = handle.featureRules.get(id);
  if (!rule) return false;
  // placement_pass
  let block = null;
  switch (rule?.options.placement_pass ?? PlacementPass.surface_pass) {
    case PlacementPass.surface_pass:
      block = event.chunk.dimension.getTopmostBlock({ x: pos.x, z: pos.z });
      if (block) pos = block.location;
      break;
    case PlacementPass.before_surface_pass:
      block = event.chunk.dimension.getTopmostBlock({ x: pos.x, z: pos.z });
      let below = block?.below();
      if (below) pos = below.location;
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

  // Placement check
  const pEvent = new FeatureRuleCanPlaceEvent(handle, event.dimension, pos, rule.options);
  if (!rule.canPlace(pEvent)) return false;
  handle.placeFeatureRule(id, event.chunk.dimension, pos);
  return true;
}

function loadChunk(event: ChunkLoadEvent): void {
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

function setup(): void {
  system.afterEvents.scriptEventReceive.subscribe(scriptEventReceive, { namespaces: ["mcutils"] });
  ChunkEvents.load.subscribe(loadChunk);
}

setup();
