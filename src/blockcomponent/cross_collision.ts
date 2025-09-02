import { BlockBaseComponent, NeighborUpdateEvent } from "./base";
import {
  Block,
  BlockComponentOnPlaceEvent,
  BlockComponentTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";

export interface CrossCollisionOptions {
  north_state: keyof BlockStateSuperset;
  east_state: keyof BlockStateSuperset;
  south_state: keyof BlockStateSuperset;
  west_state: keyof BlockStateSuperset;
}

export class CrossCollisionComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("cross_collision");

  /**
   * Fence, Iron bars, and glass pane like behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
    this.onPlace = this.onPlace.bind(this);
  }

  isAttachable(block: Block): boolean {
    return !block.isAir && !block.hasTag("non_full");
  }

  // EVENTS

  onNeighborUpdate(
    event: NeighborUpdateEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as CrossCollisionOptions;
    if (!event.direction) return;
    if (this.isAttachable(event.sourceBlock)) {
      switch (event.direction.toLowerCase()) {
        case "north":
          return BlockUtils.setState(event.block, options.north_state, true);
        case "east":
          return BlockUtils.setState(event.block, options.east_state, true);
        case "south":
          return BlockUtils.setState(event.block, options.south_state, true);
        case "west":
          return BlockUtils.setState(event.block, options.west_state, true);
      }
    }
    switch (event.direction.toLowerCase()) {
      case "north":
        return BlockUtils.setState(event.block, options.north_state, false);
      case "east":
        return BlockUtils.setState(event.block, options.east_state, false);
      case "south":
        return BlockUtils.setState(event.block, options.south_state, false);
      case "west":
        return BlockUtils.setState(event.block, options.west_state, false);
    }
  }

  onTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    this.baseTick(event, args);
  }

  onPlace(
    event: BlockComponentOnPlaceEvent,
    args: CustomComponentParameters,
  ): void {
    this.basePlace(event, args);
  }
}
