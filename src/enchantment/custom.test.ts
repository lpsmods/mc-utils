import { ItemUseAfterEvent, Player } from "@minecraft/server";
import {
  CustomEnchantment,
  customEnchantmentRegistry,
  ItemCustomDisenchantEvent,
  ItemCustomEnchantEvent,
} from "./custom";

class ExampleEnchantment extends CustomEnchantment {
  static readonly enchantmentId = "mcutils:example";

  constructor() {
    super();
    this.onEnchant = this.onEnchant.bind(this);
    this.onDisenchant = this.onDisenchant.bind(this);
    this.onUse = this.onUse.bind(this);
  }

  getDisplayName(): string {
    return "Example";
  }

  onEnchant(event: ItemCustomEnchantEvent): void {
    console.log("ENCHANT example enchant");
  }

  onDisenchant(event: ItemCustomDisenchantEvent): void {
    console.log("DISENCHANT example enchant");
  }

  onUse(event: ItemUseAfterEvent): void {
    if (!(event.source instanceof Player)) return;
    event.source.sendMessage("USE example enchant");
  }
}

export default () => {
  customEnchantmentRegistry.register(ExampleEnchantment.enchantmentId, new ExampleEnchantment());
};
