import { Player } from "@minecraft/server";
import { EntityTickEvent } from "./event/entity";
import { ModalForm, ModalFormHandler, ModalFormOnSubmit, ModalOption } from "./ui/modal_form";
import { ParticleDrawer } from "./drawer";
import { PlayerHandler } from "./entity";
import { ChunkEvents, ChunkTickEvent, PlayerChunkLoadEvent, PlayerChunkUnloadEvent } from "./event";
import { Identifier } from "./identifier";
import { Hasher } from "./type";
import { Vector3Utils } from "@minecraft/math";
import { DataUtils } from "./data";
import { WorldUtils } from "./world";

// import * as debug from "@minecraft/debug-utilities";

let initialized = false;

export abstract class Tool {
  static readonly toolId: string;

  name: string;
  description?: string;

  constructor(name: string, description?: string) {
    this.name = name;
    this.description = description;
  }

  onTick?(event: EntityTickEvent): void;

  onChunkLoad?(event: PlayerChunkLoadEvent): void;

  onChunkUnload?(event: PlayerChunkUnloadEvent): void;

  onChunkTick?(event: ChunkTickEvent): void;

  onEnable?(player: Player): void;

  onDisable?(player: Player): void;
}

export class ChunkDataTool extends Tool {
  static readonly toolId = "chunk_data";

  // @ts-ignore:
  shapes = new Map<string, debug.DebugText>();

  constructor() {
    super("Show Chunk Data", "Displays chunk data. like; position, and dimension.");
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

export class BlockDataTool extends Tool {
  static readonly toolId = "block_data";
  // @ts-ignore:
  shapes = new Map<string, debug.DebugShape>();
  lastBlock = new Map<string, string>();

  constructor() {
    super("Show Block Data", "Displays the facing block data in the action bar.");
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

export class PlayerDataTool extends Tool {
  static readonly toolId = "player_data";

  constructor() {
    super("Show Player Data", "Displays player data in the action bar.");
  }

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const dim = event.entity.dimension;
    const { x, y, z } = event.entity.location;
    const rot = event.entity.getRotation();
    const dir = WorldUtils.rot2dir(rot);
    const d = Identifier.parse(dim.id).path;
    event.entity.onScreenDisplay.setActionBar({
      text: `§lPlayer Data§r\nDimension: ${d}\nPosition: ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(
        2
      )}\nRotation: ${rot.x.toFixed(2)} ${rot.y.toFixed(2)}\nFacing Direction: ${dir}`,
    });
  }
}

export type DeveloperToolConfig = { [key: string]: boolean };

export class DeveloperTools extends PlayerHandler {
  static instances: DeveloperTools[] = [];
  delay: number = 0;
  particleDrawer: ParticleDrawer;
  textDisplayId?: string;
  tools = new Map<string, Tool>();

  constructor(textDisplayId?: string) {
    super();
    this.onTick = this.onTick.bind(this);
    this.particleDrawer = new ParticleDrawer("overworld");
    this.textDisplayId = textDisplayId;
    // this.tools.set(ChunkDataTool.toolId, new ChunkDataTool());
    // this.tools.set(BlockDataTool.toolId, new BlockDataTool());
    this.tools.set(PlayerDataTool.toolId, new PlayerDataTool());
    if (!initialized) init();
    DeveloperTools.instances.push(this);
  }

  /**
   * Register a new tool.
   * @param {string} identifier
   * @param {Tool} tool
   * @returns {DeveloperTools}
   */
  addTool(identifier: string, tool: Tool): DeveloperTools {
    this.tools.set(identifier, tool);
    return this;
  }

  getDefaultConfig(player: Player): DeveloperToolConfig {
    const options: DeveloperToolConfig = {};
    for (const id of this.tools.keys()) {
      options[id] = false;
    }
    return options;
  }

  readConfig(player: Player): DeveloperToolConfig {
    return DataUtils.getDynamicProperty(player, "mcutils:dev_tools", this.getDefaultConfig(player));
  }

  writeConfig(player: Player, config: DeveloperToolConfig): void {
    this.update(player, config);
    DataUtils.setDynamicProperty(player, "mcutils:dev_tools", config);
  }

  show(player: Player) {
    const config = this.readConfig(player);
    const options: { [key: string]: ModalOption } = {};
    for (const [id, tool] of this.tools.entries()) {
      options[id] = {
        type: "toggle",
        label: tool.name,
        tooltip: tool.description,
        value: (config[id] as boolean) ?? false,
      };
    }

    const modalForm: ModalForm = {
      title: "test",
      options: options,
      onSubmit: (event: ModalFormOnSubmit) => {
        this.writeConfig(event.player, event.formResult as {});
      },
    };
    const ui = new ModalFormHandler(modalForm);
    ui.show(player);
  }

  update(player: Player, config: DeveloperToolConfig): void {
    const oldConfig = this.readConfig(player);
    for (const [k, tool] of this.tools.entries()) {
      if (config[k] != oldConfig[k]) {
        if (config[k]) {
          if (tool.onEnable) tool.onEnable(player);
          continue;
        }
        if (tool.onDisable) tool.onDisable(player);
      }
    }
  }

  // EVENTS

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    if (this.delay > 0) {
      this.delay -= 1;
    }

    const config = this.readConfig(event.entity);
    for (const [id, tool] of this.tools.entries()) {
      if (!config[id]) continue;
      if (tool.onTick) tool.onTick(event);
    }
  }

  onChunkLoad(event: PlayerChunkLoadEvent): void {
    const config = this.readConfig(event.player);
    for (const [id, tool] of this.tools.entries()) {
      if (!config[id]) continue;
      if (tool.onChunkLoad) tool.onChunkLoad(event);
    }
  }

  onChunkUnload(event: PlayerChunkUnloadEvent): void {
    const config = this.readConfig(event.player);
    for (const [id, tool] of this.tools.entries()) {
      if (!config[id]) continue;
      if (tool.onChunkUnload) tool.onChunkUnload(event);
    }
  }

  onChunkTick(event: ChunkTickEvent): void {
    for (const tool of this.tools.values()) {
      if (tool.onChunkTick) tool.onChunkTick(event);
    }
  }
}

function init() {
  initialized = true;

  ChunkEvents.playerLoad.subscribe((event) => {
    for (const dev of DeveloperTools.instances) {
      dev.onChunkLoad(event);
    }
  });

  ChunkEvents.playerUnload.subscribe((event) => {
    for (const dev of DeveloperTools.instances) {
      dev.onChunkUnload(event);
    }
  });

  ChunkEvents.loadedTick.subscribe((event) => {
    for (const dev of DeveloperTools.instances) {
      dev.onChunkTick(event);
    }
  });
}
