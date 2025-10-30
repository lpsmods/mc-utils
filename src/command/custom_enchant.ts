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
import { CustomCommandUtils } from "./utils";

export class CustomEnchantCommand {
  private static registered: boolean = false;

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

  private static executeMob(ctx: CustomCommandOrigin, entity: Entity, enchantmentType: string, level?: number): void {
    const equ = entity.getComponent("equippable");
    if (!equ) return;
    let itemStack = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!itemStack) return;
    const bl = CustomEnchantmentUtils.add(itemStack, enchantmentType, level);
    if (!bl) {
      CustomCommandUtils.sendError(ctx, "Failed to set enchantment");
      return;
    }
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
          this.executeMob(ctx, entity, enchantmentType, level);
        });
      });
      return { status: entities.length };
    } catch (err) {
      return { status: 0, message: "§c" + err };
    }
  }

  static register(registry: CustomCommandRegistry): void {
    if (this.registered) return;
    registry.registerEnum("mcutils:custom_enchantment", [...customEnchantmentRegistry.keys()]);
    registry.registerCommand(this.options, this.execute.bind(this));
    this.registered = true;
  }
}
