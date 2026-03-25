import { Player } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";

import { TextKey } from "../text";

/**
 * Message dialog class
 */
export class MessageBox {
  message: string;
  title: string;
  buttons: string[] = [];

  constructor(message?: string, title?: string, type?: string) {
    this.message = message ?? "";
    this.title = title ?? "";
    switch (type ?? "ok") {
      case "okcancel":
        this.buttons.push(TextKey.Ok, TextKey.Cancel);
        break;
      case "retrycancel":
        this.buttons.push(TextKey.Retry, TextKey.Cancel);
        break;
      case "yesno":
        this.buttons.push(TextKey.Yes, TextKey.No);
        break;
      case "yesnocancel":
        this.buttons.push(TextKey.Yes, TextKey.No, TextKey.Cancel);
        break;
      default:
        this.buttons.push(TextKey.Ok);
        break;
    }
  }

  private buildUI(): MessageFormData | ActionFormData {
    let ui;
    let msg = this.message ?? "Message";
    if (this.buttons.length > 2) {
      ui = new ActionFormData();
      msg += "\n\n";
      for (const btn of this.buttons) {
        ui.button(btn);
      }
    } else {
      ui = new MessageFormData();
      ui.button1(this.buttons[0] ?? TextKey.Ok);
      ui.button2(this.buttons[1] ?? TextKey.Close);
    }
    ui.title(this.title);
    ui.body(msg);
    return ui;
  }

  async show(player: Player): Promise<string> {
    return new Promise((resolve) => {
      const ui = this.buildUI();
      ui.show(player)
        .then((event) => {
          const result =
            event.canceled || event.selection === undefined ? TextKey.Cancel : this.buttons[event.selection];
          resolve(this.fixResult(result));
        })
        .catch(() => {
          resolve("cancel");
        });
    });
  }

  fixResult(value: string): string {
    return value.replace("gui.", "");
  }
}

async function _show(player: Player, title?: string, message?: string, type?: string): Promise<string> {
  const res = await new MessageBox(message, title, type).show(player);
  if (typeof res === "boolean") {
    return res ? "yes" : "no";
  }
  return res.toString();
}

// Information message box

/**
 * Show an info message
 * @param {Player} player
 * @param {string} title
 * @param {string} message
 * @returns {any}
 */
export function showInfo(player: Player, title?: string, message?: string): any {
  return _show(player, title, message, "ok");
}

/**
 * Show a warning message
 * @param {Player} player
 * @param {string} title
 * @param {string} message
 * @returns {any}
 */
export function showWarning(player: Player, title?: string, message?: string): any {
  return _show(player, title, message, "ok");
}

/**
 * Show an error message
 * @param {Player} player
 * @param {string} title
 * @param {string} message
 * @returns {any}
 */
export function showError(player: Player, title?: string, message?: string): any {
  return _show(player, title, message, "ok");
}

// Question message boxes

/**
 * Ask a question
 * @param {Player} player
 * @param {string} title
 * @param {string} message
 * @returns {any}
 */
export function askQuestion(player: Player, title?: string, message?: string): any {
  return _show(player, title, message, "yesno");
}

/**
 * Ask if operation should proceed; return true if the answer is ok
 * @param {Player} player
 * @param {string} title
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export async function askOkCancel(player: Player, title?: string, message?: string): Promise<boolean> {
  const s = await _show(player, title, message, "okcancel");
  return s === "ok";
}

/**
 * Ask a question; return true if answer is yes
 * @param {Player} player
 * @param {string} title
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export async function askYesNo(player: Player, title?: string, message?: string): Promise<boolean> {
  const s = await _show(player, title, message, "yesno");
  return s === "yes";
}

/**
 * Ask a question; return true if answer is yes, undefined if cancelled
 * @param {Player} player
 * @param {string} title
 * @param {string} message
 * @returns {Promise<boolean|undefined>}
 */
export async function askYesNoCancel(player: Player, title?: string, message?: string): Promise<boolean | undefined> {
  let s = await _show(player, title, message, "yesnocancel");
  s = s.toString();
  if (s === "cancel") return undefined;
  return s === "yes";
}

/**
 * Ask if operation should be retried; return true if the answer is yes
 * @param {Player} player
 * @param {string} title
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export async function askRetryCancel(player: Player, title?: string, message?: string): Promise<boolean> {
  const s = await _show(player, title, message, "retrycancel");
  return s === "retry";
}
