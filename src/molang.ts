import {
  Block,
  Dimension,
  Entity,
  EquipmentSlot,
  GameMode,
  ItemStack,
  Player,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { Molang } from "molang";
import { deepMerge } from "./utils";

export interface MolangEnvironment {
  query?: Record<string, unknown>;
  variable?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export abstract class MolangUtils {
  /**
   * Executes molang synchronously using the context of the broader block.
   * @param {Block} block
   * @param {string} expression
   * @returns {unknown}
   */
  static block(block: Block, expression: string, env: MolangEnvironment = {}): unknown {
    const dim = block.dimension;
    let defaultEnv = {
      query: {
        cardinal_facing: "down",
        cardinal_facing_2d: "north",
        cardinal_player_facing: "down",
        block_state(stateName: string): unknown {
          return block.permutation.getState(stateName as keyof BlockStateSuperset);
        },
        has_block_state(stateName: string): boolean {
          return block.permutation.getState(stateName as keyof BlockStateSuperset) !== undefined;
        },
        all_tags(...tags: string[]): boolean {
          return tags.every((tag) => block.hasTag(tag));
        },
        any_tag(...tags: string[]): boolean {
          return tags.some((tag) => block.hasTag(tag));
        },
        block_has_all_tags(x: number, y: number, z: number, ...tags: string[]): boolean {
          const blk = dim.getBlock({ x, y, z });
          if (!blk) return false;
          return tags.every((tag) => blk.hasTag(tag));
        },
        block_has_any_tag(x: number, y: number, z: number, ...tags: string[]): boolean {
          const blk = dim.getBlock({ x, y, z });
          if (!blk) return false;
          return tags.some((tag) => blk.hasTag(tag));
        },
        block_neighbor_has_all_tags(x: number, y: number, z: number, ...tags: string[]): boolean {
          const blk = block.offset({ x, y, z });
          if (!blk) return false;
          return tags.every((tag) => block.hasTag(tag));
        },
        block_neighbor_has_any_tag(x: number, y: number, z: number, ...tags: string[]): boolean {
          const blk = block.offset({ x, y, z });
          if (!blk) return false;
          return tags.some((tag) => block.hasTag(tag));
        },
      },
      variable: {},
      context: {},
    };
    defaultEnv = deepMerge(defaultEnv, env);
    MolangUtils.commonEnv(defaultEnv, dim);
    const molang = new Molang(defaultEnv, { useCache: true });
    return molang.execute(expression);
  }

  /**
   * Executes molang synchronously using the context of the broader item.
   * @param {ItemStack} itemStack
   * @param {string} expression
   * @returns {unknown}
   */
  static item(itemStack: ItemStack, expression: string, env: MolangEnvironment = {}): unknown {
    let defaultEnv = {
      query: {
        max_durability: 0,
        remaining_durability: 0,
        is_cooldown_category(name: string): boolean {
          const cooldown = itemStack.getComponent("cooldown");
          if (!cooldown) return false;
          return cooldown.cooldownCategory === name;
        },
        all_tags(...tags: string[]): boolean {
          return tags.every((tag) => itemStack.hasTag(tag));
        },
        any_tag(...tags: string[]): boolean {
          return tags.some((tag) => itemStack.hasTag(tag));
        },
      },
      variable: {},
      context: {},
    };

    const durability = itemStack.getComponent("durability");
    if (durability) {
      defaultEnv.query.max_durability = durability.maxDurability;
      defaultEnv.query.remaining_durability = durability.maxDurability - durability.damage;
    }

    defaultEnv = deepMerge(defaultEnv, env);
    MolangUtils.commonEnv(defaultEnv);
    const molang = new Molang(defaultEnv, { useCache: true });
    return molang.execute(expression);
  }

  /**
   * Executes molang synchronously using the context of the broader entity.
   * @param {Entity} entity
   * @param {string} expression
   * @returns {unknown}
   */
  static entity(entity: Entity, expression: string, env: MolangEnvironment = {}): unknown {
    const dim = entity.dimension;
    let defaultEnv = {
      query: {
        target_x_rotation: entity.getRotation().x,
        target_y_rotation: entity.getRotation().y,
        is_on_ground: entity.isOnGround,
        is_sleeping: entity.isSleeping,
        is_in_water: entity.isInWater,
        is_sneaking: entity.isSneaking,
        is_sprinting: entity.isSprinting,
        is_swimming: entity.isSwimming,

        mark_variant: 0,
        variant: 0,
        skin_id: 0,
        max_health: 0,
        model_scale: 1.0,

        main_hand_item_max_duration: 0,
        has_collision: false,
        ground_speed: 0,
        has_head_gear: false,
        has_owner: false,
        has_player_rider: false,
        has_rider: false,
        heath: 0,
        is_baby: false,
        is_charged: false,
        is_chested: false,
        is_fire_immune: false,
        is_ignited: false,
        is_illager_captain: false,
        is_leashed: false,
        is_onfire: false,
        is_saddled: false,
        is_shaking: false,
        is_sheared: false,
        is_stackable: false,
        is_stunned: false,
        is_tamed: false,
        on_fire_time: 0,
        scoreboard(objectiveName: string): number {
          return world.scoreboard.getObjective(objectiveName)?.getScore(entity) ?? 0;
        },
        equipped_item_all_tags(slotName: string, ...tags: string[]): boolean {
          const equ = entity.getComponent("equippable");
          const stack = equ?.getEquipment(slotName as EquipmentSlot);
          if (!stack) return false;
          return tags.every((tag) => stack.hasTag(tag));
        },
        equipped_item_any_tag(slotName: string, ...tags: string[]): boolean {
          const equ = entity.getComponent("equippable");
          const stack = equ?.getEquipment(slotName as EquipmentSlot);
          if (!stack) return false;
          return tags.some((tag) => stack.hasTag(tag));
        },
        graphics_mode_is_any(...modes: string[]): boolean {
          return false;
        },
        has_any_family(...families: string[]): boolean {
          return families.some((fam) => entity.matches({ families: [fam] }));
        },
        has_property(property: string): boolean {
          return entity.getProperty(property) !== undefined;
        },
        property(property: string): string | number | boolean | undefined {
          return entity.getProperty(property);
        },
        is_item_equipped(slot: number | string, name: string): boolean {
          if (slot === "main_hand") slot = 0;
          if (slot === "off_hand") slot = 1;
          const equ = entity.getComponent("equippable");
          if (!equ) return false;
          switch (slot) {
            case 0:
              return equ.getEquipment(EquipmentSlot.Mainhand)?.matches(name) ?? false;
            case 1:
              return equ.getEquipment(EquipmentSlot.Offhand)?.matches(name) ?? false;
          }
          return false;
        },
        is_name_any(...names: string[]): boolean {
          return names.some((name) => entity.typeId === name);
        },
        is_owner_identifier_any(...identifiers: string[]): boolean {
          const projectile = entity.getComponent("projectile");
          const tameable = entity.getComponent("tameable");

          return identifiers.some((id) => {
            if (projectile) {
              return projectile.owner?.matches({ type: id }) ?? false;
            }
            if (tameable) {
              return tameable.tamedToPlayer?.matches({ type: id }) ?? false;
            }
            return false;
          });
        },
        position(axis?: number): number | Vector3 {
          const pos = entity.location;
          switch (axis) {
            case 0:
              return pos.x;
            case 1:
              return pos.y;
            case 2:
              return pos.z;
          }
          return pos;
        },
      },
      variable: {
        is_holding_left: false,
        is_holding_right: false,
        is_holding_spyglass: false,
        is_sneaking: entity.isSneaking,
        player_x_rotation: 0,
        player_y_rotation: 0,
      },
      context: {},
    };

    const equ = entity.getComponent("equippable");
    if (equ) {
      const right = equ.getEquipment(EquipmentSlot.Mainhand);
      defaultEnv.variable.is_holding_right = right !== undefined;
      if (right) {
        const durability = right.getComponent("durability");
        defaultEnv.query.main_hand_item_max_duration = durability?.maxDurability ?? 0;
        if (right.matches("spyglass")) {
          defaultEnv.variable.is_holding_spyglass = true;
        }
      }

      const left = equ.getEquipment(EquipmentSlot.Offhand);
      defaultEnv.variable.is_holding_left = left !== undefined;
      if (left) {
        if (left.matches("spyglass")) {
          defaultEnv.variable.is_holding_spyglass = true;
        }
      }
      const head = equ.getEquipment(EquipmentSlot.Head);
      defaultEnv.query.has_head_gear = head !== undefined;
    }

    const projectile = entity.getComponent("projectile");
    if (projectile) {
      defaultEnv.query.has_owner = projectile.owner !== undefined;
    }

    const tameable = entity.getComponent("tameable");
    if (tameable) {
      defaultEnv.query.has_owner = tameable.tamedToPlayer !== undefined;
    }

    const rideable = entity.getComponent("rideable");
    if (rideable) {
      defaultEnv.query.has_rider = rideable.getRiders().length !== 0;
      defaultEnv.query.has_player_rider = rideable.getRiders().some((entity) => entity instanceof Player);
    }

    const mov = entity.getComponent("movement");
    if (mov) {
      defaultEnv.query.ground_speed = mov.currentValue;
    }

    const health = entity.getComponent("health");
    if (health) {
      defaultEnv.query.heath = health.currentValue;
      defaultEnv.query.max_health = health.effectiveMax;
    }

    const leashable = entity.getComponent("leashable");
    if (leashable) {
      defaultEnv.query.is_leashed = leashable.isLeashed;
    }

    const onfire = entity.getComponent("onfire");
    if (onfire) {
      defaultEnv.query.is_onfire = onfire.onFireTicksRemaining > 0;
      defaultEnv.query.on_fire_time = onfire.onFireTicksRemaining;
    }

    defaultEnv.query.mark_variant = entity.getComponent("mark_variant")?.value ?? 0;
    defaultEnv.query.variant = entity.getComponent("variant")?.value ?? 0;
    defaultEnv.query.skin_id = entity.getComponent("skin_id")?.value ?? 0;
    defaultEnv.query.model_scale = entity.getComponent("scale")?.value ?? 0;

    defaultEnv.query.is_baby = entity.getComponent("is_baby") !== undefined;
    defaultEnv.query.is_charged = entity.getComponent("is_charged") !== undefined;
    defaultEnv.query.is_chested = entity.getComponent("is_chested") !== undefined;
    defaultEnv.query.is_ignited = entity.getComponent("is_ignited") !== undefined;
    defaultEnv.query.is_illager_captain = entity.getComponent("is_illager_captain") !== undefined;
    defaultEnv.query.is_fire_immune = entity.getComponent("fire_immune") !== undefined;
    defaultEnv.query.is_saddled = entity.getComponent("is_saddled") !== undefined;
    defaultEnv.query.is_shaking = entity.getComponent("is_shaking") !== undefined;
    defaultEnv.query.is_sheared = entity.getComponent("is_sheared") !== undefined;
    defaultEnv.query.is_stackable = entity.getComponent("is_stackable") !== undefined;
    defaultEnv.query.is_stunned = entity.getComponent("is_stunned") !== undefined;
    defaultEnv.query.is_tamed = entity.getComponent("is_tamed") !== undefined;

    if (entity instanceof Player) MolangUtils.player(defaultEnv, entity);

    defaultEnv = deepMerge(defaultEnv, env);
    MolangUtils.commonEnv(defaultEnv, dim);
    const molang = new Molang(defaultEnv, { useCache: true });
    return molang.execute(expression);
  }

  private static player(env: MolangEnvironment, player: Player): void {
    if (!env.query) env.query = {};
    if (!env.variable) env.variable = {};
    env.query.is_spectator = player.getGameMode() === GameMode.Spectator;
    env.query.is_jumping = player.isJumping;
    env.query.is_emoting = player.isEmoting;
    env.variable.player_x_rotation = player.getRotation().x;
    env.variable.player_y_rotation = player.getRotation().y;
    env.query.client_max_render_distance = player.clientSystemInfo.maxRenderDistance;
    env.query.client_memory_tier = player.clientSystemInfo.memoryTier.toString();
    env.query.player_level = player.level;
    env.query.graphics_mode_is_any = (...modes: string[]): boolean => {
      return modes.some((mode) => mode === player.graphicsMode);
    };
    env.query.is_selected_item = (item: string): boolean => {
      const equ = player.getComponent("equippable");
      if (!equ) return false;
      return equ.getEquipment(EquipmentSlot.Mainhand)?.matches(item) ?? false;
    };
  }

  private static commonEnv(env: MolangEnvironment, dim?: Dimension): void {
    if (!env.query) env.query = {};
    env.query.day = world.getDay();
    env.query.time_of_day = ((((world.getTimeOfDay() * 0.25) / 2400) % 1) + 1) % 1;
    if (!dim) return;
    env.query.heightmap = (x: number, z: number) => {
      const blk = dim.getTopmostBlock({ x, z });
      return blk?.y ?? 0;
    };
    env.query.log = (msg: string) => {
      console.info(msg);
    };
    env.query.moon_brightness = 0;
    env.query.moon_phase = world.getMoonPhase();
    env.query.server_memory_tier = system.serverSystemInfo.memoryTier;
    env.query.time_stamp = new Date().getTime();
  }
}
