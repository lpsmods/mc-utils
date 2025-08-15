import { BlockComponentTickEvent, Block, CustomComponentParameters } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent, NeighborUpdateEvent } from "./BlockBase";
import { MathUtils } from "../MathUtils";

export interface RedstoneLampOptions {
  lit_state: keyof BlockStateSuperset;
  delay?: number;
}

// TODO: Light up adjacent lamps.
export class RedstoneLampComponent extends BlockBaseComponent {
  static typeId = "mcutils:redstone_lamp";

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
    const options = args.params as RedstoneLampOptions;
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
