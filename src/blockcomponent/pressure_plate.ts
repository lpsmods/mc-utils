import {
  Block,
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  Entity,
  EntityFilter,
  EntityQueryOptions,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { deepCopy } from "../utils";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, number, object, string, Struct } from "superstruct";
import { entityFilter } from "../validation";
import { BlockBaseComponent } from "./base";

export interface PressurePlateOptions {
  filter: EntityFilter;
  powered_state: keyof BlockStateSuperset;
  delay?: number;
  click_on_sound_event?: string;
  click_off_sound_event?: string;
}

// TODO: Extend BlockBase and use onEnter and onLeave instead.
export class PressurePlateComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("pressure_plate");
  struct: Struct<any, any> = object({
    filter: defaulted(entityFilter, { type: "player" }),
    powered_state: defaulted(string(), "mcutils:powered"),
    delay: defaulted(number(), 20),
    click_on_sound_event: defaulted(string(), "click_on.stone_pressure_plate"),
    click_off_sound_event: defaulted(string(), "click_off.stone_pressure_plate"),
  });

  /**
   * Vanilla pressure plate block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  getSound(powered: boolean, options: PressurePlateOptions): string {
    if (powered) {
      return options.click_on_sound_event ?? "click_on.stone_pressure_plate";
    }
    return options.click_off_sound_event ?? "click_off.stone_pressure_plate";
  }

  getEntities(block: Block, options: PressurePlateOptions): Entity[] {
    const filter = deepCopy(options.filter) as EntityQueryOptions;
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
  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as PressurePlateOptions;
    // Check if anything is on the pressure plate.
    //
    const delay = (event.block.getDynamicProperty("mcutils:delay") as number) ?? 0;
    const powered = event.block.permutation.getState(options.powered_state) as boolean;
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
