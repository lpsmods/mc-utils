import { BlockComponentTickEvent, CustomComponentParameters } from "@minecraft/server";
import { ToggleableComponent, ToggleableOptions } from "./Toggleable";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NeighborUpdateEvent } from "./BlockBase";

export interface FenceGateOptions extends ToggleableOptions {
  in_wall_state: keyof BlockStateSuperset;
  direction_state: keyof BlockStateSuperset;
}

// TODO
export class FenceGateComponent extends ToggleableComponent {
  static typeId = "mcutils:fence_gate";

  /**
   * Fence gate block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  onNeighborUpdate(event: NeighborUpdateEvent): void {
    // TODO: Check for walls.
  }

  getSound(open: boolean = false, args: CustomComponentParameters): string {
    const options = args.params as FenceGateOptions;
    if (open) {
      return options.open_sound_event ?? "open.fence_gate";
    }
    return options.close_sound_event ?? "close.fence_gate";
  }

  // EVENTS

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    this.baseTick(event, args);
  }
}
