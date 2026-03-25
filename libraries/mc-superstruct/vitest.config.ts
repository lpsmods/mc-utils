import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    server: {
      deps: {
        inline: ["@minecraft/math"],
      },
    },
  },
  resolve: {
    alias: {
      "@minecraft/server": "@lpsmods/minecraft-server-mock",
      "@minecraft/server-ui": "@lpsmods/minecraft-server-ui-mock",
    },
  },
});
