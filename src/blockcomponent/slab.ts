import {
  EquipmentSlot,
  Direction,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { getInteractSound } from "../utils";
import { BlockBaseComponent } from "./base";
import { AddonUtils } from "../addon";

export interface SlabOptions {
  double_state: keyof BlockStateSuperset;
}

export class SlabComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("slab");

  /**
   * Vanilla slab block behavior.
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  canBeDoubled(
    event: BlockComponentPlayerInteractEvent,
    options: SlabOptions,
  ): boolean {
    if (!event.player) return false;
    const state = event.block.permutation;
    const stack = event.player
      .getComponent("minecraft:equippable")
      ?.getEquipment(EquipmentSlot.Mainhand);
    if (!stack) {
      return false;
    }
    return (
      !state.getState(options.double_state) &&
      stack.typeId === event.block.getItemStack()?.typeId &&
      ((state.getState("minecraft:vertical_half") == "top" &&
        event.face === Direction.Down) ||
        (state.getState("minecraft:vertical_half") == "bottom" &&
          event.face === Direction.Up))
    );
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as SlabOptions;
    const state = event.block.permutation;
    if (this.canBeDoubled(event, options)) {
      event.player?.dimension.playSound(
        getInteractSound(event.block),
        event.block.location,
      );
      event.block.setPermutation(state.withState(options.double_state, true));
    }
  }
}
