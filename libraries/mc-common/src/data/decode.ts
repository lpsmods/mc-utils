import { ungzip, Data } from "pako";

export class DecodeUtils {
  static fromBase64(b64: string): Uint8Array {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const lookup: { [k: string]: number } = {};

    for (let i = 0; i < chars.length; i++) {
      lookup[chars[i]] = i;
    }

    const clean = b64.replace(/[^A-Za-z0-9+/=]/g, "");

    const len = clean.length;
    const pad = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;

    const bytes: number[] = [];
    let i = 0;

    while (i < len) {
      const c1 = lookup[clean[i++]] ?? 0;
      const c2 = lookup[clean[i++]] ?? 0;
      const c3 = lookup[clean[i++]] ?? 0;
      const c4 = lookup[clean[i++]] ?? 0;

      const triplet = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;

      const b1 = (triplet >> 16) & 255;
      const b2 = (triplet >> 8) & 255;
      const b3 = triplet & 255;

      bytes.push(b1);
      if (clean[i - 2] !== "=") bytes.push(b2);
      if (clean[i - 1] !== "=") bytes.push(b3);
    }

    return new Uint8Array(bytes);
  }

  static fromGzip(bytes: Data): string {
    const raw = ungzip(bytes);
    return this.fromUtf8(raw);
  }
  static fromUtf8(bytes: Uint8Array): string {
    let out = "";
    let i = 0;

    while (i < bytes.length) {
      const c = bytes[i++];

      if (c < 128) {
        out += String.fromCharCode(c);
      } else if (c > 191 && c < 224) {
        const c2 = bytes[i++];
        out += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      } else if (c > 223 && c < 240) {
        const c2 = bytes[i++];
        const c3 = bytes[i++];
        out += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      } else {
        // 4 byte sequence → surrogate pair
        const c2 = bytes[i++];
        const c3 = bytes[i++];
        const c4 = bytes[i++];
        let cp = ((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
        cp -= 0x10000;
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 1023));
      }
    }

    return out;
  }
}
