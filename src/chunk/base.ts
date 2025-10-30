import {
  Block,
  BlockVolume,
  Dimension,
  Entity,
  EntityQueryOptions,
  system,
  Vector3,
  VectorXZ,
  world,
} from "@minecraft/server";
import { ParticleDrawer } from "../drawer";
import { BoxShape } from "../shape";
import { DataStorage, VersionedDataStorage } from "../data/data_storage";
import { Hasher } from "../type";
import { Random } from "../utils/random";
import { WorldUtils } from "../world/utils";
import { Vector3Utils } from "@minecraft/math";

// import * as debug from "@minecraft/debug-utilities";

function updateChunkData(chunk: Chunk): DataStorage {
  const k = Hasher.stringify(chunk.location) ?? "unknown";
  const old = world.getDynamicProperty(k) as string;
  const nData = new VersionedDataStorage(`mcutils:chunk.${k}`, 2);
  // Update legacy (pre-versioned)
  if (old) {
    const data = JSON.parse(old);
    nData.update(data);
  }
  return nData;
}

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
    this.store = updateChunkData(this);
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
  equals = this.matches;

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
    return this.dimension.isChunkLoaded(this.getCenter());
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

  /**
   * Get all entities in this chunk.
   * @param {EntityQueryOptions} options
   * @returns {Entity[]}
   */
  getEntities(options: EntityQueryOptions): Entity[] {
    const vol = this.getBlockVolume();
    return this.dimension
      .getEntities({ location: vol.from, volume: vol.to })
      .filter((entity) => entity.matches(options));
  }

  getChunkVolume(): ChunkVolume {
    return new ChunkVolume(this.from, this.to);
  }

  // BLOCK

  /**
   * Get all blocks in this chunk.
   * @returns {Block[]}
   */
  getBlocks(): Block[] {
    const results = [];
    for (const pos of this.getBlockVolume().getBlockLocationIterator()) {
      try {
        const block = this.dimension.getBlock(pos);
        if (!block) continue;
        results.push(block);
      } catch (err) {}
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
   * Get this chunk as a BlockVolume.
   * @returns {BlockVolume}
   */
  getBlockVolume(): BlockVolume {
    return new BlockVolume(this.from, this.to);
  }

  // show(): void {
  //   // @ts-ignore
  //   const shapes: debug.DebugShape = [];
  //   // @ts-ignore
  //   const shape = new debug.Box(this.from, this.to);
  //   // @ts-ignore
  //   debug.debugDrawer.addShape(shape);

  //   system.runTimeout(() => {
  //     // @ts-ignore
  //     shapes.forEach((shape) => shape.remove());
  //   }, 20);
  // }

  /**
   * Show the chunk borders.
   * @param {string} particle
   */
  show(particle: string = "minecraft:endrod"): void {
    const shape = new BoxShape(this.from, this.to);
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
}

export class ChunkVolume {
  "from": VectorXZ;
  to: VectorXZ;

  constructor(from: VectorXZ, to: VectorXZ) {
    this.from = from;
    this.to = to;
  }

  /**
   * Returns an iterator that yields all chunk positions in the volume.
   */
  getChunkLocationIterator(): IterableIterator<VectorXZ> {
    const min = this.getMin();
    const max = this.getMax();

    function* generator() {
      for (let x = min.x; x <= max.x; x++) {
        for (let z = min.z; z <= max.z; z++) {
          yield { x, z };
        }
      }
    }
    return generator();
  }

  /**
   * Get this chunk volume as a block volume.
   * @returns {BlockVolume}
   */
  getBlockVolume(): BlockVolume {
    const from = { x: this.from.x * 16, y: -64, z: this.from.z * 16 };
    const to = { x: this.to.x * 16, y: 320, z: this.to.z * 16 };
    return new BlockVolume(from, Vector3Utils.add(to, { x: 16, y: 0, z: 16 }));
  }

  /**
   * @remarks
   * Return the capacity (volume) of the ChunkVolume (W*H)
   *
   */
  getCapacity(): number {
    const span = this.getSpan();
    return span.x * span.z;
  }

  /**
   * @remarks
   * Get the largest corner position of the volume (guaranteed to
   * be >= min)
   */
  getMax(): VectorXZ {
    const x = Math.max(this.from.x, this.to.x);
    const z = Math.max(this.from.z, this.to.z);
    return { x, z };
  }

  /**
   * @remarks
   * Get the smallest corner position of the volume (guaranteed
   * to be <= max)
   */
  getMin(): VectorXZ {
    const x = Math.min(this.from.x, this.to.x);
    const z = Math.min(this.from.z, this.to.z);
    return { x, z };
  }

  /**
   * @remarks
   * Get a {@link Vector3} object where each component represents
   * the number of blocks along that axis
   *
   */
  getSpan(): VectorXZ {
    const min = this.getMin();
    const max = this.getMax();
    return { x: max.x - min.x, z: max.z - min.z };
  }

  /**
   * @remarks
   * Check to see if a given world block location is inside a
   * ChunkVolume
   *
   */
  isInside(location: Vector3): boolean {
    return false;
  }

  /**
   * @remarks
   * Move a ChunkVolume by a specified amount
   *
   * @param delta
   * Amount of chunks to move by
   */
  translate(delta: VectorXZ): void {
    this.from = { x: this.from.x + delta.x, z: this.from.z + delta.z };
    this.to = { x: this.to.x + delta.x, z: this.to.z + delta.z };
  }
}
