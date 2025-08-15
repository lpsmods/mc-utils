import {
  Block,
  BlockComponentTickEvent,
  BlockComponentOnPlaceEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockBaseComponent, NeighborUpdateEvent } from "./BlockBase";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/BlockUtils";

export interface WallOptions {
  north_state: keyof BlockStateSuperset;
  east_state: keyof BlockStateSuperset;
  south_state: keyof BlockStateSuperset;
  west_state: keyof BlockStateSuperset;
  up_state: keyof BlockStateSuperset;
}

export class WallComponent extends BlockBaseComponent {
  static typeId = "mcutils:wall";

  /**
   * Wall block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
    this.onPlace = this.onPlace.bind(this);
  }

  isAttachable(block: Block): boolean {
    return !block.isAir && !block.hasTag("non_full");
  }

  isWall(block: Block | undefined): boolean {
    if (block === undefined) return false;
    return block.hasTag("minecraft:wall") || block.typeId.includes("wall");
  }

  #upperBit(block: Block): boolean {
    const north = block.north();
    const south = block.south();
    const east = block.east();
    const west = block.west();
    const above = block.above();
    if (!above) return false;
    const nUp = above.north();
    const sUp = above.south();
    const eUp = above.east();
    const wUp = above.west();
    if (this.isWall(above)) return true;
    if (this.isWall(north) && this.isWall(south) && !this.isWall(east) && !this.isWall(west))
      return false;
    if (!this.isWall(north) && !this.isWall(south) && this.isWall(east) && this.isWall(west))
      return false;
    return true;
  }

  // EVENTS

  onPlace(event: BlockComponentOnPlaceEvent, args: CustomComponentParameters): void {
    this.basePlace(event, args);
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    this.baseTick(event, args);
  }

  onNeighborUpdate(event: NeighborUpdateEvent, args: CustomComponentParameters): void {
    const options = args.params as WallOptions;
    const above = event.block.above();
    // TODO post
    if (above && this.#upperBit(event.block)) {
      BlockUtils.setState(event.block, options.up_state, true);
    } else {
      BlockUtils.setState(event.block, options.up_state, false);
    }

    if (!event.direction) return;
    // sides
    if (this.isAttachable(event.sourceBlock)) {
      if (above && this.isWall(above)) {
        switch (event.direction.toLowerCase()) {
          case "north":
            return BlockUtils.setState(event.block, options.north_state, "tall");
          case "east":
            return BlockUtils.setState(event.block, options.east_state, "tall");
          case "south":
            return BlockUtils.setState(event.block, options.south_state, "tall");
          case "west":
            return BlockUtils.setState(event.block, options.west_state, "tall");
        }
      }
      switch (event.direction.toLowerCase()) {
        case "north":
          return BlockUtils.setState(event.block, options.north_state, "low");
        case "east":
          return BlockUtils.setState(event.block, options.east_state, "low");
        case "south":
          return BlockUtils.setState(event.block, options.south_state, "low");
        case "west":
          return BlockUtils.setState(event.block, options.west_state, "low");
      }
    }
    switch (event.direction.toLowerCase()) {
      case "north":
        return BlockUtils.setState(event.block, options.north_state, "none");
      case "east":
        return BlockUtils.setState(event.block, options.east_state, "none");
      case "south":
        return BlockUtils.setState(event.block, options.south_state, "none");
      case "west":
        return BlockUtils.setState(event.block, options.west_state, "none");
    }
  }
}
