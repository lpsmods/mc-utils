import { BlockVolume, Direction, Entity, Vector3, world } from "@minecraft/server";
import { Ticking } from "./ticking";
import { MathUtils } from "./math";
import { AreaEnterEvent, AreaEvents, AreaLeaveEvent, AreaTickEvent } from "./event/area";
import { Vector3Utils } from "@minecraft/math";
import { Chunk, ChunkVolume, WorldUtils } from "./world";
import { ChunkUtils } from "./chunk";

// import * as debug from "@minecraft/debug-utilities";

export interface AreaDetectorOptions {
  id?: string;
  dimensionId?: string;
  tickInterval?: number;
}

export abstract class AreaDetector extends Ticking {
  static readonly typeId: string;

  static areas: Map<string, AreaDetector> = new Map<string, AreaDetector>();
  static #lastId: number = 0;
  enabled: boolean = true;
  padding: number = 1;
  readonly areaId: string;
  readonly dimensionId: string;

  constructor(options: AreaDetectorOptions = {}) {
    super(options.tickInterval);
    this.dimensionId = options.dimensionId ?? "overworld";
    this.areaId = options.id ?? `area.${AreaDetector.#lastId++}`;
    AreaDetector.areas.set(this.areaId, this);
  }

  get id(): string {
    return this.areaId;
  }

  enter(entity: Entity): void {
    entity.addTag(this.areaId);
    const event = new AreaEnterEvent(entity, this);
    if (this.onEnter) this.onEnter(event);
    AreaEvents.entityEnter.apply(event);
  }

  leave(entity: Entity): void {
    entity.removeTag(this.areaId);
    const event = new AreaLeaveEvent(entity, this);
    if (this.onLeave) this.onLeave(event);
    AreaEvents.entityLeave.apply(event);
  }

  baseTick(entity: Entity): void {
    const event = new AreaTickEvent(entity, this);
    if (this.onTick) this.onTick(event);
    AreaEvents.entityTick.apply(event);
  }

  /**
   * Whether or not the entity is in the area.
   * @param {Entity} entity
   * @returns {boolean}
   */
  isIn(entity: Entity): boolean {
    return entity.hasTag(this.areaId);
  }

  /**
   * Delete this area.
   */
  remove() {
    super.remove();
    AreaDetector.areas.delete(this.areaId);
  }

  /**
   * Specific conditions for the entity to enter.
   * @param {Entity} entity
   * @returns {Boolean}
   */
  condition(entity: Entity): boolean {
    return true;
  }

  /**
   * Whether or not the area is ticking.
   */
  isLoaded(): boolean {
    const chunks = [];
    const dim = world.getDimension(this.dimensionId);
    for (const pos of this.getChunkVolume().getChunkLocationIterator()) {
      chunks.push(new Chunk(dim, pos));
    }
    return chunks.every((chunk) => chunk.isLoaded());
  }

  getChunkVolume(): ChunkVolume {
    const vol = this.getBlockVolume();
    const from = ChunkUtils.pos(vol.from);
    const to = ChunkUtils.pos(vol.to);
    return new ChunkVolume(from, to);
  }

  // ABSTRACT

  abstract getBlockVolume(): BlockVolume;

  /**
   * Get all entities in this area.
   */
  abstract getEntities(): Entity[];

  /**
   * Debug method to show the area in-game.
   */
  abstract show(): void;

  // EVENTS

  /**
   * Called every tick for entities that are in the area.
   * @param {AreaTickEvent} event
   */
  onTick?(event: AreaTickEvent): void;

  /**
   * Called when the entity enters the area.
   * @param {AreaEnterEvent} event
   */
  onEnter?(event: AreaEnterEvent): void;

  /**
   * Called when the entity leaves the area.
   * @param {AreaLeaveEvent} event
   */
  onLeave?(event: AreaLeaveEvent): void;
}

/**
 * Detects if an entity enters and exits a rectangle area.
 */
export class RectangleAreaDetector extends AreaDetector {
  static readonly typeId = "rectangle";

  /**
   * @param {Vector3} location1 The first location.
   * @param {Vector3} location2 The second location.
   * @param {string} id The unique id for this area.
   */
  "from": Vector3;
  to: Vector3;

  constructor(from: Vector3, to: Vector3, options?: AreaDetectorOptions) {
    super(options);
    const bounds = MathUtils.getBounds(from, to);
    this.from = { x: bounds.minX, y: bounds.minY, z: bounds.minZ };
    this.to = { x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ };
  }

  getBlockVolume(): BlockVolume {
    return new BlockVolume(this.from, this.to);
  }

  tick(): void {
    if (!this.enabled) return;
    for (const entity of this.getEntities()) {
      if (MathUtils.isInRect(entity, this.from, this.to)) {
        if (!this.isIn(entity)) {
          this.enter(entity);
        }
        this.baseTick(entity);
        return;
      }
      if (this.isIn(entity)) {
        this.leave(entity);
      }
    }
  }

  getEntities(): Entity[] {
    const dim = world.getDimension(this.dimensionId);
    const results = [];
    for (const entity of dim.getEntities()) {
      if (!entity) continue;
      if (!this.condition(entity)) continue;
      const { from, to } = MathUtils.expandRegion(this.from, this.to, this.padding);
      if (!MathUtils.isInRect(entity, from, to)) continue;
      results.push(entity);
    }
    return results;
  }

  // Requires debug-utilities
  // show(): void {
  //   // @ts-ignore:
  //   const box = new debug.DebugBox(this.from);
  //   box.bound = MathUtils.getSize(this.from, this.to);
  //   // @ts-ignore:
  //   const padding = new debug.DebugBox(
  //     Vector3Utils.subtract(this.from, { x: this.padding, y: this.padding, z: this.padding }),
  //   );
  //   padding.bound = Vector3Utils.add(box.bound, { x: this.padding * 2, y: this.padding * 2, z: this.padding * 2 });
  //   padding.color = { red: 123, green: 0, blue: 0 };
  //   // @ts-ignore:
  //   debug.debugDrawer.addShape(box);
  //   // @ts-ignore:
  //   debug.debugDrawer.addShape(padding);
  //   system.runTimeout(() => {
  //     box.remove();
  //     padding.remove();
  //   }, 10 * 20);
  // }

  /**
   * Debug method to show the area in-game.
   * @param {string} particle The particle to show.
   */
  show(particle: string = "minecraft:endrod", steps: number = 32): void {
    const dim = world.getDimension(this.dimensionId);
    const bounds = MathUtils.getBounds(this.from, this.to);
    const stepX = (bounds.maxX - bounds.minX) / steps;
    const stepY = (bounds.maxY - bounds.minY) / steps;
    const stepZ = (bounds.maxZ - bounds.minZ) / steps;

    // Wireframe outline: edges only
    // Bottom and top edges (x-z plane)
    for (let x = bounds.minX; x <= bounds.maxX; x += stepX) {
      try {
        dim.spawnParticle(particle, {
          x: x + 0.5,
          y: bounds.minY + 0.5,
          z: bounds.minZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: x + 0.5,
          y: bounds.minY + 0.5,
          z: bounds.maxZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: x + 0.5,
          y: bounds.maxY + 0.5,
          z: bounds.minZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: x + 0.5,
          y: bounds.maxY + 0.5,
          z: bounds.maxZ + 0.5,
        });
      } catch (err) {}
    }

    for (let z = bounds.minZ; z <= bounds.maxZ; z += stepZ) {
      try {
        dim.spawnParticle(particle, {
          x: bounds.minX + 0.5,
          y: bounds.minY + 0.5,
          z: z + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: bounds.maxX + 0.5,
          y: bounds.minY + 0.5,
          z: z + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: bounds.minX + 0.5,
          y: bounds.maxY + 0.5,
          z: z + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: bounds.maxX + 0.5,
          y: bounds.maxY + 0.5,
          z: z + 0.5,
        });
      } catch (err) {}
    }

    // Vertical edges (y-axis)
    for (let y = bounds.minY; y <= bounds.maxY; y += stepY) {
      try {
        dim.spawnParticle(particle, {
          x: bounds.minX + 0.5,
          y: y + 0.5,
          z: bounds.minZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: bounds.minX + 0.5,
          y: y + 0.5,
          z: bounds.maxZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: bounds.maxX + 0.5,
          y: y + 0.5,
          z: bounds.minZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: bounds.maxX + 0.5,
          y: y + 0.5,
          z: bounds.maxZ + 0.5,
        });
      } catch (err) {}
    }
  }
}

/**
 * Detects if an entity enters and exits a spherical area.
 */
export class SphereAreaDetector extends AreaDetector {
  static readonly typeId = "radius";

  /**
   * @param {Vector3} center The center of the sphere.
   * @param {number} radius The radius (in blocks).
   * @param {string} id The unique id for this area.
   */
  center: Vector3;
  radius: number;

  constructor(center: Vector3, radius: number, options?: AreaDetectorOptions) {
    super(options);
    this.center = center;
    this.radius = radius;
  }

  getBlockVolume(): BlockVolume {
    const from = { x: this.center.x - this.radius, y: this.center.y - this.radius, z: this.center.z - this.radius };
    const to = { x: this.center.x + this.radius, y: this.center.y + this.radius, z: this.center.z + this.radius };
    return new BlockVolume(from, to);
  }

  tick(): void {
    for (const entity of this.getEntities()) {
      if (entity.matches({ location: this.center, maxDistance: this.radius })) {
        if (!this.isIn(entity)) {
          this.enter(entity);
        }
        this.baseTick(entity);
        return;
      }
      if (this.isIn(entity)) {
        this.leave(entity);
      }
    }
  }

  getEntities(): Entity[] {
    const dim = world.getDimension(this.dimensionId);
    const results = [];
    for (const entity of dim.getEntities({
      location: this.center,
      maxDistance: this.radius + this.padding,
    })) {
      if (!entity) continue;
      if (!this.condition(entity)) continue;
      results.push(entity);
    }
    return results;
  }

  // Requires debug-utilities
  // show(): void {
  //   // @ts-ignore:
  //   const sphere = new debug.DebugSphere(this.center);
  //   sphere.scale = 0.5 * (this.radius * 2);
  //   // @ts-ignore:
  //   const padding = new debug.DebugSphere(this.center);
  //   padding.scale = 0.5 * ((this.radius + this.padding) * 2);
  //   padding.color = { red: 123, green: 0, blue: 0 };
  //   // @ts-ignore:
  //   debug.debugDrawer.addShape(sphere);
  //   // @ts-ignore:
  //   debug.debugDrawer.addShape(padding);
  //   system.runTimeout(() => {
  //     sphere.remove();
  //     padding.remove();
  //   }, 10 * 20);
  // }

  /**
   * Debug method to show the area in-game.
   * @param {string} particle The particle to show.
   */
  show(particle: string = "minecraft:endrod", steps: number = 32): void {
    const dim = world.getDimension(this.dimensionId);
    const { x: cx, y: cy, z: cz } = this.center;
    const radius = this.radius;

    for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / steps) {
      for (let phi = 0; phi < Math.PI; phi += Math.PI / steps) {
        const x = cx + radius * Math.sin(phi) * Math.cos(theta);
        const y = cy + radius * Math.cos(phi);
        const z = cz + radius * Math.sin(phi) * Math.sin(theta);

        try {
          dim.spawnParticle(particle, { x, y, z });
        } catch (err) {}
      }
    }
  }
}

export interface Gateway {
  from: Vector3;
  to: Vector3;
  direction: Direction;
}

/**
 * Detects if an entity enters and exits a gateway.
 */
export class GatewayAreaDetector extends AreaDetector {
  static readonly typeId = "gateway";
  private gateways: Gateway[] = [];

  constructor(options?: AreaDetectorOptions) {
    super(options);
  }

  getBlockVolume(): BlockVolume {
    return MathUtils.combineBlockVolumes(this.gateways.map(({ from, to }) => new BlockVolume(from, to)));
  }

  addGateway(from: Vector3, to: Vector3, direction: Direction): GatewayAreaDetector {
    const bounds = MathUtils.getBounds(from, to);
    this.gateways.push({
      from: { x: bounds.minX, y: bounds.minY, z: bounds.minZ },
      to: { x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ },
      direction,
    });
    return this;
  }

  getEntities(): Entity[] {
    const dim = world.getDimension(this.dimensionId);
    const results = [];
    for (const entity of dim.getEntities()) {
      if (!entity || !entity.isValid) continue;
      if (!this.condition(entity)) continue;
      results.push(entity);
    }
    return results;
  }

  tick(): void {
    if (!this.enabled) return;
    for (const entity of this.getEntities()) {
      const pos = Vector3Utils.floor(entity.location);
      const bl = this.gateways.some((gateway) => MathUtils.isInRect(pos, gateway.from, gateway.to));
      if (bl) {
        if (!this.isIn(entity)) {
          this.enter(entity);
        }
        return;
      }
      if (this.isIn(entity)) {
        this.baseTick(entity);
      }

      const bl2 = this.gateways.some((gateway) => {
        const offset = WorldUtils.dir2Offset(gateway.direction);
        const exitFrom = Vector3Utils.subtract(gateway.from, offset);
        const exitTo = Vector3Utils.subtract(gateway.to, offset);
        return MathUtils.isInRect(pos, exitFrom, exitTo);
      });
      if (bl2) {
        if (this.isIn(entity)) {
          this.leave(entity);
        }
      }
    }
  }

  // Requires debug-utilities
  // show(): void {
  //   // @ts-ignore:
  //   const shapes: debug.DebugShape = [];
  //   for (const gateway of this.gateways) {
  //     // @ts-ignore:
  //     const box = new debug.DebugBox(gateway.from);
  //     box.bound = MathUtils.getSize(gateway.from, gateway.to);

  //     const offset = WorldUtils.dir2Offset(gateway.direction);
  //     const from = Vector3Utils.subtract(gateway.from, offset);
  //     const to = Vector3Utils.subtract(gateway.to, offset);
  //     // @ts-ignore:
  //     const padding = new debug.DebugBox(from);
  //     padding.bound = MathUtils.getSize(from, to);
  //     padding.color = { red: 123, green: 0, blue: 0 };

  //     shapes.push(box);
  //     shapes.push(padding);
  //   }
  //   // @ts-ignore:
  //   shapes.forEach((shape) => debug.debugDrawer.addShape(shape));

  //   system.runTimeout(() => {
  //     // @ts-ignore:
  //     shapes.forEach((shape) => shape.remove());
  //   }, 10 * 20);
  // }

  show(): void {}
}
