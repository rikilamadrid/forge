import { ask } from "./ask.js";
import { ForgeError, type InferenceResult } from "./inference.js";
import { OllamaProvider } from "./providers/ollama.js";

export interface CreateForgeOptions {
  provider: "ollama";
  host: string;
  model: string;
  timeoutMs?: number;
}

export interface ForgeAskOptions {
  signal?: AbortSignal;
}

export interface Forge {
  ask(prompt: string, options?: ForgeAskOptions): Promise<InferenceResult>;
}

interface OptionLabels {
  host: string;
  model: string;
  timeoutMs: string;
}

const PUBLIC_LABELS: OptionLabels = {
  host: "host",
  model: "model",
  timeoutMs: "timeoutMs",
};

export function createForge(options: CreateForgeOptions): Forge {
  const normalized = normalizeCreateForgeOptions(options);
  const provider = new OllamaProvider({
    host: normalized.host,
    model: normalized.model,
    ...(normalized.timeoutMs === undefined
      ? {}
      : { timeoutMs: normalized.timeoutMs }),
  });

  return {
    ask: (prompt, askOptions) => ask(provider, prompt, askOptions),
  };
}

// Internal shared boundary validation. The CLI uses this through loadConfig so
// it cannot drift from the library's provider, host, model, or timeout rules.
export function normalizeCreateForgeOptions(
  value: unknown,
  labels: OptionLabels = PUBLIC_LABELS,
): CreateForgeOptions {
  if (typeof value !== "object" || value === null) {
    throw new ForgeError("configuration", "Forge options are required.");
  }

  const provider = Reflect.get(value, "provider");
  if (provider !== "ollama") {
    throw new ForgeError("configuration", 'provider must be "ollama".');
  }

  const hostValue = Reflect.get(value, "host");
  if (typeof hostValue !== "string" || hostValue.trim().length === 0) {
    throw new ForgeError(
      "configuration",
      `${labels.host} is required. Set it to the Ollama API base URL.`,
    );
  }

  let host: URL;
  try {
    host = new URL(hostValue.trim());
  } catch {
    throw new ForgeError(
      "configuration",
      `${labels.host} must be a valid HTTP or HTTPS URL.`,
    );
  }
  if (host.protocol !== "http:" && host.protocol !== "https:") {
    throw new ForgeError(
      "configuration",
      `${labels.host} must use http:// or https://.`,
    );
  }

  const modelValue = Reflect.get(value, "model");
  if (typeof modelValue !== "string" || modelValue.trim().length === 0) {
    throw new ForgeError(
      "configuration",
      `${labels.model} is required. Set it to an installed Ollama model name.`,
    );
  }

  const timeoutMs = Reflect.get(value, "timeoutMs");
  if (
    timeoutMs !== undefined &&
    (typeof timeoutMs !== "number" ||
      !Number.isFinite(timeoutMs) ||
      timeoutMs <= 0)
  ) {
    throw new ForgeError(
      "configuration",
      `${labels.timeoutMs} must be a positive number.`,
    );
  }

  return {
    provider,
    host: host.href.replace(/\/$/, ""),
    model: modelValue.trim(),
    ...(timeoutMs === undefined ? {} : { timeoutMs }),
  };
}
