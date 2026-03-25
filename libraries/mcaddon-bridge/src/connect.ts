import { Player } from "@minecraft/server";
import { Packet, PacketData } from "./packet";
import { uuid } from "./utils";

export class Connection {
  readonly addonId: string;
  isConnected: boolean = false;

  constructor(addonId: string) {
    this.addonId = addonId;
  }

  /**
   * Pings the addon to check if it is available.
   *
   * This function can be called in early-execution mode.
   * @param {string} version
   * @returns {Promise<Connection>}
   */
  async connect(version?: string): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const id = `bridge:${uuid()}`;
      const data = new PacketData();
      data.set("method", "connect");
      data.set("addon", this.addonId);
      data.set("version", version);
      Packet.sendSync(id, data)
        // Got response
        .then((packet) => {
          if (packet.get("body.error")) return reject(this);
          this.isConnected = true;
          resolve(this);
        })
        // Timed out
        .catch((res) => {
          reject(this);
        });
    });
  }

  async docs(player: Player): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = `bridge:${uuid()}`;
      const data = new PacketData();
      data.set("method", "docs");
      data.set("addon", this.addonId);
      data.setEntity("player", player);
      Packet.sendSync(id, data)
        .then((res) => {
          if (res.get("body.error")) {
            reject(res.get("body.message"));
            return;
          }
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Get a property.
   * @param {string} property
   * @returns {Promise<any>}
   */
  async get(property: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `bridge:${uuid()}`;
      const data = new PacketData();
      data.set("method", "get");
      data.set("addon", this.addonId);
      data.set("property", property);
      Packet.sendSync(id, data)
        .then((packet) => {
          if (packet.get("body.error")) {
            reject(packet.get("body.message"));
            return;
          }
          // console.warn(packet);

          resolve(packet.get("body.value"));
        })
        .catch(reject);
    });
  }

  /**
   * Set a property.
   * @param {string} property
   * @param {any} value
   * @returns {Promise<void>}
   */
  async set(property: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = `bridge:${uuid()}`;
      const data = new PacketData();
      data.set("method", "set");
      data.set("addon", this.addonId);
      data.set("property", property);
      data.set("value", value);
      Packet.sendSync(id, data)
        .then((res) => {
          if (res.get("body.error")) {
            reject(res.get("body.message"));
            return;
          }
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Whether or not the property exists.
   * @param {string} property
   * @returns {Promise<void>}
   */
  async has(property: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = `bridge:${uuid()}`;
      const data = new PacketData();
      data.set("method", "has");
      data.set("addon", this.addonId);
      data.set("property", property);
      Packet.sendSync(id, data)
        .then((res) => {
          resolve(res.get("body.value"));
        })
        .catch(reject);
    });
  }

  /**
   * CAll a function on an object.
   * @param {string} property
   * @param {...any} args
   * @returns {Promise<any>}
   */
  async call(property: string, ...args: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `bridge:${uuid()}`;
      const data = new PacketData();
      data.set("method", "call");
      data.set("addon", this.addonId);
      data.set("property", property);
      data.set("args", args);
      Packet.sendSync(id, data)
        .then((res) => {
          if (res.get("body.error")) {
            reject(res.get("body.message"));
            return;
          }
          resolve(res.get("body.value"));
        })
        .then(reject);
    });
  }
}

/**
 * Connect to an addon.
 * @param {string} addonId
 * @param {string} version
 * @returns {Promise<Connection>}
 */
export function connect(addonId: string, version?: string): Promise<Connection> {
  const c = new Connection(addonId);
  return c.connect(version);
}
