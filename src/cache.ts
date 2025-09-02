import { MemoryTier, system } from "@minecraft/server";

export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  /**
   * Creates a new LRUCache instance.
   * @param maxSize The maximum number of entries the cache can hold.
   */
  constructor(maxSize?: number) {
    this.cache = new Map<K, V>();
    this.maxSize = maxSize ?? this.#getDefaultSize();

    if (this.maxSize <= 0) {
      throw new Error("Cache size must be greater than 0");
    }
  }

  // TODO: use memory tier
  #getDefaultSize(): number {
    switch (system.serverSystemInfo.memoryTier) {
      case MemoryTier.SuperLow:
        return 128;
      case MemoryTier.Low:
        return 256;
      case MemoryTier.Mid:
        return 512;
      case MemoryTier.High:
        return 1024;
      case MemoryTier.SuperHigh:
        return 2048;
      default:
        return 512;
    }
  }

  /**
   * Retrieves a value from the cache by its key.
   * If the key exists, it is marked as recently used.
   * @param key The key to look up.
   * @returns The cached value, or undefined if the key is not in the cache.
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move the accessed key to the end to mark it as recently used
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  /**
   * Adds a key-value pair to the cache.
   * If the cache exceeds the maximum size, the least recently used entry is removed.
   * @param key The key to store the value under.
   * @param value The value to store.
   */
  set(key: K, value: V): V {
    if (this.cache.has(key)) {
      // Remove the existing key to update its position
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove the least recently used entry (first key in the Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    // Add the new key-value pair to the cache
    this.cache.set(key, value);
    return value;
  }

  /**
   * Checks if a key exists in the cache.
   * @param key The key to check.
   * @returns True if the key exists, false otherwise.
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Removes a key-value pair from the cache.
   * @param key The key to remove.
   */
  delete(key: K): void {
    this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Gets the current size of the cache.
   * @returns The number of entries in the cache.
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get or create a new entry
   * @param key
   * @param compute
   * @returns
   */
  getOrCompute(key: K, compute: (key: K) => V): V {
    return this.get(key) ?? this.set(key, compute(key));
  }
}
