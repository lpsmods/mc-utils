import { world, World, Vector3, PlayerLeaveBeforeEvent, Entity, ItemStack, ContainerSlot } from "@minecraft/server";
import { DataUtils, DynamicObject } from "./utils";
import { PropertyValue } from "../constants";

export class DataStorage {
  static instances = new Map<string, DataStorage>();

  readonly rootId: string;
  readonly core: World | Entity | ItemStack | ContainerSlot;

  /**
   * Stores data.
   * @param {string} rootId
   * @param {DynamicObject} core
   */
  constructor(rootId: string, core?: DynamicObject) {
    this.rootId = rootId;
    this.core = core ?? world;
    DataStorage.instances.set(rootId, this);
    this.onLoad();
  }

  /**
   * Fires when this storage is loaded.
   */
  onLoad(): void {}

  /**
   * Fires when this storage is unloaded.
   */
  onUnload(): void {}

  getItem(key: string, defaultValue?: any): any {
    const data = this.read();
    return data[key] ?? defaultValue;
  }

  hasItem(key: string): boolean {
    var item = this.getItem(key);
    return item !== undefined;
  }

  removeItem(key: string): void {
    const data = this.read();
    delete data[key];
    this.write(data);
  }

  setItem(key: string, value?: any): void {
    const data = this.read();
    data[key] = value;
    this.write(data);
  }

  clear(): void {
    this.core.setDynamicProperty(this.rootId, undefined);
  }

  keys(): string[] {
    const data = this.read();
    return Object.keys(data);
  }

  getSize(): number {
    var res = this.core.getDynamicProperty(this.rootId);
    if (!res) return 0;
    var str = res.toString();
    let bytes = 0;
    for (let i = 0; i < str.length; i++) {
      const codePoint = str.charCodeAt(i);

      if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < str.length) {
        // Handle surrogate pair
        const next = str.charCodeAt(i + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          const fullCodePoint = ((codePoint - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
          bytes += 4;
          i++; // Skip the next char
          continue;
        }
      }

      if (codePoint < 0x80) {
        bytes += 1;
      } else if (codePoint < 0x800) {
        bytes += 2;
      } else {
        bytes += 3;
      }
    }
    return bytes;
  }

  update(data: { [key: string]: string | number | boolean | Vector3 | undefined }): void {
    for (const k of Object.keys(data)) {
      const v = data[k];
      this.setItem(k, v);
    }
  }

  remove() {
    this.clear();
    DataStorage.instances.delete(this.rootId);
  }

  read(): any {
    return DataUtils.getDynamicProperty(this.core, this.rootId, {});
  }

  write(data: any): void {
    return DataUtils.setDynamicProperty(this.core, this.rootId, data);
  }

  // Alias
  get = this.getItem;
  set = this.setItem;
  delete = this.removeItem;
  has = this.hasItem;
}

export interface VersionedDataSchema {
  minFormat: number;
  maxFormat: number;
  callback: (data: { [key: string]: PropertyValue }) => void;
}

export class VersionedDataStorage extends DataStorage {
  readonly formatVersion: number;
  schemas = new Map<string, VersionedDataSchema>();

  /**
   * Stores versioned data.
   * @param {string} rootId
   * @param {number} formatVersion The current data version.
   * @param {DynamicObject} core
   */
  constructor(rootId: string, formatVersion: number, core?: DynamicObject) {
    super(rootId, core);
    this.formatVersion = formatVersion;
  }

  read(): any {
    const data = DataUtils.getDynamicProperty(this.core, this.rootId, { format_version: this.formatVersion });
    // Update data
    if (data.format_version < this.formatVersion) {
      for (const schema of this.schemas.values()) {
        if (schema.minFormat > this.formatVersion || schema.maxFormat < this.formatVersion) continue;
        schema.callback(data);
      }
      data.format_version = this.formatVersion;
      this.write(data);
    }
    return data;
  }

  write(data: any): void {
    return DataUtils.setDynamicProperty(this.core, this.rootId, data);
  }

  addSchema(name: string, schema: VersionedDataSchema): void {
    this.schemas.set(name, schema);
  }

  removeSchema(name: string): void {
    this.schemas.delete(name);
  }
}

export class LocalStorage extends DataStorage {
  constructor() {
    super("mcutils:local_storage");
  }
}

export class SessionStorage extends DataStorage {
  constructor() {
    super("mcutils:session_storage");
  }

  onUnload(): void {
    this.remove();
  }
}

export const localStorage = new LocalStorage();
export const sessionStorage = new SessionStorage();

// Events

function playerLeave(event: PlayerLeaveBeforeEvent): void {
  const count = world.getAllPlayers().length;
  if (count > 1) return;
  for (const store of DataStorage.instances.values()) {
    store.onUnload();
  }
}

world.beforeEvents.playerLeave.subscribe(playerLeave);
