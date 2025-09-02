import {
  BlockPermutation,
  Dimension,
  LocationInUnloadedChunkError,
  system,
} from "@minecraft/server";
import { Ticking } from "./ticking";
import { Vector3Utils } from "@minecraft/math";
import { Shape } from "./shape";

export abstract class Drawer extends Ticking {
  dimension: Dimension;
  tickInterval?: number;
  removeWhenEmpty: boolean;
  private shapes: Shape[] = [];

  /**
   * Create a new drawer context.
   * @param {number} tickInterval
   * @param {Dimension} dimension
   * @param {boolean} removeWhenEmpty Removes this drawer when it has no shapes to draw.
   */
  constructor(
    dimension: Dimension,
    tickInterval?: number,
    removeWhenEmpty: boolean = true,
  ) {
    super();
    this.removeWhenEmpty = removeWhenEmpty;
    this.tickInterval = tickInterval;
    this.dimension = dimension;
  }

  /**
   * Adds a new shape to the world.
   * @param {Shape} shape
   */
  addShape(shape: Shape): void {
    shape.drawer = this;
    this.shapes.push(shape);
  }

  add = this.addShape;

  /**
   * Removes all shapes from the world.
   */
  removeAll(): void {
    this.shapes = [];
  }

  /**
   * Removes an instance of a shape from the world.
   * @param {Shape} shape
   */
  removeShape(shape: Shape): void {
    const index = this.shapes.indexOf(shape);
    this.shapes.splice(index, 1);
  }

  tick() {
    if (this.removeWhenEmpty && this.shapes.length === 0) {
      this.remove();
    }

    for (const shape of this.shapes) {
      if (!shape) continue;
      if (shape.hasDuration && system.currentTick % 20 === 0) {
        if (shape.timeLeft > 0) {
          shape.timeLeft--;
        } else {
          shape.remove();
        }
      }
      if (this.tickInterval && system.currentTick % this.tickInterval === 0)
        continue;
      if (shape.onTick) shape.onTick(shape);
      this.drawShape(shape);
    }
  }

  abstract drawShape(shape: Shape): void;
}

export class BlockDrawer extends Drawer {
  drawShape(shape: Shape): void {
    var palette = shape.material ?? "white_wool";
    for (const pos of shape.getPoints()) {
      try {
        palette instanceof BlockPermutation
          ? this.dimension.setBlockPermutation(pos, palette)
          : this.dimension.setBlockType(pos, palette);
      } catch (err) {}
    }
  }
}

export class ParticleDrawer extends Drawer {
  drawShape(shape: Shape): void {
    var palette = shape.material ?? "minecraft:endrod";
    for (let pos of shape.getPoints()) {
      try {
        pos = Vector3Utils.add(pos, { x: 0.5, y: 0, z: 0.5 });
        if (palette instanceof BlockPermutation) palette = "minecraft:endrod";
        this.dimension.spawnParticle(palette, pos);
      } catch (err) {}
    }
  }
}

export class EntityDrawer extends Drawer {
  drawShape(shape: Shape): void {
    var palette = shape.material ?? "minecraft:creeper";
    for (const pos of shape.getPoints()) {
      try {
        if (palette instanceof BlockPermutation) palette = "minecraft:creeper";
        this.dimension.spawnEntity(palette, pos);
      } catch (err) {
        if (err instanceof LocationInUnloadedChunkError) return;
        throw err;
      }
    }
  }
}
