import { Player, world, WorldAfterEvents } from "@minecraft/server";
import { AddonUtils } from "./addon";
import { propertyType } from "./constants";

// TODO: Test in-game
/**
 * Global world settings.
 */
export abstract class WorldSettings {
  static readonly settingId: string = AddonUtils.makeId("settings");
  static autoSave: boolean = true;

  private static descriptor = new Map<string, propertyType>();
  private static properties = new Map<string, propertyType>();

  static get(name: string): propertyType {
    if (!this.descriptor.has(name)) {
      throw new Error(`${name} is not defined!`);
    }
    const defaultValue = this.descriptor.get(name);
    const v = this.properties.get(name);
    if (v === undefined) return defaultValue;
    return v;
  }

  static set(name: string, value?: propertyType): void {
    if (!this.descriptor.has(name)) {
      throw new Error(`${name} is not defined!`);
    }
    this.properties.set(name, value);
    if (WorldSettings.autoSave) this.save();
  }

  static defineProperty(name: string, defaultValue?: propertyType): void {
    this.descriptor.set(name, defaultValue);
  }

  static load(): void {
    const data = JSON.parse((world.getDynamicProperty(this.settingId) as string) ?? "{}");
    for (const key of this.descriptor.keys()) {
      this.properties.set(key, data[key]);
    }
  }

  static save(): void {
    const data: { [key: string]: propertyType } = {};
    for (const [key, defaultValue] of this.descriptor.entries()) {
      const v = this.properties.get(key);
      data[key] = v === undefined ? defaultValue : v;
    }
    world.setDynamicProperty(this.settingId, JSON.stringify(data));
  }

  /**
   * Reset world settings.
   */
  static reset(): void {
    for (const k of this.descriptor.keys()) {
      this.set(k);
    }
  }
}

/**
 * Per player settings.
 */
export class PlayerSettings {
  readonly settingId: string = AddonUtils.makeId("settings");

  private static descriptor = new Map<string, propertyType>();

  private properties = new Map<string, propertyType>();
  readonly player: Player;
  autoSave: boolean;

  constructor(player: Player, autoSave: boolean = true) {
    this.player = player;
    this.autoSave = autoSave;
    this.load();
  }

  get(name: string): propertyType {
    if (!PlayerSettings.descriptor.has(name)) {
      throw new Error(`${name} is not defined!`);
    }
    const defaultValue = PlayerSettings.descriptor.get(name);
    const v = this.properties.get(name);
    if (v === undefined) return defaultValue;
    return v;
  }

  set(name: string, value?: propertyType): void {
    if (!PlayerSettings.descriptor.has(name)) {
      throw new Error(`${name} is not defined!`);
    }
    this.properties.set(name, value);
    if (this.autoSave) this.save();
  }

  static defineProperty(name: string, defaultValue?: propertyType): void {
    this.descriptor.set(name, defaultValue);
  }

  load(): void {
    const data = JSON.parse((this.player.getDynamicProperty(this.settingId) as string) ?? "{}");
    for (const key of PlayerSettings.descriptor.keys()) {
      this.properties.set(key, data[key]);
    }
  }

  save(): void {
    const data: { [key: string]: propertyType } = {};
    for (const [key, defaultValue] of PlayerSettings.descriptor.entries()) {
      const v = this.properties.get(key);
      data[key] = v === undefined ? defaultValue : v;
    }
    this.player.setDynamicProperty(this.settingId, JSON.stringify(data));
  }

  /**
   * Reset player settings.
   */
  reset(): void {
    for (const k of PlayerSettings.descriptor.keys()) {
      this.set(k);
    }
  }
}

world.afterEvents.worldLoad.subscribe(() => WorldSettings.load());
