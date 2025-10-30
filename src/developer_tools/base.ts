import { Player } from "@minecraft/server";
import { ChunkEvents, ChunkTickEvent, EntityTickEvent, PlayerChunkLoadEvent, PlayerChunkUnloadEvent } from "../event";
import { DataUtils } from "../data";
import { ParticleDrawer } from "../drawer";
import { PlayerHandler } from "../entity";
import { ModalOption, ModalForm, ModalFormOnSubmit, ModalFormHandler } from "../ui";
import { DevTool } from "./tools";

let initialized = false;

export type DeveloperToolConfig = { [key: string]: boolean };

export class DeveloperTools extends PlayerHandler {
  static instances: DeveloperTools[] = [];
  delay: number = 0;
  particleDrawer: ParticleDrawer;
  textDisplayId?: string;

  constructor(textDisplayId?: string) {
    super();
    this.onTick = this.onTick.bind(this);
    this.particleDrawer = new ParticleDrawer("overworld");
    this.textDisplayId = textDisplayId;
    if (!initialized) init();
    DeveloperTools.instances.push(this);
  }

  getDefaultConfig(player: Player): DeveloperToolConfig {
    const options: DeveloperToolConfig = {};
    for (const id of DevTool.all.keys()) {
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
    for (const [id, tool] of DevTool.all.entries()) {
      options[id] = {
        type: "toggle",
        label: tool.options.name ?? `devTool.${tool.id}`,
        tooltip: tool.options.description,
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
    for (const [k, tool] of DevTool.all.entries()) {
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
    for (const [id, tool] of DevTool.all.entries()) {
      if (!config[id]) continue;
      if (tool.onTick) tool.onTick(event);
    }
  }

  onChunkLoad(event: PlayerChunkLoadEvent): void {
    const config = this.readConfig(event.player);
    for (const [id, tool] of DevTool.all.entries()) {
      if (!config[id]) continue;
      if (tool.onChunkLoad) tool.onChunkLoad(event);
    }
  }

  onChunkUnload(event: PlayerChunkUnloadEvent): void {
    const config = this.readConfig(event.player);
    for (const [id, tool] of DevTool.all.entries()) {
      if (!config[id]) continue;
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
