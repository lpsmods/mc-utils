import {
  Block,
  BlockVolume,
  Dimension,
  Entity,
  EntityQueryOptions,
  system,
  Vector3,
  VectorXZ,
} from "@minecraft/server";
import { locationToChunk } from "./utils";
import { ParticleDrawer } from "../drawer";
import { Box } from "../shape";
import { DataStorage } from "../data_storage";
import { Hasher } from "../type";
import { Random } from "../random";
import { WorldUtils } from "./utils";

/**
 * Defines a chunk the world.
 */
export class Chunk {
  dimension: Dimension;
  location: VectorXZ;
  private store: DataStorage;

  constructor(dimension: Dimension, location: VectorXZ) {
    this.dimension = dimension;
    this.location = { x: Math.floor(location.x), z: Math.floor(location.z) };
    this.store = new DataStorage(Hasher.stringify(location) ?? "unknown");
  }

  get origin(): Vector3 {
    return this.from;
  }

  get from(): Vector3 {
    return {
      x: this.location.x * 16,
      y: this.dimension.heightRange.min,
      z: this.location.z * 16,
    };
  }

  get to(): Vector3 {
    return {
      x: this.location.x * 16 + 15,
      y: this.dimension.heightRange.max,
      z: this.location.z * 16 + 15,
    };
  }

  get x(): number {
    return this.location.x;
  }

  get z(): number {
    return this.location.z;
  }

  /**
   * Tests if this chunk matches another.
   * @param chunk 
   * @returns 
   */
  matches(chunk: Chunk): boolean {
    if (!(chunk instanceof Chunk)) return false;
    return chunk.x === this.x && chunk.z === this.z;
  }

  /**
   * @deprecated Use Chunk.matches instead.
   */
  equals = this.matches

  // TODO: Test in-game.
  /**
   * Whether or not this chunk spawns slimes.
   * @returns {boolean}
   */
  isSlimeChunk(): boolean {
    const seed = WorldUtils.getSeed();
    const { x: chunkX, z: chunkZ } = this.location;

    const n =
      (BigInt(chunkX * chunkX * 4987142) +
        BigInt(chunkX * 5947611) +
        BigInt(chunkZ * chunkZ) * BigInt(4392871) +
        BigInt(chunkZ * 389711)) ^
      BigInt(seed);

    const rand = new Random(n);
    return rand.nextInt(10) === 0;
  }

  /**
   * The center position in the chunk.
   * @returns {Vector3}
   */
  getCenter(): Vector3 {
    return {
      x: this.from.x + (this.to.x - this.from.x) / 2 + 0.5,
      y: this.from.y + (this.to.y - this.from.y) / 2,
      z: this.from.z + (this.to.z - this.from.z) / 2 + 0.5,
    };
  }

  /**
   * @remarks
   * Clears all dynamic properties that have been set on this
   * block.
   *
   * @throws This function can throw errors.
   */
  clearDynamicProperties(): void {
    this.store.clear();
  }

  /**
   * @remarks
   * Returns a property value.
   *
   * @param identifier
   * The property identifier.
   * @returns
   * Returns the value for the property, or undefined if the
   * property has not been set.
   * @throws This function can throw errors.
   */
  getDynamicProperty(identifier: string): boolean | number | string | Vector3 | undefined {
    return this.store.getItem(identifier);
  }

  /**
   * @remarks
   * Returns the available set of dynamic property identifiers
   * that have been used on this block.
   *
   * @returns
   * A string array of the dynamic properties set on this block.
   * @throws This function can throw errors.
   */
  getDynamicPropertyIds(): string[] {
    return this.store.keys();
  }

  /**
   * @remarks
   * Returns the total size, in bytes, of all the dynamic
   * properties that are currently stored for this block. This
   * includes the size of both the key and the value.  This can
   * be useful for diagnosing performance warning signs - if, for
   * example, a block has many megabytes of associated dynamic
   * properties, it may be slow to load on various devices.
   *
   * @throws This function can throw errors.
   */
  getDynamicPropertyTotalByteCount(): number {
    return this.store.getSize();
  }

  /**
   * @remarks
   * Sets a specified property to a value.
   *
   * @param identifier
   * The property identifier.
   * @param value
   * Data value of the property to set.
   * @throws This function can throw errors.
   */
  setDynamicProperty(identifier: string, value?: boolean | number | string | Vector3): void {
    this.store.setItem(identifier, value);
  }

  /**
   * Whether or not the chunk is loaded.
   * @returns {boolean}
   */
  isLoaded(): boolean {
    try {
      return this.dimension.getBlock(this.from) !== undefined && this.dimension.getBlock(this.to) !== undefined;
    } catch {
      return false;
    }
  }

  // forceLoad(name?: string): string {
  //   if (!name) {
  //     name = randomId(4);
  //   }
  //   this.dimension.runCommand(
  //     `tickingarea add ${this.from.x} ${this.from.y} ${this.from.z} ${this.to.x} ${this.to.y} ${this.to.z} ${name} true`
  //   );
  //   return name;
  // }

  // removeForceLoad(name: string): void {
  //   this.dimension.runCommand(`tickingarea remove ${name}`);
  // }

  // ENTITY

  // TODO: Test in-game
  /**
   * Get all entities in this chunk.
   * @param {EntityQueryOptions} options
   * @returns {Entity[]}
   */
  getEntities(options: EntityQueryOptions): Entity[] {
    return this.dimension
      .getEntities({ location: this.from, volume: this.to })
      .filter((entity) => entity.matches(options));
  }

  // BLOCK

  // TODO: Test in-game
  /**
   * Get all blocks in this chunk.
   * @returns {Block[]}
   */
  getBlocks(): Block[] {
    const results = [];
    for (const arg of this.getMatrix()) {
      for (const pos of arg) {
        try {
          const block = this.dimension.getBlock(pos);
          if (!block) continue;
          results.push(block);
        } catch (err) {}
      }
    }
    return results;
  }

  /**
   * Get all topmost blocks in this chunk.
   * @returns {Block[]}
   */
  getTopmostBlocks(): Block[] {
    const results = [];
    for (let x = this.from.x; x <= this.to.x; x++) {
      for (let z = this.from.z; z <= this.to.z; z++) {
        const block = this.dimension.getTopmostBlock({ x: x, z: z });
        if (!block) continue;
        results.push(block);
      }
    }
    return results;
  }

  /**
   * A matrix of all block locations inside this chunk.
   * @returns {Vector3[][]}
   */
  getMatrix(): Vector3[][] {
    const matrix: Vector3[][] = [];
    for (let x = this.from.x; x <= this.to.x; x++) {
      const row: Vector3[] = [];
      for (let z = this.from.z; z <= this.to.z; z++) {
        row.push({ x, y: this.from.y, z });
      }
      matrix.push(row);
    }
    return matrix;
  }

  /**
   * Get this chunk as a BlockVolume.
   * @returns {BlockVolume}
   */
  getVolume(): BlockVolume {
    return new BlockVolume(this.from, this.to);
  }

  /**
   * Show the chunk borders.
   * @param {string} particle
   */
  show(particle: string = "minecraft:endrod"): void {
    const shape = new Box(this.from, this.to);
    shape.material = particle;
    shape.totalTimeLeft = 0.1;
    const drawer = new ParticleDrawer(this.dimension.id, 22, true);
    drawer.addShape(shape);
  }

  /**
   * Ensures the chunk containing this location is loaded before continuing.
   * @param {number} timeout Number of ticks before it gives up.
   */
  ensureLoaded(timeout: number = 40): Promise<Chunk> {
    return new Promise((resolve, reject) => {
      let c = 0;
      const interval = system.runInterval(() => {
        c++;
        if (this.isLoaded()) {
          system.clearRun(interval);
          resolve(this);
        } else if (c >= timeout) {
          system.clearRun(interval);
          reject(`Chunk ${this.x} ${this.z} timed out!`);
        }
      }, 1);
    });
  }

  /**
   * Get the chunk from a position in the world.
   * @param {Dimension} dimension
   * @param {Vector3} location
   * @returns {Chunk}
   */
  static fromPos(dimension: Dimension, location: Vector3): Chunk {
    const pos = locationToChunk(location);
    return new Chunk(dimension, pos);
  }

  /**
   * Get the chunk the block is in.
   * @param {Block} block
   * @returns {Chunk}
   */
  static fromBlock(block: Block): Chunk {
    return Chunk.fromPos(block.dimension, block.location);
  }

  /**
   * Get the chunk the entity is in.
   * @param {Entity} entity
   * @returns {Chunk}
   */
  static fromEntity(entity: Entity): Chunk {
    return Chunk.fromPos(entity.dimension, entity.location);
  }
}
