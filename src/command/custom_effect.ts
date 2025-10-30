import {
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandRegistry,
  CustomCommandResult,
  Entity,
} from "@minecraft/server";
import { customEffectRegistry, CustomEffectUtils } from "../effect";

export class CustomEffectCommand {
  private static registered: boolean = false;

  static options: CustomCommand = {
    name: "mcutils:custom-effect",
    description: "Add or remove custom status effects.",
    permissionLevel: 1,
    mandatoryParameters: [
      { type: CustomCommandParamType.Enum, name: "mcutils:custom_effect_operation" },
      { type: CustomCommandParamType.EntitySelector, name: "entity" },
    ],
    optionalParameters: [
      { type: CustomCommandParamType.Enum, name: "mcutils:custom_effect" },
      { type: CustomCommandParamType.Integer, name: "duration" },
      { type: CustomCommandParamType.Integer, name: "amplifier" },
      { type: CustomCommandParamType.Boolean, name: "showParticles" },
    ],
  };

  private static executeGive(
    entity: Entity,
    effect?: string,
    duration?: number,
    amplifier?: number,
    showParticles?: boolean,
  ) {
    if (!effect) throw new Error(`"effect" is required!`);
    if (!duration) throw new Error(`"duration" is required!`);
    CustomEffectUtils.add(entity, effect, duration, {
      amplifier: amplifier ?? 0,
      showParticles: showParticles ?? false,
    });
  }

  private static executeClear(entity: Entity, effect?: string) {
    if (effect) return CustomEffectUtils.remove(entity, effect);
    CustomEffectUtils.removeAll(entity);
  }

  static execute(
    ctx: CustomCommandOrigin,
    operation: string,
    entities: Entity[],
    effect?: string,
    duration?: number,
    amplifier?: number,
    showParticles?: boolean,
  ): CustomCommandResult | undefined {
    try {
      switch (operation) {
        case "give":
          entities.forEach((entity) => this.executeGive(entity, effect, duration, amplifier, showParticles));
          return { status: entities.length };
        case "clear":
          entities.forEach((entity) => this.executeClear(entity, effect));
          return { status: entities.length };
      }
    } catch (err) {
      return { status: 0, message: "§c" + err };
    }
  }

  static register(registry: CustomCommandRegistry): void {
    if (this.registered) return;
    registry.registerEnum("mcutils:custom_effect_operation", ["clear", "give"]);
    registry.registerEnum("mcutils:custom_effect", [...customEffectRegistry.keys()]);
    registry.registerCommand(this.options, this.execute.bind(this));
    this.registered = true;
  }
}
