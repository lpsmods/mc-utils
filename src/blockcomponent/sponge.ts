import { Block, BlockComponentOnPlaceEvent, BlockCustomComponent, CustomComponentParameters } from "@minecraft/server";
import { Identifier } from "../identifier";
import { MathUtils } from "../utils/math";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, number, object, optional, Struct } from "superstruct";
import { isBlock } from "../validation";

export interface SpongeOptions {
  block?: string;
  liquid_block: string;
  air_block: string;
  size: number;
}

export class SpongeComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("sponge");
  struct: Struct<any, any> = object({
    block: optional(isBlock),
    liquid_block: defaulted(isBlock, "water"),
    air_block: defaulted(isBlock, "air"),
    size: defaulted(number(), 7),
  });

  /**
   * Vanilla sponge block behavior.
   */
  constructor() {
    this.onPlace = this.onPlace.bind(this);
  }

  getWetBlock(block: Block, options: SpongeOptions): string {
    const id = Identifier.parse(block.typeId);
    return options.block ?? id.prefix("wet_").toString();
  }

  // Replace water with air
  absorbLiquid(block: Block, options: SpongeOptions): boolean | undefined {
    return MathUtils.taxicabDistance<boolean>(block.location, options.size ?? 7, (pos) => {
      const blk = block.dimension.getBlock(pos);
      if (blk?.matches(options.liquid_block ?? "water")) {
        blk.setType(options.air_block ?? "air");
        return true;
      }
      return undefined;
    });
  }

  // EVENTS

  onPlace(event: BlockComponentOnPlaceEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as SpongeOptions;
    const bool = this.absorbLiquid(event.block, options);
    if (bool) event.block.setType(this.getWetBlock(event.block, options));
  }
}
