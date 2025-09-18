import { ItemUseOnEvent, Block, CustomComponentParameters, Vector3 } from "@minecraft/server";
import { ToolComponent } from "./tool";
import { offsetVolume } from "../utils";
import { AddonUtils } from "../addon";
import { array, create, defaulted, number, object, optional, string, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface AxeInteraction {
  block: string;
  converted_block: string;
}

export interface AxeOptions {
  interactions: AxeInteraction[];
  size: number;
  sound_event: string;
}

export class AxeComponent extends ToolComponent {
  static readonly componentId = AddonUtils.makeId("axe");

  struct: Struct<any, any> = object({
    size: defaulted(number(), 1),
    sound_event: defaulted(string(), "use.gravel"),
    interactions: defaulted(
      array(
        object({
          block: isBlock,
          converted_block: isBlock,
        })
      ),
      []
    ),
  });
  interactions: { [key: string]: string } = AxeComponent.defaultInteractions();

  /**
   * Makes this item strip logs like an axe.
   */
  constructor() {
    super();
    this.onUseOn = this.onUseOn.bind(this);
  }

  private static defaultInteractions(): { [key: string]: string } {
    return {
      oak_log: "stripped_oak_log",
      spruce_log: "stripped_spruce_log",
      birch_log: "stripped_birch_log",
      jungle_log: "stripped_jungle_log",
      acacia_log: "stripped_acacia_log",
      dark_oak_log: "stripped_dark_oak_log",
      mangrove_log: "stripped_mangrove_log",
      cherry_log: "stripped_cherry_log",
      pale_oak_log: "stripped_pale_oak_log",
      bamboo_block: "stripped_bamboo_block",
      crimson_stem: "stripped_crimson_stem",
      warped_stem: "stripped_warped_stem",
      oak_wood: "stripped_oak_wood",
      spruce_wood: "stripped_spruce_wood",
      birch_wood: "stripped_birch_wood",
      jungle_wood: "stripped_jungle_wood",
      acacia_wood: "stripped_acacia_wood",
      dark_oak_wood: "stripped_dark_oak_wood",
      mangrove_wood: "stripped_mangrove_wood",
      cherry_wood: "stripped_cherry_wood",
      pale_oak_wood: "stripped_pale_oak_wood",
      crimson_hyphae: "stripped_crimson_hyphae",
      warped_hyphae: "stripped_warped_hyphae",
      waxed_copper: "copper_block",
      waxed_weathered_copper: "weathered_copper",
      waxed_exposed_copper: "exposed_copper",
      waxed_oxidized_copper: "oxidized_copper",
      oxidized_copper: "weathered_copper",
      weathered_copper: "exposed_copper",
      exposed_copper: "copper_block",
      waxed_cut_copper: "cut_copper",
      waxed_weathered_cut_copper: "weathered_cut_copper",
      waxed_exposed_cut_copper: "exposed_cut_copper",
      waxed_oxidized_cut_copper: "oxidized_cut_copper",
      oxidized_cut_copper: "weathered_cut_copper",
      weathered_cut_copper: "exposed_cut_copper",
      exposed_cut_copper: "cut_copper",
      waxed_copper_bulb: "copper_bulb",
      waxed_weathered_copper_bulb: "weathered_copper_bulb",
      waxed_exposed_copper_bulb: "exposed_copper_bulb",
      waxed_oxidized_copper_bulb: "oxidized_copper_bulb",
      oxidized_copper_bulb: "weathered_copper_bulb",
      weathered_copper_bulb: "exposed_copper_bulb",
      exposed_copper_bulb: "copper_bulb",
      waxed_copper_trapdoor: "copper_trapdoor",
      waxed_weathered_copper_trapdoor: "weathered_copper_trapdoor",
      waxed_exposed_copper_trapdoor: "exposed_copper_trapdoor",
      waxed_oxidized_copper_trapdoor: "oxidized_copper_trapdoor",
      oxidized_copper_trapdoor: "weathered_copper_trapdoor",
      weathered_copper_trapdoor: "exposed_copper_trapdoor",
      exposed_copper_trapdoor: "copper_trapdoor",
      waxed_copper_grate: "copper_grate",
      waxed_weathered_copper_grate: "weathered_copper_grate",
      waxed_exposed_copper_grate: "exposed_copper_grate",
      waxed_oxidized_copper_grate: "oxidized_copper_grate",
      oxidized_copper_grate: "weathered_copper_grate",
      weathered_copper_grate: "exposed_copper_grate",
      exposed_copper_grate: "copper_grate",
      waxed_chiseled_copper: "chiseled_copper",
      waxed_weathered_chiseled_copper: "weathered_chiseled_copper",
      waxed_exposed_chiseled_copper: "exposed_chiseled_copper",
      waxed_oxidized_chiseled_copper: "oxidized_chiseled_copper",
      oxidized_chiseled_copper: "weathered_chiseled_copper",
      weathered_chiseled_copper: "exposed_chiseled_copper",
      exposed_chiseled_copper: "chiseled_copper",
      waxed_cut_copper_stairs: "cut_copper_stairs",
      waxed_weathered_cut_copper_stairs: "weathered_cut_copper_stairs",
      waxed_exposed_cut_copper_stairs: "exposed_cut_copper_stairs",
      waxed_oxidized_cut_copper_stairs: "oxidized_cut_copper_stairs",
      oxidized_cut_copper_stairs: "weathered_cut_copper_stairs",
      weathered_cut_copper_stairs: "exposed_cut_copper_stairs",
      exposed_cut_copper_stairs: "cut_copper_stairs",
      waxed_cut_copper_slab: "cut_copper_slab",
      waxed_weathered_cut_copper_slab: "weathered_cut_copper_slab",
      waxed_exposed_cut_copper_slab: "exposed_cut_copper_slab",
      waxed_oxidized_cut_copper_slab: "oxidized_cut_copper_slab",
      oxidized_cut_copper_slab: "weathered_cut_copper_slab",
      weathered_cut_copper_slab: "exposed_cut_copper_slab",
      exposed_cut_copper_slab: "cut_copper_slab",
    };
  }

  getInteraction(block: Block, options: AxeOptions): AxeInteraction | undefined {
    for (const interaction of options.interactions) {
      if (block.matches(interaction.block)) {
        return interaction;
      }
    }
    return undefined;
  }

  /**
   * Convert the block.
   * @param {Block} block The block that should be converted.
   * @param {ItemUseOnEvent} event The item event for context.
   */
  convertBlock(block: Block, event: ItemUseOnEvent, options: AxeOptions): boolean | undefined {
    let result;
    if (!(result = this.getInteraction(block, options))) return;
    block.setType(result.block);
  }

  private interactBlock(event: ItemUseOnEvent, options: AxeOptions): void {
    event.block.dimension.playSound("use.gravel", event.block.location, {
      volume: 1,
    });
    offsetVolume<boolean>({ x: options.size, y: options.size, z: options.size }, (pos) => {
      try {
        const target = event.block.offset(pos);
        if (!target) return;
        return this.convertBlock(target, event, options);
      } catch (err) {}
    });
  }

  // EVENTS

  onUseOn(event: ItemUseOnEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as AxeOptions;
    if (!this.getInteraction(event.block, options)) return;
    this.interactBlock(event, options);
  }
}
