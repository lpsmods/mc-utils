import {
  BlockComponentOnPlaceEvent,
  BlockComponentPlayerInteractEvent,
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NeighborUpdateEvent } from "./base";
import { AddonUtils } from "../utils/addon";
import { BlockUtils } from "../block/utils";
import { ToggleableComponent, ToggleableOptions } from "./toggleable";
import { Vector3Utils } from "@minecraft/math";
import { assign, create, defaulted, object, string } from "superstruct";
import { CENTER_ENTITY } from "../constants";
import { DirectionUtils } from "../utils/direction";

export interface FenceGateOptions extends ToggleableOptions {
  in_wall_state: keyof BlockStateSuperset;
  direction_state: keyof BlockStateSuperset;
}

export class FenceGateComponent extends ToggleableComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("fence_gate");

  /**
   * Fence gate block behavior.
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onTick = this.onTick.bind(this);
    this.onPlace = this.onPlace.bind(this);
    this.struct = assign(
      this.struct,
      object({
        in_wall_state: defaulted(string(), "mcutils:in_wall"),
        direction_state: defaulted(string(), "minecraft:cardinal_direction"),
      }),
    );
  }

  // EVENTS

  onNeighborUpdate(event: NeighborUpdateEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FenceGateOptions;
    const axis = DirectionUtils.toAxis(event.block.permutation.getState(options.direction_state) as string);
    let inWall = false;
    switch (axis) {
      case "x":
        const e = event.block.east();
        const w = event.block.west();
        inWall = (BlockUtils.isWall(e) || BlockUtils.isWall(w)) ?? false;
        break;
      case "z":
        const n = event.block.north();
        const s = event.block.south();
        inWall = (BlockUtils.isWall(n) || BlockUtils.isWall(s)) ?? false;
        break;
    }
    BlockUtils.setState(event.block, options.in_wall_state, inWall);
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    this.baseTick(event, args);
  }

  onPlace(event: BlockComponentOnPlaceEvent, args: CustomComponentParameters): void {
    this.basePlace(event, args);
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FenceGateOptions;
    if (event.player) {
      const dir = event.block.permutation.getState(options.direction_state) as string;
      const origin = event.player.location;
      const target = Vector3Utils.add(event.block.location, CENTER_ENTITY);
      const dir2 = DirectionUtils.relDir(origin, target)?.toString().toLowerCase();
      if (dir !== dir2) {
        BlockUtils.setState(event.block, options.direction_state, DirectionUtils.getOpposite(dir).toLowerCase());
      }
    }
    super.onPlayerInteract(event, args);
  }
}
