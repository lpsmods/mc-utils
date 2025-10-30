import { Vector3Utils } from "@minecraft/math";
import { Player } from "@minecraft/server";
import { EntityTickEvent, PlayerChunkLoadEvent, PlayerChunkUnloadEvent, ChunkTickEvent } from "../event";
import { Identifier } from "../identifier";
import { Hasher } from "../type";
import { DirectionUtils } from "../utils/direction";

export interface DevToolOptions {
  name?: string;
  description?: string;
}

export abstract class DevTool {
  static all = new Map<string, DevTool>();

  readonly id: string;
  options: DevToolOptions;

  constructor(id: string, options?: DevToolOptions) {
    this.id = id;
    this.options = options ?? {};
    DevTool.all.set(id, this);
  }

  onTick?(event: EntityTickEvent): void;

  onChunkLoad?(event: PlayerChunkLoadEvent): void;

  onChunkUnload?(event: PlayerChunkUnloadEvent): void;

  onChunkTick?(event: ChunkTickEvent): void;

  onEnable?(player: Player): void;

  onDisable?(player: Player): void;
}

export class ChunkDataTool extends DevTool {
  static readonly toolId = "chunk_data";

  // @ts-ignore:
  shapes = new Map<string, debug.DebugText>();

  constructor() {
    super(ChunkDataTool.toolId, {
      name: "Show Chunk Data",
      description: "Displays chunk data. like; position, and dimension.",
    });
    this.onChunkLoad = this.onChunkLoad.bind(this);
    this.onChunkUnload = this.onChunkUnload.bind(this);
    this.onChunkTick = this.onChunkTick.bind(this);
  }

  onChunkLoad(event: PlayerChunkLoadEvent): void {
    const center = event.chunk.getCenter();
    center.y = 130;
    // @ts-ignore:
    const shape = new debug.DebugText(center, "Loading...");
    // @ts-ignore:
    debug.debugDrawer.addShape(shape);

    this.shapes.set(`${event.chunk.x},${event.chunk.z}`, shape);
  }

  onChunkUnload(event: PlayerChunkUnloadEvent): void {
    const shape = this.shapes.get(`${event.chunk.x},${event.chunk.z}`);
    if (!shape) return;
    shape.remove();
  }

  onChunkTick(event: ChunkTickEvent): void {
    const { x, z } = event.chunk;
    const shape = this.shapes.get(`${x},${z}`);
    if (!shape) return;
    shape.text = `§lChunk Data§r\n${x}, ${z}\n${Identifier.parse(event.chunk.dimension.id).path}`;
  }

  onDisable(player: Player): void {
    this.shapes.forEach((shape) => shape.remove());
  }
}

export class BlockDataTool extends DevTool {
  static readonly toolId = "block_data";
  // @ts-ignore:
  shapes = new Map<string, debug.DebugShape>();
  lastBlock = new Map<string, string>();

  constructor() {
    super(BlockDataTool.toolId, {
      name: "Show Block Data",
      description: "Displays the facing block data in the action bar.",
    });
  }

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const id = event.entity.id;
    const ray = event.entity.getBlockFromViewDirection({ maxDistance: 7 });
    if (!ray?.block) {
      if (this.shapes.has(id)) {
        this.shapes.get(id).remove();
      }
      return;
    }

    // Remove last text
    const lastBlock = this.lastBlock.get(id);
    const hash = Hasher.hashBlock(ray.block);
    if (lastBlock != hash) {
      this.shapes.get(id)?.remove();
      this.lastBlock.set(id, hash);

      const pos = Vector3Utils.add(ray.block.location, { x: 0.5, y: 2, z: 0.5 });
      // @ts-ignore:
      const shape = new debug.DebugText(pos, "Loading...");
      // @ts-ignore:
      debug.debugDrawer.addShape(shape);
      this.shapes.set(id, shape);
    }

    const shape = this.shapes.get(id);
    if (!shape) return;

    const block = ray.block;
    const states = Object.entries(block.permutation.getAllStates())
      .map((v) => `${v[0]}: ${v[1]}`)
      .join("\n ");
    const dimId = Identifier.parse(block.dimension.id).path;
    shape.text = `§lBlock Data§r\n${dimId}\n${block.x}, ${block.y}, ${block.z}\n${states}`;
  }

  onDisable(player: Player): void {
    for (const shape of this.shapes.values()) {
      shape.remove();
    }
    this.lastBlock.clear();
  }
}

export class PlayerDataTool extends DevTool {
  static readonly toolId = "player_data";

  constructor() {
    super(PlayerDataTool.toolId, { name: "Show Player Data", description: "Displays player data in the action bar." });
  }

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const dim = event.entity.dimension;
    const { x, y, z } = event.entity.location;
    const rot = event.entity.getRotation();
    const dir = DirectionUtils.rot2dir(rot);
    const d = dim.id.replace("minecraft:", "");
    const b = dim.getBiome({ x, y, z }).id.replace("minecraft:", "");
    event.entity.onScreenDisplay.setActionBar({
      text: `§lPlayer Data§r\nDimension: ${d}\nBiome: ${b}\nPosition: ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(
        2,
      )}\nRotation: ${rot.x.toFixed(2)} ${rot.y.toFixed(2)}\nFacing Direction: ${dir}`,
    });
  }
}

// Initialize tools
// new ChunkDataTool();
// new BlockDataTool();
new PlayerDataTool();
