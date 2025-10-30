import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  EquipmentSlot,
  system,
  Vector3,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockUtils } from "../block/utils";
import { ItemUtils } from "../item/utils";
import { BlockBaseComponent } from "./base";
import { AddonUtils } from "../utils/addon";
import { array, create, defaulted, number, object, optional, string, Struct } from "superstruct";
import { isItem, vec3 } from "../validation";

export interface CandleOptions {
  candles_state: keyof BlockStateSuperset;
  lit_state: keyof BlockStateSuperset;
  max_candles: number;
  item?: string;
  flame_particle: string;
  flame_positions: string[];
}

export class CandleFlamePosition {
  readonly candles: number;
  readonly location: Vector3;

  constructor(candles: number, location: Vector3) {
    this.candles = candles;
    this.location = location;
  }

  static parse(value: string): CandleFlamePosition {
    const args = value.split(",");
    return new CandleFlamePosition(+args[0], {
      x: +args[1],
      y: +args[2],
      z: +args[3],
    });
  }

  static parseAll(positions: string[]): CandleFlamePosition[] {
    return positions.map((x) => CandleFlamePosition.parse(x));
  }
}

// TODO: Ambient sounds
export class CandleComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("candle");
  struct: Struct<any, any> = object({
    candles_state: defaulted(string(), "mcutils:candles"),
    lit_state: defaulted(string(), "mcutils:lit"),
    max_candles: defaulted(number(), 4),
    item: optional(isItem),
    flame_particle: defaulted(string(), "minecraft:candle_flame_particle"),
    flame_positions: defaulted(array(vec3), [0, 0, 0]),
  });

  /**
   * Vanilla candle block behavior.
   */
  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  getCandleItem(block: Block, options: CandleOptions): string {
    return options.item ?? block.typeId;
  }

  getSound(block: Block): string {
    return "use.candle";
  }

  #defaultFlames(): CandleFlamePosition[] {
    return CandleFlamePosition.parseAll([
      "1,0,8,0",
      "2,2,8,-1",
      "2,-2,7,0",
      "3,1,8,-1",
      "3,-2,7,0",
      "3,0,5,2",
      "4,1,8,-2",
      "4,-2,7,-2",
      "4,2,7,1",
      "4,-1,5,1",
    ]);
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as CandleOptions;
    if (!event.player) return;
    const lit = event.block.permutation.getState(options.lit_state) as boolean;
    const count = event.block.permutation.getState(options.candles_state) as number;
    const equ = event.player.getComponent("equippable");
    if (!equ) return;
    const mainhand = equ.getEquipment(EquipmentSlot.Mainhand);
    if (count < options.max_candles && mainhand && mainhand.matches(this.getCandleItem(event.block, options))) {
      event.dimension.playSound(this.getSound(event.block), event.block.location);
      BlockUtils.incrementState(event.block, options.candles_state);
      ItemUtils.decrementStack(event.player, EquipmentSlot.Mainhand);
      return;
    }

    if (!lit && mainhand && ItemUtils.matches(mainhand, "#ignitable")) {
      BlockUtils.setState(event.block, options.lit_state, true);
      ItemUtils.usedIgnitable(event.player, mainhand, event.block.location);
      return;
    }
    if (lit && !mainhand) {
      event.dimension.playSound("extinguish.candle", event.block.location);
      BlockUtils.setState(event.block, options.lit_state, false);
      return;
    }
  }

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as CandleOptions;
    const lit = event.block.permutation.getState(options.lit_state);
    if (!lit) return;
    const positions = options.flame_positions
      ? CandleFlamePosition.parseAll(options.flame_positions)
      : this.#defaultFlames();
    const candles = event.block.permutation.getState(options.candles_state) as number;
    if (system.currentTick % 40 === 0) {
      for (const pos of positions) {
        if (pos.candles !== candles) continue;
        this.spawnParticle(event.block, options.flame_particle, pos.location);
      }
    }
  }
}
