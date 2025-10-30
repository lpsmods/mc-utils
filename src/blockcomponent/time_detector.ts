import {
  BlockComponentPlayerInteractEvent,
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, object, string, Struct } from "superstruct";
import { vec2 } from "../validation";

export interface TimeDetectorOptions {
  inverted_state: keyof BlockStateSuperset;
  powered_state: keyof BlockStateSuperset;
  time_interval: [number, number];
}

// TODO:
export class TimeDetectorComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("time_detector");
  struct: Struct<any, any> = object({
    inverted_state: defaulted(string(), "mcutils:inverted"),
    powered_state: defaulted(string(), "mcutils:powered"),
    time_interval: defaulted(vec2, [0, 0]),
  });

  /**
   * Vanilla time detector block behavior. (like; daylight detector)
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  // EVENTS

  // inverted, it outputs a signal strength of 15 minus the current internal sky light level, where values over 15 or below 0 are taken as 15 or 0 respectively.
  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as TimeDetectorOptions;
    const inverted = event.block.permutation.getState(options.inverted_state) as boolean;
    if (inverted) {
    }
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as TimeDetectorOptions;
    BlockUtils.toggleState(event.block, options.inverted_state);
    // TODO: Sound?
  }
}
