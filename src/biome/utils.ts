import { BiomeType } from "@minecraft/server";

export abstract class BiomeUtils {
  /**
   * Match any biome name.
   * @param {BiomeType|string} biome
   * @param {string[]} biomePredicates An array of biome names. Prefix with "!" to ignore.
   * @returns {boolean} Whether or not the biome matched any of the biome names.
   */
  static matchAny(biome: BiomeType, biomePredicates: string[]): boolean {
    const items = [...new Set(biomePredicates)];
    const biomeId = typeof biome === "string" ? biome : biome.id;
    return items.some((biomeName) => {
      return this.matches(biome, biomeName);
    });
  }

  /**
   * Match this biome.
   * @param {BiomeType|string} biome The biome to match.
   * @param biomePredicate A biome name. Prefix with "!" to ignore.
   * @returns {boolean}
   */
  static matches(biome: BiomeType, biomePredicate: string): boolean {
    const biomeId = typeof biome === "string" ? biome : biome.id;
    if (biomeId.charAt(0) === "!") {
      return biomeId !== biomePredicate.slice(1);
    }
    return biomeId === biomePredicate;
  }
}
