import { describe, expect, it } from "vitest";
import { Random, RandomUtils } from "./random";
import { BlockVolume } from "@minecraft/server";
import { MathUtils } from "./math";
import { ConditionUtils } from "../validation";

describe("Random", () => {
  it("produces deterministic output with same seed", () => {
    const r1 = new Random(123n);
    const r2 = new Random(123n);

    const values1 = [r1.next(16), r1.nextInt(10), r1.nextInt(100)];
    const values2 = [r2.next(16), r2.nextInt(10), r2.nextInt(100)];

    expect(values1).toEqual(values2);
  });

  it("changes output when seed changes", () => {
    const r1 = new Random(123n);
    const r2 = new Random(456n);

    expect(r1.nextInt(100)).not.toBe(r2.nextInt(100));
  });

  it("next(bits) returns correct bit width", () => {
    const r = new Random(1n);

    const v = r.next(12);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1 << 12); // should fit inside 12 bits
  });

  it("nextInt throws on nonpositive bound", () => {
    const r = new Random(1n);

    expect(() => r.nextInt(0)).toThrowError();
    expect(() => r.nextInt(-5)).toThrowError();
  });

  it("nextInt handles power of two bounds correctly", () => {
    const r = new Random(999n);

    const bound = 32; // power of two
    const v = r.nextInt(bound);

    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(bound);
  });

  it("nextInt handles non power of two bounds", () => {
    const r = new Random(999n);

    const bound = 37; // non power of two
    const v = r.nextInt(bound);

    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(bound);
  });

  it("nextInt distribution avoids negative loop condition", () => {
    const r = new Random(42n);
    const bound = 37;

    // Run multiple times to ensure no negative values slip through
    for (let i = 0; i < 2000; i++) {
      const v = r.nextInt(bound);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(bound);
    }
  });
});

describe("Random Utils", () => {
  it("Random position in volume", () => {
    const volume = new BlockVolume({ x: 0.1, y: 0, z: 0 }, { x: 5, y: 5, z: 5 });
    const result = RandomUtils.posInVolume(volume);
    expect(typeof result.x).toBe("number");
    expect(typeof result.y).toBe("number");
    expect(typeof result.z).toBe("number");
  });

  it("Random uuid4", () => {
    const result = RandomUtils.uuid();
    expect(ConditionUtils.isUuid4(result)).toBe(true);
  });

  it("Random integer", () => {
    const result = RandomUtils.int(0, 100);
    expect(typeof result).toBe("number");
    expect(MathUtils.inRange(result, 0, 100)).toBe(true);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("Random id", () => {
    const resultA = RandomUtils.id(4).length === 4;
    const resultB = RandomUtils.id(4, "a") === "aaaa";
    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
  });

  it("Random choice", () => {
    const items: string[] = ["item 1", "item 2", "item 3"];
    const result = RandomUtils.choice(items);
    expect(items.includes(result)).toBe(true);
  });
});
