import {
  BlockComponentTickEvent,
  CustomComponentParameters,
  Entity,
  EquipmentSlot,
} from "@minecraft/server";
import {
  BlockBaseComponent,
  EnterBlockEvent,
  LeaveBlockEvent,
  NearbyEntityBlockEvent,
} from "./base";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { InBlockTickEvent } from "../event/block";
import { AddonUtils } from "../addon";

export interface PowderSnowOptions {
  solid_state: keyof BlockStateSuperset;
  fog_identifier?: string;
}

export class PowderSnowComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("powder_snow");

  constructor() {
    super();
    this.onTick = this.onTick.bind(this);
  }

  onTick(
    event: BlockComponentTickEvent,
    args: CustomComponentParameters,
  ): void {
    this.baseTick(event, args);
  }

  onEnter(event: EnterBlockEvent, args: CustomComponentParameters): void {
    const options = args.params as PowderSnowOptions;
    if (event.sameBlockType) return;
    if (!options.fog_identifier) return;
    event.entity.runCommand(
      `fog @s push ${options.fog_identifier} ${event.block.typeId}`,
    );
  }

  onLeave(event: LeaveBlockEvent, args: CustomComponentParameters): void {
    const options = args.params as PowderSnowOptions;
    if (event.sameBlockType) return;
    if (!options.fog_identifier) return;
    event.entity.runCommand(`fog @s remove ${event.block.typeId}`);
    event.entity.removeEffect("slowness");
    event.entity.removeEffect("slow_falling");
  }

  // Simulate viscosity
  inBlockTick(event: InBlockTickEvent, args: CustomComponentParameters): void {
    event.source.addEffect("slowness", 1220, {
      amplifier: 3,
      showParticles: false,
    });
    event.source.addEffect("slow_falling", 1220, {
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
  onNearbyEntityTick(
    event: NearbyEntityBlockEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as PowderSnowOptions;
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
