import { describe, expect, it } from "vitest";

import { EncodeUtils } from "./encode";

describe("Encode Utils", () => {
  const str = "abcd";
  const arr = new Uint8Array([97, 98, 99, 100]);
  const gArr = new Uint8Array([31, 139, 8, 0, 0, 0, 0, 0, 0, 3, 75, 76, 74, 78, 1, 0, 17, 205, 130, 237, 4, 0, 0, 0]);
  it("string to Uint8Array", () => {
    const result = EncodeUtils.toUtf8(str);
    expect(result).toEqual(arr);
  });
  it("string to gZip", () => {
    const result = EncodeUtils.toGzip(str);
    expect(result).toEqual(gArr);
  });
  it("Uint8Array to base64", () => {
    const result = EncodeUtils.toBase64(arr);
    expect(result).toBe("YWJjZA==");
  });
});
