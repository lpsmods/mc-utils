import {
  EquipmentSlot,
  Direction,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  BlockCustomComponent,
} from "@minecraft/server";
import { getInteractSound } from "../utils";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, string, Struct } from "superstruct";

export interface HeightOptions {
  layers_state: keyof BlockStateSuperset;
  max_layers: number;
}

export class HeightComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("height");
  struct: Struct<any, any> = object({
    layers_state: defaulted(string(), "mcutils:layers"),
    max_layers: defaulted(number(), 8),
  });

  /**
   * Vanilla snow layer block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  canBeIncreased(event: BlockComponentPlayerInteractEvent, options: HeightOptions): boolean {
    if (!event.player) return false;
    const state = event.block.permutation;
    const stack = event.player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
    if (!stack) {
      return false;
    }
    const layers = state.getState(options.layers_state) as number;
    return (
      layers < options.max_layers &&
      stack.typeId === event.block.getItemStack()?.typeId &&
      ((state.getState("minecraft:vertical_half") == "top" && event.face === Direction.Down) ||
        (state.getState("minecraft:vertical_half") == "bottom" && event.face === Direction.Up))
    );
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as HeightOptions;
    if (!event.player) return;
    const state = event.block.permutation;
    const layers = state.getState(options.layers_state) as number;
    const newLayers = layers + 1;
    if (this.canBeIncreased(event, options)) {
      event.player.dimension.playSound(getInteractSound(event.block), event.block.location);
      event.block.setPermutation(state.withState(options.layers_state, newLayers));
    }
  }
}
