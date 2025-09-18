import {
  Player,
  // PlayerBreakBlockAfterEvent,
  // PlayerBreakBlockBeforeEvent,
  // PlayerButtonInputAfterEvent,
  // PlayerDimensionChangeAfterEvent,
  // PlayerEmoteAfterEvent,
  // PlayerGameModeChangeAfterEvent,
  // PlayerHotbarSelectedSlotChangeAfterEvent,
  // PlayerInputModeChangeAfterEvent,
  // PlayerInputPermissionCategoryChangeAfterEvent,
  // PlayerInteractWithBlockAfterEvent,
  // PlayerInteractWithBlockBeforeEvent,
  // PlayerInteractWithEntityAfterEvent,
  // PlayerInteractWithEntityBeforeEvent,
  // PlayerInventoryItemChangeAfterEvent,
  // PlayerJoinAfterEvent,
  // PlayerLeaveAfterEvent,
  // PlayerPlaceBlockAfterEvent,
  // PlayerSpawnAfterEvent,
} from "@minecraft/server";
import { EntityTickEvent } from "../event";
import { PlayerHandler } from "./player_handler";

class PlayerEntity extends PlayerHandler {
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
    // this.onBreakBlock = this.onBreakBlock.bind(this);
    // this.onBeforeBreakBlock = this.onBeforeBreakBlock.bind(this);
    // this.onButtonInput = this.onButtonInput.bind(this);
    // this.onDimensionChange = this.onDimensionChange.bind(this);
    // this.onEmote = this.onEmote.bind(this);
    // this.onGameModeChange = this.onGameModeChange.bind(this);
    // this.onBeforeGameModeChange = this.onBeforeGameModeChange.bind(this);
    // this.onHotbarSelectedSlotChange = this.onHotbarSelectedSlotChange.bind(this);
    // this.onInputModeChange = this.onInputModeChange.bind(this);
    // this.onInputPermissionCategoryChange = this.onInputPermissionCategoryChange.bind(this);
    // this.onInteractWithBlock = this.onInteractWithBlock.bind(this);
    // this.onBeforeInteractWithBlock = this.onBeforeInteractWithBlock.bind(this);
    // this.onInteractWithEntity = this.onInteractWithEntity.bind(this);
    // this.onBeforeInteractWithEntity = this.onBeforeInteractWithEntity.bind(this);
    // this.onInventoryItemChange = this.onInventoryItemChange.bind(this);
    // this.onJoin = this.onJoin.bind(this);
    // this.onLeave = this.onLeave.bind(this);
    // this.onPlaceBlock = this.onPlaceBlock.bind(this);
    // this.onPlayerSpawn = this.onPlayerSpawn.bind(this);
  }

  // ENTITY

  onTick(event: EntityTickEvent): void {
    if (!event.entity.isSneaking) return;
    const block = event.entity.dimension.getBlock(event.entity.location);
    if (!block) return;
    const below = block.below();
    if (!below) return;
    if (!(event.entity instanceof Player)) return;
    event.entity.onScreenDisplay.setActionBar({ translate: below.localizationKey });
  }

  // PLAYER

  // onBreakBlock(event: PlayerBreakBlockAfterEvent): void {
  //   console.warn("onBreakBlock");
  // }
  // onBeforeBreakBlock(event: PlayerBreakBlockBeforeEvent): void {
  //   console.warn("onBeforeBreakBlock");
  // }
  // onButtonInput(event: PlayerButtonInputAfterEvent): void {
  //   console.warn("onButtonInput");
  // }
  // onDimensionChange(event: PlayerDimensionChangeAfterEvent): void {
  //   console.warn("onDimensionChange");
  // }
  // onEmote(event: PlayerEmoteAfterEvent): void {
  //   console.warn("onEmote");
  // }
  // onGameModeChange(event: PlayerGameModeChangeAfterEvent): void {
  //   console.warn("onGameModeChange");
  // }
  // onBeforeGameModeChange(event: PlayerGameModeChangeAfterEvent): void {
  //   console.warn("onBeforeGameModeChange");
  // }
  // onHotbarSelectedSlotChange(event: PlayerHotbarSelectedSlotChangeAfterEvent): void {
  //   console.warn("onHotbarSelectedSlotChange");
  // }
  // onInputModeChange(event: PlayerInputModeChangeAfterEvent): void {
  //   console.warn("onInputModeChange");
  // }
  // onInputPermissionCategoryChange(event: PlayerInputPermissionCategoryChangeAfterEvent): void {
  //   console.warn("onInputPermissionCategoryChange");
  // }
  // onInteractWithBlock(event: PlayerInteractWithBlockAfterEvent): void {
  //   console.warn("onInteractWithBlock");
  // }
  // onBeforeInteractWithBlock(event: PlayerInteractWithBlockBeforeEvent): void {
  //   console.warn("onBeforeInteractWithBlock");
  // }
  // onInteractWithEntity(event: PlayerInteractWithEntityAfterEvent): void {
  //   console.warn("onInteractWithEntity");
  // }
  // onBeforeInteractWithEntity(event: PlayerInteractWithEntityBeforeEvent): void {
  //   console.warn("onBeforeInteractWithEntity");
  // }
  // onInventoryItemChange(event: PlayerInventoryItemChangeAfterEvent): void {
  //   console.warn("onInventoryItemChange");
  // }
  // onJoin(event: PlayerJoinAfterEvent): void {
  //   console.warn("onJoin");
  // }
  // onLeave(event: PlayerLeaveAfterEvent): void {
  //   console.warn("onLeave");
  // }
  // onPlaceBlock(event: PlayerPlaceBlockAfterEvent): void {
  //   console.warn("onPlaceBlock");
  // }
  // onPlayerSpawn(event: PlayerSpawnAfterEvent): void {
  //   console.warn("onPlayerSpawn");
  // }
}

export default () => {
  new PlayerEntity();
};
