import {
  Block,
  Entity,
  EquipmentSlot,
  ItemUseBeforeEvent,
  Player,
  PlayerInteractWithBlockBeforeEvent,
  PlayerInteractWithEntityBeforeEvent,
  system,
  world,
} from "@minecraft/server";
import { EventSignal } from "./utils";
import { BlockUtils } from "../block";
import { ItemUtils } from "../item";
import { Hasher } from "../type";
import { Vector3Utils } from "@minecraft/math";

let initialized = false;

export enum ScreenEventSource {
  Block = "block",
  Entity = "entity",
}

export interface ScreenEventOptions {
  sourceBlock?: Block;
  sourceEntity?: Entity;
}

export abstract class ScreenEvent {
  constructor(player: Player, screenType: string, sourceType: ScreenEventSource, options: ScreenEventOptions) {
    this.player = player;
    this.screenType = screenType;
    this.sourceType = sourceType;
    this.sourceBlock = options.sourceBlock;
    this.sourceEntity = options.sourceEntity;
  }

  readonly player: Player;
  readonly screenType: string;
  readonly sourceType: ScreenEventSource;
  readonly sourceBlock: Block | undefined;
  readonly sourceEntity: Entity | undefined;
}

export class OpenScreenEvent extends ScreenEvent {}

export class CloseScreenEvent extends ScreenEvent {}

export class OpenScreenEventSignal extends EventSignal<OpenScreenEvent> {}

export class CloseScreenEventSignal extends EventSignal<CloseScreenEvent> {}

export class ScreenEvents {
  private constructor() {}

  /**
   * This event fires when a player opens a screen.
   * @eventProperty
   */
  static readonly openScreen = new OpenScreenEventSignal();

  /**
   * This event fires when a player closes a screen.
   * @eventProperty
   */
  static readonly closeScreen = new CloseScreenEventSignal();
}

function trackClosedUI(event: CloseScreenEvent): void {
  let lastPos: string | undefined = undefined;
  let lastRot: string | undefined = undefined;
  let delay = 2;
  const runId = system.runInterval(() => {
    // Check if player has moved.
    if (delay > 0) {
      delay--;
      return;
    }
    let pos = Vector3Utils.toString(event.player.location, { decimals: 2 });
    let rot = Hasher.stringify(event.player.getRotation());
    if (lastPos === undefined || lastRot === undefined) {
      lastPos = pos;
      lastRot = rot;
      return;
    }
    if (lastPos !== pos || lastRot !== rot) {
      ScreenEvents.closeScreen.apply(event);
      system.clearRun(runId);
    }
  });
}

function getBlockScreen(block: Block): string | undefined {
  if (BlockUtils.matches(block, "#anvil")) return "anvil_screen";
  if (BlockUtils.matches(block, "beacon")) return "beacon_screen";
  if (BlockUtils.matches(block, "blast_furnace")) return "blast_furnace_screen";
  if (BlockUtils.matches(block, "loom")) return "loom_screen";
  if (BlockUtils.matches(block, "lectern")) return "book_screen";
  if (BlockUtils.matches(block, "brewing_stand")) return "brewing_stand_screen";
  if (BlockUtils.matches(block, "cartography_table")) return "cartography_screen";
  if (BlockUtils.matches(block, "barrel")) return "barrel_screen";
  if (BlockUtils.matches(block, "#shulker_box")) return "shulker_box_screen";
  if (BlockUtils.matches(block, "ender_chest")) return "ender_chest_screen";
  if (BlockUtils.matches(block, "enchanting_table")) return "enchanting_screen";
  if (BlockUtils.matches(block, "furnace")) return "furnace_screen";
  if (BlockUtils.matches(block, "grindstone")) return "grindstone_screen";
  if (BlockUtils.matches(block, "crafting_table")) return "crafting_screen";
  if (BlockUtils.matches(block, "jigsaw")) return "jigsaw_editor_screen";
  if (BlockUtils.matches(block, "dispenser")) return "dispenser_screen";
  if (BlockUtils.matches(block, "hopper")) return "hopper_screen";
  if (BlockUtils.matches(block, "dropper")) return "dropper_screen";
  if (BlockUtils.matches(block, "crafter")) return "crafter_screen";
  if (BlockUtils.matches(block, "smithing_table")) return "smithing_table_screen";
  if (BlockUtils.matches(block, "smoker")) return "smoker_screen";
  if (BlockUtils.matches(block, "stonecutter_block")) return "stonecutter_screen";
  if (BlockUtils.matches(block, "structure_block")) return "structure_editor_screen";

  const blockPredicates: string[] = ["chest", "trapped_chest", "#copper_chests"];
  if (BlockUtils.matchAny(block, blockPredicates)) return "small_chest_screen"; // TODO: large_chest_screen
  if (BlockUtils.matchAny(block, ["command_block", "chain_command_block", "repeating_command_block"]))
    return "command_block_screen";
}

function playerInteractWithBlock(event: PlayerInteractWithBlockBeforeEvent): void {
  if (event.player.isSneaking) {
    const equ = event.player.getComponent("equippable");
    if (!equ) return;
    if (equ.getEquipment(EquipmentSlot.Mainhand) !== undefined) return;
  }
  const screenType = getBlockScreen(event.block);
  if (!screenType) return;
  const cEvent = new OpenScreenEvent(event.player, screenType, ScreenEventSource.Block, { sourceBlock: event.block });
  ScreenEvents.openScreen.apply(cEvent);
  trackClosedUI(new CloseScreenEvent(event.player, screenType, ScreenEventSource.Block, { sourceBlock: event.block }));
}

function playerInteractWithEntity(event: PlayerInteractWithEntityBeforeEvent): void {
  const npc = event.target.hasComponent("npc");
  if (npc) {
    ScreenEvents.openScreen.apply(
      new OpenScreenEvent(event.player, "npc", ScreenEventSource.Entity, { sourceEntity: event.target }),
    );
    trackClosedUI(new CloseScreenEvent(event.player, "npc", ScreenEventSource.Entity, { sourceEntity: event.target }));
    return;
  }

  const screenType = event.target.getComponent("inventory")?.containerType;
  if (!screenType || screenType === "none") return;
  if (event.target.matches({ type: "chest_boat" })) {
    if (!event.player.isSneaking) return;
    ScreenEvents.openScreen.apply(
      new OpenScreenEvent(event.player, screenType, ScreenEventSource.Entity, { sourceEntity: event.target }),
    );
    trackClosedUI(
      new CloseScreenEvent(event.player, screenType, ScreenEventSource.Entity, { sourceEntity: event.target }),
    );
    return;
  }
  ScreenEvents.openScreen.apply(
    new OpenScreenEvent(event.player, screenType, ScreenEventSource.Entity, { sourceEntity: event.target }),
  );
  trackClosedUI(
    new CloseScreenEvent(event.player, screenType, ScreenEventSource.Entity, { sourceEntity: event.target }),
  );
}

function itemUse(event: ItemUseBeforeEvent): void {
  if (ItemUtils.matchAny(event.itemStack, ["writable_book", "written_book"])) {
    ScreenEvents.openScreen.apply(
      new OpenScreenEvent(event.source, "book_screen", ScreenEventSource.Entity, { sourceEntity: event.source }),
    );
    trackClosedUI(
      new CloseScreenEvent(event.source, "book_screen", ScreenEventSource.Entity, { sourceEntity: event.source }),
    );
    return;
  }
}

function init() {
  initialized = true;

  world.beforeEvents.playerInteractWithBlock.subscribe(playerInteractWithBlock);
  world.beforeEvents.playerInteractWithEntity.subscribe(playerInteractWithEntity);
  world.beforeEvents.itemUse.subscribe(itemUse);
}

if (!initialized) init();
