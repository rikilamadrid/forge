#!/usr/bin/env node
/**
 * Regenerate src/identity.ts from the Wonder Wagon design system, or check that it is current.
 *
 *   node scripts/wonder-wagon/sync.mjs           write src/identity.ts
 *   node scripts/wonder-wagon/sync.mjs --check   exit 1 if the committed file differs
 *
 * Forge consumes @wonder-wagon/themes through the ordinary package boundary — a
 * devDependency resolved from node_modules — and commits the result, so its runtime keeps
 * zero production dependencies and its bytes stay deterministic. Nothing here reaches the
 * network, reads a clock, or depends on the machine.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { forge } = await import("@wonder-wagon/themes/forge");
const { renderTerminalModule } = await import("@wonder-wagon/themes/adapters/terminal");
const { version } = require("@wonder-wagon/themes/package.json");

// Bronze is the hallmark's colour and yellow is the only warm ANSI colour, so the
// 16-colour floor is bold yellow by policy — never red, which is the `bad` severity.
const target = fileURLToPath(new URL("../../src/identity.ts", import.meta.url));
const next = renderTerminalModule(forge, { packageVersion: version, env: "night" });

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {
    current = "";
  }
  if (current !== next) {
    console.error("src/identity.ts is stale against @wonder-wagon/themes@" + version + "; run `npm run wonder-wagon:sync`");
    process.exit(1);
  }
  console.log("src/identity.ts is current (@wonder-wagon/themes@" + version + ")");
} else {
  writeFileSync(target, next);
  console.log("wrote src/identity.ts from @wonder-wagon/themes@" + version);
}
