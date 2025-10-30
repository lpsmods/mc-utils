import minecraftLinting from "eslint-plugin-minecraft-linting";
import unusedImports from "eslint-plugin-unused-imports";
import tsParser from "@typescript-eslint/parser";
import ts from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
    },
    plugins: {
      ts,
      "minecraft-linting": minecraftLinting,
      "unused-imports": unusedImports,
    },
    rules: {
      "minecraft-linting/avoid-unnecessary-command": "error",
      "no-duplicate-imports": "error",
      // "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      // "unused-imports/no-unused-vars": [
      //   "warn",
      //   {
      //     vars: "all",
      //     varsIgnorePattern: "^_",
      //     args: "after-used",
      //     argsIgnorePattern: "^_",
      //   },
      // ],
    },
  },
];
