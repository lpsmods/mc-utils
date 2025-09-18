import { world } from "@minecraft/server";
import { SphereAreaDetector, RectangleAreaDetector } from "./area_detector";
import { AreaEnterEvent, AreaLeaveEvent } from "./event";

class RedArea extends RectangleAreaDetector {
  constructor() {
    super({ x: 27, y: 130, z: 21 }, { x: 34, y: 123, z: 28 });
  }
  onEnter(event: AreaEnterEvent): void {
    world.sendMessage(`§cEnter ${this.areaId}`);
    this.show();
  }
  onLeave(event: AreaLeaveEvent): void {
    world.sendMessage(`§cLeave ${this.areaId}`);
  }
}

class LimeArea extends RectangleAreaDetector {
  constructor() {
    super({ x: 18, y: 130, z: 21 }, { x: 25, y: 123, z: 28 });
  }
  onEnter(event: AreaEnterEvent): void {
    world.sendMessage(`§aEnter ${this.areaId}`);
    this.show();
  }
  onLeave(event: AreaLeaveEvent): void {
    world.sendMessage(`§aLeave ${this.areaId}`);
  }
}

class PurpleArea extends SphereAreaDetector {
  constructor() {
    super({ x: 26.5, y: 124, z: 33.5 }, 3);
  }
  onEnter(event: AreaEnterEvent): void {
    world.sendMessage(`§5Enter ${this.areaId}`);
    this.show();
  }
  onLeave(event: AreaLeaveEvent): void {
    world.sendMessage(`§5Leave ${this.areaId}`);
  }
}

export default () => {
  const red = new RedArea();
  const lime = new LimeArea();
  const purple = new PurpleArea();
};
