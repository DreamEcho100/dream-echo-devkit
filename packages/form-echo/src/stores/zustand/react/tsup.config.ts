// Credit to <https://stackoverflow.com/a/73883783/13961420>

import path from "path";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    clean: true,
    dts: true,
    minify: true,
    splitting: true,
    entry: ["src/stores/zustand/react/index.js"],
    // Credit to: <https://stackoverflow.com/a/74604287/13961420>
    esbuildOptions(options) {
      options.external = ["use-sync-external-store", "react", "zustand"];
    },
    treeshake: true,
    format: ["esm", "cjs"],
    sourcemap: true,
    tsconfig: path.resolve(process.cwd(), "./tsconfig.json"),
    outDir: "src/stores/zustand/react/dist",
  },
]);
