/**
 * Generic text functions.
 */

import { RawMessage } from "@minecraft/server";

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

  // TODO:
  // - Add support for HTML `<em>Italic</em>`
  /**
   * Uses markdown to format text.
   * @param {string} text
   * @returns {string}
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
   * @param {string} text
   * @returns {string}
   */
  static toTitleCase(text: string): string {
    return text.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
  }

  /**
   * Highlights all occurrences of a query string in the given text by wrapping them
   * with §6 and §r, and clamps the result to include up to 5 characters on each side
   * of each match. Multiple matches are supported, and overlapping ranges are merged.
   *
   * @param query - The search term to highlight within the text. Case-insensitive.
   * @param text - The full text to search within.
   * @returns A string containing the highlighted matches, each with 5 characters of surrounding context.
   */
  static highlightQuery(query: string, text: string, padding: number = 15): string {
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
        mergedRanges[mergedRanges.length - 1].end = Math.max(
          mergedRanges[mergedRanges.length - 1].end,
          extendedEnd
        );
      } else {
        mergedRanges.push({ start: extendedStart, end: extendedEnd });
      }
    }

    const clampedSnippets = mergedRanges.map(({ start, end }) => {
      const snippet = text.slice(start, end);
      return snippet.replace(regex, (m) => `§6${m}§r`);
    });

    return clampedSnippets.join(" ... ").trim();
  }
}
