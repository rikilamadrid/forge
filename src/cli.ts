#!/usr/bin/env node

import { ask } from "./ask.js";
import { loadConfig, type Environment } from "./config.js";
import { OllamaProvider } from "./providers/ollama.js";

interface ProcessLike {
  argv: string[];
  env: Environment;
  exitCode?: number;
  stdout: { write(value: string): void };
  stderr: { write(value: string): void };
}

const runtime = globalThis as typeof globalThis & { process: ProcessLike };

async function main(process: ProcessLike): Promise<void> {
  const [command, prompt, ...extraArguments] = process.argv.slice(2);

  if (command !== "ask" || prompt === undefined || extraArguments.length > 0) {
    throw new Error('Usage: forge ask "<prompt>"');
  }

  const config = loadConfig(process.env);
  const provider = new OllamaProvider({
    host: config.ollamaHost,
    model: config.model,
  });
  const result = await ask(provider, prompt);

  process.stdout.write(
    `${result.output.trimEnd()}\n\n` +
      `Provider: ${result.provider}\n` +
      `Model: ${result.model}\n` +
      `Latency: ${result.clientLatencyMs.toFixed(1)} ms\n`,
  );
}

try {
  await main(runtime.process);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unexpected Forge failure.";
  runtime.process.stderr.write(`Forge error: ${message}\n`);
  runtime.process.exitCode = 1;
}
