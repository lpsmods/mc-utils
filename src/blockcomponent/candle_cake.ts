import {
  BlockComponentPlayerInteractEvent,
  BlockPermutation,
  Block,
  EquipmentSlot,
  ItemStack,
  CustomComponentParameters,
  BlockComponentTickEvent,
  system,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { CANDLES, COLORS } from "../constants";
import { TextUtils } from "../text";
import { ItemUtils } from "../item/utils";
import { BlockBaseComponent } from "./base";
import { Vector3Utils } from "@minecraft/math";
import { Identifier } from "../identifier";
import { AddonUtils } from "../addon";
import { create, defaulted, object, optional, string, Struct } from "superstruct";
import { isBlock, isItem, vec3 } from "../validation";

// TODO: Use block permutation for "BLOCK" instead of slice_state
// Check players hunger.
export interface CandleCakeOptions {
  candle: string;
  lit_state: keyof BlockStateSuperset;
  slice_state: keyof BlockStateSuperset;
  block?: string;
  flame_position: number[];
  flame_particle: string;
}

export class CandleCakeComponent extends BlockBaseComponent {
  static readonly componentId = AddonUtils.makeId("candle_cake");
  struct: Struct<any, any> = object({
    candle: isItem,
    lit_state: defaulted(string(), "mcutils:lit"),
    slice_state: defaulted(string(), "mcutils:slices"),
    block: optional(isBlock),
    flame_position: defaulted(vec3, [0, 16, 0]),
    flame_particle: defaulted(string(), "minecraft:candle_flame_particle"),
  });

  /**
   * Vanilla candle cake block behavior.
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  // Remove the "color" parts.
  getCakeBlock(block: Block, options: CandleCakeOptions): string {
    return options.block ?? TextUtils.stripAll(block.typeId, CANDLES, undefined, "_");
  }

  getCandleItem(block: Block, options: CandleCakeOptions): string {
    if (options.candle) return options.candle;
    const id = Identifier.parse(block);
    for (const color of COLORS) {
      let colorCandle = `${color}_candle`;
      let candleColor = `candle_${color}`;
      if (id.path.includes(colorCandle) || id.path.includes(candleColor)) return colorCandle;
    }
    return "candle";
  }

  setLit(event: BlockComponentPlayerInteractEvent, value: boolean = true, options: CandleCakeOptions): void {
    event.block.setPermutation(event.block.permutation.withState(options.lit_state, value));
  }

  eat(event: BlockComponentPlayerInteractEvent, options: CandleCakeOptions): void {
    if (!event.player) return;
    event.player.addEffect("saturation", 100, {
      amplifier: 0,
      showParticles: false,
    });
    event.block.dimension.spawnItem(new ItemStack(options.candle), event.block.center());
    const BLOCK = BlockPermutation.resolve(this.getCakeBlock(event.block, options));
    event.block.setPermutation(BLOCK.withState(options.slice_state, 1));
  }

  hasLight(event: BlockComponentPlayerInteractEvent): boolean {
    if (!event.player) return false;
    const equ = event.player.getComponent("equippable");
    if (!equ) return false;
    const mainhand = equ.getEquipment(EquipmentSlot.Mainhand);
    return ItemUtils.isIgnitable(mainhand);
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): boolean | void {
    const options = create(args.params, this.struct) as CandleCakeOptions;
    const LIT = event.block.permutation.getState(options.lit_state);
    if (this.hasLight(event)) {
      this.setLit(event, true, options);
      return true;
    }
    if (LIT && !this.hasLight(event)) {
      this.setLit(event, false, options);
    } else {
      this.eat(event, options);
    }
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as CandleCakeOptions;
    const lit = event.block.permutation.getState(options.lit_state);
    if (!lit) return;
    if (system.currentTick % 40 === 0) {
      const pos = options.flame_position;
      event.dimension.spawnParticle(
        options.flame_particle,
        Vector3Utils.add(event.block.location, {
          x: 0.5 + pos[0] / 16,
          y: pos[1] / 16,
          z: 0.5 + pos[2] / 16,
        }),
      );
    }
  }
}
