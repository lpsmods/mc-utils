import {
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  EquipmentSlot,
  GameMode,
  ItemStack,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent } from "./BlockBase";
import { Vector3Utils } from "@minecraft/math";
import { MathUtils } from "../MathUtils";
import { RandomUtils } from "../RandomUtils";
import { ItemUtils } from "../item/ItemUtils";
import { BlockUtils } from "../block/BlockUtils";

export interface FertilizableOptions {
  growth_state: keyof BlockStateSuperset;
  max_stage: number;
  items?: string[];
}

export class FertilizableComponent extends BlockBaseComponent {
  static typeId = "mcutils:fertilizable";

  /**
   * Vanilla fertilizable block behavior.
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  matchItem(itemStack: ItemStack | undefined, options: FertilizableOptions): boolean {
    if (!itemStack) return false;
    for (const item of options.items ?? ["bone_meal"]) {
      if (itemStack.matches(item)) return true;
    }
    return false;
  }

  onFertilize(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): boolean {
    const options = args.params as FertilizableOptions;
    if (!event.player) return false;
    if (!this.isFertilizable(event, options)) return false;
    if (!this.canGrow(event, options)) return false;

    // TODO: Check if tall block.
    var pos = Vector3Utils.add(event.block.location, { x: 0.5, y: 0.5, z: 0.5 });
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
    if (!this.matchItem(mainhand, options)) return false;
    return true;
  }

  canGrow(event: BlockComponentPlayerInteractEvent, options: FertilizableOptions): boolean {
    const growthState = event.block.permutation.getState(options.growth_state) as number;
    return growthState <= options.max_stage;
  }

  getGrowthAmount(event: BlockComponentPlayerInteractEvent): number {
    return RandomUtils.int(2, 5);
  }

  grow(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = args.params as FertilizableOptions;
    if (event.player) {
      if (event.player.getGameMode() === GameMode.Creative) {
        BlockUtils.setState(event.block, options.growth_state, options.max_stage);
        this.update(event.block, args);
        return;
      }
    }
    const growthState = event.block.permutation.getState(options.growth_state) as number;
    const i = growthState + this.getGrowthAmount(event);
    BlockUtils.setState(event.block, options.growth_state, MathUtils.clamp(i, 0, options.max_stage));
    this.update(event.block, args);
  }

  // EVENTS

  onPlayerInteract(
    event: BlockComponentPlayerInteractEvent,
    args: CustomComponentParameters
  ): boolean {
    return this.onFertilize(event, args);
  }
}
