import {
  ItemStack,
  EquipmentSlot,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  BlockPermutation,
  BlockCustomComponent,
} from "@minecraft/server";
import { ItemUtils } from "../item/utils";
import { AddonUtils } from "../utils/addon";
import { array, create, defaulted, object, string, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface LavaCauldronOptions {
  block: string;
  interactions?: string[];
}

export class LavaCauldronInteraction {
  constructor(item: string, resultItem: string) {
    this.item = item;
    this.resultItem = resultItem;
  }

  item: string;
  resultItem: string;

  getResultStack(): ItemStack {
    return new ItemStack(this.resultItem);
  }

  static parse(value: string): LavaCauldronInteraction {
    const args = value.split("->");
    const item = args[0];
    const block = args[1];
    return new LavaCauldronInteraction(item, block);
  }

  static parseAll(values?: string[]): LavaCauldronInteraction[] {
    if (!values) return [];
    return values.map((x) => LavaCauldronInteraction.parse(x));
  }
}

export class LavaCauldronComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("lava_cauldron");
  struct: Struct<any, any> = object({
    block: defaulted(isBlock, "cauldron"),
    interactions: defaulted(array(string()), []),
  });

  /**
   * Vanilla "lava" cauldron block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getInteraction(itemStack: ItemStack, options: LavaCauldronOptions): LavaCauldronInteraction | undefined {
    for (const action of LavaCauldronInteraction.parseAll(options.interactions)) {
      if (!action) continue;
      if (itemStack.matches(action.item)) {
        return action;
      }
    }
    return undefined;
  }

  update(event: BlockComponentPlayerInteractEvent) {}

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as LavaCauldronOptions;
    if (!event.player) return;
    const equ = event.player.getComponent("equippable");
    if (!equ) return;
    const mainhand = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!mainhand) return;
    let interaction = this.getInteraction(mainhand, options);
    if (!interaction) return;
    // TODO: Sound
    ItemUtils.convert(event.player, EquipmentSlot.Mainhand, interaction.getResultStack());
    event.block.setPermutation(BlockPermutation.resolve(options.block, event.block.permutation.getAllStates()));
    this.update(event);
  }
}
