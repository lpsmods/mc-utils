import { Player } from "@minecraft/server";
import { PropertyValue } from "./constants";
import { ModalForm, ModalFormHandler } from "./ui";
import { DynamicObject, VersionedDataStorage } from "./data";

export interface SettingDescriptor {
  value?: PropertyValue;
  type: "string" | "number" | "boolean" | "Vector3";
  min?: number;
  max?: number;
  values?: string[];
  title?: string;
  description?: string;
}

export interface SettingsOptions {
  formatVersion?: number;
  core?: DynamicObject;
}

export class Settings {
  readonly id: string;
  readonly store: VersionedDataStorage;
  readonly options: SettingsOptions;
  descriptor = new Map<string, SettingDescriptor>();

  constructor(id: string, options?: SettingsOptions) {
    this.id = id;
    this.options = options ?? {};
    this.store = new VersionedDataStorage(this.id, this.options.formatVersion ?? 1, this.options.core);
  }

  getDescriptor(): Map<string, SettingDescriptor> {
    return this.descriptor;
  }

  defineProperty(name: string, descriptor: SettingDescriptor): void {
    this.getDescriptor().set(name, descriptor);
  }

  get(name: string, fallbackValue?: any): any {
    const prop = this.getDescriptor().get(name);
    if (!prop) throw new Error(`${name} is not defined!`);
    return this.store.get(name) ?? fallbackValue ?? prop.value;
  }

  set(name: string, value?: any): void {
    if (!this.getDescriptor().has(name)) {
      throw new Error(`${name} is not defined!`);
    }
    return this.store.set(name, value);
  }

  reset(): void {
    for (const k of this.getDescriptor().keys()) {
      this.set(k);
    }
  }

  update(data: { [key: string]: any }): void {
    for (const [k, v] of Object.entries(data)) {
      this.set(k, v);
    }
  }

  show(player: Player, title?: string): void {
    const form: ModalForm = {
      title: title ?? "World Settings",
      options: {},
      onSubmit: (event) => {
        this.update(event.formResult);
      },
    };

    for (const [k, prop] of this.getDescriptor().entries()) {
      const label = prop.title ?? k;
      const tooltip = prop.description;
      switch (prop.type) {
        case "string":
          form.options[k] = { label, tooltip, type: "text", value: this.get(k) as string };
          if (prop.values) {
            form.options[k].type = "dropdown";
            form.options[k].options = prop.values;
          }
          break;
        case "number":
          form.options[k] = {
            label,
            tooltip,
            type: "slider",
            value: this.get(k) as number,
            min: prop.min,
            max: prop.max,
          };
          break;
        case "boolean":
          form.options[k] = { label, tooltip, type: "toggle", value: this.get(k) as boolean };
          break;
        case "Vector3":
          form.options[k] = { label, tooltip, type: "text", value: JSON.stringify(this.get(k)) as string };
          break;
        default:
          throw new Error(`Unsupported type ${prop.type}`);
      }
    }

    const ui = new ModalFormHandler(form);
    ui.show(player);
  }
}

/**
 * Per player settings.
 */
export class PlayerSettings extends Settings {
  readonly player: Player;
  static descriptor = new Map<string, SettingDescriptor>();

  constructor(player: Player, formatVersion?: number, id?: string) {
    super(id ?? "mcutils:settings", { formatVersion, core: player });
    this.player = player;
  }

  getDescriptor(): Map<string, SettingDescriptor> {
    return PlayerSettings.descriptor;
  }

  static defineProperty(name: string, descriptor: SettingDescriptor): void {
    this.descriptor.set(name, descriptor);
  }

  show(title?: string): void;
  override show(player: Player, title?: string): void;
  show(arg1?: Player | string, arg2?: string): void {
    if (typeof arg1 === "string" || arg1 === undefined) {
      super.show(this.player, arg2);
    } else {
      super.show(arg1, arg2);
    }
  }
}
