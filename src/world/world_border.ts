import {
  Dimension,
  Vector2,
  Vector3,
  Player,
  world,
  PlayerBreakBlockBeforeEvent,
  PlayerPlaceBlockAfterEvent,
} from "@minecraft/server";
import { Ticking } from "../ticking.js";
import { VECTOR2_ZERO, Vector3Utils } from "@minecraft/math";
import { MathUtils } from "../utils/math.js";

export interface WorldBorderOptions {
  canBreakBlocks?: boolean;
  canPlaceBlocks?: boolean;
}

export class WorldBorder extends Ticking {
  center: Vector2;
  width: number;
  depth: number;
  dimension: Dimension;
  options: WorldBorderOptions;

  constructor(center?: Vector2, width?: number, depth?: number, options?: WorldBorderOptions, dimension?: Dimension) {
    super();
    this.center = center ?? VECTOR2_ZERO;
    this.width = width ?? 29999984;
    this.depth = depth ?? 29999984;
    this.dimension = dimension ?? world.getDimension("overworld");
    this.options = options ?? {};
    this.#init();
  }

  #init() {
    world.beforeEvents.playerBreakBlock.subscribe(this.#playerBreakBlock.bind(this));
    world.afterEvents.playerPlaceBlock.subscribe(this.#playerPlaceBlock.bind(this));
  }

  #playerBreakBlock(event: PlayerBreakBlockBeforeEvent): void {
    if (this.options.canBreakBlocks == undefined || this.options.canBreakBlocks) return;
    if (this.inInBorder(event.block.location, event.dimension)) return;
    event.cancel = true;
  }

  #playerPlaceBlock(event: PlayerPlaceBlockAfterEvent): void {
    if (this.options.canPlaceBlocks == undefined || this.options.canPlaceBlocks) return;
    if (this.inInBorder(event.block.location, event.dimension)) return;
    event.block.setType("air");
  }

  inInBorder(origin: Vector3, dimension?: Dimension): boolean {
    const heightRange = dimension?.heightRange ?? world.getDimension("overworld").heightRange;
    const x = this.width - this.center.x;
    const z = this.depth - this.center.y;
    const from = { x: x, y: heightRange.max, z: z };
    const to = { x: -x, y: heightRange.min, z: -z };
    return MathUtils.isInRect(Vector3Utils.floor(origin), Vector3Utils.floor(from), Vector3Utils.floor(to));
  }

  tick(): void {
    for (const player of world.getAllPlayers()) {
      if (!this.inInBorder(player.location, player.dimension)) {
        this.onOutside(player);
      }
    }
  }

  onOutside(player: Player): void {}
}
