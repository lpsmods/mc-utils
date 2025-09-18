import { BlockComponentTickEvent, CustomComponentParameters } from "@minecraft/server";
import { BlockBaseComponent } from "./base";
import { AddonUtils } from "../addon";
import { MAX_EFFECT } from "../constants";
import { create, number, object, Struct } from "superstruct";
import { EntityEnterBlockEvent, EntityLeaveBlockEvent } from "../event";

export interface ViscosityOptions {
  value: number;
}

export class ViscosityComponent extends BlockBaseComponent {
  static readonly componentId = AddonUtils.makeId("viscosity");
  struct: Struct<any, any> = object({
    value: number(),
  });

  /**
   * Block viscosity behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  // EVENTS

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    this.enterLeaveTick(event, args);
  }

  onEnter(event: EntityEnterBlockEvent, args: CustomComponentParameters): void {
    if (event.sameType) return;
    const options = create(args.params, this.struct) as ViscosityOptions;
    if (options.value === 0) return;
    if (options.value < 0) {
      event.entity.addEffect("slowness", MAX_EFFECT, { amplifier: Math.abs(options.value) - 1, showParticles: false });
      return;
    }
    event.entity.addEffect("speed", MAX_EFFECT, { amplifier: options.value - 1, showParticles: false });
  }

  onLeave(event: EntityLeaveBlockEvent, args: CustomComponentParameters): void {
    if (event.sameType) return;
    const options = create(args.params, this.struct) as ViscosityOptions;
    if (options.value === 0) return;
    if (options.value < 0) {
      event.entity.removeEffect("slowness");
      return;
    }
    event.entity.removeEffect("speed");
  }
}
