import { describe, expect, it } from "vitest";
import { TextUtils } from "./text";
import { ChatColor } from "../constants";

describe("Text Utils", () => {
  it("Strip formatting", () => {
    const inputA = "§aHello §lWorld§r!";
    const inputB = "§AHello §LWorld§R!";
    const inputC = "§sHello World!";
    const inputD = "§SHello World!";
    const result = "Hello World!";
    expect(TextUtils.stripFormat(inputA)).toBe(result);
    expect(TextUtils.stripFormat(inputB)).toBe(result);
    expect(TextUtils.stripFormat(inputC)).toBe(result);
    expect(TextUtils.stripFormat(inputD)).toBe(result);
  });

  it("Highlight query", () => {
    const inputA = TextUtils.highlightQuery("text", "some text");
    const inputB = TextUtils.highlightQuery("text", "SOME TEXT");
    const inputC = TextUtils.highlightQuery("t", "some text");
    const inputD = TextUtils.highlightQuery("text", "text", 15, ChatColor.MaterialDiamond);
    const resultA = "some §6text§r";
    const resultB = "SOME §6TEXT§r";
    const resultC = "some §6t§rex§6t§r";
    const resultD = "§stext§r";
    expect(inputA).toBe(resultA);
    expect(inputB).toBe(resultB);
    expect(inputC).toBe(resultC);
    expect(inputD).toBe(resultD);
  });

  it("Convert number to roman numerals", () => {
    const inputA = 1;
    const inputB = 4;
    const inputC = 7;
    const resultA = "I";
    const resultB = "IV";
    const resultC = "VII";
    expect(TextUtils.toRoman(inputA)).toBe(resultA);
    expect(TextUtils.toRoman(inputB)).toBe(resultB);
    expect(TextUtils.toRoman(inputC)).toBe(resultC);
  });

  it("Render markdown", () => {
    const input = `**bold** __bold__ *italic* _italic_\n1. Ordered 1\n2. Ordered 2\n3. Ordered 3\n\n- Unordered 1\n- Unordered 2\n- Unordered 3`;
    const result = `§lbold§r __bold__ §oitalic§r _italic_\n§71.§r Ordered 1\n§72.§r Ordered 2\n§73.§r Ordered 3\n\n§7■§r Unordered 1\n§7■§r Unordered 2\n§7■§r Unordered 3`;
    expect(TextUtils.renderMarkdown(input)).toBe(result);
  });

  it("Convert to Title Case", () => {
    const inputA = TextUtils.titleCase("hello world test");
    const inputB = TextUtils.titleCase("hello_world_test");
    const inputC = TextUtils.titleCase("HELLO WORLD TEST");
    const inputD = TextUtils.titleCase("HELLO_WORLD_TEST");
    const inputE = TextUtils.titleCase("minecraft:some_path");
    const inputF = TextUtils.titleCase("lpsm_more_pumpkins:some_path");
    const resultA = "Hello World Test";
    const resultC = "Some Path";
    const resultF = "Some Path\n§9More Pumpkins";
    expect(inputA).toBe(resultA);
    expect(inputB).toBe(resultA);
    expect(inputC).toBe(resultA);
    expect(inputD).toBe(resultA);
    expect(inputE).toBe(resultC);
    expect(inputF).toBe(resultF);
  });

  it("Convert to camelCase", () => {
    const inputA = TextUtils.camelCase("hello world test");
    const inputB = TextUtils.camelCase("HELLO WORLD TEST");
    const resultA = "helloWorldTest";
    expect(inputA).toBe(resultA);
    expect(inputB).toBe(resultA);
  });

  it("Convert to param-case", () => {
    const inputA = TextUtils.paramCase("hello world test");
    const inputB = TextUtils.paramCase("HELLO WORLD TEST");
    const resultA = "hello-world-test";
    expect(inputA).toBe(resultA);
    expect(inputB).toBe(resultA);
  });

  it("Convert to PascalCase", () => {
    const inputA = TextUtils.pascalCase("hello world test");
    const inputB = TextUtils.pascalCase("HELLO WORLD TEST");
    const resultA = "HelloWorldTest";
    expect(inputA).toBe(resultA);
    expect(inputB).toBe(resultA);
  });

  it("Convert to snake_case", () => {
    const inputA = TextUtils.snakeCase("hello world test");
    const inputB = TextUtils.snakeCase("HELLO WORLD TEST");
    const resultA = "hello_world_test";
    expect(inputA).toBe(resultA);
    expect(inputB).toBe(resultA);
  });

  it("Truncates a string", () => {
    const inputA = TextUtils.truncate("Hello, World! This is a Test.", 10);
    const resultA = "Hello, Wor...";
    expect(inputA).toBe(resultA);
  });

  it("Reverse a string", () => {
    const inputA = TextUtils.reverse("hello");
    const resultA = "olleh";
    expect(inputA).toBe(resultA);
  });
});
