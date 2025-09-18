import { world, World, Vector3, PlayerLeaveBeforeEvent, Entity, ItemStack, ContainerSlot } from "@minecraft/server";

export class DataStorage {
  static instances = new Map<string, DataStorage>();

  readonly rootId: string;
  readonly core: World | Entity | ItemStack | ContainerSlot;
  constructor(rootId: string, core?: World | Entity | ItemStack | ContainerSlot) {
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

  getItem(key: string): string | number | boolean | Vector3 | undefined {
    var res = this.core.getDynamicProperty(this.rootId);
    if (!res) res = "{}";
    var data = JSON.parse(res.toString());
    return data[key];
  }

  hasItem(key: string): boolean {
    var item = this.getItem(key);
    return item !== undefined;
  }

  removeItem(key: string): void {
    var res = this.core.getDynamicProperty(this.rootId);
    if (!res) res = "{}";
    var data = JSON.parse(res.toString());
    delete data[key];
    this.core.setDynamicProperty(this.rootId, JSON.stringify(data));
  }

  setItem(key: string, value?: string | number | boolean | Vector3 | undefined): void {
    var res = this.core.getDynamicProperty(this.rootId);
    if (!res) res = "{}";
    var data = JSON.parse(res.toString());
    data[key] = value;
    this.core.setDynamicProperty(this.rootId, JSON.stringify(data));
  }

  clear(): void {
    this.core.setDynamicProperty(this.rootId, undefined);
  }

  keys(): string[] {
    var res = this.core.getDynamicProperty(this.rootId);
    if (res == undefined) res = "{}";
    var data = JSON.parse(res.toString());
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

  // Alias
  get = this.getItem;
  set = this.setItem;
  delete = this.removeItem;
  has = this.hasItem;
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
