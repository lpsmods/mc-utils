import { build } from "esbuild";

const buildOptions = {
  entryPoints: ["./src"],
  outfile: "dist/mc-dev.js",
  format: "esm",
  platform: "browser",
  target: "es2024",
  loader: {
    ".json": "json",
  },
  bundle: true,
  external: ["@minecraft/server", "@minecraft/server-ui", "@minecraft/debug-utilities"],
};

await build({ ...buildOptions });

await build({
  ...buildOptions,
  outfile: "dist/mc-dev.min.js",
  minify: true,
});
