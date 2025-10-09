import { Dimension, Entity, world } from "@minecraft/server";
import { EventSignal } from "./utils";
import { AreaDetector } from "../area_detector";

export abstract class AreaEvent {
  readonly entity: Entity;
  readonly dimension: Dimension;
  readonly area: AreaDetector;

  constructor(entity: Entity, area: AreaDetector) {
    this.entity = entity;
    this.area = area;
    this.dimension = world.getDimension(area.dimensionId);
  }
}

export class AreaEnterEvent extends AreaEvent {}
export class AreaLeaveEvent extends AreaEvent {}
export class AreaTickEvent extends AreaEvent {}

export class AreaEnterEventSignal extends EventSignal<AreaEnterEvent> {}
export class AreaLeaveEventSignal extends EventSignal<AreaLeaveEvent> {}
export class AreaTickEventSignal extends EventSignal<AreaTickEvent> {}

/**
 * Custom area events.
 */
export abstract class AreaEvents {
  private constructor() {}

  /**
   * This event fires when a entity enters the area.
   * @eventProperty
   */
  static readonly entityEnter = new AreaEnterEventSignal();

  /**
   * This event fires when a entity leaves the area.
   * @eventProperty
   */
  static readonly entityLeave = new AreaLeaveEventSignal();

  /**
   * This event fires every tick a entity is in the area.
   * @eventProperty
   */
  static readonly entityTick = new AreaTickEventSignal();

  static get size(): number {
    return this.entityEnter.size + this.entityLeave.size + this.entityTick.size;
  }
}
