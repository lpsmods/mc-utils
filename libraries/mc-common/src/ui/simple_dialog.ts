import { Player } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";

import { showWarning } from "./message_box";
import { TextKey } from "../text";

// TODO: implement https://github.com/python/cpython/blob/3.14/Lib/tkinter/simpledialog.py
export class SimpleDialog {}

export class Dialog {
  player: Player;
  result?: any;
  ui: ModalFormData;

  constructor(player: Player, title?: string) {
    this.player = player;

    this.ui = new ModalFormData();
    if (title) this.ui.title(title);

    this.body();
    this.buttonBox();
  }

  body(): void {}

  buttonBox(): void {
    this.ui.submitButton(TextKey.Ok);
  }

  ok(event: ModalFormResponse): void {
    // Reopen if invalid
    const bl = this.validate(event);
    if (!bl) {
      console.warn("ERROR!");
      this.show();
      return;
    }
    this.onApply();
  }

  async show(): Promise<Dialog> {
    return new Promise((resolve) => {
      this.ui.show(this.player).then((event) => {
        if (event.canceled) return;
        this.ok(event);
        resolve(this);
      });
    });
  }

  // Command hooks

  onApply(): void {}

  validate(event: ModalFormResponse): boolean {
    return true;
  }
}

class QueryDialog extends Dialog {
  errorMessage: string = "";

  prompt: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: any;

  constructor(player: Player, title: string, prompt: string, defaultValue?: any, minValue?: number, maxValue?: number) {
    super(player, title);
    this.prompt = prompt;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.defaultValue = defaultValue;
  }

  getResult(formValues?: (string | number | boolean | undefined)[]): any {
    return undefined;
  }

  body(): void {
    this.ui.label(this.prompt ?? "");

    // TODO: Use slider if minValue and maxValue
    this.ui.textField("", "", { defaultValue: this.defaultValue?.toString() });
  }

  validate(event: ModalFormResponse): boolean {
    let result;
    try {
      result = this.getResult(event.formValues);
    } catch (err) {
      showWarning(this.player, "Illegal value", this.errorMessage + "\nPlease try again.");
      return false;
    }

    if (this.minValue !== undefined && result < this.minValue) {
      showWarning(this.player, "Too small", `The allowed minimum value is ${this.minValue}.\nPlease try again.`);
      return false;
    }

    if (this.maxValue !== undefined && result > this.maxValue) {
      showWarning(this.player, "Too large", `The allowed maximum value is ${this.maxValue}.\nPlease try again.`);
      return false;
    }

    this.result = result;
    return true;
  }
}

class QueryInteger extends QueryDialog {
  errormessage = "Not an integer.";
  getResult(formValues?: (string | number | boolean | undefined)[]): any {
    return formValues ? Number.parseInt(formValues[0] as string) : 0.0;
  }
}

export async function askInteger(player: Player, title: string, prompt: string): Promise<number> {
  const d = await new QueryInteger(player, title, prompt).show();
  return d.result;
}

class QueryFloat extends QueryDialog {
  errormessage = "Not a floating-point value.";

  getResult(formValues?: (string | number | boolean | undefined)[]): any {
    return formValues ? Number.parseFloat(formValues[0] as string) : 0.0;
  }
}

export async function askFloat(player: Player, title: string, prompt: string): Promise<number> {
  const d = await new QueryFloat(player, title, prompt).show();
  return d.result;
}

class QueryString extends QueryDialog {
  getResult(formValues?: (string | number | boolean | undefined)[]): any {
    return formValues ? formValues[0]?.toString() : "";
  }
}

export async function askString(player: Player, title: string, prompt: string): Promise<string> {
  const d = await new QueryString(player, title, prompt).show();
  return d.result;
}
