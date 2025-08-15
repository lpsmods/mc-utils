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
import { PlayerUtils } from "../entity/PlayerUtils";
import { id, Identifier } from "../misc/Identifier";

export abstract class BlockHandler {
  static all = new Map<string, BlockHandler>();

  blockId: Identifier;
  location?: Vector3;

  constructor(blockId: id, location?: Vector3) {
    this.blockId = Identifier.parse(blockId);
    this.location = location;
  }

  abstract onExplode?(event: BlockExplodeAfterEvent): void;

  abstract onButtonPush?(event: ButtonPushAfterEvent): void;

  abstract onLeverAction?(event: LeverActionAfterEvent): void;

  abstract onPlayerBreak?(event: PlayerBreakBlockAfterEvent): void;

  abstract onPlayerPlace?(event: PlayerPlaceBlockAfterEvent): void;

  abstract onPlayerInteract?(event: PlayerInteractWithBlockAfterEvent): void;

  abstract onPressurePlatePop?(event: PressurePlatePopAfterEvent): void;

  abstract onPressurePlatePush?(event: PressurePlatePushAfterEvent): void;

  abstract onProjectileHitBlock?(event: ProjectileHitBlockAfterEvent): void;

  abstract onTick?(event: any): void;

  abstract beforePlayerBreak?(event: PlayerBreakBlockBeforeEvent): void;

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

export function setup() {
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
        // TODO: Search all blocks around the player.
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

