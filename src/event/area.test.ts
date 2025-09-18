import { Player } from "@minecraft/server";
import { AreaEvents } from "./area";

export default () => {
  AreaEvents.entityEnter.subscribe((event) => {
    console.warn("ENTER " + event.area.id);
  });
  AreaEvents.entityLeave.subscribe((event) => {
    console.warn("LEAVE " + event.area.id);
  });
  AreaEvents.entityTick.subscribe((event) => {
    if (!(event.entity instanceof Player)) return;
    event.entity.onScreenDisplay.setActionBar("AREA TICK " + event.area.id);
  });
};
