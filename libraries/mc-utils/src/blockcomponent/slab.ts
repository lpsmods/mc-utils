import {
  EquipmentSlot,
  Direction,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  BlockCustomComponent,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { create, defaulted, object, optional, string, Struct } from "superstruct";

import { getInteractSound } from "../utils";
import { BlockBaseComponent } from "./base";
import { AddonUtils } from "../utils/addon";
import { ItemUtils } from "../item";

export interface SlabOptions {
  double_state: keyof BlockStateSuperset;
  sound_event: string;
}

export class SlabComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("slab");
  struct: Struct<any, any> = object({
    double_state: defaulted(string(), "mcutils:double"),
    sound_event: optional(string()),
  });

  /**
   * Vanilla slab block behavior.
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  canBeDoubled(event: BlockComponentPlayerInteractEvent, options: SlabOptions): boolean {
    if (!event.player) return false;
    const state = event.block.permutation;
    const stack = event.player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
    if (!stack) {
      return false;
    }
    return (
      !state.getState(options.double_state) &&
      stack.typeId === event.block.getItemStack()?.typeId &&
      ((state.getState("minecraft:vertical_half") == "top" && event.face === Direction.Down) ||
        (state.getState("minecraft:vertical_half") == "bottom" && event.face === Direction.Up))
    );
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as SlabOptions;
    const state = event.block.permutation;
    if (this.canBeDoubled(event, options)) {
      const sound = options.sound_event ?? getInteractSound(event.block);
      event.player?.dimension.playSound(sound, event.block.location);
      event.block.setPermutation(state.withState(options.double_state, true));
      if (event.player) ItemUtils.decrementStack(event.player);
    }
  }
}
