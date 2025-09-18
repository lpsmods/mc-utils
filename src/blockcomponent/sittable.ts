import {
  Block,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  Dimension,
  Player,
  system,
  Vector2,
  Vector3,
} from "@minecraft/server";
import { BlockBaseComponent } from "./base";
import { Vector3Utils } from "@minecraft/math";
import { PlayerUtils } from "../entity/player_utils";
import { AddonUtils } from "../addon";
import { array, create, defaulted, object, string, Struct } from "superstruct";
import { vec3 } from "../validation";
import { CENTER_ENTITY } from "../constants";

export interface SittableOptions {
  seat_position: number[];
  seat_animations: string[];
}

export class SittableBlockEvent {
  constructor(block: Block, dimension: Dimension, player: Player) {
    this.block = block;
    this.dimension = dimension;
    this.player = player;
  }

  readonly block: Block;
  readonly dimension: Dimension;
  readonly player: Player;
  cancel: boolean = false;
}

export class SittableComponent extends BlockBaseComponent {
  static readonly componentId = AddonUtils.makeId("sittable");
  struct: Struct<any, any> = object({
    seat_position: defaulted(vec3, [0, 8, 0]),
    seat_animations: defaulted(array(string()), []),
  });

  /**
   * Sittable block behavior.
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  canSit(): boolean {
    return true;
  }

  getPos(block: Block, options: SittableOptions): Vector3 {
    const pos = options.seat_position;
    return Vector3Utils.add(Vector3Utils.add(block.location, CENTER_ENTITY), {
      x: pos[0] / 16,
      y: pos[1] / 16,
      z: pos[2] / 16,
    });
  }

  getRot(block: Block, options: SittableOptions): Vector2 | undefined {
    return undefined;
  }

  sit(block: Block, player: Player, options: SittableOptions): void {
    const sitEvent = new SittableBlockEvent(block, block.dimension, player);
    if (this.onMountEnter) this.onMountEnter(sitEvent);
    if (sitEvent.cancel) return;
    let pos = this.getPos(block, options);
    let rot = this.getRot(block, options);
    PlayerUtils.sit(
      player,
      pos,
      rot,
      (cancel) => {
        const sitEvent = new SittableBlockEvent(block, block.dimension, player);
        if (this.onMountExit) this.onMountExit(sitEvent);
        cancel = sitEvent.cancel;
      },
      options.seat_animations,
    );
    player.onScreenDisplay.setActionBar({
      translate: `action.hint.exit.${block.typeId}`,
    });
  }

  // CUSTOM EVENTS

  onMountEnter?(event: SittableBlockEvent): void;

  onMountExit?(event: SittableBlockEvent): void;

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as SittableOptions;
    if (!event.player) return;
    if (!this.canSit()) return;
    this.sit(event.block, event.player, options);
  }
}
