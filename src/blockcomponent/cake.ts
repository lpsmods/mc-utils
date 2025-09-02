import {
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  EquipmentSlot,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { ItemUtils } from "../item/utils";
import { AddonUtils } from "../addon";

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
  interactions?: string[];
  max_slices?: number;
}

// TODO: Check players hunger.
export class CakeComponent {
  static typeId = AddonUtils.makeId("cake");

  SLICES = 6;

  /**
   * Vanilla cake block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  placeBlock(
    event: BlockComponentPlayerInteractEvent,
    options: CakeOptions,
  ): boolean {
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
    const actions = CakeInteraction.parseAll(options.interactions ?? []);
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
    event.player.addEffect("saturation", 100, {
      amplifier: 0,
      showParticles: false,
    });
    var slice = event.block.permutation.getState(options.slice_state) as number;
    if (slice === options.max_slices) {
      return event.dimension.setBlockType(event.block.location, "air");
    }
    // Decrease slice
    event.block.setPermutation(
      event.block.permutation.withState(options.slice_state, slice + 1),
    );
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as CakeOptions;
    if (!this.placeBlock(event, options)) {
      this.eat(event, options);
    }
  }
}
