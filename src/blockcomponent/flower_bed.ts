import { BlockComponentPlayerInteractEvent, CustomComponentParameters, EquipmentSlot } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, string, Struct } from "superstruct";

export interface FlowerBedOptions {
  flowers_state: keyof BlockStateSuperset;
  max_flowers: number;
}

// TODO: pink pedals, leaf litter.
export class FlowerBedComponent {
  static readonly componentId = AddonUtils.makeId("flower_bed");
  struct: Struct<any, any> = object({
    flowers_state: defaulted(string(), 'mcutils:flowers'),
    max_flowers: defaulted(number(), 4),
  });

  /**
   * Vanilla flower bed block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FlowerBedOptions;
    if (!event.player) return;
    const flowers = event.block.permutation.getState(options.flowers_state) as number;
    if (flowers >= options.max_flowers) return;
    const equ = event.player.getComponent("equippable");
    if (!equ) return;
    const itemStack = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!itemStack || itemStack.matches(event.block.typeId)) return;
    BlockUtils.incrementState(event.block, options.flowers_state);
  }
}
