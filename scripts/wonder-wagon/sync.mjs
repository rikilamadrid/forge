#!/usr/bin/env node
/**
 * Generate Forge's committed terminal identity from wonder-wagon-ui/cli.
 * Geometry stays product-owned; the shared package owns rendering and
 * terminal-capability policy. The generated runtime has no imports.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderCliIdentityModule } from "wonder-wagon-ui/cli";

const product = {
  name: "Forge",
  serial: "FG-047",
  tagline: "the Local AI Kit",
  accent: "#C8973F",
  secondary: "#8A9299",
  ansi16: {
    accent: { name: "yellow", bright: false },
    secondary: { name: "black", bright: true },
    allowSeverityCollision: true,
  },
  mark: {
    width: 9,
    nameRow: 1,
    rows: [
      {
        expressive: [{ text: "  ▗▄▄▄▄▖", role: "accent" }],
        plain: "  .----.",
      },
      {
        expressive: [{ text: " ▐ █▀▀▀ ▌", role: "accent" }],
        plain: " / F=== \\",
      },
      {
        expressive: [
          { text: " ▐ ", role: "accent" },
          { text: "█▀▀", role: "secondary" },
          { text: "  ▌", role: "accent" },
        ],
        plain: " \\ F==  /",
      },
      {
        expressive: [{ text: "  ▝▀▀▀▀▘", role: "accent" }],
        plain: "  '----'",
      },
    ],
  },
};

const target = fileURLToPath(new URL("../../src/identity.ts", import.meta.url));
const next = renderCliIdentityModule(product, { language: "ts" });

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {
    current = "";
  }
  if (current !== next) {
    console.error("src/identity.ts is stale against wonder-wagon-ui/cli; run `npm run wonder-wagon:sync`");
    process.exitCode = 1;
  } else {
    console.log("src/identity.ts is current against wonder-wagon-ui/cli");
  }
} else {
  writeFileSync(target, next);
  console.log("wrote src/identity.ts from wonder-wagon-ui/cli");
}
