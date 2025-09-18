import {
  Player,
  PlayerBreakBlockAfterEvent,
  PlayerBreakBlockBeforeEvent,
  PlayerButtonInputAfterEvent,
  PlayerDimensionChangeAfterEvent,
  PlayerEmoteAfterEvent,
  PlayerGameModeChangeAfterEvent,
  PlayerHotbarSelectedSlotChangeAfterEvent,
  PlayerInputModeChangeAfterEvent,
  PlayerInputPermissionCategoryChangeAfterEvent,
  PlayerInteractWithBlockAfterEvent,
  PlayerInteractWithBlockBeforeEvent,
  PlayerInteractWithEntityAfterEvent,
  PlayerInteractWithEntityBeforeEvent,
  PlayerInventoryItemChangeAfterEvent,
  PlayerJoinAfterEvent,
  PlayerLeaveAfterEvent,
  PlayerPlaceBlockAfterEvent,
  PlayerSpawnAfterEvent,
  world,
} from "@minecraft/server";
import { EntityHandler } from "./entity_handler";

let initialized = false;

export class PlayerHandler extends EntityHandler {
  static players = new Map<string, PlayerHandler>();
  constructor() {
    super({ type: "player" });
    PlayerHandler.players.set(this.id, this);
    if (!initialized) init();
  }

  // EVENTS

  /**
   * This event fires for a block that is broken by a player.
   * @param {PlayerBreakBlockAfterEvent} event
   */
  onBreakBlock?(event: PlayerBreakBlockAfterEvent): void;

  /**
   * This event fires before a block is broken by a player.
   * @param {PlayerBreakBlockBeforeEvent} event
   */
  onBeforeBreakBlock?(event: PlayerBreakBlockBeforeEvent): void;

  /**
   * This event fires when an InputButton state is changed.
   * @param {PlayerButtonInputAfterEvent} event
   */
  onButtonInput?(event: PlayerButtonInputAfterEvent): void;

  /**
   * Fires when a player moved to a different dimension.
   * @param {PlayerDimensionChangeAfterEvent} event
   */
  onDimensionChange?(event: PlayerDimensionChangeAfterEvent): void;

  /**
   * Fires when a player used an emote.
   * @param {PlayerEmoteAfterEvent} event
   */
  onEmote?(event: PlayerEmoteAfterEvent): void;

  /**
   * Fires when a player changes game mode.
   * @param {PlayerGameModeChangeAfterEvent} event
   */
  onGameModeChange?(event: PlayerGameModeChangeAfterEvent): void;

  /**
   * This event fires before a player changes game mode.
   * @param {PlayerGameModeChangeAfterEvent} event
   */
  onBeforeGameModeChange?(event: PlayerGameModeChangeAfterEvent): void;

  /**
   * This event fires when a player's selected slot changes.
   * @param {PlayerHotbarSelectedSlotChangeAfterEvent} event
   */
  onHotbarSelectedSlotChange?(event: PlayerHotbarSelectedSlotChangeAfterEvent): void;

  /**
   * This event fires when a player's InputMode changes.
   * @param {PlayerInputModeChangeAfterEvent} event
   */
  onInputModeChange?(event: PlayerInputModeChangeAfterEvent): void;

  /**
   * This event fires when a players input permissions change.
   * @param {PlayerInputPermissionCategoryChangeAfterEvent} event
   */
  onInputPermissionCategoryChange?(event: PlayerInputPermissionCategoryChangeAfterEvent): void;

  /**
   * An event for when a player interacts with a block.
   * @param {PlayerInteractWithBlockAfterEvent} event
   */
  onInteractWithBlock?(event: PlayerInteractWithBlockAfterEvent): void;

  /**
   * Fires before a player interacts with a block.
   * @param {PlayerInteractWithBlockBeforeEvent} event
   */
  onBeforeInteractWithBlock?(event: PlayerInteractWithBlockBeforeEvent): void;

  /**
   * This event fires when a player interacts with an entity.
   * @param {PlayerInteractWithEntityAfterEvent} event
   */
  onInteractWithEntity?(event: PlayerInteractWithEntityAfterEvent): void;

  /**
   * Fires before a player interacts with an entity.
   * @param {PlayerInteractWithEntityBeforeEvent} event
   */
  onBeforeInteractWithEntity?(event: PlayerInteractWithEntityBeforeEvent): void;

  /**
   * This event fires when an item gets added or removed to the player's inventory.
   * @param {PlayerInventoryItemChangeAfterEvent} event
   */
  onInventoryItemChange?(event: PlayerInventoryItemChangeAfterEvent): void;

  /**
   * This event fires when a player joins a world. See also playerSpawn for another related event you can trap for when a player is spawned the first time within a world.
   * @param {PlayerJoinAfterEvent} event
   */
  onJoin?(event: PlayerJoinAfterEvent): void;

  /**
   * This event fires when a player leaves a world.
   * @param {PlayerLeaveAfterEvent} event
   */
  onLeave?(event: PlayerLeaveAfterEvent): void;

  /**
   * This event fires for a block that is placed by a player.
   * @param {PlayerPlaceBlockAfterEvent} event
   */
  onPlaceBlock?(event: PlayerPlaceBlockAfterEvent): void;

  /**
   * This event fires when a player spawns or respawns. Note that an additional flag within this event will tell you whether the player is spawning right after join vs. a respawn.
   * @param {PlayerSpawnAfterEvent} event
   */
  onPlayerSpawn?(event: PlayerSpawnAfterEvent): void;
}

function callHandle(name: string, player: Player | undefined, event: any): void {
  if (!player) return;
  for (const handler of PlayerHandler.players.values()) {
    if (!player || !player.isValid) continue;
    const func = handler[name as keyof PlayerHandler];
    if (!func) continue;
    if (typeof func !== "function") continue;
    func(event);
  }
}

function init() {
  initialized = true;

  world.afterEvents.playerBreakBlock.subscribe((event) => {
    callHandle("onBreakBlock", event.player, event);
  });
  world.beforeEvents.playerBreakBlock.subscribe((event) => {
    callHandle("onBeforeBreakBlock", event.player, event);
  });
  world.afterEvents.playerButtonInput.subscribe((event) => {
    callHandle("onButtonInput", event.player, event);
  });
  world.afterEvents.playerDimensionChange.subscribe((event) => {
    callHandle("onDimensionChange", event.player, event);
  });
  world.afterEvents.playerEmote.subscribe((event) => {
    callHandle("onEmote", event.player, event);
  });
  world.afterEvents.playerGameModeChange.subscribe((event) => {
    callHandle("onGameModeChange", event.player, event);
  });
  world.beforeEvents.playerGameModeChange.subscribe((event) => {
    callHandle("onBeforeGameModeChange", event.player, event);
  });
  world.afterEvents.playerHotbarSelectedSlotChange.subscribe((event) => {
    callHandle("onHotbarSelectedSlotChange", event.player, event);
  });
  world.afterEvents.playerInputModeChange.subscribe((event) => {
    callHandle("onInputModeChange", event.player, event);
  });
  world.afterEvents.playerInputPermissionCategoryChange.subscribe((event) => {
    callHandle("onInputPermissionCategoryChange", event.player, event);
  });
  world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    callHandle("onInteractWithBlock", event.player, event);
  });
  world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    callHandle("onBeforeInteractWithBlock", event.player, event);
  });
  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    callHandle("onInteractWithEntity", event.player, event);
  });
  world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    callHandle("onBeforeInteractWithEntity", event.player, event);
  });
  world.afterEvents.playerInventoryItemChange.subscribe((event) => {
    callHandle("onInventoryItemChange", event.player, event);
  });
  world.afterEvents.playerPlaceBlock.subscribe((event) => {
    callHandle("onPlaceBlock", event.player, event);
  });
  world.afterEvents.playerSpawn.subscribe((event) => {
    callHandle("onPlayerSpawn", event.player, event);
  });
  world.afterEvents.playerJoin.subscribe((event) => {
    for (const handler of PlayerHandler.players.values()) {
      if (handler.onJoin) handler.onJoin(event);
    }
  });
  world.afterEvents.playerLeave.subscribe((event) => {
    for (const handler of PlayerHandler.players.values()) {
      if (handler.onLeave) handler.onLeave(event);
    }
  });
}
