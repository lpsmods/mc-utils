import {
  ItemStack,
  EquipmentSlot,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  BlockPermutation,
} from "@minecraft/server";
import { Parser } from "../misc/parser";
import { ItemUtils } from "../item/utils";
import { AddonUtils } from "../addon";

export interface CauldronOptions {
  interactions?: string[];
}

export class CauldronInteraction {
  constructor(
    item: string,
    blockPermutation: BlockPermutation,
    resultItem?: string,
  ) {
    this.item = item;
    this.resultItem = resultItem;
    this.blockPermutation = blockPermutation;
  }

  readonly resultItem: string | undefined;
  readonly item: string;
  readonly blockPermutation: BlockPermutation;

  getResultStack(): ItemStack {
    return this.resultItem
      ? new ItemStack(this.resultItem)
      : new ItemStack("air");
  }

  static parse(value: string): CauldronInteraction {
    const args = value.split("->");
    const item = args[0];
    const perm = Parser.parseBlockPermutation(args[1]);
    const resultItem = args[2];
    if (!perm)
      return new CauldronInteraction(
        item,
        BlockPermutation.resolve("water_cauldron"),
        resultItem,
      );
    return new CauldronInteraction(item, perm, resultItem);
  }

  static parseAll(values: string[] | undefined): CauldronInteraction[] {
    if (!values) return [];
    return values.map((x) => CauldronInteraction.parse(x));
  }
}

export class CauldronComponent {
  static typeId = AddonUtils.makeId("cauldron");

  /**
   * Vanilla cauldron block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getInteraction(
    itemStack: ItemStack,
    options: CauldronOptions,
  ): CauldronInteraction | undefined {
    const actions = CauldronInteraction.parseAll(options.interactions);
    for (const action of actions) {
      if (itemStack.matches(action.item)) return action;
    }
  }

  update(event: BlockComponentPlayerInteractEvent) {}

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as CauldronOptions;
    if (!event.player) return;
    const equ = event.player.getComponent("equippable");
    if (!equ) return;
    const mainhand = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!mainhand) return;
    let interaction = this.getInteraction(mainhand, options);
    if (!interaction) return;
    event.block.setPermutation(interaction.blockPermutation);
    ItemUtils.convert(
      event.player,
      EquipmentSlot.Mainhand,
      interaction.getResultStack(),
    );

    // TODO: sound

    // const stack = new ItemStack(interaction.output);
    // replaceStack(event.player, EquipmentSlot.Mainhand, stack);
    // event.block.setType(this.getEmptyCauldronBlock(event.block, options));
    // this.update(event);
  }
}
