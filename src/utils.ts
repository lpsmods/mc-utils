import { system, Block, Vector3, Dimension, DimensionTypes, world } from "@minecraft/server";
import { LRUCache } from "./cache";

// const CACHED_SOUNDS: { [key: string]: string } = {};

// TODO: Use @cache() decorator
/**
 * Add a block sound to cache.
 * @param {string} blockId
 * @param {string} soundEvent
 * @returns {string}
 */
// function cacheSound(blockId: string, soundEvent: string): string {
//   CACHED_SOUNDS[blockId] = soundEvent;
//   return soundEvent;
// }

// export function getInteractSound(block: Block, defaultSound: string = "dig.stone"): string {
//   if (!block) return "dig.stone";
//   const id = block.typeId;
//   const snd = CACHED_SOUNDS[id];
//   if (snd) return snd;
//   // TODO: Use array
//   const sounds = {
//     "dig.gravel": ["dirt", "farmland", "gravel"],
//     "dig.stem": ["crimson", "warped"],
//     "break.cherry_wood": ["cherry"],
//   };
//   if (id.includes("dirt") || id.includes("farmland") || id.includes("gravel"))
//     return cacheSound(id, "dig.gravel");
//   if (id.includes("crimson") || id.includes("warped")) return cacheSound(id, "dig.stem");
//   if (id.includes("cherry")) return cacheSound(id, "break.cherry_wood");
//   return cacheSound(id, defaultSound);
// }

const soundCache = new LRUCache<string, string>();
/**
 * Returns the sound event that should be used for the block. Cached to improve speed.
 * @param {Block} block
 * @param {string} defaultSound
 * @returns String
 */
export function getInteractSound(block: Block, defaultSound: string = "dig.stone"): string {
  if (!block) return "dig.stone";
  const key = block.typeId;
  if (soundCache.has(key)) return soundCache.get(key) ?? defaultSound;
  // TODO: Use array
  const sounds = {
    "dig.gravel": ["dirt", "farmland", "gravel"],
    "dig.stem": ["crimson", "warped"],
    "break.cherry_wood": ["cherry"],
  };
  if (key.includes("dirt") || key.includes("farmland") || key.includes("gravel"))
    return soundCache.set(key, "dig.gravel");
  if (key.includes("crimson") || key.includes("warped")) return soundCache.set(key, "dig.stem");
  if (key.includes("cherry")) return soundCache.set(key, "break.cherry_wood");
  return soundCache.set(key, defaultSound);
}

/**
 * Run a function each tick for a duration.
 * @param {Function} callback
 * @param {number} duration
 */
export function forDuration(callback: Function, duration?: number): void {
  var delta = 0;
  const o = system.runInterval(() => {
    callback.call(delta), delta >= (duration ?? 20) && system.clearRun(o), delta++;
  });
}

/**
 * Run a function for all dimensions.
 * @param callback
 */
export function forAllDimensions(callback: (dimension: Dimension) => void): void {
  for (const dimType of DimensionTypes.getAll()) {
    callback(world.getDimension(dimType.typeId));
  }
}

/**
 * Iterates over a 3D volume defined by the given offset and applies the provided callback function.
 * @param {Vector3} offset
 * @param callback
 * @returns
 */
export function offsetVolume<T>(offset: Vector3, callback: (pos: Vector3) => T | undefined): T | undefined {
  for (let x = -offset.x; x < offset.x + 1; x++) {
    for (let y = -offset.y; y < offset.y + 1; y++) {
      for (let z = -offset.z; z < offset.z + 1; z++) {
        const result = callback({ x: x, y: y, z: z });
        if (result !== undefined) return result;
      }
    }
  }
}

/**
 * Creates a deep copy of JSON data.
 * @param {T} input
 * @param {WeakMap} seen
 * @returns {T}
 */
export function deepCopy<T>(input: T, seen = new WeakMap()): T {
  // Handle primitives and functions directly
  if (input === null || typeof input !== "object") {
    return input;
  }

  // Preserve functions
  if (typeof input === "function") {
    return input;
  }

  // Handle circular references
  if (seen.has(input)) {
    return seen.get(input) as T;
  }

  // Handle arrays
  if (Array.isArray(input)) {
    const copy: any[] = [];
    seen.set(input, copy);
    for (const item of input) {
      copy.push(deepCopy(item, seen));
    }
    return copy as T;
  }

  // Handle plain objects
  const copy: Record<string, any> = {};
  seen.set(input, copy);
  for (const [key, value] of Object.entries(input)) {
    copy[key] = deepCopy(value, seen);
  }
  return copy as T;
}

/**
 * Get the next item in an array.
 * @param {T[]} array
 * @param {T} value
 * @returns {T|undefined}
 */
export function nextItem<T>(array: T[], value: T): T | undefined {
  const index = array.indexOf(value);
  if (index === -1 || array.length === 0) return undefined;
  return array[(index + 1) % array.length];
}

export function differenceArray(a: string[], b: string[]): string[] {
  const setA = new Set(a);
  const setB = new Set(b);

  const result: string[] = [];

  for (const item of setA) {
    if (!setB.has(item)) {
      result.push(item);
    }
  }

  for (const item of setB) {
    if (!setA.has(item)) {
      result.push(item);
    }
  }

  return result;
}

export function removeItems<T>(source: T[], itemsToRemove: T[]): T[] {
  const toRemove = new Set(itemsToRemove);
  return source.filter((item) => !toRemove.has(item));
}

export function deepMerge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  const result: any = { ...obj1 };

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (
        typeof obj2[key] === "object" &&
        obj2[key] !== null &&
        !Array.isArray(obj2[key]) &&
        typeof result[key] === "object" &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        // Recursively merge objects
        result[key] = deepMerge(result[key], obj2[key]);
      } else {
        // Overwrite value
        result[key] = obj2[key];
      }
    }
  }

  return result as T & U;
}
