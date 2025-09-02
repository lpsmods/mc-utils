// TODO: Implement
import { Entity, ItemStack } from "@minecraft/server";
import { EventSignal } from "./utils";

export class ItemEvent {
  constructor(itemStack: ItemStack) {
    this.itemStack = itemStack;
  }

  readonly itemStack: ItemStack;
}

export class ItemHoldEvent extends ItemEvent {
  readonly source: Entity;
  constructor(itemStack: ItemStack, source: Entity) {
    super(itemStack);
    this.source = source;
  }
}

export class ItemReleaseHoldEvent extends ItemEvent {
  readonly source: Entity;
  constructor(itemStack: ItemStack, source: Entity) {
    super(itemStack);
    this.source = source;
  }
}

export class ItemHoldTickEvent extends ItemEvent {
  readonly source: Entity;
  constructor(itemStack: ItemStack, source: Entity) {
    super(itemStack);
    this.source = source;
  }
}

export class ItemHoldEventSignal extends EventSignal<ItemHoldEvent> {}

export class ItemReleaseHoldEventSignal extends EventSignal<ItemReleaseHoldEvent> {}

export class ItemHoldTickEventSignal extends EventSignal<ItemHoldTickEvent> {}

export class ItemEvents {
  private constructor() {}

  /**
   * This event fires when an entity holds an item.
   */
  static readonly hold = new ItemHoldEventSignal();

  /**
   * This event fires when an entity stops holding an item.
   */
  static readonly releaseHold = new ItemReleaseHoldEventSignal();

  /**
   * This event fires every tick the entity is holding an item.
   */
  static readonly holdTick = new ItemHoldTickEventSignal();
}

function setup() {}

setup();
