import type {
  InferenceProvider,
  InferenceRequest,
  InferenceMetrics,
  InferenceResult,
} from "../inference.js";
import { ForgeError } from "../inference.js";

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

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        if (!response.ok) {
          throw this.#error(
            "http",
            `Ollama request failed with HTTP ${response.status}.`,
            startedAt,
            response.status,
          );
        }
        throw this.#error(
          "invalid_response",
          "Ollama returned invalid JSON.",
          startedAt,
        );
      }

      const providerMessage = readProviderError(payload);
      if (providerMessage !== undefined) {
        throw this.#error(
          "provider",
          `Ollama reported an error: ${providerMessage}`,
          startedAt,
          response.ok ? undefined : response.status,
        );
      }

      if (!response.ok) {
        throw this.#error(
          "http",
          `Ollama request failed with HTTP ${response.status}.`,
          startedAt,
          response.status,
        );
      }

      const parsed = parseOllamaResponse(payload, () =>
        this.#error(
          "invalid_response",
          "Ollama returned an invalid completed response.",
          startedAt,
        ),
      );
      const clientLatencyMs = elapsedMilliseconds(this.#now(), startedAt);

      return {
        success: true,
        provider: "ollama",
        model: parsed.model,
        output: parsed.response,
        metrics: mapMetrics(parsed, clientLatencyMs),
      };
    } catch (error) {
      if (error instanceof ForgeError) {
        throw error;
      }
      if (controller.signal.aborted) {
        throw this.#error(
          "timeout",
          `Ollama request timed out after ${this.#timeoutMs} ms.`,
          startedAt,
        );
      }
      throw this.#error(
        "network",
        "Could not reach the configured Ollama runtime.",
        startedAt,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  #error(
    category: "network" | "timeout" | "http" | "invalid_response" | "provider",
    message: string,
    startedAt: number,
    statusCode?: number,
  ): ForgeError {
    return new ForgeError(category, message, {
      ...(statusCode === undefined ? {} : { statusCode }),
      evidence: {
        provider: "ollama",
        model: this.#model,
        clientLatencyMs: elapsedMilliseconds(this.#now(), startedAt),
      },
    });
  }
}

interface OllamaResponse {
  model: string;
  response: string;
  totalDurationNs?: number;
  loadDurationNs?: number;
  promptTokens?: number;
  promptEvalDurationNs?: number;
  completionTokens?: number;
  completionEvalDurationNs?: number;
}

function parseOllamaResponse(
  value: unknown,
  invalid: () => ForgeError,
): OllamaResponse {
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
    throw invalid();
  }

  return {
    model: value.model,
    response: value.response,
    ...optionalNumber(value, "total_duration", "totalDurationNs", invalid),
    ...optionalNumber(value, "load_duration", "loadDurationNs", invalid),
    ...optionalNumber(value, "prompt_eval_count", "promptTokens", invalid),
    ...optionalNumber(
      value,
      "prompt_eval_duration",
      "promptEvalDurationNs",
      invalid,
    ),
    ...optionalNumber(value, "eval_count", "completionTokens", invalid),
    ...optionalNumber(
      value,
      "eval_duration",
      "completionEvalDurationNs",
      invalid,
    ),
  };
}

function readProviderError(value: unknown): string | undefined {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string" &&
    value.error.trim().length > 0
  ) {
    return value.error;
  }
  return undefined;
}

function optionalNumber<OutputKey extends string>(
  value: object,
  wireKey: string,
  outputKey: OutputKey,
  invalid: () => ForgeError,
): Partial<Record<OutputKey, number>> {
  if (!(wireKey in value)) {
    return {};
  }

  const metric: unknown = Reflect.get(value, wireKey);
  if (
    typeof metric !== "number" ||
    !Number.isFinite(metric) ||
    metric < 0 ||
    !Number.isSafeInteger(metric)
  ) {
    throw invalid();
  }

  return { [outputKey]: metric } as Partial<Record<OutputKey, number>>;
}

function mapMetrics(
  response: OllamaResponse,
  clientLatencyMs: number,
): InferenceMetrics {
  const promptTokens = response.promptTokens;
  const completionTokens = response.completionTokens;
  const hasTotalTokens =
    promptTokens !== undefined && completionTokens !== undefined;

  return {
    clientLatencyMs,
    ...(promptTokens === undefined ? {} : { promptTokens }),
    ...(completionTokens === undefined ? {} : { completionTokens }),
    ...(hasTotalTokens
      ? { totalTokens: promptTokens + completionTokens }
      : {}),
    ...durationMetric("totalDurationMs", response.totalDurationNs),
    ...durationMetric("loadDurationMs", response.loadDurationNs),
    ...durationMetric("promptEvalDurationMs", response.promptEvalDurationNs),
    ...durationMetric(
      "completionEvalDurationMs",
      response.completionEvalDurationNs,
    ),
  };
}

function durationMetric<Key extends string>(
  key: Key,
  nanoseconds: number | undefined,
): Partial<Record<Key, number>> {
  return nanoseconds === undefined
    ? {}
    : ({ [key]: nanoseconds / 1_000_000 } as Partial<Record<Key, number>>);
}

function elapsedMilliseconds(now: number, startedAt: number): number {
  return Math.max(0, now - startedAt);
}
