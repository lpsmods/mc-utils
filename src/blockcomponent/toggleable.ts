import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockCustomComponent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent } from "./base";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";
import { create, defaulted, object, string, Struct } from "superstruct";

export interface ToggleableOptions {
  toggle_state: keyof BlockStateSuperset;
  true_sound_event: string;
  false_sound_event: string;
  // toggled_by_redstone?: boolean;
}

// TODO: Make it toggled by redstone
export class ToggleableComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("toggleable");
  struct: Struct<any, any> = object({
    toggle_state: defaulted(string(), "mcutils:open"),
    true_sound_event: defaulted(string(), "use.stone"),
    false_sound_event: defaulted(string(), "use.stone"),
  });

  /**
   * Toggleable block state behavior. (like; doors, trapdoors)
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getSound(open: boolean = false, args: CustomComponentParameters): string {
    const options = create(args.params, this.struct) as ToggleableOptions;
    if (open) {
      return options.true_sound_event;
    }
    return options.false_sound_event;
  }

  toggle(block: Block, args: CustomComponentParameters) {
    const options = create(args.params, this.struct) as ToggleableOptions;
    const bool = BlockUtils.toggleState(block, options.toggle_state);
    block.dimension.playSound(this.getSound(bool, args), block.location);
    this.update(block, args);
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    this.toggle(event.block, args);
  }
}
