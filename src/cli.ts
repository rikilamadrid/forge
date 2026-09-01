#!/usr/bin/env node

import { ask } from "./ask.js";
import { loadConfig, type Environment } from "./config.js";
import {
  ForgeError,
  type InferenceFailure,
  type InferenceMetrics,
  type InferenceResult,
  toInferenceFailure,
} from "./inference.js";
import { OllamaProvider } from "./providers/ollama.js";

interface ProcessLike {
  argv: string[];
  env: Environment;
  exitCode?: number;
  stdout: { write(value: string): void };
  stderr: { write(value: string): void };
}

const runtime = globalThis as typeof globalThis & { process: ProcessLike };

const JSON_FLAG = "--json";

async function main(process: ProcessLike): Promise<void> {
  const arguments_ = process.argv.slice(2);
  // Read the output mode before validating, so usage failures honour --json too.
  const json = arguments_.includes(JSON_FLAG);

  try {
    const prompt = parsePrompt(arguments_);
    const config = loadConfig(process.env);
    const provider = new OllamaProvider({
      host: config.ollamaHost,
      model: config.model,
    });
    const result = await ask(provider, prompt);

    process.stdout.write(
      json ? `${JSON.stringify(result)}\n` : formatHumanResult(result),
    );
  } catch (error) {
    writeFailure(process, toInferenceFailure(error), json);
  }
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
