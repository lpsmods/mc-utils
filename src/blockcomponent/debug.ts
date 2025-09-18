import { BlockComponentPlayerInteractEvent, CustomComponentParameters } from "@minecraft/server";
import { BlockBaseComponent } from "./base";
import { AddonUtils } from "../addon";

export class DebugBlockComponent extends BlockBaseComponent {
  static readonly componentId = AddonUtils.makeId("debug");

  constructor() {
    super();
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    if (!event.player) return;
    event.player.sendMessage(JSON.stringify(event.block.permutation.getAllStates(), null, 2));
  }
}
