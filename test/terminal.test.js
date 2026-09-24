import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  QUENCH_RULE_COLUMNS,
  QUENCH_RULE_HOT_COLUMNS,
  createTerminal,
  detectColor,
  detectColorDepth,
} from "../dist/src/terminal.js";
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

// --- the quench rule ---------------------------------------------------------------
//
// Hot above the line, measured below it. The rule exists only where colour does, so
// every byte a pipe, NO_COLOR or TERM=dumb already saw in 0.1.2 is unchanged, and it is
// dropped whole rather than shortened in a terminal too narrow to hold it.

const CELL = "\u2500";

test("the quench rule is twenty-four cells, eight of them hot", () => {
  const terminal = createTerminal({ FORCE_COLOR: "3" }, true);
  const rule = terminal.quenchRule(80);
  const cells = [...rule].filter((character) => character === CELL);

  assert.equal(QUENCH_RULE_COLUMNS, 24);
  assert.equal(QUENCH_RULE_HOT_COLUMNS, 8);
  assert.equal(cells.length, QUENCH_RULE_COLUMNS);
  assert.equal(
    rule,
    `${BRAND.truecolor}${CELL.repeat(8)}${ESC}[0m${ESC}[2m${CELL.repeat(16)}${ESC}[0m`,
  );
  // The quenched run is the terminal's own dim, not a second identity colour: the one
  // brand colour a CLI byte may carry is the generated one in identity.js.
  assert.equal(rule.split(`${ESC}[0m`)[1], `${ESC}[2m${CELL.repeat(16)}`);
});

test("the quench rule is suppressed whole below twenty-four columns, never shortened", () => {
  const terminal = createTerminal({ FORCE_COLOR: "3" }, true);
  assert.equal(terminal.quenchRule(24).length > 0, true);
  assert.equal(terminal.quenchRule(23), "");
  assert.equal(terminal.quenchRule(1), "");
  assert.equal(terminal.quenchRule(0), "");
  // An unknown width is not a narrow terminal: colour was forced onto something that is
  // not a TTY, where nothing wraps.
  assert.equal(terminal.quenchRule(undefined).length > 0, true);
});

test("the quench rule is empty wherever colour is", () => {
  assert.equal(createTerminal({}, false).quenchRule(80), "");
  assert.equal(createTerminal({ NO_COLOR: "1" }, true).quenchRule(80), "");
  assert.equal(createTerminal({ TERM: "dumb" }, true).quenchRule(80), "");
  assert.equal(createTerminal({ FORCE_COLOR: "0" }, true).quenchRule(80), "");
  // At the sixteen-colour floor it is still drawn, in the alphabet that terminal speaks.
  assert.equal(createTerminal({ FORCE_COLOR: "1" }, false).quenchRule(80).includes(CELL), true);
});

async function withStubServer(context) {
  const payload = JSON.stringify({
    model: "qwen-test:latest",
    response: "The function can return undefined.",
    done: true,
    prompt_eval_count: 12,
    eval_count: 24,
  });
  const server = createServer((request, outgoing) => {
    request.resume();
    request.on("end", () => {
      outgoing.writeHead(200, { "content-type": "application/json" });
      outgoing.end(payload);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  return {
    OLLAMA_HOST: `http://127.0.0.1:${server.address().port}`,
    FORGE_MODEL: "qwen-test",
  };
}

test("a human result separates the answer from the metrics only when colour is on", async (context) => {
  const environment = await withStubServer(context);

  const coloured = await runCli(["ask", "Review this function"], {
    ...environment,
    FORCE_COLOR: "3",
  });
  assert.equal(coloured.code, 0);
  assert.match(
    coloured.stdout,
    new RegExp(`^The function can return undefined\\.\\n\\n.*${CELL}{8}.*${CELL}{16}.*\\n\\n`),
  );
  assert.equal([...coloured.stdout].filter((character) => character === CELL).length, 24);

  // A pipe, NO_COLOR and TERM=dumb each see the 0.1.2 bytes: no rule, no escape byte.
  for (const extra of [{}, { NO_COLOR: "1" }, { TERM: "dumb" }, { FORCE_COLOR: "0" }]) {
    const plain = await runCli(["ask", "Review this function"], { ...environment, ...extra });
    assert.equal(plain.code, 0);
    assert.doesNotMatch(plain.stdout, /\u001B\[/);
    assert.equal(plain.stdout.includes(CELL), false);
    assert.match(plain.stdout, /^The function can return undefined\.\n\nProvider: ollama\n/);
  }
});

test("--json carries no rule and no escape byte, even with colour forced on", async (context) => {
  const environment = await withStubServer(context);
  const piped = await runCli(["ask", "Review this function", "--json"], environment);
  const forced = await runCli(["ask", "Review this function", "--json"], {
    ...environment,
    FORCE_COLOR: "3",
  });

  assert.equal(forced.code, 0);
  assert.equal(forced.stdout.includes(CELL), false);
  assert.doesNotMatch(forced.stdout, /\u001B\[/);
  // Machine-readable output does not pass through the terminal at all, so forcing
  // colour cannot move a single byte of it. Only the measured latency differs between
  // two runs, so it is the one field normalised before the comparison.
  const shape = (text) => {
    const value = JSON.parse(text);
    value.metrics.clientLatencyMs = 0;
    return JSON.stringify(value);
  };
  assert.equal(shape(forced.stdout), shape(piped.stdout));
  assert.equal(forced.stdout.replace(/[\d.]+(?=,"promptTokens)/, ""),
               piped.stdout.replace(/[\d.]+(?=,"promptTokens)/, ""));
  const parsed = JSON.parse(forced.stdout);
  assert.equal(parsed.success, true);
  assert.equal(parsed.output, "The function can return undefined.");
});
