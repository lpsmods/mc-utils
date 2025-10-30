import { BlockComponentTickEvent, Block, CustomComponentParameters, BlockCustomComponent } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent, NeighborUpdateEvent } from "./base";
import { MathUtils } from "../utils/math";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, number, object, string, Struct } from "superstruct";

export interface RedstoneLampOptions {
  lit_state: keyof BlockStateSuperset;
  delay: number;
}

export class RedstoneLampComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("redstone_lamp");
  struct: Struct<any, any> = object({
    lit_state: defaulted(string(), "mcutils:lit"),
    delay: defaulted(number(), 0),
  });

  /**
   * Vanilla redstone lamp block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  updateNeighbors(block: Block, value: boolean, options: RedstoneLampOptions): void {
    MathUtils.taxicabDistance(block.location, 1, (pos) => {
      const blk = block.dimension.getBlock(pos);
      if (!blk || blk.typeId != block.typeId) return;
      blk.setState(options.lit_state, value);
    });
  }

  // EVENTS

  // TODO: Prevent spam
  onNeighborUpdate(event: NeighborUpdateEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as RedstoneLampOptions;
    let level = event.sourceBlock.getRedstonePower();
    if (level == undefined) return;
    if (level == 0) {
      return this.updateNeighbors(event.block, false, options);
    }
    this.updateNeighbors(event.block, true, options);
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    super.baseTick(event, args);
  }
}
