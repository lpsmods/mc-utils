import {
  Block,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  EquipmentSlot,
  GameMode,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent } from "./base";
import { clampNumber, Vector3Utils } from "@minecraft/math";
import { RandomUtils } from "../random";
import { ItemUtils } from "../item/utils";
import { BlockUtils } from "../block/utils";
import { CropComponent, CropOptions } from "./crop";
import { SaplingComponent, SaplingOptions } from "./sapling";
import { AddonUtils } from "../addon";
import { array, create, defaulted, number, object, string, Struct } from "superstruct";

export interface FertilizableOptions {
  growth_state?: keyof BlockStateSuperset;
  max_stage?: number;
  items: string[];
}

export class FertilizableComponent extends BlockBaseComponent {
  static readonly componentId = AddonUtils.makeId("fertilizable");
  struct: Struct<any, any> = object({
    growth_state: string(),
    max_stage: defaulted(number(), 7),
    items: defaulted(array(string()), ["bone_meal"]),
  });

  /**
   * Vanilla fertilizable block behavior.
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  getMaxStage(block: Block, options: FertilizableOptions): number {
    const com = block.getComponent(CropComponent.componentId) ?? block.getComponent(SaplingComponent.componentId);
    if (!com) return options.max_stage ?? 7;
    return (com.customComponentParameters.params as CropOptions | SaplingOptions).max_stage ?? 7;
  }

  getGrowthState(block: Block, options: FertilizableOptions): keyof BlockStateSuperset {
    const com = block.getComponent(CropComponent.componentId) ?? block.getComponent(SaplingComponent.componentId);
    if (!com) return options.growth_state ?? ("mcutils:growth" as keyof BlockStateSuperset);
    return (
      (com.customComponentParameters.params as CropOptions | SaplingOptions).growth_state ??
      ("mcutils:growth" as keyof BlockStateSuperset)
    );
  }

  fertilize(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): boolean {
    const options = create(args.params, this.struct) as FertilizableOptions;
    if (!event.player) return false;
    if (!this.isFertilizable(event, options)) return false;
    if (!this.canGrow(event, options)) return false;

    // TODO: Check if multi-block.
    var pos = Vector3Utils.add(event.block.location, {
      x: 0.5,
      y: 0.5,
      z: 0.5,
    });
    event.dimension.spawnParticle("minecraft:crop_growth_emitter", pos);
    event.dimension.playSound("item.bone_meal.use", pos);

    this.grow(event, args);
    if (event.player.getGameMode() === GameMode.Survival) {
      ItemUtils.decrementStack(event.player, EquipmentSlot.Mainhand);
    }
    return true;
  }

  isFertilizable(event: BlockComponentPlayerInteractEvent, options: FertilizableOptions): boolean {
    if (!event.player) return false;
    const equ = event.player.getComponent("equippable");
    if (!equ) return false;
    const mainhand = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!mainhand || !ItemUtils.matchAny(mainhand, options.items)) return false;
    return true;
  }

  // TODO: Check light level
  canGrow(event: BlockComponentPlayerInteractEvent, options: FertilizableOptions): boolean {
    const growthName = this.getGrowthState(event.block, options);
    const growthState = event.block.permutation.getState(growthName) as number;
    return growthState <= this.getMaxStage(event.block, options);
  }

  getGrowthAmount(event: BlockComponentPlayerInteractEvent): number {
    return RandomUtils.int(2, 5);
  }

  grow(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FertilizableOptions;
    const growthName = this.getGrowthState(event.block, options);
    const maxStage = this.getMaxStage(event.block, options);
    if (event.player) {
      if (event.player.getGameMode() === GameMode.Creative) {
        BlockUtils.setState(event.block, growthName, maxStage);
        this.update(event.block, args);
        return;
      }
    }
    const growthState = event.block.permutation.getState(growthName) as number;
    const i = growthState + this.getGrowthAmount(event);
    BlockUtils.setState(event.block, growthName, clampNumber(i, 0, maxStage));
    this.update(event.block, args);
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): boolean {
    return this.fertilize(event, args);
  }
}
