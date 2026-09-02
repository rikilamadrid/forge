#!/usr/bin/env node

import { readFileSync } from "node:fs";

import { loadConfig, type Environment } from "./config.js";
import { createForge } from "./index.js";
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
  stdout: { write(value: string): void };
  stderr: { write(value: string): void };
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
    process.stdout.write(helpText());
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
      json ? `${JSON.stringify(result)}\n` : formatHumanResult(result),
    );
  } catch (error) {
    writeFailure(process, toInferenceFailure(error), json);
  }
}

function helpText(): string {
  return [
    "Forge — the Local AI Kit",
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

function formatHumanResult(result: InferenceResult): string {
  const metrics = result.metrics;
  const lines = [
    result.output.trimEnd(),
    "",
    `Provider: ${result.provider}`,
    `Model: ${result.model}`,
    `Client latency: ${formatMilliseconds(metrics.clientLatencyMs)}`,
    `Tokens: prompt ${formatCount(metrics.promptTokens)} | completion ${formatCount(metrics.completionTokens)} | total ${formatCount(metrics.totalTokens)}`,
    ...formatProviderTimings(metrics),
  ];

  return `${lines.join("\n")}\n`;
}

function formatProviderTimings(metrics: InferenceMetrics): string[] {
  const timings = [
    ["Total", metrics.totalDurationMs],
    ["Load", metrics.loadDurationMs],
    ["Prompt evaluation", metrics.promptEvalDurationMs],
    ["Completion evaluation", metrics.completionEvalDurationMs],
  ] as const;
  const available: string[] = [];
  for (const [label, value] of timings) {
    if (value !== undefined) {
      available.push(`  ${label}: ${formatMilliseconds(value)}`);
    }
  }

  return available.length === 0
    ? ["Ollama timings: unavailable"]
    : ["Ollama timings:", ...available];
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
    process.stderr.write(
      `Forge error [${failure.error.category}]: ${failure.error.message}\n`,
    );
  }
  process.exitCode = 1;
}

try {
  await main(runtime.process);
} catch (error) {
  writeFailure(runtime.process, toInferenceFailure(error), false);
}
