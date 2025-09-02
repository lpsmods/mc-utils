import { BlockPermutation, Vector3 } from "@minecraft/server";
import { MathUtils } from "../math";
import { Font, Fonts } from "./font";
import { Drawer } from "./drawer";

export abstract class Shape {
  drawer?: Drawer = undefined;

  location: Vector3;
  rotation: Vector3 = { x: 0, y: 0, z: 0 };
  origin?: Vector3;

  // TODO: Only implemented for some shapes.
  scale: number = 1;
  timeLeft: number = 0;
  private _totalTimeLeft: number = 0;

  /**
   * A block, entity, or particle.
   */
  material?: string | BlockPermutation;

  constructor(location: Vector3) {
    this.location = location;
  }

  get hasDuration(): boolean {
    return this.totalTimeLeft > 0;
  }

  get totalTimeLeft(): number {
    return this._totalTimeLeft;
  }

  set totalTimeLeft(value: number) {
    this._totalTimeLeft = value;
    this.timeLeft = value;
  }

  /**
   * Removes this shape from the world.
   */
  remove() {
    if (this.drawer) {
      this.drawer.removeShape(this);
    }
  }

  /**
   * Rotate the shape in the X direction.
   * @param {number} value
   */
  rotateX(value: number): void {
    this.rotation.x = value;
  }

  /**
   * Rotate the shape in the Y direction.
   * @param {number} value
   */
  rotateY(value: number): void {
    this.rotation.y = value;
  }

  /**
   * Rotate the shape in the Z direction.
   * @param {number} value
   */
  rotateZ(value: number): void {
    this.rotation.z = value;
  }

  /**
   * All points for the shape.
   */
  abstract getPoints(): Vector3[];

  // EVENTS

  /**
   * Called every tick.
   */
  onTick?(shape: Shape): void;
}

export class Box extends Shape {
  bound: Vector3;

  constructor(location: Vector3, bound: Vector3) {
    super(location);
    this.bound = bound;
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    const minX = Math.min(this.location.x, this.bound.x);
    const maxX = Math.max(this.location.x, this.bound.x);
    const minY = Math.min(this.location.y, this.bound.y);
    const maxY = Math.max(this.location.y, this.bound.y);
    const minZ = Math.min(this.location.z, this.bound.z);
    const maxZ = Math.max(this.location.z, this.bound.z);

    for (let x = minX; x <= maxX; x++) {
      points.push({ x: x, y: minY, z: minZ });
      points.push({ x: x, y: minY, z: maxZ });
      points.push({ x: x, y: maxY, z: minZ });
      points.push({ x: x, y: maxY, z: maxZ });
    }

    for (let y = minY; y <= maxY; y++) {
      points.push({ x: minX, y: y, z: minZ });
      points.push({ x: minX, y: y, z: maxZ });
      points.push({ x: maxX, y: y, z: minZ });
      points.push({ x: maxX, y: y, z: maxZ });
    }

    for (let z = minZ; z <= maxZ; z++) {
      points.push({ x: minX, y: minY, z: z });
      points.push({ x: minX, y: maxY, z: z });
      points.push({ x: maxX, y: minY, z: z });
      points.push({ x: maxX, y: maxY, z: z });
    }
    return MathUtils.rotatePoints(
      points,
      this.location,
      this.origin ?? this.rotation,
    );
  }
}

export class Line extends Shape {
  endLocation: Vector3;

  constructor(location: Vector3, endLocation: Vector3) {
    super(location);
    this.endLocation = endLocation;
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    const x1 = Math.floor(this.location.x),
      y1 = Math.floor(this.location.y),
      z1 = Math.floor(this.location.z);
    const x2 = Math.floor(this.endLocation.x),
      y2 = Math.floor(this.endLocation.y),
      z2 = Math.floor(this.endLocation.z);

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
        points.push({ x: x, y: y, z: z });
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
        points.push({ x: x, y: y, z: z });
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
        points.push({ x: x, y: y, z: z });
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

    points.push({ x: x2, y: y2, z: z2 });
    return MathUtils.rotatePoints(
      points,
      this.location,
      this.origin ?? this.rotation,
    );
  }
}

export class Arrow extends Line {
  headLength: number = 1;
  headRadius: number = 1;
  headSegments: number = 1;

  // TODO: Add arrow head
  getPoints(): Vector3[] {
    const points: Vector3[] = super.getPoints();
    return points;
  }
}

export class Circle extends Shape {
  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    const { x: cx, y: cy, z: cz } = this.location;
    const r = this.scale ?? 3;
    const steps = Math.max(12, Math.floor(r * 8));
    for (let theta = 0; theta < Math.PI * 2; theta += (Math.PI * 2) / steps) {
      const x = cx + r * Math.cos(theta);
      const z = cz + r * Math.sin(theta);
      const px = Math.round(x);
      const pz = Math.round(z);
      if (!points.some((pt) => pt.x === px && pt.y === cy && pt.z === pz)) {
        points.push({ x: px, y: cy, z: pz });
      }
    }
    return MathUtils.rotatePoints(
      points,
      this.location,
      this.origin ?? this.rotation,
    );
  }
}

export class Sphere extends Shape {
  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    const { x: cx, y: cy, z: cz } = this.location;
    const r = this.scale ?? 3;
    const steps = Math.max(12, Math.floor(r * 8));
    for (let theta = 0; theta < Math.PI * 2; theta += (Math.PI * 2) / steps) {
      for (let phi = 0; phi < Math.PI; phi += Math.PI / steps) {
        const x = cx + r * Math.sin(phi) * Math.cos(theta);
        const y = cy + r * Math.cos(phi);
        const z = cz + r * Math.sin(phi) * Math.sin(theta);
        const px = Math.round(x);
        const py = Math.round(y);
        const pz = Math.round(z);
        if (!points.some((pt) => pt.x === px && pt.y === py && pt.z === pz)) {
          points.push({ x: px, y: py, z: pz });
        }
      }
    }
    return MathUtils.rotatePoints(
      points,
      this.location,
      this.origin ?? this.rotation,
    );
  }
}

export class Text extends Shape {
  text: string;
  font: Fonts = Fonts.Default;

  constructor(location: Vector3, text: string) {
    super(location);
    this.text = text;
  }

  getPoints(): Vector3[] {
    const font = Font.get(this.font);
    const points: Vector3[] = [];
    const { x: cx, y: cy, z: cz } = this.location;
    const scale = Math.max(1, Math.floor(this.scale ?? 1));
    let offsetX = 0;
    let offsetY = 0;

    for (const char of this.text) {
      if (char === "\n") {
        offsetY -= (font[" "]?.length ?? 7) * scale + scale;
        offsetX = 0;
        continue;
      }
      const glyph = font[char] ?? font[" "];
      for (let row = 0; row < glyph.length; row++) {
        for (let col = 0; col < glyph[row].length; col++) {
          if (glyph[row][col] === "1") {
            for (let sx = 0; sx < scale; sx++) {
              for (let sy = 0; sy < scale; sy++) {
                points.push({
                  x: cx + offsetX + col * scale + sx,
                  y: cy + (glyph.length - row - 1) * scale + sy + offsetY,
                  z: cz,
                });
              }
            }
          }
        }
      }
      offsetX += (glyph[0].length + 1) * scale;
    }
    return MathUtils.rotatePoints(
      points,
      this.location,
      this.origin ?? this.rotation,
    );
  }
}

// TODO: Adjust shape
export class Cone extends Shape {
  radius: number;
  height: number;

  constructor(location: Vector3, radius: number, height: number) {
    super(location);
    this.radius = radius;
    this.height = height;
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    const { x: cx, y: cy, z: cz } = this.location;
    const stepsPerBlock = 16;
    const verticalSteps = Math.max(1, Math.floor(this.height * stepsPerBlock));
    for (let step = 0; step <= verticalSteps; step++) {
      const t = step / verticalSteps;
      const currentRadius = this.radius * (1 - t);
      const currentY = cy + t * this.height;
      const circumference = 2 * Math.PI * currentRadius;
      const horizontalSteps = Math.max(
        8,
        Math.floor(circumference * stepsPerBlock),
      );
      for (let i = 0; i < horizontalSteps; i++) {
        const theta = (i / horizontalSteps) * Math.PI * 2;
        const px = Math.cos(theta) * currentRadius;
        const pz = Math.sin(theta) * currentRadius;
        points.push({
          x: cx + px,
          y: currentY,
          z: cz + pz,
        });
      }
    }
    return points;
  }
}

// TODO: Adjust shape
export class Cylinder extends Shape {
  radius: number;
  height: number;

  constructor(location: Vector3, radius: number, height: number) {
    super(location);
    this.radius = radius;
    this.height = height;
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    const { x: cx, y: cy, z: cz } = this.location;

    const stepsPerBlock = 16;
    const verticalSteps = Math.max(1, Math.floor(this.height * stepsPerBlock));

    // Precompute circumference resolution
    const circumference = 2 * Math.PI * this.radius;
    const horizontalSteps = Math.max(
      8,
      Math.floor(circumference * stepsPerBlock),
    );

    for (let step = 0; step <= verticalSteps; step++) {
      const currentY = cy + (step / verticalSteps) * this.height;

      for (let i = 0; i < horizontalSteps; i++) {
        const theta = (i / horizontalSteps) * Math.PI * 2;
        const px = Math.cos(theta) * this.radius;
        const pz = Math.sin(theta) * this.radius;

        points.push({
          x: cx + px,
          y: currentY,
          z: cz + pz,
        });
      }
    }

    return points;
  }
}

// TODO: Implement shape
export class Dodecahedron extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Edges extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Extrude extends Shape {
  shape: Shape;

  constructor(shape: Shape) {
    super(shape.location);
    this.shape = shape;
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Icosahedron extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Lathe extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Octahedron extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Plane extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Polyhedron extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Ring extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Tetrahedron extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Torus extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class TorusKnot extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Tube extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
export class Wireframe extends Shape {
  shape: Shape;

  constructor(shape: Shape) {
    super(shape.location);
    this.shape = shape;
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}

// TODO: Implement shape
//  https://threejs.org/docs/#api/en/geometries/ShapeGeometry
export class CustomShape extends Shape {
  constructor(location: Vector3) {
    super(location);
  }

  getPoints(): Vector3[] {
    const points: Vector3[] = [];
    return points;
  }
}
