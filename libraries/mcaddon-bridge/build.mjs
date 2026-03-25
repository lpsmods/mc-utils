import { build } from "esbuild";

const buildOptions = {
  entryPoints: ["./src"],
  outfile: "dist/mcaddon-bridge.js",
  format: "esm",
  platform: "browser",
  target: "es2024",
  loader: {
    ".json": "json",
  },
  bundle: true,
  external: ["@minecraft/server", "@minecraft/server-ui"],
};

await build(buildOptions);

await build({
  ...buildOptions,
  outfile: "dist/mcaddon-bridge.min.js",
  minify: true,
});
