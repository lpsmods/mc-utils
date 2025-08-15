import { Player } from "@minecraft/server";
import { EntityHandler } from "../entity/EntityHandler";
import { EntityTickEvent } from "../event/entity";
import { ModalForm, ModalFormHandler, ModalFormOnSubmit } from "../ui/ModalForm";
import { Chunk } from "../world/Chunk";
import { ParticleDrawer } from "./Drawer";
import { Box } from "./Shape";
import { MathUtils } from "../MathUtils";

export interface DeveloperToolsConfig {
  showChunks?: boolean;
}

// TODO: Make delay per player.
export class DeveloperTools extends EntityHandler {
  delay: number = 0;

  constructor() {
    super({ type: "player" });
    this.onTick = this.onTick.bind(this);
  }
  
  getDefaultConfig(): DeveloperToolsConfig {
    return {
      showChunks: false,
    };
  }

  readConfig(player: Player): DeveloperToolsConfig {
    return (
      JSON.parse(player.getDynamicProperty("mcutils:dev_mode") as string) ?? this.getDefaultConfig()
    );
  }

  writeConfig(player: Player, config: DeveloperToolsConfig): void {
    player.setDynamicProperty("mcutils:dev_mode", JSON.stringify(config));
  }

  show(player: Player) {
    const config = this.readConfig(player);
    const modalForm: ModalForm = {
      title: "test",
      options: {
        showChunks: { type: "toggle", label: "Show Chunks", value: config.showChunks },
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

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const config = this.readConfig(event.entity);
    if (this.delay > 0) {
        this.delay -=1;
    }
    if (config.showChunks && this.delay === 0) this.renderChunks(event.entity);
  }

  // Tools

  renderChunks(player: Player): void {
    const pad = 20;
    const chunk = Chunk.fromEntity(player);
    const y = player.location.y;
    const start = chunk.from;
    start.y = MathUtils.clamp(start.y, y-pad, y+pad);
    const end = chunk.to;
    end.y = MathUtils.clamp(end.y, y-pad, y+pad);
    const box = new Box(start, end);
    box.material = 'lpsmods:barrier';
    const drawing = new ParticleDrawer(player.dimension);
    drawing.addShape(box);
    this.delay = 20;
  }
}
