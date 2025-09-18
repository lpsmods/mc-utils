import { Entity, Vector3, world } from "@minecraft/server";
import { Ticking } from "./ticking";
import { MathUtils } from "./math";
import { AreaEnterEvent, AreaEvents, AreaLeaveEvent, AreaTickEvent } from "./event/area";

export abstract class AreaDetector extends Ticking {
  static readonly typeId: string;

  static areas: Map<string, AreaDetector> = new Map<string, AreaDetector>();
  static #lastId: number = 0;
  enabled: boolean = true;
  padding: number = 1;
  readonly areaId: string;
  readonly dimensionId: string;

  constructor(dimensionId?: string, prefix?: string, id?: string, tickInterval?: number) {
    super(tickInterval);
    this.dimensionId = dimensionId ?? "overworld";
    this.areaId = `${prefix ?? "area"}.${id ?? (AreaDetector.#lastId++).toString()}`;
    AreaDetector.areas.set(this.areaId, this);
  }

  get id(): string {
    return this.areaId;
  }

  _enter(entity: Entity): void {
    const event = new AreaEnterEvent(entity, this);
    if (this.onEnter) this.onEnter(event);
    AreaEvents.entityEnter.apply(event);
  }

  _leave(entity: Entity): void {
    const event = new AreaLeaveEvent(entity, this);
    if (this.onLeave) this.onLeave(event);
    AreaEvents.entityLeave.apply(event);
  }

  _tick(entity: Entity): void {
    const event = new AreaTickEvent(entity, this);
    if (this.onTick) this.onTick(event);
    AreaEvents.entityTick.apply(event);
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

  /**
   * Get all entities in this area.
   */
  abstract getEntities(): Entity[];

  /**
   * Debug method to show the area in-game.
   */
  abstract show(): void;
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
  location1: Vector3;
  location2: Vector3;

  constructor(location1: Vector3, location2: Vector3, dimensionId?: string, prefix?: string, id?: string) {
    super(dimensionId, prefix, id);
    this.location1 = location1;
    this.location2 = location2;
  }

  tick(): void {
    if (!this.enabled) return;
    for (const entity of this.getEntities()) {
      if (MathUtils.isInRect(entity, this.location1, this.location2)) {
        if (!entity.hasTag(this.areaId)) {
          entity.addTag(this.areaId);
          this._enter(entity);
        }
        this._tick(entity);
        return;
      }
      if (entity.hasTag(this.areaId)) {
        entity.removeTag(this.areaId);
        this._leave(entity);
      }
    }
  }

  getEntities(): Entity[] {
    const dim = world.getDimension(this.dimensionId);
    const results = [];
    for (const entity of dim.getEntities()) {
      if (!entity) continue;
      if (!this.condition(entity)) continue;
      const { from, to } = MathUtils.expandRegion(this.location1, this.location2, this.padding);
      if (!MathUtils.isInRect(entity, from, to)) continue;
      results.push(entity);
    }
    return results;
  }

  /**
   * Debug method to show the area in-game.
   * @param {string} particle The particle to show.
   */
  show(particle: string = "minecraft:endrod", steps: number = 32): void {
    const dim = world.getDimension(this.dimensionId);
    const { x: x1, y: y1, z: z1 } = this.location1;
    const { x: x2, y: y2, z: z2 } = this.location2;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);

    const stepX = (maxX - minX) / steps;
    const stepY = (maxY - minY) / steps;
    const stepZ = (maxZ - minZ) / steps;

    // Wireframe outline: edges only
    // Bottom and top edges (x-z plane)
    for (let x = minX; x <= maxX; x += stepX) {
      try {
        dim.spawnParticle(particle, {
          x: x + 0.5,
          y: minY + 0.5,
          z: minZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: x + 0.5,
          y: minY + 0.5,
          z: maxZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: x + 0.5,
          y: maxY + 0.5,
          z: minZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: x + 0.5,
          y: maxY + 0.5,
          z: maxZ + 0.5,
        });
      } catch (err) {}
    }

    for (let z = minZ; z <= maxZ; z += stepZ) {
      try {
        dim.spawnParticle(particle, {
          x: minX + 0.5,
          y: minY + 0.5,
          z: z + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: maxX + 0.5,
          y: minY + 0.5,
          z: z + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: minX + 0.5,
          y: maxY + 0.5,
          z: z + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: maxX + 0.5,
          y: maxY + 0.5,
          z: z + 0.5,
        });
      } catch (err) {}
    }

    // Vertical edges (y-axis)
    for (let y = minY; y <= maxY; y += stepY) {
      try {
        dim.spawnParticle(particle, {
          x: minX + 0.5,
          y: y + 0.5,
          z: minZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: minX + 0.5,
          y: y + 0.5,
          z: maxZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: maxX + 0.5,
          y: y + 0.5,
          z: minZ + 0.5,
        });
      } catch (err) {}
      try {
        dim.spawnParticle(particle, {
          x: maxX + 0.5,
          y: y + 0.5,
          z: maxZ + 0.5,
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

  constructor(center: Vector3, radius: number, dimensionId?: string, prefix?: string, id?: string) {
    super(dimensionId, prefix, id);
    this.center = center;
    this.radius = radius;
  }

  tick(): void {
    for (const entity of this.getEntities()) {
      if (entity.matches({ location: this.center, maxDistance: this.radius })) {
        if (!entity.hasTag(this.areaId)) {
          entity.addTag(this.areaId);
          this._enter(entity);
        }
        this._tick(entity);
        return;
      }
      if (entity.hasTag(this.areaId)) {
        entity.removeTag(this.areaId);
        this._leave(entity);
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
