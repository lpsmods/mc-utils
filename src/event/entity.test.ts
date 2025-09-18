import { Player } from "@minecraft/server";
import { EntityEvents } from "./entity";

export default () => {
  // EntityEvents.tick.subscribe((event) => {
  //   if (!(event.entity instanceof Player)) return;
  //   event.entity.onScreenDisplay.setActionBar("TICK");
  // }, {'type': "player"});

  EntityEvents.enterBlock.subscribe((event) => {
    if (event.sameType) return;
    console.warn("ENTER "+event.block.typeId);
  });
  EntityEvents.leaveBlock.subscribe((event) => {
    if (event.sameType) return;
    console.warn("LEAVE"+event.block.typeId);
  });
  EntityEvents.inBlockTick.subscribe((event) => {
    if (!(event.entity instanceof Player)) return;
    event.entity.onScreenDisplay.setActionBar("IN BLOCK TICK");
  });
};
