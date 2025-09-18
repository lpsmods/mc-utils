import { Player } from "@minecraft/server";
import { EntityTickEvent } from "./event/entity";
import { ModalForm, ModalFormHandler, ModalFormOnSubmit } from "./ui/modal_form";
import { Chunk } from "./world/chunk";
import { ParticleDrawer } from "./drawer";
import { PlayerHandler } from "./entity";

let initialized = false;

export interface DeveloperToolsConfig {
  showChunks?: boolean;
  showChunkData?: boolean;
  showPlayerData?: boolean;
  showBlockData?: boolean;
}

// TODO: Use tool class instead of methods.
export abstract class Tool {
  static readonly typeId: string;

  onTick?(event: EntityTickEvent): void;
}

export class ChunkDataTool extends Tool {
  static readonly typeId = "chunk_data";

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const chunk = Chunk.fromEntity(event.entity);
    event.entity.onScreenDisplay.setActionBar({
      text: `§lChunk Data§r\nDimension: ${chunk.dimension.id}\nPosition: ${chunk.x}, ${chunk.z}`,
    });
  }
}

export class PlayerDataTool extends Tool {
  static readonly typeId = "player_data";

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const dim = event.entity.dimension;
    const { x, y, z } = event.entity.location;
    event.entity.onScreenDisplay.setActionBar({
      text: `§lPlayer Data§r\nDimension: ${dim.id}\nPosition: ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`,
    });
  }
}

export class BlockDataTool extends Tool {
  static readonly typeId = "block_data";

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const ray = event.entity.getBlockFromViewDirection({ maxDistance: 7 });
    if (!ray?.block) return;
    const block = ray.block;
    const states = Object.entries(block.permutation.getAllStates())
      .map((v) => `${v[0]}: ${v[1]}`)
      .join("\n ");
    event.entity.onScreenDisplay.setActionBar({
      text: `§lBlock Data§r\nDimension: ${block.dimension.id}\nPosition: ${block.x}, ${block.y}, ${block.z}\nStates:\n ${states}`,
    });
  }
}

// TODO: Make delay per player.
export class DeveloperTools extends PlayerHandler {
  delay: number = 0;
  particleDrawer: ParticleDrawer;
  textDisplayId?: string;
  tools = new Map<string, Tool>();

  constructor(textDisplayId?: string) {
    super();
    this.onTick = this.onTick.bind(this);
    this.particleDrawer = new ParticleDrawer("overworld");
    this.textDisplayId = textDisplayId;
    // this.tools.set(ChunkDataTool.typeId, new ChunkDataTool());
    // this.tools.set(PlayerDataTool.typeId, new PlayerDataTool());
    // this.tools.set(BlockDataTool.typeId, new BlockDataTool());
    if (!initialized) init();
  }

  getDefaultConfig(): DeveloperToolsConfig {
    return {
      showChunks: false,
      showChunkData: false,
      showPlayerData: false,
      showBlockData: false,
    };
  }

  readConfig(player: Player): DeveloperToolsConfig {
    return JSON.parse(player.getDynamicProperty("mcutils:dev_mode") as string) ?? this.getDefaultConfig();
  }

  writeConfig(player: Player, config: DeveloperToolsConfig): void {
    player.setDynamicProperty("mcutils:dev_mode", JSON.stringify(config));
  }

  show(player: Player) {
    const config = this.readConfig(player);
    const modalForm: ModalForm = {
      title: "test",
      options: {
        showChunks: {
          type: "toggle",
          label: "Show Chunks",
          tooltip: "Uses particles to render chunk borders.",
          value: config.showChunks,
        },
        showChunkData: {
          type: "toggle",
          label: "Show Chunk Data",
          tooltip: "Displays chunk data in the action bar.",
          value: config.showChunkData,
        },
        showPlayerData: {
          type: "toggle",
          label: "Show Player Data",
          tooltip: "Displays player data in the action bar.",
          value: config.showPlayerData,
        },
        showBlockData: {
          type: "toggle",
          label: "Show Block Data",
          tooltip: "Displays the facing block data in the action bar.",
          value: config.showBlockData,
        },
      },
      onSubmit: (event: ModalFormOnSubmit) => {
        this.writeConfig(event.player, event.formResult);
        this.update(event.player);
      },
    };
    const ui = new ModalFormHandler(modalForm);
    ui.show(player);
  }

  update(player: Player): void {}

  // Tools

  renderChunks(player: Player): void {
    // const pad = 20;
    // const chunk = Chunk.fromEntity(player);
    // const y = player.location.y;
    // const start = chunk.from;
    // start.y = clampNumber(start.y, y - pad, y + pad);
    // const end = chunk.to;
    // end.y = clampNumber(end.y, y - pad, y + pad);
    // const box = new Box(start, end);
    // box.material = "lpsmods:barrier";
    // this.particleDrawer.addShape(box);
    // this.delay = 20;
  }

  renderChunkData(player: Player): void {
    const chunk = Chunk.fromEntity(player);
    player.onScreenDisplay.setActionBar({
      text: `§lChunk Data§r\nDimension: ${chunk.dimension.id}\nPosition: ${chunk.x}, ${chunk.z}`,
    });
  }

  renderPlayerData(player: Player): void {
    const { x, y, z } = player.location;
    player.onScreenDisplay.setActionBar({
      text: `§lPlayer Data§r\nDimension: ${player.dimension.id}\nPosition: ${x.toFixed(2)}, ${y.toFixed(
        2
      )}, ${z.toFixed(2)}`,
    });
  }

  renderBlockData(player: Player): void {
    const ray = player.getBlockFromViewDirection({ maxDistance: 7 });
    if (!ray?.block) return;
    const block = ray.block;
    const states = Object.entries(block.permutation.getAllStates())
      .map((v) => `${v[0]}: ${v[1]}`)
      .join("\n ");
    player.onScreenDisplay.setActionBar({
      text: `§lBlock Data§r\nDimension: ${block.dimension.id}\nPosition: ${block.x}, ${block.y}, ${block.z}\nStates:\n ${states}`,
    });
  }

  // EVENTS

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const config = this.readConfig(event.entity);
    if (this.delay > 0) {
      this.delay -= 1;
    }

    for (const tool of this.tools.values()) {
      // TODO: Check if enabled.
      if (tool.onTick) this.onTick(event);
    }

    if (config.showChunks && this.delay === 0) this.renderChunks(event.entity);
    if (config.showChunkData) this.renderChunkData(event.entity);
    if (config.showPlayerData) this.renderPlayerData(event.entity);
    if (config.showBlockData) this.renderBlockData(event.entity);
  }
}

function init() {
  initialized = true;

  // const textDisplay = "lpsmods:text_display";
  // ChunkEvents.playerLoad.subscribe((event) => {
  //   const center = event.chunk.getCenter();
  //   center.y = 151;
  //   const entity = event.dimension.spawnEntity(textDisplay, center);
  //   entity.addTag("dev:chunk_data");
  // });

  // ChunkEvents.playerUnload.subscribe((event) => {
  //   const center = event.chunk.getCenter();
  //   center.y = 151;
  //   event.dimension
  //     .getEntities({location: center, maxDistance: 5, closest: 1})
  //     .filter((e) => e.matches({ type: textDisplay }))
  //     .forEach((e) => e.remove());
  // });

  // ChunkEvents.loadedTick.subscribe((event) => {
  //   const center = event.chunk.getCenter();
  //   const entity = event.dimension.getEntities({location: center, maxDistance: 5, closest: 1}).find((e) => e.matches({ type: textDisplay }));
  //   if (!entity) return;
  //   entity.nameTag = "Updated!";
  // });
}
