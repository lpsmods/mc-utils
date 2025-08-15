import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockComponentTickEvent,
  CustomComponentParameters,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/BlockUtils";

export interface ButtonOptions {
  powered_state: keyof BlockStateSuperset;
  delay?: number;
  click_on_sound_event?: string;
  click_off_sound_event?: string;
}

// TODO:
// Emit redstone power
export class ButtonComponent {
  static typeId = "mcutils:button";

  DELAY = 0;

  constructor() {
    this.onTick = this.onTick.bind(this);
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getSound(block: Block, powered: boolean): string {
    if (block.hasTag("wood") && block.typeId.includes("cherry")) {
      return powered ? "click_on.cherry_wood_button" : "click_off.cherry_wood_button";
    }
    if (block.hasTag("wood") && block.typeId.includes("bamboo")) {
      return powered ? "click_on.bamboo_wood_button" : "click_off.bamboo_wood_button";
    }
    if (
      (block.hasTag("wood") && block.typeId.includes("crimson")) ||
      block.typeId.includes("warped")
    ) {
      return powered ? "click_on.nether_wood_button" : "click_off.nether_wood_button";
    }
    return "random.wood_click";
  }

  // EVENTS

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    const options = args.params as ButtonOptions;
    const delay = (event.block.getDynamicProperty("mcutils:delay") as number) ?? 0;
    if (delay > 0) {
      let v = delay - 1;
      event.block.setDynamicProperty("mcutils:delay", v);
      if (v == 0) {
        event.dimension.playSound(this.getSound(event.block, false), event.block.location);
        BlockUtils.setState(event.block, options.powered_state, false);
      }
    }
  }

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): void {
    const options = args.params as ButtonOptions;
    const powered = event.block.permutation.getState(options.powered_state) as boolean;
    if (!powered) {
      event.block.setDynamicProperty("mcutils:delay", options.delay ?? this.DELAY);
      event.dimension.playSound(this.getSound(event.block, true), event.block.location);
      return BlockUtils.setState(event.block, options.powered_state, true);
    }
    if (powered) {
      event.block.setDynamicProperty("mcutils:delay", options.delay ?? this.DELAY);
    }
  }
}

export class WoodenButtonComponent extends ButtonComponent {
  static typeId = "mcutils:wooden_button";

  DELAY = 30;
}

export class StoneButtonComponent extends ButtonComponent {
  static typeId = "mcutils:stone_button";

  DELAY = 20;
}
