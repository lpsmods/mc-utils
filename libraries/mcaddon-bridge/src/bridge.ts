import { Player, RawMessage } from "@minecraft/server";
import { PacketData, PacketEvents, PacketReceiveEvent } from "./packet";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { errorPacket } from "./utils";

export interface BridgeDescriptor {
  /**
   * Sets the property’s value
   */
  value?: any;

  /**
   * Can the value be changed?
   */
  writeable?: boolean;

  /**
   * Shows in loops/Object.keys()?
   */
  enumerable?: boolean;

  /**
   * Can the property be deleted or modified?
   */
  configurable?: boolean;

  /**
   * A description to show in the docs.
   */
  description?: string;

  /**
   * Function to call when reading the property
   * @returns {any}
   */
  get?: () => any;

  /**
   * Function to call when setting the property
   * @param {any} value
   */
  set?: (value: any) => void;
}

export interface BridgeOptions {
  version?: string;
  name?: string | RawMessage;
  description?: string | RawMessage;
  enableDocs?: boolean;
}

export class Bridge {
  static readonly all = new Map<string, Bridge>();

  private descriptors = new Map<string, BridgeDescriptor>();
  readonly addonId: string;
  options: BridgeOptions;

  /**
   * A new Bridge instance.
   * @param {string} addonId
   * @param {BridgeOptions} options
   */
  constructor(addonId: string, options?: BridgeOptions) {
    this.addonId = addonId;
    this.options = options ?? {};
    if (!this.options.version) this.options.version = "1.0.0";
    if (!this.options.enableDocs) this.options.enableDocs = true;
    Bridge.all.set(this.addonId, this);
  }

  get(name: string): any {
    const prop = this.descriptors.get(name);
    if (!prop) throw new Error(`${name} not found`);
    if (prop.get) return prop.get();
    return prop.value;
  }

  set(name: string, value: any): Bridge {
    const prop = this.descriptors.get(name);
    if (!prop) throw new Error(`${name} not found`);
    if (prop.set) {
      prop.set(value);
      return this;
    }
    prop.value = value;
    return this;
  }

  has(name: string): boolean {
    const prop = this.descriptors.get(name);
    return !prop;
  }

  call(name: string, args?: any[]): any {
    const prop = this.descriptors.get(name);
    if (!prop) throw new Error(`${name} not found`);

    // Check if function
    if (!prop.value || typeof prop.value !== "function") {
      throw new Error(`Property '${name}' is not a function.`);
    }
    return prop.value.apply(this, args ?? []);
  }

  private receive_connect(event: PacketReceiveEvent, data: PacketData): void {
    if (this.addonId !== data.get("addon")) {
      event.response = errorPacket("Not found!").set("addon", this.addonId);
      return;
    }
    event.response = new PacketData()
      .set("error", false)
      .set("addon", this.addonId)
      .set("message", `Connected to ${this.addonId}!`);
  }

  private receive_get(event: PacketReceiveEvent, data: PacketData): void {
    const name = data.get("property");
    try {
      event.response = new PacketData().set("error", false).set("value", this.get(name));
    } catch (err) {
      event.response = errorPacket(err as string);
    }
  }

  private receive_set(event: PacketReceiveEvent, data: PacketData): void {
    const name = data.get("property");
    const value = data.get("value");
    try {
      this.set(name, value);
      event.response = new PacketData().set("error", false);
    } catch (err) {
      event.response = errorPacket(err as string);
    }
  }

  private receive_has(event: PacketReceiveEvent, data: PacketData): void {
    const name = data.get("property");
    try {
      event.response = new PacketData().set("error", false).set("value", this.has(name));
    } catch (err) {
      event.response = errorPacket(err as string);
    }
  }

  private receive_call(event: PacketReceiveEvent, data: PacketData): void {
    const name = data.get("property");
    const args = data.get("args");
    try {
      const result = this.call(name, args);
      event.response = new PacketData().set("error", false).set("value", result);
    } catch (err) {
      event.response = errorPacket(err as string);
    }
  }

  private receive_docs(event: PacketReceiveEvent, data: PacketData): void {
    const result = new PacketData();
    result.set("error", false);
    const player = data.getEntity("player");
    if (!this.options.enableDocs) {
      event.response = errorPacket(`${this.options.name ?? this.addonId} docs are disabled.`);
      return;
    }
    if (!player || !(player instanceof Player)) {
      event.response = errorPacket("Player not found!");
      return;
    }
    this.showDocs(player);
    event.response = result.set("message", `Showing ${this.options.name ?? this.addonId} docs for ${player.name}`);
  }

  /**
   * Create a new property.
   * @param {string} property The property name.
   * @param {BridgeDescriptor} descriptor A descriptor of the property to be added or changed
   */
  defineProperty(property: string, descriptor: BridgeDescriptor): void {
    if (this.descriptors.has(property)) throw new Error(`${property} is already defined`);
    this.descriptors.set(property, descriptor);
  }

  private showProperty(player: Player, propertyName: string): void {
    const res = this.descriptors.get(propertyName);
    if (!res) return;
    const ui = new ActionFormData();
    ui.title(`${propertyName} Bridge`);
    const type = res.value != undefined ? typeof res.value : "setter / getter";
    ui.body(
      `${res.description ?? ""}\n\n§lType:§r ${type}\n\n§lWriteable§r: ${res.writeable}\n\n§lEnumerable§r: ${
        res.enumerable
      }\n\n§lConfigurable§r: ${res.configurable}\n\n`,
    );
    ui.show(player);
  }

  private showProperties(player: Player): void {
    const ui = new ActionFormData();
    ui.title(`${this.addonId} Bridge Properties`);
    ui.body(`All properties for ${this.addonId}`);

    for (const k of this.descriptors.keys()) {
      // for (const [kk, vv] of v) {
      //   ui.button(`${kk} (${k})`);
      //   btns.push([k, kk]);
      // }
      ui.button(k);
    }

    ui.show(player).then((event: ActionFormResponse) => {
      if (event.canceled) return;
      // const btn = btns[event.selection as number];
      const key = [...this.descriptors.keys()][event.selection ?? 0];
      this.showProperty(player, key);
    });
  }

  /**
   * Show docs UI for this Add-On bridge.
   * @param {Player} player
   */
  showDocs(player: Player): void {
    const ui = new ActionFormData();
    ui.title(`${this.addonId} Bridge [${this.options.version}]`);
    ui.body(this.options.description ?? "");
    ui.button("Properties");
    ui.show(player).then((event: ActionFormResponse) => {
      if (event.canceled) return;
      switch (event.selection) {
        case 0:
          this.showProperties(player);
          break;
      }
    });
  }

  static receive(event: PacketReceiveEvent): void {
    const data = event.packet as PacketData;
    const addonId = data.get("addon");
    const bridge = Bridge.all.get(addonId);
    if (!bridge) return; // No bridge in this pack.
    const methodName = `receive_${data.get("method")}`;
    const func = bridge[methodName as keyof Bridge];
    if (typeof func === "function") {
      (func as Function).bind(bridge)(event, data);
    } else {
      console.error(`Method "${methodName}" not found or not a function.`);
    }
  }
}

function setup() {
  PacketEvents.receive.subscribe(Bridge.receive, { namespaces: ["bridge"] });
}

setup();
