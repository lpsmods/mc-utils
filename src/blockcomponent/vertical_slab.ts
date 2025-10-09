import { BlockComponentPlayerInteractEvent, BlockCustomComponent, EquipmentSlot } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { SlabComponent, SlabOptions } from "./slab";
import { WorldUtils } from "../world/utils";
import { AddonUtils } from "../addon";
import { assign, defaulted, object, string } from "superstruct";

export interface VerticalSlabOptions extends SlabOptions {
  direction_state: keyof BlockStateSuperset;
}

export class VerticalSlabComponent extends SlabComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("vertical_slab");

  /**
   * Vertical slab block behavior.
   */
  constructor() {
    super();
    this.struct = assign(
      this.struct,
      object({
        direction_state: defaulted(string(), "minecraft:cardinal_direction"),
      }),
    );
  }

  canBeDoubled(event: BlockComponentPlayerInteractEvent, options: VerticalSlabOptions): boolean {
    if (!event.player) return false;
    const state = event.block.permutation;
    const dir = state.getState(options.direction_state) as string;
    const stack = event.player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
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
