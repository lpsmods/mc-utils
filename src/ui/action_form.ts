import { Player, RawMessage, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { TextUtils } from "../utils/text";

export class ActionFormEvent {
  constructor(ui: ActionFormData, player: Player, ctx?: any) {
    this.ui = ui;
    this.player = player;
    this.ctx = ctx;
  }

  readonly ui: ActionFormData;
  readonly player: Player;
  readonly ctx: any;
}

export class ActionFormShowEvent extends ActionFormEvent {
  /**
   * When cancel is true it will not show the form.
   */
  cancel: boolean = false;
}

export interface ActionButton {
  label: string | RawMessage;
  icon?: string;

  top_margin?: number;
  bottom_margin?: number;
  top_divider?: boolean;
  bottom_divider?: boolean;

  /**
   * Function to call when the button has been pressed.
   * @param {ActionFormEvent} event
   */
  onClick?: (event: ActionFormEvent) => void;

  /**
   * Condition to add this button to the menu.
   * @param {ActionFormEvent} event
   * @returns {boolean} When true it will show this button.
   */
  condition?: (event: ActionFormEvent) => boolean;
}

export interface ActionForm {
  title?: string | RawMessage;
  body?: string | RawMessage;

  /**
   * An array of buttons.
   */
  buttons?: ActionButton[];

  /**
   * Function to call when the UI is shown.
   * @param {ActionFormEvent} event
   */
  onShow?: (event: ActionFormEvent) => void;

  /**
   * Function to call when the UI is closed or switched to a new menu.
   * @param {ActionFormEvent} event
   */
  onClose?: (event: ActionFormEvent) => void;
}

function t(text: string | RawMessage): string | RawMessage {
  if (typeof text !== "string") return text;
  const content = text.charAt(0) == "#" ? { translate: text.toString().slice(1) } : text;
  return TextUtils.renderMarkdown(content);
}

export interface ActionFormHandlerOptions {
  id?: string;
}

export class ActionFormHandler {
  form: ActionForm;
  readonly options: ActionFormHandlerOptions;
  readonly id: string;
  static #lastId: number = 0;

  constructor(form: ActionForm, options?: ActionFormHandlerOptions) {
    this.options = options ?? {};
    this.form = form;
    this.id = this.options.id ?? `${ActionFormHandler.#lastId++}`;
  }

  /**
   * Show this form to the player.
   * @param {Player} player
   * @param {any} ctx
   * @returns {boolean}
   */
  show(player: Player, ctx?: any): boolean {
    const ui = new ActionFormData();
    const event = new ActionFormEvent(ui, player, ctx);
    const showEvent = new ActionFormShowEvent(ui, player, ctx);
    if (this.form.onShow) this.form.onShow(showEvent);
    if (showEvent.cancel) return false;

    // Build
    if (this.form.title) {
      ui.title(t(this.form.title));
    }

    if (this.form.body) {
      ui.body(t(this.form.body));
    }

    const btns: ActionButton[] = [];
    if (this.form.buttons) {
      for (const btn of this.form.buttons) {
        if (btn.condition && !btn.condition(event)) continue;
        if (btn.top_margin) for (let c = 0; c < btn.top_margin; c++) ui.label("");
        if (btn.top_divider) ui.divider();
        ui.button(t(btn.label), btn.icon);
        if (btn.bottom_margin) for (let c = 0; c < btn.bottom_margin; c++) ui.label("");
        if (btn.bottom_divider) ui.divider();
        btns.push(btn);
      }
    }

    // Show
    const res = ui.show(player);
    res.then((res) => {
      if (this.form.onClose) this.form.onClose(event);
      if (res.canceled) return;
      if (res.selection === undefined) return;
      const btn = btns[res.selection];
      if (btn.onClick) btn.onClick(event);
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
}
