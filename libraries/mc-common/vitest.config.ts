import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
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
    },
  },
});
