import {
  Block,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  MolangVariableMap,
} from "@minecraft/server";
import { ItemUtils } from "../item/ItemUtils";
import { BlockUtils } from "../block/BlockUtils";
import { Identifier } from "../misc/Identifier";

export interface WaxableOptions {
  block?: string;
  particle_effect?: string;
  sound_effect?: string;
  items?: string[];
}

export class WaxableComponent {
  static typeId = "mcutils:waxable";

  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getBlock(block: Block, options: WaxableOptions): string {
    const typeId = Identifier.parse(block.typeId);
    return options.block ?? typeId.prefix("waxed_").toString();
  }

  convertBlock(block: Block, options: WaxableOptions): void {
    BlockUtils.setType(block, this.getBlock(block, options));
  }

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): void {
    const options = args.params as WaxableOptions;
    if (!ItemUtils.isHolding(event.player, options.items ?? [])) return;
    this.convertBlock(event.block, options);
    const variables = new MolangVariableMap();
    variables.setColorRGB("color", { red: 1, green: 1, blue: 1 });
    variables.setVector3("direction", { x: 1, y: 0, z: 0 });
    event.block.dimension.spawnParticle(
      options.particle_effect ?? "minecraft:wax_particle",
      event.block.location,
      variables
    );
    event.block.dimension.playSound(options.sound_effect ?? "copper.wax.on", event.block.location);
  }
}
