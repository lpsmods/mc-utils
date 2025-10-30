import {
  EntityQueryOptions,
  PlayerInteractWithEntityAfterEvent,
  system,
  EntitySpawnAfterEvent,
  Entity,
} from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { EntityHandler } from "./entity_handler";
import { Vector3Utils } from "@minecraft/math";
import { TextUtils } from "../utils/text";

export class TextDisplayHandler extends EntityHandler {
  constructor(options: EntityQueryOptions) {
    super(options);
    this.onInteract = this.onInteract.bind(this);
    this.onSpawn = this.onSpawn.bind(this);
  }

  onInteract(event: PlayerInteractWithEntityAfterEvent): void {
    if (event.player.isSneaking || event.target.hasTag("locked")) return;
    system.run(() => this.show.bind(this)(event));
  }

  onSpawn(event: EntitySpawnAfterEvent): void {
    if (event.entity.nameTag !== "") return;
    event.entity.nameTag = "Text Display";
  }

  show(event: PlayerInteractWithEntityAfterEvent): void {
    const ui = new ActionFormData();
    ui.title("Text Display");
    ui.button("Rename", "textures/items/name_tag.png");
    ui.button("Center", "textures/ui/down_arrow.png");
    ui.button("§cLock", "textures/ui/lock_color.png");
    ui.button("§cRemove", "textures/ui/icon_trash.png");
    ui.show(event.player).then((res) => {
      switch (res.selection) {
        case 0:
          return this.rename(event);
        case 1:
          return this.center(event.target);
        case 2:
          return this.lock(event.target);
        case 3:
          return event.target.remove();
      }
    });
  }

  private rename(event: PlayerInteractWithEntityAfterEvent): void {
    const ui = new ModalFormData();
    ui.title("Rename");
    ui.textField("Name", "", { defaultValue: event.target.nameTag });
    ui.submitButton("Save");
    ui.show(event.player).then((res) => {
      const value = res.formValues?.toString();
      if (!value) return;
      event.target.nameTag = TextUtils.renderMarkdown(value).toString();
    });
  }

  private center(entity: Entity): void {
    const pos = Vector3Utils.floor(entity.location);
    pos.x += 0.5;
    pos.z += 0.5;
    entity.teleport(pos);
  }

  private lock(entity: Entity): void {
    entity.addTag("locked");
  }
}
