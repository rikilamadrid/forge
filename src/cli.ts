#!/usr/bin/env node

import { readFileSync } from "node:fs";

import { loadConfig, type Environment } from "./config.js";
import { SERIAL } from "./identity.js";
import { createForge } from "./index.js";
import { createTerminal, type Terminal } from "./terminal.js";
import {
  ForgeError,
  type InferenceFailure,
  type InferenceMetrics,
  type InferenceResult,
  toInferenceFailure,
} from "./inference.js";

interface ProcessLike {
  argv: string[];
  env: Environment;
  exitCode?: number;
  stdout: { write(value: string): void; isTTY?: boolean; columns?: number };
  stderr: { write(value: string): void; isTTY?: boolean };
}

const runtime = globalThis as typeof globalThis & { process: ProcessLike };

const JSON_FLAG = "--json";
const HELP_FLAG = "--help";
const VERSION_FLAG = "--version";

async function main(process: ProcessLike): Promise<void> {
  const arguments_ = process.argv.slice(2);

  // Serve --help and --version before configuration or any network activity, so
  // a published executable answers them offline and exits 0.
  if (arguments_.includes(HELP_FLAG)) {
    process.stdout.write(helpText(createTerminal(process.env, process.stdout.isTTY === true)));
    return;
  }
  if (arguments_.includes(VERSION_FLAG)) {
    process.stdout.write(`${readPackageVersion()}\n`);
    return;
  }

  // Read the output mode before validating, so usage failures honour --json too.
  const json = arguments_.includes(JSON_FLAG);

  try {
    const prompt = parsePrompt(arguments_);
    const config = loadConfig(process.env);
    const forge = createForge({
      provider: "ollama",
      host: config.ollamaHost,
      model: config.model,
      ...(config.timeoutMs === undefined
        ? {}
        : { timeoutMs: config.timeoutMs }),
    });
    const result = await forge.ask(prompt);

    process.stdout.write(
      json
        ? `${JSON.stringify(result)}\n`
        : formatHumanResult(
            result,
            createTerminal(process.env, process.stdout.isTTY === true),
            process.stdout.columns,
          ),
    );
  } catch (error) {
    writeFailure(process, toInferenceFailure(error), json);
  }
}

function helpText(terminal: Terminal): string {
  // The one identity moment: the name in bronze, the serial small at the foot. Everything
  // between is plain, and in a pipe every byte of this is the same as before.
  return [
    terminal.brand(terminal.bold("Forge")) + " — the Local AI Kit",
    "",
    "Usage:",
    '  forge ask "<prompt>" [--json]   Delegate a prompt to the local runtime',
    "  forge --help                    Show this help and exit",
    "  forge --version                 Print the version and exit",
    "",
    "Flags:",
    "  --json      Emit the result or failure as a single JSON object",
    "  --help      Show this help and exit",
    "  --version   Print the version and exit",
    "",
    "Configuration (environment variables):",
    "  OLLAMA_HOST      Base URL of the Ollama API (required)",
    "  FORGE_MODEL      Model to run (required)",
      "  FORGE_TIMEOUT_MS Request timeout in milliseconds (optional)",
    "",
    terminal.dim(`${SERIAL} · a Wonder Wagon tool`),
    "",
  ].join("\n");
}

function readPackageVersion(): string {
  // Resolve the package manifest relative to this compiled file so it works in
  // both the repository layout (dist/src/cli.js) and the packed layout
  // (package/dist/src/cli.js); "../../package.json" is the package root in each.
  const manifestUrl = new URL("../../package.json", import.meta.url);
  const manifest: unknown = JSON.parse(readFileSync(manifestUrl, "utf8"));
  if (
    typeof manifest === "object" &&
    manifest !== null &&
    "version" in manifest &&
    typeof manifest.version === "string"
  ) {
    return manifest.version;
  }

  throw new ForgeError("internal", "Package version is unavailable.");
}

function parsePrompt(arguments_: string[]): string {
  const flags = arguments_.filter((argument) => argument === JSON_FLAG);
  const [command, prompt, ...extraArguments] = arguments_.filter(
    (argument) => argument !== JSON_FLAG,
  );
  const valid =
    command === "ask" &&
    prompt !== undefined &&
    prompt.trim().length > 0 &&
    extraArguments.length === 0 &&
    flags.length <= 1;

  if (!valid) {
    throw new ForgeError("usage", 'Usage: forge ask "<prompt>" [--json]');
  }

  return prompt;
}

function formatHumanResult(
  result: InferenceResult,
  terminal: Terminal,
  columns?: number,
): string {
  // The answer is the object; the metrics are the plate beneath it. Labels dim, values
  // plain, so a reader's eye lands on the numbers. Colour never carries a value.
  //
  // The quench rule separates the two: the answer is hot, the metrics are measured. It
  // exists only where colour does, so a pipe, NO_COLOR and TERM=dumb see exactly the
  // bytes 0.1.2 emitted, and it is dropped whole in a terminal too narrow to hold it.
  const metrics = result.metrics;
  const label = (text: string) => terminal.dim(text);
  const rule = terminal.quenchRule(columns);
  const lines = [
    result.output.trimEnd(),
    "",
    ...(rule === "" ? [] : [rule, ""]),
    `${label("Provider:")} ${result.provider}`,
    `${label("Model:")} ${result.model}`,
    `${label("Client latency:")} ${formatMilliseconds(metrics.clientLatencyMs)}`,
    `${label("Tokens:")} prompt ${formatCount(metrics.promptTokens)} | completion ${formatCount(metrics.completionTokens)} | total ${formatCount(metrics.totalTokens)}`,
    ...formatProviderTimings(metrics, terminal),
  ];

  return `${lines.join("\n")}\n`;
}

function formatProviderTimings(metrics: InferenceMetrics, terminal: Terminal): string[] {
  const timings = [
    ["Total", metrics.totalDurationMs],
    ["Load", metrics.loadDurationMs],
    ["Prompt evaluation", metrics.promptEvalDurationMs],
    ["Completion evaluation", metrics.completionEvalDurationMs],
  ] as const;
  const available: string[] = [];
  for (const [label, value] of timings) {
    if (value !== undefined) {
      available.push(`  ${terminal.dim(`${label}:`)} ${formatMilliseconds(value)}`);
    }
  }

  return available.length === 0
    ? [`${terminal.dim("Ollama timings:")} unavailable`]
    : [terminal.dim("Ollama timings:"), ...available];
}

function formatMilliseconds(value: number): string {
  return `${value.toFixed(1)} ms`;
}

function formatCount(value: number | undefined): string {
  return value === undefined ? "unavailable" : String(value);
}

function writeFailure(
  process: ProcessLike,
  failure: InferenceFailure,
  json: boolean,
): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(failure)}\n`);
  } else {
    // Severity by meaning: the category in the terminal's own red, the message plain.
    // The corrective text is never coloured and never cute.
    const terminal = createTerminal(process.env, process.stderr.isTTY === true);
    process.stderr.write(
      `Forge error ${terminal.bad(`[${failure.error.category}]`)}: ${failure.error.message}\n`,
    );
  }
  process.exitCode = 1;
}

try {
  await main(runtime.process);
} catch (error) {
  writeFailure(runtime.process, toInferenceFailure(error), false);
}
