import {
  BlockPermutation,
  BlockVolumeBase,
  Dimension,
  Entity,
  ExplosionOptions,
  ItemStack,
  Vector3,
  BlockType,
  BlockFillOptions,
  world,
  VectorXZ,
} from "@minecraft/server";
import { DataStorage } from "./DataStorage";
import { Chunk } from "../world/Chunk";
import { Hasher } from "../type";

// TODO:
export class DimensionHandler {
  dimension: Dimension;
  store: DataStorage;

  constructor(dimension?: Dimension) {
    this.dimension = dimension ?? world.getDimension("overworld");
    this.store = new DataStorage("mcutils:dimension_handler");
  }

  // loadChunk(location: Vector3): string | undefined {
  //   const loaded = this.isLoaded(location);
  //   if (loaded) return;
  //   const chunk = Chunk.fromPos(this.dimension, location);
  //   const id = chunk.forceLoad();
  //   this.store.set(id, Hasher.stringify(chunk.location));
  //   return id;
  // }

  // unloadChunk(name: string | undefined): void {
  //   if (!name) return;
  //   this.dimension.runCommand(`tickingarea remove ${name}`);
  //   this.store.delete(name);
  // }

  isChunkLoaded(chunk: VectorXZ): boolean {
    const id = Hasher.stringify(chunk);
    return this.store.has(id);
  }

  isLoaded(location: Vector3): boolean {
    return Chunk.fromPos(this.dimension, location).isLoaded();
  }

  fillBlocks(
    volume: BlockVolumeBase,
    block: BlockType | BlockPermutation | string,
    options?: BlockFillOptions
  ): void {
    this.dimension.fillBlocks(volume, block, options);
  }

  wrapper<T>(location: Vector3, callback: (id: string | undefined) => T): T | undefined {
    const id = this.loadChunk(location);

    try {
      return callback(id);
    } finally {
      this.unloadChunk(id);
    }
  }

  createExplosion(location: Vector3, radius: number, explosionOptions: ExplosionOptions): boolean {
    return this.wrapper<boolean>(location, () => {
      return this.dimension.createExplosion(location, radius, explosionOptions);
    });
  }

  placeFeature(featureName: string, location: Vector3, shouldThrow?: boolean): boolean {
    return this.wrapper<boolean>(location, () => {
      return this.dimension.placeFeature(featureName, location, shouldThrow);
    });
  }

  placeFeatureRule(featureRuleName: string, location: Vector3): boolean {
    return this.wrapper<boolean>(location, () => {
      return this.dimension.placeFeatureRule(featureRuleName, location);
    });
  }

  setBlockPermutation(location: Vector3, permutation: BlockPermutation): void {
    this.wrapper(location, () => {
      this.dimension.setBlockPermutation(location, permutation);
    });
  }

  setBlockType(location: Vector3, blockType: string): void {
    this.wrapper(location, () => {
      this.dimension.setBlockType(location, blockType);
    });
  }

  spawnEntity(identifier: string, location: Vector3): Entity {
    return this.wrapper<Entity>(location, () => {
      return this.dimension.spawnEntity(identifier, location);
    });
  }

  spawnItem(itemStack: ItemStack, location: Vector3): Entity {
    return this.wrapper<Entity>(location, () => {
      return this.dimension.spawnItem(itemStack, location);
    });
  }

  removeAll() {
    for (const id of this.store.keys()) {
      this.unloadChunk(id);
    }
  }
}
