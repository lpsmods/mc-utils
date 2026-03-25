import { build } from "esbuild";

const buildOptions = {
  entryPoints: ["./src"],
  outfile: "dist/mc-superstruct.js",
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
  outfile: "dist/mc-superstruct.min.js",
  minify: true,
});
