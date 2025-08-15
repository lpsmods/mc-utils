import { Vector3, world } from "@minecraft/server";
import { Packet, PacketData, PacketEvents, PacketReceiveEvent } from "./misc/Packet";
import { Identifier } from "./misc/Identifier";

export interface APIPrototype {
  name: string,
  value?: any;
  mode?: "disk" | "memory";
  args?: object;
}

export class API {
  static all = new Set<API>();
  addonId: string;
  private memory = new Map<string, any>();
  private internal = new Map<string, APIPrototype>();

  private constructor(addonId: string) {
    this.addonId = addonId;
  }

  /**
   * Create a new API instance.
   * @param {string} addonId
   */
  static create(addonId: string): API {
    const api = new API(addonId);
    API.all.add(api);
    return api;
  }

  /**
   * Ref an API.
   * @param {string} addonId
   */
  static ref(addonId: string): API {
    const res = new API(addonId);
    res.validate();
    return res;
  }

  async isValid(): Promise<boolean> {
    try {
      const data = new PacketData({ type: "ping", name: "ping", mode: "memory" });
      await Packet.send(`api:${this.addonId}`, data);
      return true;
    } catch (err) {
      return false;
    }
  }

  private async validate() {
    const bl = await this.isValid();
    if (bl) return;
    console.warn(`API '${this.addonId}' not found!`);
  }

  register<T>(name: string, value?: T, mode?: "disk" | "memory"): API {
    if (this.internal.has(name)) throw new Error(`'${name}' has already been registered!`);
    this.internal.set(name, {name, value, mode: mode ?? "disk" });
    return this;
  }

  call(name: string, args?: object): Promise<PacketData> {
    const data = new PacketData({ name, args, type: "function" });
    return Packet.send(`api:${this.addonId}`, data);
  }

  async getProperty(name: string): Promise<string | number | boolean | Vector3 | undefined> {
    const data = new PacketData({ name, type: "get_property" });
    const res = await Packet.send(`api:${this.addonId}`, data);
    return JSON.parse(res);
  }

  setProperty(name: string, value: any): void {
    const data = new PacketData({ name, value, type: "set_property" });
    Packet.send(`api:${this.addonId}`, data);
  }

  resetProperty(name: string) {
    const data = new PacketData({ name, type: "reset_property" });
    Packet.send(`api:${this.addonId}`, data);
  }

  private packet_function(data: APIPrototype) {
    const prop = this.internal.get(data.name);
    if (!prop) {
      throw new Error(`'${this.addonId}' api has no function '${data.name}'`);
    }
    const args2 = new PacketData(data.args);
    return prop.value(args2);
  }

  private packet_get_property(data: APIPrototype) {
    const prop = this.internal.get(data.name);
    if (!prop) {
      throw new Error(`'${this.addonId}' api has no property '${data.name}'`);
    }
    switch (prop.mode) {
      case "disk":
        return world.getDynamicProperty(data.name) ?? prop.value;
      case "memory":
        return this.memory.get(data.name) ?? prop.value;
      default:
        throw new Error(`${prop.mode} is not a valid mode`);
    }
  }

  private packet_set_property(data: APIPrototype) {
    const prop = this.internal.get(data.name);
    if (!prop) {
      throw new Error(`'${this.addonId}' api has no property '${data.name}'`);
    }
    switch (prop.mode) {
      case "disk":
        world.setDynamicProperty(data.name, data.value);
        return true;
      case "memory":
        this.memory.set(data.name, data.value);
        return true;
      default:
        throw new Error(`${prop.mode} is not a valid mode`);
    }
  }

  private packet_reset_property(data: APIPrototype) {
    const prop = this.internal.get(data.name);
    if (!prop) {
      throw new Error(`'${this.addonId}' api has no property '${data.name}'`);
    }
    switch (prop.mode) {
      case "disk":
        world.setDynamicProperty(data.name);
        return true;
      case "memory":
        this.memory.delete(data.name);
        return true;
      default:
        throw new Error(`${prop.mode} is not a valid mode`);
    }
  }

  private packet_ping(data: APIPrototype) {
    return true;
  }

  static onPacketReceive(event: PacketReceiveEvent): void {
    const id = Identifier.parse(event.id);
    if (id.namespace !== "api") return;
    for (const api of API.all) {
      if (api.addonId !== id.path) continue;
      const data = event.body.data;

      const param = api[`packet_${data.type}` as keyof API];
      if (typeof param !== "function") throw new Error(`${data.type} is not a valid type`);
      event.response = (param as (...args: any[]) => unknown).bind(api)(data);
      return;
    }
  }
}

function setup() {
  // TODO: Filter namespaces.
  PacketEvents.receive.subscribe(API.onPacketReceive);
}

setup();
