import {
  Block,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  MolangVariableMap,
} from "@minecraft/server";
import { Identifier } from "../misc/identifier";
import { ItemUtils } from "../item/utils";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";

export interface ScrapeWaxOptions {
  block?: string;
  particle_effect?: string;
  sound_effect?: string;
}

export class ScrapeWaxComponent {
  static typeId = AddonUtils.makeId("scrape_wax");

  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getBlock(block: Block, options: ScrapeWaxOptions): string {
    const typeId = Identifier.parse(block.typeId);
    return options.block ?? typeId.replace("waxed_", "").toString();
  }

  convertBlock(block: Block, options: ScrapeWaxOptions): void {
    BlockUtils.setType(block, this.getBlock(block, options));
  }

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters,
  ): void {
    if (!event.player) return;
    const options = args.params as ScrapeWaxOptions;
    if (!ItemUtils.holdingAxe(event.player)) return;
    this.convertBlock(event.block, options);
    const variables = new MolangVariableMap();
    variables.setColorRGB("color", { red: 1, green: 1, blue: 1 });
    variables.setVector3("direction", { x: 1, y: 1, z: 0 });
    event.block.dimension.spawnParticle(
      options.particle_effect ?? "minecraft:wax_particle",
      event.block.location,
      variables,
    );
    event.block.dimension.playSound(
      options.sound_effect ?? "copper.wax.off",
      event.block.location,
    );
  }
}
