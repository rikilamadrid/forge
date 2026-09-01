export interface ForgeConfig {
  ollamaHost: string;
  model: string;
}

export type Environment = Readonly<Record<string, string | undefined>>;

export function loadConfig(environment: Environment): ForgeConfig {
  const hostValue = environment.OLLAMA_HOST?.trim();
  if (!hostValue) {
    throw new ForgeError(
      "configuration",
      "OLLAMA_HOST is required. Set it to the Ollama API base URL.",
    );
  }

  let host: URL;
  try {
    host = new URL(hostValue);
  } catch {
    throw new ForgeError(
      "configuration",
      "OLLAMA_HOST must be a valid HTTP or HTTPS URL.",
    );
  }

  if (host.protocol !== "http:" && host.protocol !== "https:") {
    throw new ForgeError(
      "configuration",
      "OLLAMA_HOST must use http:// or https://.",
    );
  }

  const model = environment.FORGE_MODEL?.trim();
  if (!model) {
    throw new ForgeError(
      "configuration",
      "FORGE_MODEL is required. Set it to an installed Ollama model name.",
    );
  }

  return {
    ollamaHost: host.href.replace(/\/$/, ""),
    model,
  };
}
import { ForgeError } from "./inference.js";
