import { CustomCommandOrigin } from "@minecraft/server";
import { UnitTestMap } from "../command/test";
import { ChunkQueue } from "./chunk_queue";

export default (units: UnitTestMap) => {
  let queue: ChunkQueue | undefined = undefined;

  units.set("chunk_queue", (ctx: CustomCommandOrigin) => {
    if (!queue) queue = new ChunkQueue("overworld");
    queue.setBlockType({ x: 500, y: 63, z: 500 }, "minecraft:diamond_block");
    queue.spawnEntity({ x: 500, y: 63, z: 500 }, "armor_stand");
  });
};
