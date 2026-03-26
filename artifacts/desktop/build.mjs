import { build } from "esbuild";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");

await rm(distDir, { recursive: true, force: true });

await build({
  entryPoints: [
    path.resolve(__dirname, "src/main.ts"),
    path.resolve(__dirname, "src/preload.ts"),
  ],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outdir: distDir,
  external: ["electron"],
  logLevel: "info",
});

console.log("Desktop build complete");
