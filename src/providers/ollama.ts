import type {
  InferenceProvider,
  InferenceRequest,
  InferenceResult,
} from "../inference.js";

const DEFAULT_TIMEOUT_MS = 120_000;

type Fetch = typeof fetch;

interface OllamaProviderOptions {
  host: string;
  model: string;
  timeoutMs?: number;
  fetch?: Fetch;
  now?: () => number;
}

export class OllamaProvider implements InferenceProvider {
  readonly #host: string;
  readonly #model: string;
  readonly #timeoutMs: number;
  readonly #fetch: Fetch;
  readonly #now: () => number;

  constructor(options: OllamaProviderOptions) {
    this.#host = options.host;
    this.#model = options.model;
    this.#timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#now = options.now ?? (() => performance.now());
  }

  async generate(request: InferenceRequest): Promise<InferenceResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMs);
    const startedAt = this.#now();

    try {
      const response = await this.#fetch(
        new URL("api/generate", `${this.#host}/`),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: this.#model,
            prompt: request.prompt,
            stream: false,
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Ollama request failed with HTTP ${response.status}.`);
      }

      const payload: unknown = await response.json();
      const parsed = parseOllamaResponse(payload);

      return {
        provider: "ollama",
        model: parsed.model,
        output: parsed.response,
        clientLatencyMs: Math.max(0, this.#now() - startedAt),
      };
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error(`Ollama request timed out after ${this.#timeoutMs} ms.`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

interface OllamaResponse {
  model: string;
  response: string;
}

function parseOllamaResponse(value: unknown): OllamaResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("model" in value) ||
    typeof value.model !== "string" ||
    value.model.trim().length === 0 ||
    !("response" in value) ||
    typeof value.response !== "string" ||
    value.response.trim().length === 0 ||
    !("done" in value) ||
    value.done !== true
  ) {
    throw new Error("Ollama returned an invalid completed response.");
  }

  return { model: value.model, response: value.response };
}
