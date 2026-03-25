import {
  Block,
  BlockPermutation,
  BlockType,
  BlockTypes,
  Entity,
  EntityType,
  EntityTypes,
  ItemStack,
  ItemType,
  ItemTypes,
  ScriptEventCommandMessageAfterEvent,
  system,
  world,
} from "@minecraft/server";
import { uuid } from "./utils";

export type pData = { [key: string]: any };

export class PacketData {
  readonly data: pData;

  constructor(data?: {}) {
    this.data = data ?? {};
  }

  // TODO: Test in-game
  /**
   * Convert all data to the correct types.
   * @param {pData} data
   * @returns {pData}
   */
  parseAll(data: pData): pData {
    for (const [k, v] of Object.entries(data)) {
      if (v.type) {
        data[k] = this.parse(k, v);
        continue;
      }
    }
    return data;
  }

  /**
   * Convert to the correct object.
   * @param {any} value
   * @returns {any}
   */
  parse(key: string, value: any): any {
    if (value.type) {
      const methodName = `get${value.type}`;
      if (typeof this[methodName as keyof PacketData] === "function") {
        return (this[methodName as keyof PacketData] as Function)(key);
      }
    }
    return value;
  }

  toString(): string {
    return JSON.stringify(this.data);
  }

  /**
   * Whether or not this object has any data.
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return Object.keys(this.data).length === 0;
  }

  get(name: string): any {
    let val = this.data;
    for (const k of name.split(".")) {
      val = val[k];
    }
    return val;
  }

  set(name: string, value: any): PacketData {
    this.data[name] = value;
    return this;
  }

  setBlockPermutation(name: string, value: BlockPermutation): PacketData {
    this.set(name, {
      type: "BlockPermutation",
      blockName: value.type.id,
      states: value.getAllStates(),
    });
    return this;
  }

  getBlockPermutation(name: string): BlockPermutation | undefined {
    const prop = this.get(name);
    return BlockPermutation.resolve(prop.blockName, prop.states);
  }

  setDate(name: string, value: Date): PacketData {
    this.set(name, { type: "Date", timestamp: value.getTime() });
    return this;
  }

  getDate(name: string): Date | undefined {
    const prop = this.get(name);
    return new Date(prop.timestamp);
  }

  setBlock(name: string, value: Block): PacketData {
    this.set(name, {
      type: "Block",
      dimension: value.dimension.id,
      x: value.x,
      y: value.y,
      z: value.z,
    });
    return this;
  }

  getBlock(name: string): Block | undefined {
    const prop = this.get(name);
    const dim = world.getDimension(prop.dimension);
    if (!dim) return;
    return dim.getBlock({ x: prop.x, y: prop.y, z: prop.z });
  }

  setEntity(name: string, value: Entity): PacketData {
    this.set(name, { type: "Entity", id: value.id });
    return this;
  }

  getEntity(name: string): Entity | undefined {
    const prop = this.get(name);
    return world.getEntity(prop.id);
  }

  setBlockType(name: string, blockType: string | BlockType): PacketData {
    this.set(name, {
      type: "BlockType",
      id: blockType instanceof BlockType ? blockType.id : blockType,
    });
    return this;
  }

  getBlockType(name: string): BlockType | undefined {
    const prop = this.get(name);
    return BlockTypes.get(prop.id);
  }

  setEntityType(name: string, entityType: string | EntityType): PacketData {
    this.set(name, {
      type: "EntityType",
      id: entityType instanceof EntityType ? entityType.id : entityType,
    });
    return this;
  }

  getEntityType(name: string): EntityType | undefined {
    const prop = this.get(name);
    return EntityTypes.get(prop.id);
  }

  setItemType(name: string, itemType: string | ItemType): PacketData {
    this.set(name, {
      type: "ItemType",
      id: itemType instanceof ItemType ? itemType.id : itemType,
    });
    return this;
  }

  getItemType(name: string): ItemType | undefined {
    const prop = this.get(name);
    return ItemTypes.get(prop.id);
  }

  // NOTE: This doesn't preserve item data. (enchantments, custom name, etc)
  setItemStack(name: string, itemStack: ItemStack): PacketData {
    this.set(name, {
      type: "ItemStack",
      itemType: itemStack.typeId,
      amount: itemStack.amount,
    });
    return this;
  }

  getItemStack(name: string): ItemStack {
    const prop = this.get(name);
    return new ItemStack(prop.itemType, prop.amount);
  }
}

export class PacketEvent {
  readonly id: string;
  readonly packet: PacketData;

  constructor(id: string, packet: PacketData) {
    this.id = id;
    this.packet = packet;
  }
}

export class PacketReceiveEvent extends PacketEvent {
  response: any;

  constructor(id: string, packet: PacketData, response?: any) {
    super(id, packet);
    this.response = response ?? null;
  }
}

export interface PacketReceiveEventOptions {
  namespaces?: string[];
}

export class PacketResponseEvent extends PacketEvent {
  constructor(id: string, packet: PacketData) {
    super(id, packet);
  }
}

export interface PacketResponseEventOptions {
  namespaces?: string[];
}

export interface PacketListener {
  callback: (event: any) => void;
  options?: PacketReceiveEventOptions;
}

export class PacketReceiveEventSignal {
  private listeners: PacketListener[] = [];

  constructor() {}

  size(): number {
    return this.listeners.length;
  }

  subscribe(
    callback: (event: PacketReceiveEvent) => void,
    options?: PacketReceiveEventOptions,
  ): (event: PacketReceiveEvent) => void {
    this.listeners.push({ callback, options });
    return callback;
  }

  unsubscribe(callback: (event: PacketReceiveEvent) => void): void {
    this.listeners = this.listeners.filter((fn) => fn.callback !== callback);
  }

  apply(event: PacketReceiveEvent): void {
    for (const fn of this.listeners) {
      try {
        fn.callback(event);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export class PacketResponseEventSignal {
  private listeners: PacketListener[] = [];

  constructor() {}

  size(): number {
    return this.listeners.length;
  }

  subscribe(
    callback: (event: PacketResponseEvent) => void,
    options?: PacketResponseEventOptions,
  ): (event: PacketResponseEvent) => void {
    this.listeners.push({ callback, options });
    return callback;
  }

  unsubscribe(callback: (event: PacketResponseEvent) => void): void {
    this.listeners = this.listeners.filter((fn) => fn.callback !== callback);
  }

  apply(event: PacketResponseEvent): void {
    for (const fn of this.listeners) {
      try {
        fn.callback(event);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export class Packet {
  static readonly sender = uuid(); // per addon

  static send(identifier: string, data: PacketData): void {
    const eId = `packet:${uuid()}`; // Don't use identifier because of namespace issues.
    const payload = JSON.stringify({
      headers: { type: "request", sender: Packet.sender, id: identifier },
      body: data instanceof PacketData ? data.data : data,
    });
    system.sendScriptEvent(eId, payload);
  }

  // TODO: Timeout
  static sendSync(identifier: string, data: PacketData): Promise<PacketData> {
    return new Promise((resolve, reject) => {
      function cb(event: PacketResponseEvent): void {
        if (event.id !== identifier) return;
        resolve(event.packet);
        PacketEvents.response.unsubscribe(cb);
      }

      PacketEvents.response.subscribe(cb);
      this.send(identifier, data);
    });
  }

  static packetReceive(event: ScriptEventCommandMessageAfterEvent): void {
    const data = JSON.parse(event.message);
    const id = data.headers.id;

    switch (data.headers.type) {
      case "request": // dst
        const pEvent = new PacketReceiveEvent(id.toString(), new PacketData(data.body));
        PacketEvents.receive.apply(pEvent);
        if (!pEvent.response) return;
        // Send response packet.
        const payload = JSON.stringify({
          headers: {
            type: "response",
            sender: Packet.sender,
            id: id.toString(),
          },
          body: pEvent.response instanceof PacketData ? pEvent.response.data : pEvent.response,
        });
        system.sendScriptEvent(event.id, payload);
        return;

      case "response": // src
        const result = new PacketData(data);
        PacketEvents.response.apply(new PacketResponseEvent(id, result));
        return;
      default:
        throw new Error(`'${data.headers.type}' is not a valid packet type!`);
    }
  }
}

export class PacketEvents {
  /**
   * This event fires when a packet is received.
   */
  static readonly receive = new PacketReceiveEventSignal();

  /**
   * This event fires when a packet has been responded.
   */
  static readonly response = new PacketResponseEventSignal();
}

function setup() {
  system.afterEvents.scriptEventReceive.subscribe(Packet.packetReceive, {
    namespaces: ["packet"],
  });
}

setup();
