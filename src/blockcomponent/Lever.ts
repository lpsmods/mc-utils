import { BlockComponentPlayerInteractEvent, CustomComponentParameters } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/BlockUtils";

export interface LeverOptions {
  powered_state: keyof BlockStateSuperset;

  click_on_sound_event?: string;
  click_off_sound_event?: string;
}

// TODO:
// - Emit redstone power
export class LeverComponent {
  static typeId = "mcutils:lever";

  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getSound(powered: boolean, options: LeverOptions): string {
    if (powered) {
      return options.click_on_sound_event ?? "random.lever_click";
    }
    return options.click_off_sound_event ?? "random.lever_click";
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): void {
    const options = args.params as LeverOptions;
    const powered = event.block.permutation.getState(options.powered_state) as boolean;
    event.dimension.playSound(this.getSound(!powered, options), event.block.location);
    return BlockUtils.setState(event.block, options.powered_state, !powered);
  }
}
