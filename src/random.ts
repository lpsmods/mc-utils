export class Random {
  private seed: bigint = BigInt(0);

  constructor(seed: bigint | number) {
    this.setSeed(seed);
  }

  setSeed(seed: bigint | number): void {
    const bigSeed = BigInt(seed);
    this.seed = (bigSeed ^ 0x5deece66dn) & ((1n << 48n) - 1n);
  }

  next(bits: number): number {
    this.seed = (this.seed * 0x5deece66dn + 0xbn) & ((1n << 48n) - 1n);
    return Number(this.seed >> (48n - BigInt(bits)));
  }

  nextInt(bound: number): number {
    if (bound <= 0) {
      throw new Error("Bound must be positive");
    }

    if ((bound & -bound) === bound) {
      // Power of two
      return Math.floor((bound * this.next(31)) / (1 << 31));
    }

    let bits: number, val: number;
    do {
      bits = this.next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    return val;
  }
}

export class RandomUtils {
  /**
   * Create a random UUID.
   * @returns {string}
   */
  static uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Returns a random integer within MIN and MAX.
   * @param {number} low
   * @param {number} high
   * @returns {number}
   */
  static int(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low) + low);
  }

  /**
   * Create a random string.
   * @param {number} length
   * @param {string} characters
   * @returns
   */
  static id(
    length: number,
    characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ): string {
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
  }

  /**
   * Create a random dynamic property id.
   * @returns {string}
   */
  static propertyId(): string {
    return RandomUtils.id(12);
  }

  /**
   * Chooses one random item from the array.
   * @param {T[]} choices
   * @returns {T}
   */
  static choice<T>(choices: T[]): T {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
  }

  /**
   * Chooses one random item (with weight) from the array.
   * @param {Array<T, number>} choices
   * @returns {T}
   */
  static weightedChoice<T>(choices: Array<[T, number]>): T {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index][0];
  }
}
