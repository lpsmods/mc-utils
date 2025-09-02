import { ItemStack, PlayerSpawnAfterEvent, world } from "@minecraft/server";
import { InfoBookComponent, Pages } from "./info_book";
import { ItemUtils } from "../item/utils";

export class GuideBookComponent extends InfoBookComponent {
  constructor(pages: Pages) {
    super(pages);
  }

  static setup(guideBookName: string): void {
    world.afterEvents.playerSpawn.subscribe((event: PlayerSpawnAfterEvent) => {
      if (!event.initialSpawn) return;
      const bl =
        (event.player.getDynamicProperty(guideBookName) as boolean) ?? false;
      if (bl) return;
      const stack = new ItemStack(guideBookName);
      stack.keepOnDeath = true;
      ItemUtils.give(event.player, stack);
      event.player.setDynamicProperty(guideBookName, true);
    });
  }
}
