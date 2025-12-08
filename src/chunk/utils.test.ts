import { describe, expect, it } from "vitest";
import { ChunkUtils } from "./utils";

describe("Chunk Utils", () => {
  it("Convert a block pos to chunk pos", () => {
    const posA = { x: 0, y: 0, z: 0 };
    const posB = { x: 16, y: 0, z: 16 };
    const resultA = { x: 0, z: 0 };
    const resultB = { x: 1, z: 1 };
    expect(ChunkUtils.pos(posA)).toEqual(resultA);
    expect(ChunkUtils.pos(posB)).toEqual(resultB);
  });
});
