import {
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandRegistry,
  CustomCommandResult,
  Entity,
  EquipmentSlot,
  system,
} from "@minecraft/server";
import { customEnchantmentRegistry, CustomEnchantmentUtils } from "../enchantment";

export class CustomEnchantCommand {
  static options: CustomCommand = {
    name: "mcutils:custom-enchant",
    description: "Add a custom enchantment.",
    permissionLevel: 1,
    mandatoryParameters: [
      { type: CustomCommandParamType.EntitySelector, name: "entities" },
      { type: CustomCommandParamType.Enum, name: "mcutils:custom_enchantment" },
    ],
    optionalParameters: [{ type: CustomCommandParamType.Integer, name: "level" }],
  };

  private static executeMob(entity: Entity, enchantmentType: string, level?: number): void {
    const equ = entity.getComponent("equippable");
    if (!equ) return;
    let itemStack = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!itemStack) return;
    CustomEnchantmentUtils.add(itemStack, enchantmentType, level);
    equ.setEquipment(EquipmentSlot.Mainhand, itemStack);
  }

  static execute(
    ctx: CustomCommandOrigin,
    entities: Entity[],
    enchantmentType: string,
    level?: number,
  ): CustomCommandResult | undefined {
    try {
      system.run(() => {
        entities.forEach((entity) => {
          this.executeMob(entity, enchantmentType, level);
        });
      });
      return { status: entities.length };
    } catch (err) {
      return { status: 0, message: "§c" + err };
    }
  }

  static register(registry: CustomCommandRegistry): void {
    registry.registerEnum("mcutils:custom_enchantment", [...customEnchantmentRegistry.keys()]);
    registry.registerCommand(this.options, this.execute.bind(this));
  }
}
