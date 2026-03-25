import { PacketData } from "./packet";

/**
 * Create a random UUID.
 * @returns {string}
 */
export function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function errorPacket(message: string): PacketData {
  const res = new PacketData();
  res.set("error", true);
  res.set("message", message);
  return res;
}
