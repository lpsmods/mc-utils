import {
  Block,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  MolangVariableMap,
} from "@minecraft/server";
import { Identifier } from "../misc/Identifier";
import { BlockUtils } from "../block/BlockUtils";
import { Oxidization } from "../constants";
import { ItemUtils } from "../item/ItemUtils";

export interface ScrapeOxidizationOptions {
  block?: string;
  particle_effect?: string;
  sound_effect?: string;
}

export class ScrapeOxidizationComponent {
  static typeId = "mcutils:scrape_oxidization";

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

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): void {
    if (!event.player) return;
    const options = args.params as ScrapeOxidizationOptions;
    if (!ItemUtils.holdingAxe(event.player)) return;
    this.convertBlock(event.block, options);
    const variables = new MolangVariableMap();
    variables.setColorRGB("color", { red: 0, green: 0, blue: 0 });
    variables.setVector3("direction", { x: 0, y: 0, z: 0 });
    event.block.dimension.spawnParticle(
      options.particle_effect ?? "minecraft:wax_particle",
      event.block.location,
      variables
    );
    event.block.dimension.playSound(options.sound_effect ?? "scrape", event.block.location);
  }
}
