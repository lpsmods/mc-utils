import { Player } from "@minecraft/server";
import {
  ActionButton,
  ActionForm,
  ActionFormHandler,
  ChunkEvents,
  ChunkTickEvent,
  EntityTickEvent,
  ParticleDrawer,
  PlayerChunkLoadEvent,
  PlayerChunkUnloadEvent,
  PlayerHandler,
} from "@lpsmods/mc-utils";

import { DevTool } from "./tools";

let initialized = false;

export type DeveloperToolsConfig = { [key: string]: boolean };

export class DeveloperTools extends PlayerHandler {
  static instance: DeveloperTools | undefined = undefined;
  delay: number = 0;
  particleDrawer: ParticleDrawer;
  textDisplayId?: string;

  constructor(textDisplayId?: string) {
    super();
    this.onTick = this.onTick.bind(this);
    this.particleDrawer = new ParticleDrawer("overworld");
    this.textDisplayId = textDisplayId;
    if (!initialized) init();
    DeveloperTools.instance = this;
  }

  getDefaultConfig(player: Player): DeveloperToolsConfig {
    const options: DeveloperToolsConfig = {};
    for (const id of DevTool.all.keys()) {
      options[id] = false;
    }
    return options;
  }

  show(player: Player) {
    const buttons: ActionButton[] = [];
    for (const tool of DevTool.all.values()) {
      buttons.push({
        label: tool.options.name ?? tool.id,
        icon: tool.options.icon,
        onClick: () => tool.show(player),
      });
    }

    const actionForm: ActionForm = {
      title: "Developer Tools",
      buttons,
    };
    const ui = new ActionFormHandler(actionForm);
    ui.show(player);
  }

  // EVENTS

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    if (this.delay > 0) {
      this.delay -= 1;
    }

    for (const tool of DevTool.all.values()) {
      if (!tool.isEnabled) continue;
      if (tool.onTick) tool.onTick(event);
    }
  }

  onChunkLoad(event: PlayerChunkLoadEvent): void {
    for (const tool of DevTool.all.values()) {
      if (!tool.isEnabled) continue;
      if (tool.onChunkLoad) tool.onChunkLoad(event);
    }
  }

  onChunkUnload(event: PlayerChunkUnloadEvent): void {
    for (const tool of DevTool.all.values()) {
      if (!tool.isEnabled) continue;
      if (tool.onChunkUnload) tool.onChunkUnload(event);
    }
  }

  onChunkTick(event: ChunkTickEvent): void {
    for (const tool of DevTool.all.values()) {
      if (tool.onChunkTick) tool.onChunkTick(event);
    }
  }
}

function init() {
  initialized = true;

  ChunkEvents.playerLoad.subscribe((event) => {
    if (!DeveloperTools.instance) return;
    DeveloperTools.instance.onChunkLoad(event);
  });

  ChunkEvents.playerUnload.subscribe((event) => {
    if (!DeveloperTools.instance) return;
    DeveloperTools.instance.onChunkUnload(event);
  });

  ChunkEvents.loadedTick.subscribe((event) => {
    if (!DeveloperTools.instance) return;
    DeveloperTools.instance.onChunkTick(event);
  });
}
