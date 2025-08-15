import { Player, RawMessage, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { DataStorage } from "../misc/DataStorage";
import { TextUtils } from "../TextUtils";

// TODO: Save options

function t(text: string | RawMessage): string | RawMessage {
  if (typeof text !== "string") return text;
  const content = text.charAt(0) == "#" ? { translate: text.toString().slice(1) } : text;
  return TextUtils.renderMarkdown(content);
}

export class ModalFormEvent {
  constructor(ui: ModalFormData, player: Player, ctx?: any) {
    this.ui = ui;
    this.player = player;
    this.ctx = ctx;
  }

  readonly ui: ModalFormData;
  readonly player: Player;
  readonly ctx: any;
}

export class ModelFormShowEvent extends ModalFormEvent {
  /**
   * When cancel is true it will not show the form.
   */
  cancel: boolean = false;
}

export type FormResult = { [key: string]: boolean | number | string | undefined };

export class ModalFormOnSubmit extends ModalFormEvent {
  constructor(ui: ModalFormData, player: Player, formResult: FormResult, ctx?: any) {
    super(ui, player, ctx);
    this.formResult = formResult;
  }

  readonly formResult: FormResult;
}

export interface ModalOption {
  label: string | RawMessage;
  placeholder?: string | RawMessage;

  type?: "text" | "dropdown" | "slider" | "toggle";
  value?: string | boolean | number;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  tooltip?: string | RawMessage;

  /**
   * Condition to add this option to the menu.
   * @param {ActionFormEvent} event
   * @returns {boolean} When true it will show this option.
   */
  condition?: (event: ModalFormEvent) => boolean;
}

export interface ModalForm {
  title?: string | RawMessage;
  body?: string | RawMessage;
  submitLabel?: string;

  options: { [key: string]: ModalOption };

  /**
   * Function to call when the UI is shown.
   * @param {GuideBookEvent} event
   */
  onShow?: (event: ModalFormEvent) => void;

  /**
   * Function to call when the UI is closed or switched to a new menu.
   * @param {GuideBookEvent} event
   */
  onClose?: (event: ModalFormEvent) => void;

  /**
   * Function to call when submitted.
   * @param {GuideBookEvent} event
   */
  onSubmit?: (event: ModalFormOnSubmit) => void;
}

export class ModalFormHandler {
  form: ModalForm;
  saveValues: boolean;
  readonly id: string;
  readonly store: DataStorage;
  static #lastId: number = 0;

  constructor(form: ModalForm, id?: string, saveValues: boolean = true) {
    this.form = form;
    this.saveValues = saveValues;
    this.id = id ?? `${ModalFormHandler.#lastId++}`;
    this.store = new DataStorage(`mcutils:form_${this.id}`);
  }

  #buildText(ui: ModalFormData, option: ModalOption): void {
    ui.textField(t(option.label), t(option.placeholder ?? ""), {
      defaultValue: option.value?.toString(),
      tooltip: option.tooltip,
    });
  }

  #buildDropdown(ui: ModalFormData, option: ModalOption): void {
    ui.dropdown(t(option.label), option.options ?? ["unset"], {
      defaultValueIndex: (option.value as number) ?? 0,
      tooltip: option.tooltip,
    });
  }

  #buildSlider(ui: ModalFormData, option: ModalOption): void {
    ui.slider(t(option.label), option.min ?? 0, option.max ?? 100, {
      valueStep: option.step ?? 1,
      defaultValue: (option.value as number) ?? 0,
      tooltip: option.tooltip,
    });
  }

  #buildToggle(ui: ModalFormData, option: ModalOption): void {
    ui.toggle(t(option.label), {
      defaultValue: (option.value as boolean) ?? false,
      tooltip: option.tooltip,
    });
  }

  #buildOptions(ui: ModalFormData, option: ModalOption): void {
    switch (option.type ?? "text") {
      case "text":
        return this.#buildText(ui, option);
      case "dropdown":
        return this.#buildDropdown(ui, option);
      case "slider":
        return this.#buildSlider(ui, option);
      case "toggle":
        return this.#buildToggle(ui, option);
    }
  }

  #build(ui: ModalFormData, event: ModalFormEvent): string[] {
    // Build
    if (this.form.title) {
      ui.title(t(this.form.title));
    }
    if (this.form.submitLabel) {
      ui.submitButton(t(this.form.submitLabel));
    }
    const keys: string[] = [];
    if (this.form.options) {
      const defaults: FormResult = this.saveValues ? this.#read() : {};
      for (const k of Object.keys(this.form.options)) {
        const option = this.form.options[k];
        if (option.condition && !option.condition(event)) continue;
        keys.push(k);
        this.#buildOptions(ui, option);
      }
    }
    return keys;
  }

  /**
   * Show this form to the player.
   * @param {Player} player
   * @param {any} ctx
   * @returns {boolean}
   */
  show(player: Player, ctx?: any): boolean {
    const ui = new ModalFormData();
    const event = new ModalFormEvent(ui, player, ctx);
    const showEvent = new ModelFormShowEvent(ui, player, ctx);
    if (this.form.onShow) this.form.onShow(showEvent);
    if (showEvent.cancel) return false;

    const keys = this.#build(ui, event);

    // Show
    const res = ui.show(player);
    res.then((res) => {
      if (res.canceled || res.formValues === undefined)
        return this.form.onClose ? this.form.onClose(event) : undefined;
      const results: FormResult = {};
      for (const i in keys) {
        const v = res.formValues[i];
        const k = keys[i];
        results[k] = v;
      }
      const submit = new ModalFormOnSubmit(ui, player, results, ctx);
      if (this.saveValues) this.#write(results);
      if (this.form.onSubmit) this.form.onSubmit(submit);
    });
    return true;
  }

  /**
   * Show the form to all players.
   * @param {any} ctx
   */
  showAll(ctx?: any): void {
    for (const player of world.getAllPlayers()) {
      this.show(player, ctx);
    }
  }

  #read(): FormResult {
    const results: FormResult = {};
    const keys = this.store.keys();
    for (const k of keys) {
      results[k] = this.store.getItem(k) as boolean | number | string;
    }
    return results;
  }

  #write(value: FormResult): void {
    this.store.update(value);
  }
}
