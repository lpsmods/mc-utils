import { BlockPermutation } from "@minecraft/server";

export class Parser {
  // stone_slab["minecraft:vertical_half"="top"]
  static parseBlockPermutation(value: string): BlockPermutation | undefined {
    const match = value.match(/^([^\[\]]+)(?:\[(.+)\])?$/);
    if (!match) throw new Error("Invalid input format");

    const block = match[1];
    const statesStr = match[2];
    const states: Record<string, number | string | boolean> = {};

    if (statesStr) {
      for (const pair of statesStr.split(",")) {
        const [key, value] = pair.split("=");
        if (key && value) {
          let v: number | string | boolean = value.trim();
          if (Number.isInteger(v)) v = +v;
          if (v === "true") v = true;
          if (v === "false") v = false;
          states[key.trim()] = v;
        }
      }
    }
    return BlockPermutation.resolve(block, states);
  }
}
