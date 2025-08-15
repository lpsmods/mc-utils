import { Vector3Utils } from "@minecraft/math";
import { Dimension, Vector3, BlockPermutation } from "@minecraft/server";

// TODO: Add all drawing methods.
export abstract class Drawer {
  dimension: Dimension;

  constructor(dimension: Dimension) {
    this.dimension = dimension;
  }

  drawPoint(position: Vector3, callback: (pos: Vector3) => void, size: number = 1): void {
    const r = Math.floor(size / 2);
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dz = -r; dz <= r; dz++) {
          const target = {
            x: position.x + dx,
            y: position.y + dy,
            z: position.z + dz,
          };
          callback(target);
        }
      }
    }
  }

  drawLine(
    start: Vector3,
    end: Vector3,
    callback: (pos: Vector3) => void,
    thickness?: number
  ): void {
    const x1 = Math.floor(start.x),
      y1 = Math.floor(start.y),
      z1 = Math.floor(start.z);
    const x2 = Math.floor(end.x),
      y2 = Math.floor(end.y),
      z2 = Math.floor(end.z);

    const dx = Math.abs(x2 - x1),
      dy = Math.abs(y2 - y1),
      dz = Math.abs(z2 - z1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    const sz = z1 < z2 ? 1 : -1;

    let err1, err2;

    let x = x1,
      y = y1,
      z = z1;

    if (dx >= dy && dx >= dz) {
      err1 = dy - dx / 2;
      err2 = dz - dx / 2;
      while (x !== x2) {
        this.drawPoint({ x: x, y: y, z: z }, callback, thickness);
        if (err1 >= 0) {
          y += sy;
          err1 -= dx;
        }
        if (err2 >= 0) {
          z += sz;
          err2 -= dx;
        }
        err1 += dy;
        err2 += dz;
        x += sx;
      }
    } else if (dy >= dx && dy >= dz) {
      err1 = dx - dy / 2;
      err2 = dz - dy / 2;
      while (y !== y2) {
        this.drawPoint({ x: x, y: y, z: z }, callback, thickness);
        if (err1 >= 0) {
          x += sx;
          err1 -= dy;
        }
        if (err2 >= 0) {
          z += sz;
          err2 -= dy;
        }
        err1 += dx;
        err2 += dz;
        y += sy;
      }
    } else {
      err1 = dx - dz / 2;
      err2 = dy - dz / 2;
      while (z !== z2) {
        this.drawPoint({ x: x, y: y, z: z }, callback, thickness);
        if (err1 >= 0) {
          x += sx;
          err1 -= dz;
        }
        if (err2 >= 0) {
          y += sy;
          err2 -= dz;
        }
        err1 += dx;
        err2 += dy;
        z += sz;
      }
    }

    this.drawPoint({ x: x2, y: y2, z: z2 }, callback, thickness); // final point
  }

  drawRay(
    origin: Vector3,
    direction: Vector3,
    length: number,
    callback: (pos: Vector3) => void
  ): void {
    const norm = Vector3Utils.normalize(direction);
    if (!norm) return;
    for (let i = 0; i <= length; i++) {
      const x = Math.floor(origin.x + norm.x * i);
      const y = Math.floor(origin.y + norm.y * i);
      const z = Math.floor(origin.z + norm.z * i);
      this.drawPoint({ x, y, z }, callback);
    }
  }

  #fillTriangle(a: Vector3, b: Vector3, c: Vector3, callback: (pos: Vector3) => void): void {
    const y = Math.floor(a.y);

    const points = [a, b, c].map((p) => ({ x: p.x, z: p.z }));

    const minX = Math.floor(Math.min(...points.map((p) => p.x)));
    const maxX = Math.ceil(Math.max(...points.map((p) => p.x)));
    const minZ = Math.floor(Math.min(...points.map((p) => p.z)));
    const maxZ = Math.ceil(Math.max(...points.map((p) => p.z)));

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (this.#pointInTriangle({ x, z }, points[0], points[1], points[2])) {
          this.drawPoint({ x, y, z }, callback);
        }
      }
    }
  }

  #pointInTriangle(
    p: { x: number; z: number },
    a: { x: number; z: number },
    b: { x: number; z: number },
    c: { x: number; z: number }
  ): boolean {
    const area = 0.5 * (-b.z * c.x + a.z * (-b.x + c.x) + a.x * (b.z - c.z) + b.x * c.z);
    const s = (1 / (2 * area)) * (a.z * c.x - a.x * c.z + (c.z - a.z) * p.x + (a.x - c.x) * p.z);
    const t = (1 / (2 * area)) * (a.x * b.z - a.z * b.x + (a.z - b.z) * p.x + (b.x - a.x) * p.z);
    const u = 1 - s - t;
    return s >= 0 && t >= 0 && u >= 0;
  }

  drawTriangle(
    a: Vector3,
    b: Vector3,
    c: Vector3,
    callback: (pos: Vector3) => void,
    insideCallback: (pos: Vector3) => void
  ): void {
    this.drawLine(a, b, callback);
    this.drawLine(b, c, callback);
    this.drawLine(c, a, callback);

    if (insideCallback !== undefined) {
      this.#fillTriangle(a, b, c, insideCallback);
    }
  }

  drawRect(
    start: Vector3,
    end: Vector3,
    callback: (pos: Vector3) => void,
    insideCallback: (pos: Vector3) => void
  ): void {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    const minZ = Math.min(start.z, end.z);
    const maxZ = Math.max(start.z, end.z);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const isEdge =
            x === minX || x === maxX || y === minY || y === maxY || z === minZ || z === maxZ;

          const func = isEdge ? callback : insideCallback;
          if (func === undefined) continue;
          this.drawPoint({ x, y, z }, func);
        }
      }
    }
  }

  drawSphere(
    center: Vector3,
    radius: number,
    callback: (pos: Vector3) => void,
    detail: number = 1
  ): void {
    const rSquared = radius * radius;

    const minX = Math.floor(center.x - radius);
    const maxX = Math.ceil(center.x + radius);
    const minY = Math.floor(center.y - radius);
    const maxY = Math.ceil(center.y + radius);
    const minZ = Math.floor(center.z - radius);
    const maxZ = Math.ceil(center.z + radius);

    for (let x = minX; x <= maxX; x += detail) {
      for (let y = minY; y <= maxY; y += detail) {
        for (let z = minZ; z <= maxZ; z += detail) {
          const dx = x - center.x;
          const dy = y - center.y;
          const dz = z - center.z;

          if (dx * dx + dy * dy + dz * dz <= rSquared) {
            this.drawPoint({ x, y, z }, callback);
          }
        }
      }
    }
  }

  drawWireframe(start: Vector3, end: Vector3, callback: (pos: Vector3) => void): void {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    const minZ = Math.min(start.z, end.z);
    const maxZ = Math.max(start.z, end.z);

    const place = (x: number, y: number, z: number) => {
      callback({ x, y, z });
    };

    // 12 Edges of a box
    for (let x = minX; x <= maxX; x++) {
      place(x, minY, minZ);
      place(x, minY, maxZ);
      place(x, maxY, minZ);
      place(x, maxY, maxZ);
    }

    for (let y = minY; y <= maxY; y++) {
      place(minX, y, minZ);
      place(minX, y, maxZ);
      place(maxX, y, minZ);
      place(maxX, y, maxZ);
    }

    for (let z = minZ; z <= maxZ; z++) {
      place(minX, minY, z);
      place(minX, maxY, z);
      place(maxX, minY, z);
      place(maxX, maxY, z);
    }
  }

  // drawCylinder(
  //   base: Vector3,
  //   height: number,
  //   radius: number,
  //   axis: "x" | "y" | "z",
  //   block: BlockPermutation | string
  // ): void {}

  // drawCircle(
  //   center: Vector3,
  //   normal: Vector3,
  //   radius: number,
  //   segments: number,
  //   block: BlockPermutation | string
  // ): void {}

  // drawPyramid(
  //   baseCenter: Vector3,
  //   height: number,
  //   baseSize: number,
  //   block: BlockPermutation | string
  // ): void {}

  // drawGrid(
  //   center: Vector3,
  //   size: Vector2,
  //   spacing: number,
  //   normal: Vector3,
  //   block: BlockPermutation | string
  // ): void {}

  // drawPlane(
  //   origin: Vector3,
  //   normal: Vector3,
  //   size: number,
  //   block: BlockPermutation | string
  // ): void {}

  // drawArrow(
  //   start: Vector3,
  //   direction: Vector3,
  //   length: number,
  //   block: BlockPermutation | string
  // ): void {}

  // drawText3D(
  //   position: Vector3,
  //   text: string,
  //   block: BlockPermutation | string,
  //   size?: number
  // ): void {}

  // drawPath(points: Vector3[], block: BlockPermutation | string, closed?: boolean): void {}

  // drawSpline(points: Vector3[], resolution: number, block: BlockPermutation | string): void {}

  // drawAxes(origin: Vector3, block: BlockPermutation | string, scale: number = 1): void {}

  // drawCone(base: Vector3, tip: Vector3, radius: number, block: BlockPermutation | string): void {}

  // drawCapsule(
  //   start: Vector3,
  //   end: Vector3,
  //   radius: number,
  //   block: BlockPermutation | string
  // ): void {}

  // drawFrustum(viewProjectionMatrix: any, block: BlockPermutation | string): void {}
}

export class BlockDrawer extends Drawer {
  setBlock(location: Vector3, block: BlockPermutation | string | undefined): void {
    if (!block) return;
    if (block instanceof BlockPermutation) {
      this.dimension.setBlockPermutation(location, block);
      return;
    }
    this.dimension.setBlockType(location, block);
  }

  drawPoint(position: Vector3, block: BlockPermutation | string, size: number = 1): void {
    super.drawPoint(position, (pos) => this.setBlock(pos, block), size);
  }

  drawLine(
    start: Vector3,
    end: Vector3,
    block: BlockPermutation | string,
    thickness?: number
  ): void {
    super.drawLine(start, end, (pos) => this.setBlock(pos, block), thickness);
  }

  drawRay(
    origin: Vector3,
    direction: Vector3,
    length: number,
    block: BlockPermutation | string
  ): void {
    super.drawRay(origin, direction, length, (pos) => this.setBlock(pos, block));
  }

  drawTriangle(
    a: Vector3,
    b: Vector3,
    c: Vector3,
    block: BlockPermutation | string,
    fillBlock?: BlockPermutation | string
  ): void {
    super.drawTriangle(
      a,
      b,
      c,
      (pos) => this.setBlock(pos, block),
      (pos) => this.setBlock(pos, fillBlock)
    );
  }

  drawRect(
    start: Vector3,
    end: Vector3,
    block: BlockPermutation | string,
    fillBlock?: BlockPermutation | string
  ): void {
    super.drawRect(
      start,
      end,
      (pos) => this.setBlock(pos, block),
      (pos) => this.setBlock(pos, fillBlock)
    );
  }

  drawSphere(
    center: Vector3,
    radius: number,
    block: BlockPermutation | string,
    detail: number = 1
  ): void {
    super.drawSphere(center, radius, (pos) => this.setBlock(pos, block), detail);
  }

  drawWireframe(start: Vector3, end: Vector3, block: BlockPermutation | string): void {
    super.drawWireframe(start, end, (pos) => this.setBlock(pos, block));
  }

  // TODO:
  drawHelicalLine(
    dimension,
    start,
    end,
    blockType = "red_wool",
    thickness = 1,
    radius = 1.5,
    frequency = 0.3,
    phaseOffset = Math.random() * Math.PI * 2
  ) {
    let x1 = start.x,
      y1 = start.y,
      z1 = start.z;
    let x2 = end.x,
      y2 = end.y,
      z2 = end.z;

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const dz = Math.abs(z2 - z1);

    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    const sz = z1 < z2 ? 1 : -1;

    let err1, err2;
    let x = x1,
      y = y1,
      z = z1;

    let step = 0;

    function placeThickBlock(cx, cy, cz) {
      for (let ox = -thickness; ox <= thickness; ox++) {
        for (let oy = -thickness; oy <= thickness; oy++) {
          for (let oz = -thickness; oz <= thickness; oz++) {
            if (ox * ox + oy * oy + oz * oz <= thickness * thickness) {
              const pos = {
                x: Math.floor(cx + ox),
                y: Math.floor(cy + oy),
                z: Math.floor(cz + oz),
              };
              dimension.getBlock(pos)?.setType(blockType);
            }
          }
        }
      }
    }

    // Choose a helix axis that's orthogonal to the dominant movement direction
    const major = dx >= dy && dx >= dz ? "x" : dy >= dz ? "y" : "z";

    function getHelixOffset(step) {
      const angle = step * frequency + phaseOffset;
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;

      if (major === "x") return { x: 0, y: offsetX, z: offsetY };
      if (major === "y") return { x: offsetX, y: 0, z: offsetY };
      return { x: offsetX, y: offsetY, z: 0 };
    }

    if (major === "x") {
      err1 = 2 * dy - dx;
      err2 = 2 * dz - dx;
      for (let i = 0; i <= dx; i++, step++) {
        const offset = getHelixOffset(step);
        placeThickBlock(x + offset.x, y + offset.y, z + offset.z);
        if (err1 > 0) {
          y += sy;
          err1 -= 2 * dx;
        }
        if (err2 > 0) {
          z += sz;
          err2 -= 2 * dx;
        }
        err1 += 2 * dy;
        err2 += 2 * dz;
        x += sx;
      }
    } else if (major === "y") {
      err1 = 2 * dx - dy;
      err2 = 2 * dz - dy;
      for (let i = 0; i <= dy; i++, step++) {
        const offset = getHelixOffset(step);
        placeThickBlock(x + offset.x, y + offset.y, z + offset.z);
        if (err1 > 0) {
          x += sx;
          err1 -= 2 * dy;
        }
        if (err2 > 0) {
          z += sz;
          err2 -= 2 * dy;
        }
        err1 += 2 * dx;
        err2 += 2 * dz;
        y += sy;
      }
    } else {
      err1 = 2 * dx - dz;
      err2 = 2 * dy - dz;
      for (let i = 0; i <= dz; i++, step++) {
        const offset = getHelixOffset(step);
        placeThickBlock(x + offset.x, y + offset.y, z + offset.z);
        if (err1 > 0) {
          x += sx;
          err1 -= 2 * dz;
        }
        if (err2 > 0) {
          y += sy;
          err2 -= 2 * dz;
        }
        err1 += 2 * dx;
        err2 += 2 * dy;
        z += sz;
      }
    }
  }
}

export class ParticleDrawer extends Drawer {
  spawnParticle(location: Vector3, effectName: string | undefined): void {
    if (!effectName) return;
    location.x += 0.5;
    location.z += 0.5;
    this.dimension.spawnParticle(effectName, location);
  }

  drawPoint(position: Vector3, effectName: string, size: number = 1): void {
    super.drawPoint(position, (pos) => this.spawnParticle(pos, effectName), size);
  }

  drawLine(start: Vector3, end: Vector3, effectName: string, thickness?: number): void {
    super.drawLine(start, end, (pos) => this.spawnParticle(pos, effectName), thickness);
  }

  drawRay(origin: Vector3, direction: Vector3, length: number, effectName: string): void {
    super.drawRay(origin, direction, length, (pos) => this.spawnParticle(pos, effectName));
  }

  drawTriangle(
    a: Vector3,
    b: Vector3,
    c: Vector3,
    effectName: string,
    fillEffectName?: string
  ): void {
    super.drawTriangle(
      a,
      b,
      c,
      (pos) => this.spawnParticle(pos, effectName),
      (pos) => this.spawnParticle(pos, fillEffectName)
    );
  }

  drawRect(start: Vector3, end: Vector3, effectName: string, fillEffectName?: string): void {
    super.drawRect(
      start,
      end,
      (pos) => this.spawnParticle(pos, effectName),
      (pos) => this.spawnParticle(pos, fillEffectName)
    );
  }

  drawSphere(center: Vector3, radius: number, effectName: string, detail: number = 1): void {
    super.drawSphere(center, radius, (pos) => this.spawnParticle(pos, effectName), detail);
  }

  drawWireframe(start: Vector3, end: Vector3, effectName?: string): void {
    super.drawWireframe(start, end, (pos) => this.spawnParticle(pos, effectName ?? "minecraft:endrod"));
  }
}

export class EntityDrawer extends Drawer {
  spawnEntity(location: Vector3, identifier: string | undefined): void {
    if (!identifier) return;
    location.x += 0.5;
    location.z += 0.5;
    this.dimension.spawnEntity(identifier, location);
  }

  drawPoint(position: Vector3, identifier: string, size: number = 1): void {
    super.drawPoint(position, (pos) => this.spawnEntity(pos, identifier), size);
  }

  drawLine(start: Vector3, end: Vector3, identifier: string, thickness?: number): void {
    super.drawLine(start, end, (pos) => this.spawnEntity(pos, identifier), thickness);
  }

  drawRay(origin: Vector3, direction: Vector3, length: number, identifier: string): void {
    super.drawRay(origin, direction, length, (pos) => this.spawnEntity(pos, identifier));
  }

  drawTriangle(
    a: Vector3,
    b: Vector3,
    c: Vector3,
    identifier: string,
    fillIdentifier?: string
  ): void {
    super.drawTriangle(
      a,
      b,
      c,
      (pos) => this.spawnEntity(pos, identifier),
      (pos) => this.spawnEntity(pos, fillIdentifier)
    );
  }

  drawRect(start: Vector3, end: Vector3, identifier: string, fillIdentifier?: string): void {
    super.drawRect(
      start,
      end,
      (pos) => this.spawnEntity(pos, identifier),
      (pos) => this.spawnEntity(pos, fillIdentifier)
    );
  }

  drawSphere(center: Vector3, radius: number, identifier: string, detail: number = 1): void {
    super.drawSphere(center, radius, (pos) => this.spawnEntity(pos, identifier), detail);
  }

  drawWireframe(start: Vector3, end: Vector3, identifier: string): void {
    super.drawWireframe(start, end, (pos) => this.spawnEntity(pos, identifier));
  }
}
