/**
 * Generic text functions.
 */

import { RawMessage } from "@minecraft/server";
import { Registry } from "@bedrock-oss/add-on-registry";

import { ChatColor } from "./constants";
import { Id, Identifier } from "./identifier";

/**
 * Generic text translations.
 */
export enum TextKey {
  Save = "structure_block.mode.save",
  Accept = "gui.accept",
  All = "gui.all",
  Back = "gui.back",
  Cancel = "gui.cancel",
  Clear = "gui.clear",
  Close = "gui.close",
  Confirm = "gui.confirm",
  Custom = "gui.custom",
  Default = "gui.default",
  Decline = "gui.decline",
  Delete = "gui.delete",
  Done = "gui.done",
  Down = "gui.down",
  Edit = "gui.edit",
  Error = "gui.error",
  Exit = "gui.exit",
  Previous = "gui.previous",
  GoBack = "gui.goBack",
  Import = "gui.import",
  Next = "gui.next",
  None = "gui.none",
  No = "gui.no",
  Ok = "gui.ok",
  Login = "gui.login",
  Logout = "gui.logout",
  Continue = "gui.continue",
  Retry = "gui.retry",
  Select = "gui.select",
  Skip = "gui.skip",
  Tab = "gui.tab",
  Okay = "gui.okay",
  Up = "gui.up",
  TryAgain = "gui.tryAgain",
  Yes = "gui.yes",
  Submit = "gui.submit",
  Hide = "gui.hide",
  Host = "menu.host",
  Inbox = "menu.inbox",
  Multiplayer = "menu.multiplayer",
  Options = "menu.options",
  Settings = "menu.settings",
  Play = "menu.play",
  Preview = "menu.preview",
  Profile = "menu.profile",
  Singleplayer = "menu.singleplayer",
  Saving = "menu.saving",
  Onboard = "mount.onboard",
  Black = "color.black",
  DarkBlue = "color.dark_blue",
  DarkGreen = "color.dark_green",
  DarkAqua = "color.dark_aqua",
  DarkRed = "color.dark_red",
  DarkPurple = "color.dark_purple",
  Gold = "color.gold",
  Gray = "color.gray",
  DarkGray = "color.dark_gray",
  Blue = "color.blue",
  Green = "color.green",
  Aqua = "color.aqua",
  Red = "color.red",
  LightPurple = "color.light_purple",
  Yellow = "color.yellow",
  White = "color.white",
}

/**
 * Input key shortcodes.
 */
export enum InputKey {
  // Generic
  Attack = ":_input_key.attack:",
  Use = ":_input_key.use:",
  Chat = ":_input_key.chat:",
  Drop = ":_input_key.drop:",
  Emote = ":_input_key.emote:",
  Jump = ":_input_key.jump:",
  Sneak = ":_input_key.sneak:",
  Sprint = ":_input_key.sprint:",
  Forward = ":_input_key.forward:",
  Back = ":_input_key.back:",
  Left = ":_input_key.left:",
  Right = ":_input_key.right:",
  Inventory = ":_input_key.inventory:",
  CycleItemLeft = ":_input_key.cycleItemLeft:",
  CycleItemRight = ":_input_key.cycleItemRight:",
  TogglePerspective = ":_input_key.togglePerspective:",
  PickBlock = ":_input_key.pickItem:",

  // Keyboard & mouse
  HotbarSlot1 = ":_input_key.hotbar.1:",
  HotbarSlot2 = ":_input_key.hotbar.2:",
  HotbarSlot3 = ":_input_key.hotbar.3:",
  HotbarSlot4 = ":_input_key.hotbar.4:",
  HotbarSlot5 = ":_input_key.hotbar.5:",
  HotbarSlot6 = ":_input_key.hotbar.6:",
  HotbarSlot7 = ":_input_key.hotbar.7:",
  HotbarSlot8 = ":_input_key.hotbar.8:",
  HotbarSlot9 = ":_input_key.hotbar.9:",
  LookUpSlight = ":_input_key.lookUpSlight:",
  LookDownSlight = ":_input_key.lookDownSlight:",
  LookDownLeft = ":_input_key.lookDownLeft:",
  LookDown = ":_input_key.lookDown:",
  LookDownRight = ":_input_key.lookDownRight:",
  LookLeft = ":_input_key.lookLeft:",
  LookCenter = ":_input_key.lookCenter:",
  LookRight = ":_input_key.lookRight:",
  LookUpLeft = ":_input_key.lookUpLeft:",
  LookUp = ":_input_key.lookUp:",
  LookUpRight = ":_input_key.lookUpRight:",
  LookUpSmooth = ":_input_key.lookUpSmooth:",
  LookDownSmooth = ":_input_key.lookDownSmooth:",
  LookLeftSmooth = ":_input_key.lookLeftSmooth:",
  LookRightSmooth = ":_input_key.lookRightSmooth:",
  MenuCancel = ":_input_key.menuCancel:",
  MobEffects = ":_input_key.mobEffects:",
  OpenCommand = ":_input_key.command:",
  OpenNotification = ":_input_key.interactwithtoast:",

  // Controller
  FlyUpSlow = ":_input_key.flyUpSlow:",
  FlyDownSlow = ":_input_key.flyDownSlow:",
  MobEffectsOpenNotification = ":_input_key.mobeffectsandinteractwithtoast:",
}

/**
 * Emoji shortcodes. (or character if no shortcode)
 */
export enum Emoji {
  WoodenPickaxe = ":wood_pickaxe:",
  WoodenSword = ":wood_sword:",
  CraftingTable = ":crafting_table:",
  Furnace = ":furnace:",
  Armor = ":armor:",
  Crosshair = ":tip_crosshair:",
  Food = ":shank:",
  Heart = ":heart:",
  Minecoin = ":minecoin:",
  Token = ":minecoin:",
  CraftableToggleOn = ":craftable_toggle_on:",
  CraftableToggleOff = ":craftable_toggle_off:",
  MouseLeftButton = ":mouse_left_button:",
  MouseRightButton = ":mouse_right_button:",
  MouseMiddleButton = ":mouse_middle_button:",
  MouseButton = ":mouse_button:",
  LightMouseLeftButton = ":light_mouse_left_button:",
  LightMouseRightButton = ":light_mouse_right_button:",
  LightMouseMiddleButton = ":light_mouse_middle_button:",
  LightMouseButton = ":light_mouse_button:",
  Forward = ":touch_forward:",
  Left = ":touch_left:",
  Back = ":touch_back:",
  Right = ":touch_right:",
  Jump = ":touch_jump:",
  Sneak = ":touch_sneak:",
  Emote = "",
  Chat = ":touch_chat:",
  Pause = "",
  SprintDoubleTap = ":touch_sprint_double_tap:",
  Attack = ":tip_virtual_button_action_attack_or_destroy:",
  Joystick = ":tip_virtual_joystick:",
  JoystickForward = ":touch_virtual_joystick_forward:",
  JoystickLeft = ":touch_virtual_joystick_left:",
  JoystickBack = ":touch_virtual_joystick_back:",
  JoystickRight = ":touch_virtual_joystick_right:",
  Place = ":tip_virtual_button_action_build_or_use:",
  Sprint = ":tip_virtual_button_sprint: :touch_sprint:",
  FlyUp = ":tip_virtual_button_fly_up:",
  FlyDown = ":tip_virtual_button_fly_down:",
  Dismount = ":tip_virtual_button_dismount:",
  TouchFlyUp = ":touch_fly_up:",
  TouchFlyDown = ":touch_fly_down:",
  StopFlying = ":touch_stop_flying:",
  SmallSneak = ":tip_touch_sneak:",
  SmallJump = ":tip_touch_jump:",
  SmallInventory = ":tip_touch_inventory:",
  SmallFlyUp = ":tip_touch_fly_up:",
  SmallFlyDown = ":tip_touch_fly_down:",
  SmallUpArrow = ":tip_touch_forward:",
  SmallLeftArrow = ":tip_touch_left:",
  SmallDownArrow = ":tip_touch_back:",
  SmallRightArrow = ":tip_touch_right:",
  SwitchLeftStickUp = ":switch_left_stick_up:",
  SwitchLeftStickLeft = ":switch_left_stick_left:",
  SwitchLeftStickDown = ":switch_left_stick_down:",
  SwitchLeftStickRight = ":switch_left_stick_right:",
  SwitchRightStickUp = ":switch_right_stick_up:",
  SwitchRightStickLeft = ":switch_right_stick_left:",
  SwitchRightStickDown = ":switch_right_stick_down:",
  SwitchRightStickRight = ":switch_right_stick_right:",
  SwitchA = ":switch_face_button_down:",
  SwitchB = ":switch_face_button_right:",
  SwitchX = ":switch_face_button_left:",
  SwitchY = ":switch_face_button_up:",
  SwitchLeftBumper = ":switch_bumper_left:",
  SwitchRightBumper = ":switch_bumper_right:",
  SwitchLeftTrigger = ":switch_trigger_left:",
  SwitchRightTrigger = ":switch_trigger_right:",
  SwitchSelect = ":switch_select:",
  SwitchStart = ":switch_start:",
  SwitchLeftStick = ":switch_stick_left:",
  SwitchRightStick = ":switch_stick_right:",
  SwitchDPadUp = ":switch_dpad_up:",
  SwitchDPadLeft = ":switch_dpad_left:",
  SwitchDPadDown = ":switch_dpad_down:",
  SwitchDPadRight = ":switch_dpad_right:",
  Ps4LeftStickUp = ":ps4_left_stick_up:",
  Ps4LeftStickLeft = ":ps4_left_stick_left:",
  Ps4LeftStickDown = ":ps4_left_stick_down:",
  Ps4LeftStickRight = ":ps4_left_stick_right:",
  Ps4RightStickUp = ":ps4_right_stick_up:",
  Ps4RightStickLeft = ":ps4_right_stick_left:",
  Ps4RightStickDown = ":ps4_right_stick_down:",
  Ps4RightStickRight = ":ps4_right_stick_right:",
  Ps4Cross = ":ps4_face_button_down:",
  Ps4Circle = ":ps4_face_button_right:",
  Ps4Square = ":ps4_face_button_left:",
  Ps4Triangle = ":ps4_face_button_up:",
  Ps4LeftBumper = ":ps4_bumper_left:",
  Ps4RightBumper = ":ps4_bumper_right:",
  Ps4LeftTrigger = ":ps4_trigger_left:",
  Ps4RightTrigger = ":ps4_trigger_right:",
  Ps4TouchPad = ":ps4_select:",
  Ps4OptionsShare = ":ps4_start:",
  Ps4LeftStick = ":ps4_stick_left:",
  Ps4RightStick = ":ps4_stick_right:",
  Ps4dPadUp = ":ps4_dpad_up:",
  Ps4dPadLeft = ":ps4_dpad_left:",
  Ps4dPadDown = ":ps4_dpad_down:",
  Ps4dPadRight = ":ps4_dpad_right:",
  OculusZero = "",
  OculusB = "",
  OculusA = "",
  OculusY = "",
  OculusX = "",
  OculusLeftGrip = "",
  OculusRightGrip = "",
  OculusLeftTrigger = "",
  OculusRightTrigger = "",
  OculusLeftStick = "",
  OculusRightStick = "",
  WindowsMRMenu = "",
  WindowsMRWindows = "",
  WindowsMRLeftTouchpad = "",
  WindowsMRLeftHorizontalTouchpad = "",
  WindowsMRLeftVerticalTouchpad = "",
  WindowsMRRightTouchpad = "",
  WindowsMRRightHorizontalTouchpad = "",
  WindowsMRRightVerticalTouchpad = "",
  WindowsMRLeftTrigger = "",
  WindowsMRRightTrigger = "",
  WindowsMRLeftGrab = "",
  WindowsMRRightGrab = "",
  WindowsMRLeftStick = "",
  WindowsMRRightStick = "",
  XboxLeftStickUp = ":xbox_left_stick_up:",
  XboxLeftStickLeft = ":xbox_left_stick_left:",
  XboxLeftStickDown = ":xbox_left_stick_down:",
  XboxLeftStickRight = ":xbox_left_stick_right:",
  XboxRightStickUp = ":xbox_right_stick_up:",
  XboxRightStickLeft = ":xbox_right_stick_left:",
  XboxRightStickDown = ":xbox_right_stick_down:",
  XboxRightStickRight = ":xbox_right_stick_right:",
  XboxA = ":xbox_face_button_down:",
  XboxB = ":xbox_face_button_right:",
  XboxX = ":xbox_face_button_left:",
  XboxY = ":xbox_face_button_up:",
  XboxLeftBumper = ":xbox_bumper_left:",
  XboxRightBumper = ":xbox_bumper_right:",
  XboxLeftTrigger = ":xbox_trigger_left:",
  XboxRightTrigger = ":xbox_trigger_right:",
  XboxSelect = ":xbox_select:",
  XboxStart = ":xbox_start:",
  XboxLeftStick = ":xbox_stick_left:",
  XboxRightStick = ":xbox_stick_right:",
  XboxDPadUp = ":xbox_dpad_up:",
  XboxDPadLeft = ":xbox_dpad_left:",
  XboxDPadDown = ":xbox_dpad_down:",
  XboxDPadRight = ":xbox_dpad_right:",
  NonBreakingSpace = ":nbsp:",
  Agent = ":code_builder_button:",
  ImmersiveReader = ":immersive_reader_button:",
  HollowStar = ":hollow_star:",
  SolidStar = ":solid_star:",
  Camera = ":camera:",
}

export interface RenderJsonOptions {
  indent?: number;
  defaultColor?: ChatColor | string;
  keyColor?: ChatColor | string;
  numberColor?: ChatColor | string;
  stringColor?: ChatColor | string;
}

export class TextUtils {
  /**
   * Removes strings from text.
   * @param {string} text
   * @param {string[]} strings
   * @returns {string}
   */
  static stripAll(text: string, strings: string[], prefix?: string, suffix?: string): string {
    strings = strings.map((str) => (prefix ?? "") + str + (suffix ?? ""));
    const regex = new RegExp(strings.join("|"), "gi");
    return text.toString().replace(regex, "");
  }

  // TODO: Add support for HTML `<em>Italic</em>`
  /**
   * Uses markdown to format text.
   * @param {string} text
   * @returns {string|RawMessage}
   */
  static renderMarkdown(text: string | RawMessage): string | RawMessage {
    if (typeof text !== "string") return text;
    const ESCAPES: [RegExp, string][] = [
      [/\\\\/g, "\u0006"],
      [/\\\*/g, "\u0001"],
      [/\\_/g, "\u0002"],
      [/\\~/g, "\u0003"],
      [/\\`/g, "\u0004"],
      [/\\&/g, "\u0005"],
    ];
    for (const [pattern, replacement] of ESCAPES) {
      text = text.replace(pattern, replacement);
    }

    text = text.replace(/\\n/g, "\n");
    text = text.replace(/&(.)/g, "§$1");

    text = text
      .replace(/\*\*(.*?)\*\*/gs, "§l$1§r")
      .replace(/\*(.*?)\*/gs, "§o$1§r")
      // .replace(/__(.*?)__/gs, "§n$1§r")
      // .replace(/~~(.*?)~~/gs, "§m$1§r")
      .replace(/`(.*?)`/gs, "§k$1§r");

    text = text.replace(/^[-+*] (.*)$/gm, "§7■§r $1");

    text = text.replace(/^(\d+)\. (.*)$/gm, "§7$1.§r $2");

    const UNESCAPES: [RegExp, string][] = [
      [/\u0001/g, "*"],
      [/\u0002/g, "_"],
      [/\u0003/g, "~"],
      [/\u0004/g, "`"],
      [/\u0005/g, "&"],
      [/\u0006/g, "\\"],
    ];
    for (const [pattern, replacement] of UNESCAPES) {
      text = text.replace(pattern, replacement);
    }

    return text;
  }

  /**
   *
   * @param text
   * @returns
   */
  static stripFormat(text: string): string {
    return text.replace(/§[0-9A-V]/gi, "");
  }

  /**
   * Highlights all occurrences of a query string in the given text by wrapping them
   * with §6 and §r, and clamps the result to include up to 5 characters on each side
   * of each match. Multiple matches are supported, and overlapping ranges are merged.
   *
   * @param {string} query - The search term to highlight within the text. Case-insensitive.
   * @param {string} text - The full text to search within.
   * @param {number} padding
   * @returns A string containing the highlighted matches, each with 5 characters of surrounding context.
   */
  static highlightQuery(
    query: string,
    text: string,
    padding: number = 15,
    color: ChatColor | string = ChatColor.Gold,
  ): string {
    if (!query) return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "gi");

    const matches: { start: number; end: number }[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      matches.push({ start: match.index, end: match.index + match[0].length });
    }

    if (matches.length === 0) {
      return text;
    }

    const mergedRanges: { start: number; end: number }[] = [];

    for (const { start, end } of matches) {
      const extendedStart = Math.max(0, start - padding);
      const extendedEnd = Math.min(text.length, end + padding);

      if (mergedRanges.length > 0 && mergedRanges[mergedRanges.length - 1].end >= extendedStart) {
        mergedRanges[mergedRanges.length - 1].end = Math.max(mergedRanges[mergedRanges.length - 1].end, extendedEnd);
      } else {
        mergedRanges.push({ start: extendedStart, end: extendedEnd });
      }
    }

    const clampedSnippets = mergedRanges.map(({ start, end }) => {
      const snippet = text.slice(start, end);
      return snippet.replace(regex, (m) => `${color}${m}§r`);
    });

    return clampedSnippets.join(" ... ").trim();
  }

  /**
   * Highlight JSON.
   * @param {unknown} data
   * @param {RenderJsonOptions} options
   * @returns {string}
   */
  static renderJSON(data: unknown, options?: RenderJsonOptions): string {
    const json = JSON.stringify(data, null, options?.indent ?? 2);
    const stringColor = options?.stringColor ?? ChatColor.MaterialCopper;
    const keyColor = options?.keyColor ?? ChatColor.Aqua;
    const defaultColor = options?.defaultColor ?? ChatColor.White;
    const numberColor = options?.numberColor ?? ChatColor.Green;
    return json
      .replace(/\"([^"]+)\"/g, `${stringColor}\"$1\"§r`)
      .replace(/§a\"([^"]+)\"§r\s*:/g, `${keyColor}\"$1\"§r${defaultColor}:`) // Use configured color.
      .replace(/\b(-?\d+(?:\.\d+)?)\b/g, `${numberColor}$1§r`)
      .replace(/\b(true|false)\b/g, `§9$1§r`)
      .replace(/\bnull\b/g, `§7null§r`)
      .replace(/([\{\}\[\]])/g, `${defaultColor}$1§r`)
      .replace(/,/g, `${defaultColor},§r`);
  }

  /**
   * Converts a number to roman numerals.
   * @param {number} num 1-3999
   * @returns {string}
   */
  static toRoman(num: number): string {
    if (num <= 0 || num >= 4000) {
      throw new RangeError("Number must be between 1 and 3999");
    }

    const romanMap: [number, string][] = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];

    let result = "";
    for (const [value, numeral] of romanMap) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  }

  // CASES

  /**
   * Converts a given string or id into Title Case
   * @param {String} text
   * @returns {string}
   */
  static smartTitleCase(text: String | Id): string {
    if (Identifier.isId(text)) {
      const id = Identifier.parse(text);
      text = id.toString();
      if (id.namespace === "minecraft") {
        return this.titleCase(id.path);
      }
      const label = Registry[id.namespace]?.name ?? this.titleCase(id.namespace);
      return `${this.titleCase(id.path)}\n§9${label}`;
    }
    return this.titleCase(text.toString());
  }

  /**
   * Converts a given string into Title Case
   * @param {String} text
   * @returns {string}
   */
  static titleCase(text: String): string {
    return text
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (s) => s.toUpperCase());
  }
  /**
   * Converts a given string into camelCase
   * @param {String} text
   * @returns {string}
   */
  static camelCase(text: String): string {
    return text.toLowerCase().replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
  }

  /**
   * Converts a given string into param-case
   * @param {String} text
   * @returns {string}
   */
  static paramCase(text: String): string {
    return text.toLowerCase().replace(/\s+/g, "-");
  }

  /**
   * Converts a given string into PascalCase
   * @param {String} text
   * @returns {string}
   */
  static pascalCase(text: String): string {
    return text
      .toLowerCase()
      .replace(/\b\w/g, (s) => s.toUpperCase())
      .replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
  }

  /**
   * Converts a given string into snake_case
   * @param {String} text
   * @returns {string}
   */
  static snakeCase(text: String): string {
    return text
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/\s+/g, "_")
      .toLowerCase();
  }

  /**
   * Truncates a string after a specified length
   * @param {String} text
   * @param {number} maxLength
   * @returns {string}
   */
  static truncate(text: String, maxLength: number = 50): string {
    return `${text.slice(0, maxLength)}${text.length >= maxLength ? "..." : ""}`;
  }

  /**
   * Reverses the characters in a string
   * @param {String} text
   * @returns {string}
   */
  static reverse(text: String): string {
    return text.split("").reverse().join("");
  }
}
