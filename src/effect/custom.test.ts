import { Player } from "@minecraft/server";
import {
  CustomEffect,
  CustomEffectEndEvent,
  customEffectRegistry,
  CustomEffectStartEvent,
  CustomEffectTickEvent,
} from "./custom";

class ExampleEffect extends CustomEffect {
  static readonly effectId = "mcutils:example";

  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
    this.onStart = this.onStart.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  onTick(event: CustomEffectTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    event.entity.onScreenDisplay.setActionBar("TICK example effect");
  }

  onStart(event: CustomEffectStartEvent): void {
    if (!(event.entity instanceof Player)) return;
    event.entity.sendMessage("START example effect");
  }

  onEnd(event: CustomEffectEndEvent): void {
    if (!(event.entity instanceof Player)) return;
    event.entity.sendMessage("END example effect");
  }
}

export default () => {
  customEffectRegistry.register(ExampleEffect.effectId, new ExampleEffect());
};
