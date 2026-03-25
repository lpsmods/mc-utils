import { gzip as pakoGZip, Uint8ArrayReturnType } from "pako";

export class EncodeUtils {
  static toUtf8(str: string): Uint8Array {
    const out = [];
    let i = 0;
    while (i < str.length) {
      let c = str.charCodeAt(i++);

      if (c < 128) {
        out.push(c);
      } else if (c < 2048) {
        out.push((c >> 6) | 192);
        out.push((c & 63) | 128);
      } else if ((c & 0xfc00) === 0xd800 && i < str.length && (str.charCodeAt(i) & 0xfc00) === 0xdc00) {
        // surrogate pair
        const c2 = str.charCodeAt(i++);
        const cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push((cp >> 18) | 240);
        out.push(((cp >> 12) & 63) | 128);
        out.push(((cp >> 6) & 63) | 128);
        out.push((cp & 63) | 128);
      } else {
        out.push((c >> 12) | 224);
        out.push(((c >> 6) & 63) | 128);
        out.push((c & 63) | 128);
      }
    }
    return new Uint8Array(out);
  }

  static toGzip(text: string): Uint8ArrayReturnType {
    const data = this.toUtf8(text);
    return pakoGZip(data);
  }

  static toBase64(bytes: Uint8Array): string {
    let out = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    let i = 0;
    while (i < bytes.length) {
      const b1 = bytes[i++] || 0;
      const b2 = bytes[i++] || 0;
      const b3 = bytes[i++] || 0;

      const triplet = (b1 << 16) | (b2 << 8) | b3;

      out += chars[(triplet >> 18) & 63];
      out += chars[(triplet >> 12) & 63];
      out += chars[(triplet >> 6) & 63];
      out += chars[triplet & 63];
    }

    const padLength = (3 - (bytes.length % 3)) % 3;
    if (padLength > 0) out = out.slice(0, -padLength) + "=".repeat(padLength);

    return out;
  }
}
