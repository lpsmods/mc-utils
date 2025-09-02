import { Entity } from "@minecraft/server";
import { EventSignal } from "./utils";
import { AreaDetector } from "../misc/area_detector";

export class AreaEvent {
  readonly entity: Entity;
  readonly area: AreaDetector;

  constructor(entity: Entity, area: AreaDetector) {
    this.entity = entity;
    this.area = area;
  }
}

export class AreaEnterEvent extends AreaEvent {}
export class AreaLeaveEvent extends AreaEvent {}
export class AreaTickEvent extends AreaEvent {}

export class AreaEnterEventSignal extends EventSignal<AreaEnterEvent> {}
export class AreaLeaveEventSignal extends EventSignal<AreaLeaveEvent> {}
export class AreaTickEventSignal extends EventSignal<AreaTickEvent> {}

export abstract class AreaEvents {
  private constructor() {}

  /**
   * This event fires when a entity enters the area.
   */
  static readonly enter = new AreaEnterEventSignal();

  /**
   * This event fires when a entity leaves the area.
   */
  static readonly leave = new AreaLeaveEventSignal();

  /**
   * This event fires every tick a entity is in the area.
   */
  static readonly tick = new AreaTickEventSignal();
}

function setup(): void {}

setup();
