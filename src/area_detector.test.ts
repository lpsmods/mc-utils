import { Direction, Player, world } from "@minecraft/server";
import { SphereAreaDetector, RectangleAreaDetector, GatewayAreaDetector } from "./area_detector";
import { AreaEnterEvent, AreaLeaveEvent, AreaTickEvent } from "./event";

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
  onTick(event: AreaTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    event.entity.onScreenDisplay.setActionBar({ text: `§cTick ${this.areaId}` });
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
  onTick(event: AreaTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    event.entity.onScreenDisplay.setActionBar({ text: `§aTick ${this.areaId}` });
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

  onTick(event: AreaTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    event.entity.onScreenDisplay.setActionBar({ text: `§5Tick ${this.areaId}` });
  }
}

class OrangeArea extends GatewayAreaDetector {
  constructor() {
    super();
    this.addGateway({ x: 52, y: 118, z: 42 }, { x: 52, y: 125, z: 45 }, Direction.West);
    this.addGateway({ x: 43, y: 118, z: 50 }, { x: 46, y: 125, z: 50 }, Direction.North);
    this.addGateway({ x: 46, y: 117, z: 45 }, { x: 43, y: 117, z: 42 }, Direction.Up);
  }
  onEnter(event: AreaEnterEvent): void {
    world.sendMessage(`§vEnter ${this.areaId}`);
    this.show();
  }
  onLeave(event: AreaLeaveEvent): void {
    world.sendMessage(`§vLeave ${this.areaId}`);
  }
  onTick(event: AreaTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    event.entity.onScreenDisplay.setActionBar({ text: `§vTick ${this.areaId}` });
  }
}

export default () => {
  const red = new RedArea();
  const lime = new LimeArea();
  const purple = new PurpleArea();
  const orange = new OrangeArea();
};
