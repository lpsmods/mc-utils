import { Dimension, Player, PlayerJoinAfterEventSignal, system, world } from "@minecraft/server";
import { EventSignal } from "./utils";
import { Chunk } from "../world/chunk";
import { PlayerUtils } from "../entity/player_utils";
import { Hasher } from "../type";
import { differenceArray, removeItems } from "../utils";
import { EntityEvents } from "./entity";

export abstract class ChunkEvent {
  constructor(chunk: Chunk) {
    this.chunk = chunk;
    this.dimension = chunk.dimension;
  }

  readonly chunk: Chunk;
  readonly dimension: Dimension;
}

export abstract class PlayerChunkEvent extends ChunkEvent {
  constructor(chunk: Chunk, player: Player) {
    super(chunk);
    this.player = player;
  }

  readonly player: Player;
}

export class PlayerChunkLoadEvent extends PlayerChunkEvent {
  constructor(chunk: Chunk, player: Player, initial: boolean) {
    super(chunk, player);
    this.initial = initial;
  }

  readonly initial: boolean;
}

export class PlayerChunkUnloadEvent extends PlayerChunkEvent {}

export class ChunkTickEvent extends ChunkEvent {}

export class PlayerChunkLoadEventSignal extends EventSignal<PlayerChunkLoadEvent> {
  subscribe(callback: (event: PlayerChunkLoadEvent) => void): (event: PlayerChunkLoadEvent) => void {
    return super.subscribe(callback);
  }
}

export class PlayerChunkUnloadEventSignal extends EventSignal<PlayerChunkUnloadEvent> {
  subscribe(callback: (event: PlayerChunkUnloadEvent) => void): (event: PlayerChunkUnloadEvent) => void {
    return super.subscribe(callback);
  }
}

export class ChunkTickEventSignal extends EventSignal<ChunkTickEvent> {
  subscribe(callback: (event: ChunkTickEvent) => void): (event: ChunkTickEvent) => void {
    return super.subscribe(callback);
  }
}

// TODO:
// Use entity.hasComponent('tick_world') to tick entities.

/**
 * Custom chunk events.
 */
export class ChunkEvents {
  private constructor() {}

  /**
   * This event fires when a player loads a chunk.
   * @eventProperty
   */
  static readonly playerLoad = new PlayerChunkLoadEventSignal();

  /**
   * This event fires when a player unloads a chunk.
   * @eventProperty
   */
  static readonly playerUnload = new PlayerChunkUnloadEventSignal();

  /**
   * This event fires every tick for loaded chunks.
   * @eventProperty
   */
  static readonly loadedTick = new ChunkTickEventSignal();

  static get size(): number {
    return this.playerLoad.size + this.playerUnload.size + this.loadedTick.size;
  }
}

var SIMULATION_DISTANCE = 4;
var loadedChunks: Set<string> = new Set();

function tick() {
  for (const hash of loadedChunks) {
    const chunk = Hasher.parseChunk(hash);
    if (!chunk) continue;
    ChunkEvents.loadedTick.apply(new ChunkTickEvent(chunk));
  }
}

function movedChunk(player: Player): void {
  if (ChunkEvents.size === 0) return;
  const cache = [];
  const chunks = PlayerUtils.getLoadedChunks(player, SIMULATION_DISTANCE);
  for (const chunk of chunks) {
    const key = Hasher.stringify(chunk);
    if (!key) continue;
    cache.push(key);
    if (loadedChunks.has(key)) continue;
    loadedChunks.add(key);
    const gen = chunk.getDynamicProperty("mcutils:has_generated") ?? false;
    chunk.ensureLoaded().then((loaded) => {
      if (!loaded) return;
      if (!gen) {
        chunk.setDynamicProperty("mcutils:has_generated", true);
      }
      ChunkEvents.playerLoad.apply(new PlayerChunkLoadEvent(chunk, player, !gen));
    });
  }

  const diff = differenceArray(cache, [...loadedChunks]);
  for (const hash of diff) {
    const chunk = Hasher.parseChunk(hash);
    if (!chunk) continue;
    ChunkEvents.playerUnload.apply(new PlayerChunkUnloadEvent(chunk, player));
  }
  loadedChunks = new Set(removeItems([...loadedChunks], diff));
}

function init() {
  system.runInterval(tick);

  world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn) return;
    movedChunk(event.player);
  });

  EntityEvents.moved.subscribe(
    (event) => {
      if (!event.movedChunk) return;
      movedChunk(event.entity as Player);
    },
    { type: "player" },
  );
}

init();
