import { CustomComponentParameters } from "@minecraft/server";

export interface Option {
  type: object;
  defaultValue: any;
}

export class OptionsHandler {
  specs: { [key: string]: Option } = {};
  options: {[key: string]: any} = {};

  constructor() {}

  option(key: string, type: object, defaultValue?: any): OptionsHandler {
    this.specs[key] = { type: type, defaultValue: defaultValue };
    return this;
  }

  string(key: string): OptionsHandler {
    return this.option(key, String);
  }

  number(key: string) {
    return this.option(key, Number, 0);
  }

  boolean(key: string) {
    return this.option(key, Boolean, 0);
  }

  get(key: string): any {
    return this.options[key] ?? this.specs[key]?.defaultValue;
  }

  isValid(arg: CustomComponentParameters): boolean {
    try {
      this.validate(arg);
      return true;
    } catch (err) {}
    return false;
  }

  parse(arg: CustomComponentParameters) {
    this.options = arg.params as { [key: string]: any };
    this.validate(arg);
  }

  validate(arg: CustomComponentParameters): OptionsHandler {
    return this;
  }

}
