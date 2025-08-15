import { BlockComponentPlayerInteractEvent, CustomComponentParameters } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent } from "./BlockBase";
import { BlockUtils } from "../block/BlockUtils";

export interface ToggleableOptions {
  open_state: keyof BlockStateSuperset;
  open_sound_event?: string;
  close_sound_event?: string;
}

// TODO: Make it toggled by redstone
export class ToggleableComponent extends BlockBaseComponent {
  static typeId = "mcutils:toggleable";

  /**
   * Toggleable/Openable block behavior. (e.g. doors, trapdoors)
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getSound(open: boolean = false, args: CustomComponentParameters): string {
    const options = args.params as ToggleableOptions;
    if (open) {
      return options.open_sound_event ?? "use.stone";
    }
    return options.close_sound_event ?? "use.stone";
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): void {
    const options = args.params as ToggleableOptions;
    const bool = BlockUtils.toggleState(event.block, options.open_state);
    event.block.dimension.playSound(this.getSound(bool, args), event.block.location);
    this.update(event.block, args);
  }
}
