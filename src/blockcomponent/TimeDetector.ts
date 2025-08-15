import {
  BlockComponentPlayerInteractEvent,
  BlockComponentTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/BlockUtils";

export interface TimeDetectorOptions {
  inverted_state: keyof BlockStateSuperset;
  powered_state: keyof BlockStateSuperset;
  time_interval: [number, number];
}

// TODO:
export class TimeDetectorComponent {
  static typeId = "mcutils:time_detector";

  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  // EVENTS

  // inverted, it outputs a signal strength of 15 minus the current internal sky light level, where values over 15 or below 0 are taken as 15 or 0 respectively.
  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    const options = args.params as TimeDetectorOptions;
    const inverted = event.block.permutation.getState(options.inverted_state) as boolean;
    if (inverted) {
    }
  }

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): void {
    const options = args.params as TimeDetectorOptions;
    BlockUtils.toggleState(event.block, options.inverted_state);
    // TODO: Sound?
  }
}
