import { Dimension, system, world } from "@minecraft/server";
import { EventSignal } from ".";
import { Chunk } from "../world/Chunk";
import { PlayerUtils } from "../entity/PlayerUtils";
import { Hasher } from "../type";
import { differenceArray, removeItems } from "../utils";

export class ChunkEvent {
  constructor(chunk: Chunk) {
    this.chunk = chunk;
    this.dimension = chunk.dimension;
  }

  readonly chunk: Chunk;
  readonly dimension: Dimension;
}

export class ChunkLoadEvent extends ChunkEvent {
  constructor(chunk: Chunk, initial: boolean) {
    super(chunk);
    this.initial = initial;
  }

  readonly initial: boolean;
}

export class ChunkUnloadEvent extends ChunkEvent {}
export class ChunkTickEvent extends ChunkEvent {}

export class ChunkLoadEventSignal extends EventSignal<ChunkLoadEvent> {
  subscribe(callback: (event: ChunkLoadEvent) => void): (event: ChunkLoadEvent) => void {
    return super.subscribe(callback);
  }
}

export class ChunkUnloadEventSignal extends EventSignal<ChunkUnloadEvent> {
  subscribe(callback: (event: ChunkUnloadEvent) => void): (event: ChunkUnloadEvent) => void {
    return super.subscribe(callback);
  }
}

export class ChunkTickEventSignal extends EventSignal<ChunkTickEvent> {
  subscribe(callback: (event: ChunkTickEvent) => void): (event: ChunkTickEvent) => void {
    return super.subscribe(callback);
  }
}

export class ChunkEvents {
  private constructor() {}

  /**
   * This event fires when a chunk is loaded.
   */
  static readonly load = new ChunkLoadEventSignal();

  /**
   * This event fires when a chunk is unloaded.
   */
  static readonly unload = new ChunkUnloadEventSignal();

  /**
   * This event fires every tick for loaded chunks.
   */
  static readonly tick = new ChunkTickEventSignal();
}

var SIMULATION_DISTANCE = 4;
var loadedChunks: Set<string> = new Set();

function tick() {
  const players = world.getAllPlayers();
  const cache = [];
  for (const player of players) {
    const chunks = PlayerUtils.getLoadedChunks(player, SIMULATION_DISTANCE);
    for (const chunk of chunks) {
      const key = Hasher.stringify(chunk);
      if (!key) continue;
      cache.push(key);
      if (loadedChunks.has(key)) continue;
      loadedChunks.add(key);
      const gen = chunk.getDynamicProperty("mcutils:has_generated") ?? false;
      ChunkEvents.load.apply(new ChunkLoadEvent(chunk, !gen));
      if (!gen) {
        chunk.setDynamicProperty("mcutils:has_generated", true);
      }
    }
  }

  const diff = differenceArray(cache, [...loadedChunks]);
  for (const hash of diff) {
    const chunk = Hasher.parseChunk(hash);
    if (!chunk) continue;
    ChunkEvents.unload.apply(new ChunkUnloadEvent(chunk));
  }
  loadedChunks = new Set(removeItems([...loadedChunks], diff));

  for (const hash of loadedChunks) {
    const chunk = Hasher.parseChunk(hash);
    if (!chunk) continue;
    ChunkEvents.tick.apply(new ChunkTickEvent(chunk));
  }
}

function setup() {
  system.runInterval(tick);
}

setup();
