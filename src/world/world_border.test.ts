import { Player } from "@minecraft/server";
import { WorldBorder } from "./world_border";
import { VECTOR2_ZERO } from "@minecraft/math";

class Border extends WorldBorder {
  constructor() {
    super(VECTOR2_ZERO, 50, 50, {
      canBreakBlocks: false,
      canPlaceBlocks: false,
    });
    this.onOutside = this.onOutside.bind(this);
  }

  onOutside(player: Player): void {
    player.sendMessage("Outside border!");
    player.teleport({ x: this.center.x + 0.5, y: 123, z: this.center.y + 0.5 });
  }
}

export default () => {
  const worldBorder = new Border();
};
