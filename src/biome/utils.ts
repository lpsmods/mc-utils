import { BiomeType } from "@minecraft/server";
import { Identifier } from "../identifier";

export abstract class BiomeUtils {
  /**
   * Match any biome name.
   * @param {BiomeType|string} biome
   * @param {string[]} biomePredicates An array of biome names. Prefix with "!" to ignore.
   * @returns {boolean} Whether or not the biome matched any of the biome names.
   */
  static matchAny(biome: BiomeType | string, biomePredicates: string[]): boolean {
    const items = [...new Set(biomePredicates)];
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
  static matches(biome: BiomeType | string, biomePredicate: string): boolean {
    const biomeId = Identifier.parse(typeof biome === "string" ? biome : biome.id);
    if (biomePredicate.charAt(0) === "!") {
      return !biomeId.equals(biomePredicate.slice(1));
    }
    return biomeId.equals(biomePredicate);
  }
}
