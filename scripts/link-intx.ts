/**
 * Link sibling Interchange packages into node_modules so we track live
 * source (intx-src), not the stale npm 0.2.2 cut.
 *
 * Expects `../interchange` next to this repo (local Corbits layout).
 */
import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const interchangeRoot = resolve(root, "../interchange");
const intxModules = join(interchangeRoot, "node_modules/@intx");
const destRoot = join(root, "node_modules/@intx");

const packages = ["agent", "types", "inference", "log", "mime", "crypto"] as const;

if (!existsSync(intxModules)) {
  console.warn(
    `link-intx: ${intxModules} not found — skip (CI without sibling interchange)`,
  );
  process.exit(0);
}

mkdirSync(destRoot, { recursive: true });

for (const name of packages) {
  const src = join(intxModules, name);
  const dest = join(destRoot, name);
  if (!existsSync(src)) {
    console.warn(`link-intx: missing ${src} — skip`);
    continue;
  }
  rmSync(dest, { recursive: true, force: true });
  symlinkSync(src, dest);
  console.log(`link-intx: @intx/${name} -> ${src}`);
}
