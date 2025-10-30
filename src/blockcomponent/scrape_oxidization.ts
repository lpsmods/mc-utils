import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  MolangVariableMap,
} from "@minecraft/server";
import { Identifier } from "../identifier";
import { BlockUtils } from "../block/utils";
import { Oxidization } from "../constants";
import { ItemUtils } from "../item/utils";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, object, optional, string, Struct } from "superstruct";
import { isBlock } from "../validation";
import { VECTOR3_ZERO } from "@minecraft/math";

export interface ScrapeOxidizationOptions {
  block?: string;
  particle_effect: string;
  sound_effect: string;
}

export class ScrapeOxidizationComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("scrape_oxidization");
  struct: Struct<any, any> = object({
    block: optional(isBlock),
    particle_effect: defaulted(string(), "minecraft:wax_particle"),
    sound_effect: defaulted(string(), "scrape"),
  });

  /**
   * Vanilla scrape oxidization block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getBlock(block: Block, options: ScrapeOxidizationOptions) {
    if (options.block) return options.block;
    const typeId = Identifier.parse(block.typeId);
    const age = BlockUtils.guessOxidization(block);
    switch (age) {
      case Oxidization.Oxidized:
        return typeId.replace("oxidized_", "weathered_").toString();
      case Oxidization.Weathered:
        return typeId.replace("weathered_", "exposed_").toString();
      case Oxidization.Exposed:
        return typeId.replace("exposed_", "").toString();
    }
    return typeId.toString();
  }

  convertBlock(block: Block, options: ScrapeOxidizationOptions): void {
    BlockUtils.setType(block, this.getBlock(block, options));
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    if (!event.player) return;
    const options = create(args.params, this.struct) as ScrapeOxidizationOptions;
    if (!ItemUtils.holding(event.player, "#is_axe")) return;
    this.convertBlock(event.block, options);
    const variables = new MolangVariableMap();
    variables.setColorRGB("color", { red: 0, green: 0, blue: 0 });
    variables.setVector3("direction", VECTOR3_ZERO);
    event.block.dimension.spawnParticle(
      options.particle_effect ?? "minecraft:wax_particle",
      event.block.location,
      variables,
    );
    event.block.dimension.playSound(options.sound_effect ?? "scrape", event.block.location);
  }
}
