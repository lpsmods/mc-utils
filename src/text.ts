/**
 * Generic text functions.
 */

import { RawMessage } from "@minecraft/server";
import { ChatColor } from "./constants";

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
    return text.replace(regex, "");
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
   * Makes the text title case.
   * @param {String} text
   * @returns {string}
   */
  static titleCase(text: String): string {
    return text.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
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
}
