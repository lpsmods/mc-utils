import {
  Block,
  BlockExplodeAfterEvent,
  ButtonPushAfterEvent,
  Entity,
  LeverActionAfterEvent,
  PlayerBreakBlockAfterEvent,
  PlayerBreakBlockBeforeEvent,
  PlayerInteractWithBlockAfterEvent,
  PlayerInteractWithBlockBeforeEvent,
  PlayerPlaceBlockAfterEvent,
  PressurePlatePopAfterEvent,
  PressurePlatePushAfterEvent,
  ProjectileHitBlockAfterEvent,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { PlayerUtils } from "../entity/player_utils";
import { id, Identifier } from "../identifier";

let initialized = false;

export abstract class BlockHandler {
  static all = new Map<string, BlockHandler>();

  blockId: Identifier;
  location?: Vector3;

  constructor(blockId: id, location?: Vector3) {
    this.blockId = Identifier.parse(blockId);
    this.location = location;
    if (!initialized) init();
  }

  /**
   *
   * @param {BlockExplodeAfterEvent} event
   */
  abstract onExplode?(event: BlockExplodeAfterEvent): void;

  /**
   *
   * @param {ButtonPushAfterEvent} event
   */
  abstract onButtonPush?(event: ButtonPushAfterEvent): void;

  /**
   *
   * @param {LeverActionAfterEvent} event
   */
  abstract onLeverAction?(event: LeverActionAfterEvent): void;

  /**
   *
   * @param {PlayerBreakBlockAfterEvent} event
   */
  abstract onPlayerBreak?(event: PlayerBreakBlockAfterEvent): void;

  /**
   *
   * @param {PlayerPlaceBlockAfterEvent} event
   */
  abstract onPlayerPlace?(event: PlayerPlaceBlockAfterEvent): void;

  /**
   *
   * @param {PlayerInteractWithBlockAfterEvent} event
   */
  abstract onPlayerInteract?(event: PlayerInteractWithBlockAfterEvent): void;

  /**
   *
   * @param {PressurePlatePopAfterEvent} event
   */
  abstract onPressurePlatePop?(event: PressurePlatePopAfterEvent): void;

  /**
   *
   * @param {PressurePlatePushAfterEvent} event
   */
  abstract onPressurePlatePush?(event: PressurePlatePushAfterEvent): void;

  /**
   *
   * @param {ProjectileHitBlockAfterEvent} event
   */
  abstract onProjectileHitBlock?(event: ProjectileHitBlockAfterEvent): void;

  /**
   *
   * @param {any} event
   */
  abstract onTick?(event: any): void;

  /**
   *
   * @param {PlayerBreakBlockBeforeEvent} event
   */
  abstract beforePlayerBreak?(event: PlayerBreakBlockBeforeEvent): void;

  /**
   *
   * @param {PlayerInteractWithBlockBeforeEvent} event
   */
  abstract beforePlayerInteract?(event: PlayerInteractWithBlockBeforeEvent): void;

  matches(block: Block, entity?: Entity): boolean {
    if (this.location) {
      if (this.location === block.location) return false;
    }
    return block.matches(this.blockId.toString());
  }
}

function callHandle(name: string, block: Block | undefined, event: any): void {
  if (!block) return;
  for (const handler of BlockHandler.all.values()) {
    const func = handler[name as keyof BlockHandler];
    if (!func) continue;
    if (!handler.matches(block)) continue;
    if (typeof func !== "function") continue;
    func(event);
  }
}

function init() {
  initialized = true;
  world.afterEvents.blockExplode.subscribe((event) => {
    callHandle("onExplode", event.block, event);
  });
  world.afterEvents.buttonPush.subscribe((event) => {
    callHandle("onButtonPush", event.block, event);
  });
  world.afterEvents.leverAction.subscribe((event) => {
    callHandle("onLeverAction", event.block, event);
  });
  world.afterEvents.playerBreakBlock.subscribe((event) => {
    callHandle("onPlayerBreak", event.block, event);
  });
  world.afterEvents.playerPlaceBlock.subscribe((event) => {
    callHandle("onPlayerPlace", event.block, event);
  });
  world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    callHandle("onInteract", event.block, event);
  });
  world.afterEvents.pressurePlatePop.subscribe((event) => {
    callHandle("onPressurePlatePop", event.block, event);
  });
  world.afterEvents.pressurePlatePush.subscribe((event) => {
    callHandle("onPressurePlatePush", event.block, event);
  });
  world.afterEvents.projectileHitBlock.subscribe((event) => {
    const hit = event.getBlockHit();
    callHandle("onProjectileHit", hit.block, event);
  });
  world.beforeEvents.playerBreakBlock.subscribe((event) => {
    callHandle("beforePlayerBreak", event.block, event);
  });
  world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    callHandle("beforePlayerInteract", event.block, event);
  });

  const DISTANCE = 4 * 16;

  // on Tick
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
      for (const handler of BlockHandler.all.values()) {
        if (!handler.onTick) continue;
        const blocks = PlayerUtils.getBlocksAroundPlayer(player, DISTANCE);
        for (const block of blocks) {
          if (handler.matches(block, player)) {
            const event = { block, player };
            handler.onTick(event);
          }
        }
      }
    }
  });
}
