import { describe, expect, it } from "vitest";

import { DecodeUtils } from "./decode";

describe("Decode Utils", () => {
  const str = "abcd";
  const arr = new Uint8Array([97, 98, 99, 100]);
  const gArr = new Uint8Array([31, 139, 8, 0, 0, 0, 0, 0, 0, 3, 75, 76, 74, 78, 1, 0, 17, 205, 130, 237, 4, 0, 0, 0]);
  it("Uint8Array to string", () => {
    const result = DecodeUtils.fromUtf8(arr);
    expect(result).toEqual(str);
  });
  it("base64 to Uint8Array", () => {
    const result = DecodeUtils.fromBase64("YWJjZA==");
    expect(result).toEqual(arr);
  });
  it("gZip to string", () => {
    const result = DecodeUtils.fromGzip(gArr);
    expect(result).toEqual(str);
  });
});
