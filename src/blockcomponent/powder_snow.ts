import {
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  Entity,
  EquipmentSlot,
} from "@minecraft/server";
import { BlockBaseComponent, NearbyEntityBlockEvent } from "./base";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { AddonUtils } from "../utils/addon";
import { create, defaulted, object, optional, string, Struct } from "superstruct";
import { EntityEnterBlockEvent, EntityInBlockTickEvent, EntityLeaveBlockEvent } from "../event";

export interface PowderSnowOptions {
  solid_state: keyof BlockStateSuperset;
  fog_identifier?: string;
}

export class PowderSnowComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("powder_snow");
  struct: Struct<any, any> = object({
    solid_state: defaulted(string(), "mcutils:solid"),
    fog_identifier: optional(string()),
  });

  /**
   * Vanilla powder snow block behavior.
   */
  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    this.baseTick(event, args);
  }

  onEnter(event: EntityEnterBlockEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as PowderSnowOptions;
    if (event.sameType) return;
    if (!options.fog_identifier) return;
    event.entity.runCommand(`fog @s push ${options.fog_identifier} ${event.block.typeId}`);
  }

  onLeave(event: EntityLeaveBlockEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as PowderSnowOptions;
    if (event.sameType) return;
    if (!options.fog_identifier) return;
    event.entity.runCommand(`fog @s remove ${event.block.typeId}`);
    event.entity.removeEffect("slowness");
    event.entity.removeEffect("slow_falling");
  }

  // Simulate viscosity
  inBlockTick(event: EntityInBlockTickEvent, args: CustomComponentParameters): void {
    event.entity.addEffect("slowness", 1220, {
      amplifier: 3,
      showParticles: false,
    });
    event.entity.addEffect("slow_falling", 1220, {
      amplifier: 1,
      showParticles: false,
    });
  }

  hasLeatherBoots(entity: Entity): boolean {
    const equ = entity.getComponent("equippable");
    if (!equ) return false;
    const feet = equ.getEquipment(EquipmentSlot.Feet);
    if (!feet) return false;
    return feet.matches("leather_boots");
  }

  // TODO: Check if entity is standing on this block.
  onNearbyEntityTick(event: NearbyEntityBlockEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as PowderSnowOptions;
    const solid = event.block.permutation.getState(options.solid_state);
    let boots = this.hasLeatherBoots(event.entity);
    if (!solid && boots) {
      BlockUtils.setState(event.block, options.solid_state, true);
      return;
    }
    if (solid && !boots) {
      BlockUtils.setState(event.block, options.solid_state, false);
    }
  }
}
