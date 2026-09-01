import { normalizeCreateForgeOptions } from "./forge.js";

export interface ForgeConfig {
  ollamaHost: string;
  model: string;
  timeoutMs?: number;
}

export type Environment = Readonly<Record<string, string | undefined>>;

export function loadConfig(environment: Environment): ForgeConfig {
  const timeoutMs =
    environment.FORGE_TIMEOUT_MS === undefined
      ? undefined
      : Number(environment.FORGE_TIMEOUT_MS.trim());
  const options = normalizeCreateForgeOptions(
    {
      provider: "ollama",
      host: environment.OLLAMA_HOST,
      model: environment.FORGE_MODEL,
      timeoutMs,
    },
    {
      host: "OLLAMA_HOST",
      model: "FORGE_MODEL",
      timeoutMs: "FORGE_TIMEOUT_MS",
    },
  );

  return {
    ollamaHost: options.host,
    model: options.model,
    ...(options.timeoutMs === undefined
      ? {}
      : { timeoutMs: options.timeoutMs }),
  };
}
