import {
  BlockComponentTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent, NeighborUpdateEvent } from "./base";
import { AddonUtils } from "../addon";

export interface FenceGateOptions {
  in_wall_state: keyof BlockStateSuperset;
  direction_state: keyof BlockStateSuperset;
}

export class FenceGateComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("fence_gate");

  /**
   * Fence gate block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  // EVENTS

  // TODO: Check for walls.
  onNeighborUpdate(event: NeighborUpdateEvent): void {}

  onTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    this.baseTick(event, args);
  }
}
