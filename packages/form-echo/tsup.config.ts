// Credit to <https://stackoverflow.com/a/73883783/13961420>

import path from "path";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    clean: true,
    dts: true,
    minify: true,
    splitting: true,
    treeshake: true,
    entry: ["./src/index.js", "./src/helpers/index.js"],
    // Credit to: <https://stackoverflow.com/a/74604287/13961420>
    // esbuildOptions(options) {
    // 	options.external = ['zod'];
    // },
    format: ["esm", "cjs"],
    sourcemap: true,
    tsconfig: path.resolve(process.cwd(), "./tsconfig.json"),
    outDir: "dist",
  },
]);
