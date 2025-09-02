import { Biome } from "./biome";

export abstract class BiomeUtils {
  /**
   * Match any biome name.
   * @param {Biome} biome
   * @param {string[]} biomeNames
   * @returns {boolean} Whether or not the biome matched any of the biome names.
   */
  static matchAny(biome: Biome, biomeNames: string[]): boolean {
    const items = [...new Set(biomeNames)];
    return items.some((biomeName) => {
      if (biomeName.charAt(0) === "!") {
        return !biome.matches(biomeName.slice(1));
      }
      return biome.matches(biomeName);
    });
  }
}
