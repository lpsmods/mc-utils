import {
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent } from "./base";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";

export interface ToggleableOptions {
  state: keyof BlockStateSuperset;
  true_sound_event?: string;
  false_sound_event?: string;
  // toggled_by_redstone?: boolean;
}

// TODO: Make it toggled by redstone
export class ToggleableComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("toggleable");

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
      return options.true_sound_event ?? "use.stone";
    }
    return options.false_sound_event ?? "use.stone";
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as ToggleableOptions;
    const bool = BlockUtils.toggleState(event.block, options.state);
    event.block.dimension.playSound(
      this.getSound(bool, args),
      event.block.location,
    );
    this.update(event.block, args);
  }
}
