import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  MolangVariableMap,
} from "@minecraft/server";
import { ItemUtils } from "../item/utils";
import { BlockUtils } from "../block/utils";
import { Identifier } from "../identifier";
import { AddonUtils } from "../utils/addon";
import { array, create, defaulted, object, optional, string, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface WaxableOptions {
  block?: string;
  items?: string[];
  particle_effect: string;
  sound_effect: string;
}

export class WaxableComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("waxable");
  struct: Struct<any, any> = object({
    block: optional(isBlock),
    particle_effect: defaulted(string(), "minecraft:wax_particle"),
    sound_effect: defaulted(string(), "copper.wax.on"),
    items: defaulted(array(string()), []),
  });

  /**
   * Vanilla waxable block behavior.
   */
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

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as WaxableOptions;
    if (!event.player || !ItemUtils.holding(event.player, options.items ?? [])) return;
    this.convertBlock(event.block, options);
    const variables = new MolangVariableMap();
    variables.setColorRGB("color", { red: 1, green: 1, blue: 1 });
    variables.setVector3("direction", { x: 1, y: 0, z: 0 });
    event.block.dimension.spawnParticle(options.particle_effect, event.block.location, variables);
    event.block.dimension.playSound(options.sound_effect, event.block.location);
  }
}
