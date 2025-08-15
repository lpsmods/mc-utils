import {
  ItemStack,
  Block,
  EquipmentSlot,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  BlockPermutation,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { ItemUtils } from "../item/ItemUtils";

export interface LayeredCauldronOptions {
  block: string;
  level_state: keyof BlockStateSuperset;
  max_level?: number;
  interactions?: string[];
}

export class LayeredCauldronInteraction {
  constructor(input: string, output: string, level: string) {
    this.input = input;
    this.output = output;
    this.level = level;
  }

  input: string;
  output: string;
  level: string;

  getOutputStack(): ItemStack {
    return new ItemStack(this.output);
  }

  getBlock(block: Block, options: LayeredCauldronOptions): BlockPermutation {
    let level = block.permutation.getState(options.level_state) as number;
    switch (this.level.charAt(0)) {
      case "+":
        level = level + +this.level.slice(1);
        break;
      case "-":
        level = level - +this.level.slice(1);
        break;
      default:
        level = +this.level;
        break;
    }
    return level < 1 ? BlockPermutation.resolve(options.block) :  block.permutation.withState(options.level_state, level);
  }

  static parse(value: string): LayeredCauldronInteraction {
    const args = value.split("->");
    const input = args[0];
    const args2 = args[1].split(",");
    const output = args2[0];
    const level = args2[1];
    return new LayeredCauldronInteraction(input, output, level);
  }

  static parseAll(values: string[] | undefined): LayeredCauldronInteraction[] {
    if (!values) return [];
    return values.map((x) => LayeredCauldronInteraction.parse(x));
  }
}

export class LayeredCauldronComponent {
  static typeId = "mcutils:layered_cauldron";

  /**
   * Vanilla "water" cauldron block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getInteraction(
    itemStack: ItemStack,
    options: LayeredCauldronOptions
  ): LayeredCauldronInteraction | undefined {
    const actions = LayeredCauldronInteraction.parseAll(options.interactions);
    for (const action of actions) {
      if (itemStack.matches(action.input)) return action;
    }
    return undefined;
  }

  update(event: BlockComponentPlayerInteractEvent) {}

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): void {
    const options = args.params as LayeredCauldronOptions;
    if (!event.player) return;
    const equ = event.player.getComponent("equippable");
    if (!equ) return;
    const mainhand = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!mainhand) return;
    let interaction = this.getInteraction(mainhand, options);
    if (!interaction) return;
    // TODO: Sound
    ItemUtils.convert(event.player, EquipmentSlot.Mainhand, interaction.getOutputStack());
    event.block.setPermutation(interaction.getBlock(event.block, options));
    this.update(event);
  }
}
