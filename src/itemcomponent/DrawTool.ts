import {
  BlockPermutation,
  CustomComponentParameters,
  ItemComponentUseEvent,
  ItemComponentUseOnEvent,
  ItemStack,
  Player,
  Vector3,
} from "@minecraft/server";
import { BlockDrawer } from "../misc/Drawer";
import { Vector3Utils } from "@minecraft/math";
import { nextItem } from "../utils";
import { TextUtils } from "../TextUtils";

export interface DrawToolOptions {
  shapes?: string[];
  initial_shape?: string;
}

export class DrawToolComponent {
  static typeId = "mcutils:draw_tool";

  constructor() {
    this.onUse = this.onUse.bind(this);
    this.onUseOn = this.onUseOn.bind(this);
  }

  draw(
    ctx: BlockDrawer,
    pos: Vector3,
    block: BlockPermutation | string,
    options: DrawToolOptions
  ): void {
    let start;
    let end;
    switch ((options.initial_shape ?? "line").toLowerCase()) {
      case "line":
        start = pos;
        end = Vector3Utils.add(pos, { x: 10, y: 10, z: 10 });
        return ctx.drawLine(start, end, block);
      case "point":
        return ctx.drawPoint(pos, block, 1);
      case "ray":
        return ctx.drawRay(pos, { x: 0, y: 10, z: 10 }, 3, block);
      case "triangle":
        const a = { x: 10, y: 144, z: 10 };
        const b = { x: 20, y: 144, z: 10 };
        const c = { x: 15, y: 144, z: 20 };
        return ctx.drawTriangle(a, b, c, block, "glass");
      case "rect":
        start = pos;
        end = Vector3Utils.add(pos, { x: 10, y: 10, z: 10 });
        return ctx.drawRect(start, end, block, "glass");
      case "sphere":
        return ctx.drawSphere(pos, 5, block);
      case "cylinder":
        return;
      case "circle":
        return;
      case "pyramid":
        return;
      case "grid":
        return;
      case "plane":
        return;
      case "arrow":
        return;
      case "text3d":
        return;
      case "path":
        return;
      case "spline":
        return;
      case "axes":
        return;
      case "cone":
        return;
      case "capsule":
        return;
      case "frustum":
        return;
    }
  }

  getSelectedShape(player: Player, itemStack: ItemStack, options: DrawToolOptions): string {
    return (
      (player.getDynamicProperty(`mcutils:${itemStack.typeId}.shape`) as string) ??
      options.initial_shape
    );
  }

  setSelectedShape(player: Player, itemStack: ItemStack, shape: string): void {
    return player.setDynamicProperty(`mcutils:${itemStack.typeId}.shape`, shape);
  }

  // EVENTS

  onUse(event: ItemComponentUseEvent, args: CustomComponentParameters): void {
    if (!event.itemStack) return;
    const options = args.params as DrawToolOptions;
    const shape = this.getSelectedShape(event.source, event.itemStack, options);
    if (event.source.isSneaking) {
      const next = nextItem(options.shapes ?? [], shape);
      if (!next) return;
      const name = TextUtils.toTitleCase(next.replace('_', ' '));
      event.source.onScreenDisplay.setActionBar(`Shape: ${ name }`);
      return this.setSelectedShape(event.source, event.itemStack, next);
    }
  }

  onUseOn(event: ItemComponentUseOnEvent, args: CustomComponentParameters): void {
    const options = args.params as DrawToolOptions;
    if (!(event.source instanceof Player)) return;
    const ctx = new BlockDrawer(event.source.dimension);
    const above = event.block.above();
    if (!above) return;
    this.draw(ctx, above.location, 'tinted_glass', options);
  }
}
