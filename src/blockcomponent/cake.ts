import {
  BlockComponentPlayerInteractEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  EquipmentSlot,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { ItemUtils } from "../item/utils";
import { AddonUtils } from "../addon";
import { array, create, defaulted, number, object, string, Struct } from "superstruct";
import { clampNumber } from "@minecraft/math";

export class CakeInteraction {
  readonly item: string;
  readonly block: string;

  constructor(item: string, block: string) {
    this.item = item;
    this.block = block;
  }

  static parse(value: string): CakeInteraction {
    const args = value.split("->");
    return new CakeInteraction(args[0], args[1]);
  }

  static parseAll(interactions: string[]): CakeInteraction[] {
    return interactions.map((x) => CakeInteraction.parse(x));
  }
}

export interface CakeOptions {
  slice_state: keyof BlockStateSuperset;
  max_slices: number;
  nutrition: number;
  interactions: string[];
}

// TODO: Check players hunger.
export class CakeComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("cake");
  struct: Struct<any, any> = object({
    slice_state: defaulted(string(), "mcutils:slices"),
    max_slices: defaulted(number(), 6),
    interactions: defaulted(array(string()), []),
    nutrition: defaulted(number(), 2),
  });

  SLICES = 6;

  /**
   * Vanilla cake block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  placeBlock(event: BlockComponentPlayerInteractEvent, options: CakeOptions): boolean {
    if (!event.player) return false;
    const SLICES = event.block.permutation.getState(options.slice_state);
    if (SLICES != 0) {
      return false;
    }
    const equ = event.player.getComponent("equippable");
    if (!equ) return false;
    const mainhand = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!mainhand) {
      return false;
    }
    const actions = CakeInteraction.parseAll(options.interactions);
    let interaction = actions.find((x) => mainhand.matches(x.item));
    if (interaction) {
      event.dimension.playSound("cake.add_candle", event.block.location);
      event.dimension.setBlockType(event.block.location, interaction.block);
      ItemUtils.decrementStack(event.player, EquipmentSlot.Mainhand);
      return true;
    }
    return false;
  }

  eat(event: BlockComponentPlayerInteractEvent, options: CakeOptions): void {
    if (!event.player) return;
    const hunger = event.player.getComponent("player.hunger");
    if (hunger) {
      hunger.setCurrentValue(
        clampNumber(hunger.currentValue + options.nutrition, hunger.effectiveMin, hunger.effectiveMax),
      );
    }
    var slice = event.block.permutation.getState(options.slice_state) as number;
    if (slice === options.max_slices) {
      return event.dimension.setBlockType(event.block.location, "air");
    }
    // Decrease slice
    event.block.setPermutation(event.block.permutation.withState(options.slice_state, slice + 1));
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as CakeOptions;
    if (!this.placeBlock(event, options)) {
      this.eat(event, options);
    }
  }
}
