import { BlockVolume } from "@minecraft/server";
import { describe, expect, it } from "vitest";
import { MathUtils } from "./math";
import { VECTOR3_ZERO } from "@minecraft/math";

describe("Math Utils", () => {
  const FROM = { x: 0, y: 0, z: 0 };
  const TO = { x: 5, y: 5, z: 5 };
  it("Merge block volumes", () => {
    const volA = new BlockVolume(FROM, TO);
    const volB = new BlockVolume(TO, { x: 10, y: 10, z: 10 });
    const result = new BlockVolume({ x: 0, y: 0, z: 0 }, { x: 10, y: 10, z: 10 });
    expect(MathUtils.combineBlockVolumes([volA, volB])).toEqual(result);
  });

  it("is number in range", () => {
    expect(MathUtils.inRange(1, 0, 100)).toBe(true);
    expect(MathUtils.inRange(200, 0, 100)).toBe(false);
  });

  it("scale regin", () => {
    const result = { from: { x: -1, y: -1, z: -1 }, to: { x: 6, y: 6, z: 6 } };
    expect(MathUtils.expandRegion(FROM, TO, 1)).toEqual(result);
  });

  // it("is origin in volume", () => {
  //   const originA = { x: 1, y: 1, z: 1 };
  //   const originB = { x: 0, y: -10, z: 0 };
  //   expect(MathUtils.isInRect(originA, FROM, TO)).toBe(true);
  //   expect(MathUtils.isInRect(originB, FROM, TO)).toBe(false);
  // });

  it("Returns volume with min and max", () => {
    const result = { maxX: 5, maxY: 5, maxZ: 5, minX: 0, minY: 0, minZ: 0 };
    expect(MathUtils.getBounds(FROM, TO)).toEqual(result);
  });

  it("Returns the size of the volume", () => {
    const result = { x: 6, y: 6, z: 6 };
    expect(MathUtils.getSize(FROM, TO)).toEqual(result);
  });

  it("Rotates a matrix of points", () => {
    const points = [
      { x: 0, y: 2, z: -2 },
      { x: 0, y: 2, z: 2 },
      { x: 2, y: 2, z: 0 },
      { x: -2, y: 2, z: 0 },
      { x: 0, y: -2, z: -2 },
      { x: 0, y: -2, z: 2 },
      { x: 2, y: -2, z: 0 },
      { x: -2, y: -2, z: 0 },
    ];
    const result = [
      { x: -2, y: 2, z: -1.2246467991473532e-16 },
      { x: 2, y: 2, z: 1.2246467991473532e-16 },
      { x: 1.2246467991473532e-16, y: 2, z: -2 },
      { x: -1.2246467991473532e-16, y: 2, z: 2 },
      { x: -2, y: -2, z: -1.2246467991473532e-16 },
      { x: 2, y: -2, z: 1.2246467991473532e-16 },
      { x: 1.2246467991473532e-16, y: -2, z: -2 },
      { x: -1.2246467991473532e-16, y: -2, z: 2 },
    ];
    expect(MathUtils.rotatePoints(points, VECTOR3_ZERO, { x: 0, y: 90, z: 0 })).toEqual(result);
  });
});
