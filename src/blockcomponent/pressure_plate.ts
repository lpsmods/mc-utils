import {
  Block,
  BlockComponentTickEvent,
  CustomComponentParameters,
  Entity,
  EntityQueryOptions,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { deepCopy } from "../utils";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../addon";

export interface PressurePlateOptions {
  filter: EntityQueryOptions;
  powered_state: keyof BlockStateSuperset;
  delay?: number;
  click_on_sound_event?: string;
  click_off_sound_event?: string;
}

// TODO: Extend BlockBase and use onEnter and onLeave instead.
export class PressurePlateComponent {
  static typeId = AddonUtils.makeId("pressure_plate");

  constructor() {
    this.onTick = this.onTick.bind(this);
  }

  getSound(powered: boolean, options: PressurePlateOptions): string {
    if (powered) {
      return options.click_on_sound_event ?? "click_on.stone_pressure_plate";
    }
    return options.click_off_sound_event ?? "click_off.stone_pressure_plate";
  }

  getEntities(block: Block, options: PressurePlateOptions): Entity[] {
    const filter = deepCopy(options.filter);
    filter.maxDistance = 1.5;
    filter.location = block.location;
    // TODO: Use better block pos detection.
    // "specifically, when the entity's collision mask intersects the bottom quarter-block of the pressure plate's space, which may include entities flying close to the ground"
    return block.dimension
      .getEntities(filter)
      .filter(
        (entity) =>
          Math.floor(entity.location.x) == block.location.x &&
          Math.floor(entity.location.y) == block.location.y &&
          Math.floor(entity.location.z) == block.location.z,
      );
  }

  // EVENTS

  // Check for entities
  onTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as PressurePlateOptions;
    // Check if anything is on the pressure plate.
    //
    const delay =
      (event.block.getDynamicProperty("mcutils:delay") as number) ?? 0;
    const powered = event.block.permutation.getState(
      options.powered_state,
    ) as boolean;
    const entities = this.getEntities(event.block, options);
    if (!powered && entities.length > 0) {
      event.block.setDynamicProperty("mcutils:delay", options.delay);
      event.dimension.playSound(this.getSound(true, options), event.block);
      BlockUtils.setState(event.block, options.powered_state, true);
      return;
    }
    // Decrease delay.
    if (powered && entities.length === 0 && delay > 0) {
      let v = delay - 1;
      event.block.setDynamicProperty("mcutils:delay", v);
      if (v == 0) {
        event.dimension.playSound(this.getSound(false, options), event.block);
        BlockUtils.setState(event.block, options.powered_state, false);
      }
    }
  }
}

export class WoodenPressurePlateComponent extends PressurePlateComponent {
  static typeId = AddonUtils.makeId("wooden_pressure_plate");
}

// mobs, players, armor stands
// https://minecraft.wiki/w/Stone_Pressure_Plate
export class StonePressurePlateComponent extends PressurePlateComponent {
  static typeId = AddonUtils.makeId("stone_pressure_plate");
}

// Outputs 1 redstone level per entity.
// https://minecraft.wiki/w/Light_Weighted_Pressure_Plate
export class LightWeightedPressurePlateComponent extends PressurePlateComponent {
  static typeId = AddonUtils.makeId("light_weighted_pressure_plate");
}

// 1 redstone level for every 10 entities starting at 1
// https://minecraft.wiki/w/Heavy_Weighted_Pressure_Plate
export class HeavyWeightedPressurePlateComponent extends PressurePlateComponent {
  static typeId = AddonUtils.makeId("heavy_weighted_pressure_plate");
}
