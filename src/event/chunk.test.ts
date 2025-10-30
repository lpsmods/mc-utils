import { BlockVolume } from "@minecraft/server";
import { ChunkEvents } from "./chunk";
import { RandomUtils } from "../utils/random";
import { COLORS } from "../constants";

export default () => {
  ChunkEvents.playerLoad.subscribe((event) => {
    const color = RandomUtils.choice(COLORS);
    const from = event.chunk.from;
    from.y = 150;
    const to = event.chunk.to;
    to.y = 150;
    event.chunk.dimension.fillBlocks(new BlockVolume(from, to), `${color}_stained_glass`);
  });

  ChunkEvents.playerUnload.subscribe((event) => {
    const from = event.chunk.from;
    from.y = 150;
    const to = event.chunk.to;
    to.y = 150;
    event.chunk.dimension.fillBlocks(new BlockVolume(from, to), "air");
  });

  // ChunkEvents.playerLoadedTick.subscribe((event) => {
  //   const from = event.chunk.from;
  //   from.y = 150;
  //   const to = event.chunk.to;
  //   to.y = 150;
  //   event.chunk.dimension.fillBlocks(new BlockVolume(from, to), "lime_stained_glass");
  // });
};
