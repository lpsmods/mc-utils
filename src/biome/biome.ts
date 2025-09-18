import { Identifier } from "../identifier";

/**
 * Describes a biome.
 */
export class Biome {
  readonly typeId: string;

  constructor(typeId: string) {
    this.typeId = typeId;
  }

  matches(biome: string | Biome): boolean {
    const id = Identifier.parse(this);
    return id.matches(biome);
  }
}
