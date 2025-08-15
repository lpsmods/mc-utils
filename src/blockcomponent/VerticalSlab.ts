import { BlockComponentPlayerInteractEvent, EquipmentSlot } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { SlabComponent, SlabOptions } from "./Slab";
import { WorldUtils } from "../world/WorldUtils";

export interface VerticalSlabOptions extends SlabOptions {
  direction_state: keyof BlockStateSuperset;
}

export class VerticalSlabComponent extends SlabComponent {
  static typeId = "mcutils:vertical_slab";

  /**
   * Vertical slab block behavior.
   */
  constructor() {
    super();
  }

  canBeDoubled(event: BlockComponentPlayerInteractEvent, options: VerticalSlabOptions): boolean {
    if (!event.player) return false;
    const state = event.block.permutation;
    const dir = state.getState(options.direction_state) as string;
    const stack = event.player
      .getComponent("minecraft:equippable")
      ?.getEquipment(EquipmentSlot.Mainhand);
    if (!stack) {
      return false;
    }

    return (
      !state.getState(options.double_state) &&
      stack.typeId === event.block.getItemStack()?.typeId &&
      WorldUtils.getOpposite(dir) == event.face
    );
  }
}
