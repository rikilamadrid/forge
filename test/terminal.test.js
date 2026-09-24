import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createTerminal, detectColor, detectColorDepth } from "../dist/src/terminal.js";
import { BRAND, SERIAL, SEVERITY, VALUES_HASH } from "../dist/src/identity.js";

const cliPath = fileURLToPath(new URL("../dist/src/cli.js", import.meta.url));

// A minimal environment: no PATH inheritance of COLORTERM/TERM from the developer's shell,
// so every assertion below is about the variables it names and nothing else.
function runCli(arguments_, environment = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...arguments_], {
      env: { PATH: process.env.PATH, ...environment },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

const ESC = "\u001B";

test("the generated identity is Forge's, from the Wonder Wagon theme, and never a severity", () => {
  assert.equal(SERIAL, "FG-047");
  assert.equal(BRAND.hex, "#C8973F");
  assert.equal(BRAND.truecolor, `${ESC}[38;2;200;151;63m`);
  assert.match(BRAND.ansi256, /^\u001B\[38;5;\d+m$/);
  assert.equal(BRAND.ansi16, `${ESC}[33m`);
  assert.deepEqual(SEVERITY, { ok: "green", info: "cyan", warn: "yellow", bad: "red" });
  assert.match(VALUES_HASH, /^[0-9a-f]{8}$/);
});

test("colour is a sequence of refusals ending in the TTY", () => {
  assert.equal(detectColor({}, false), false);
  assert.equal(detectColor({}, true), true);
  assert.equal(detectColor({ NO_COLOR: "" }, true), false);
  assert.equal(detectColor({ FORCE_COLOR: "0" }, true), false);
  assert.equal(detectColor({ TERM: "dumb" }, true), false);
  assert.equal(detectColor({ FORCE_COLOR: "1" }, false), true);
  assert.equal(detectColor({ NO_COLOR: "1", FORCE_COLOR: "3" }, true), false);
});

test("depth comes from what the terminal claims, and is 0 when colour is off", () => {
  assert.equal(detectColorDepth({}, false), 0);
  assert.equal(detectColorDepth({}, true), 4);
  assert.equal(detectColorDepth({ TERM: "xterm-256color" }, true), 8);
  assert.equal(detectColorDepth({ COLORTERM: "truecolor" }, true), 24);
  assert.equal(detectColorDepth({ FORCE_COLOR: "2" }, true), 8);
  assert.equal(detectColorDepth({ FORCE_COLOR: "3", TERM: "xterm-256color" }, true), 24);
});

test("paints are total: plain text when colour is off, the brand at the claimed depth when on", () => {
  const plain = createTerminal({}, false);
  assert.equal(plain.brand("Forge"), "Forge");
  assert.equal(plain.bad("[usage]"), "[usage]");
  const four = createTerminal({ FORCE_COLOR: "1" }, false);
  assert.equal(four.brand("Forge"), `${BRAND.ansi16}Forge${ESC}[0m`);
  assert.equal(four.bad("x"), `${ESC}[31mx${ESC}[0m`);
  assert.equal(four.ok("x"), `${ESC}[32mx${ESC}[0m`);
  const truecolor = createTerminal({ COLORTERM: "truecolor" }, true);
  assert.equal(truecolor.brand("Forge"), `${BRAND.truecolor}Forge${ESC}[0m`);
});

test("in a pipe the CLI emits no escape byte and the serial is present", async () => {
  const result = await runCli(["--help"]);
  assert.equal(result.code, 0);
  assert.doesNotMatch(result.stdout, /\u001B\[/);
  assert.match(result.stdout, /^Forge — the Local AI Kit\n/);
  assert.match(result.stdout, /FG-047 · a Wonder Wagon tool\n$/);
});

test("FORCE_COLOR paints the name in bronze and NO_COLOR outranks it", async () => {
  const coloured = await runCli(["--help"], { FORCE_COLOR: "3" });
  assert.equal(coloured.code, 0);
  assert.ok(coloured.stdout.startsWith(`${BRAND.truecolor}${ESC}[1mForge${ESC}[0m${ESC}[0m — the Local AI Kit`));
  const quiet = await runCli(["--help"], { FORCE_COLOR: "3", NO_COLOR: "1" });
  assert.doesNotMatch(quiet.stdout, /\u001B\[/);
});

test("severity paints the category in the terminal's red, and --json never passes through the terminal", async () => {
  const human = await runCli([], { FORCE_COLOR: "1" });
  assert.equal(human.code, 1);
  assert.equal(human.stderr, `Forge error ${ESC}[31m[usage]${ESC}[0m: Usage: forge ask "<prompt>" [--json]\n`);
  const json = await runCli(["--json"], { FORCE_COLOR: "3" });
  assert.equal(json.stderr, "");
  assert.doesNotMatch(json.stdout, /\u001B\[/);
  assert.deepEqual(JSON.parse(json.stdout).error.category, "usage");
});
