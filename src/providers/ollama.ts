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
    let abortSource: "caller" | "timeout" | undefined;
    const abortFromCaller = (): void => {
      if (abortSource === undefined) {
        abortSource = "caller";
        controller.abort(request.signal?.reason);
      }
    };
    if (request.signal?.aborted === true) {
      abortFromCaller();
    } else {
      request.signal?.addEventListener("abort", abortFromCaller, { once: true });
    }
    const timeout = setTimeout(() => {
      if (abortSource === undefined) {
        abortSource = "timeout";
        controller.abort();
      }
    }, this.#timeoutMs);
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
            { statusCode: response.status },
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
          response.ok ? {} : { statusCode: response.status },
        );
      }

      if (!response.ok) {
        throw this.#error(
          "http",
          `Ollama request failed with HTTP ${response.status}.`,
          startedAt,
          { statusCode: response.status },
        );
      }

      const parsed = parseOllamaResponse(payload, () =>
        this.#error(
          "invalid_response",
          "Ollama returned an invalid completed response.",
          startedAt,
        ),
      );

      if (parsed.response.trim().length === 0) {
        throw this.#error(
          "empty_response",
          emptyResponseMessage(parsed.doneReason),
          startedAt,
          parsed.doneReason === undefined
            ? {}
            : { doneReason: parsed.doneReason },
        );
      }

      const clientLatencyMs = elapsedMilliseconds(this.#now(), startedAt);

      return {
        success: true,
        provider: "ollama",
        model: parsed.model,
        output: parsed.response,
        metrics: mapMetrics(parsed, clientLatencyMs),
      };
    } catch (error) {
      if (abortSource === "caller") {
        throw this.#error(
          "aborted",
          "Ollama request was aborted by the caller.",
          startedAt,
        );
      }
      if (abortSource === "timeout") {
        throw this.#error(
          "timeout",
          `Ollama request timed out after ${this.#timeoutMs} ms.`,
          startedAt,
        );
      }
      if (error instanceof ForgeError) {
        throw error;
      }
      throw this.#error(
        "network",
        "Could not reach the configured Ollama runtime.",
        startedAt,
      );
    } finally {
      clearTimeout(timeout);
      request.signal?.removeEventListener("abort", abortFromCaller);
    }
  }

  #error(
    category:
      | "network"
      | "aborted"
      | "timeout"
      | "http"
      | "invalid_response"
      | "empty_response"
      | "provider",
    message: string,
    startedAt: number,
    details: { statusCode?: number; doneReason?: string } = {},
  ): ForgeError {
    return new ForgeError(category, message, {
      ...(details.statusCode === undefined
        ? {}
        : { statusCode: details.statusCode }),
      evidence: {
        provider: "ollama",
        model: this.#model,
        clientLatencyMs: elapsedMilliseconds(this.#now(), startedAt),
        ...(details.doneReason === undefined
          ? {}
          : { doneReason: details.doneReason }),
      },
    });
  }
}

interface OllamaResponse {
  model: string;
  response: string;
  doneReason?: string;
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
    !("done" in value) ||
    value.done !== true
  ) {
    throw invalid();
  }

  return {
    model: value.model,
    response: value.response,
    ...optionalDoneReason(value),
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

// `done_reason` is diagnostic only. A malformed one is dropped rather than
// failing the turn, because nothing else in the mapping depends on it.
function optionalDoneReason(value: object): { doneReason?: string } {
  const reason: unknown = Reflect.get(value, "done_reason");
  return typeof reason === "string" && reason.trim().length > 0
    ? { doneReason: reason }
    : {};
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

// A reasoning-capable model can finish a turn having produced only hidden
// reasoning. The payload is well formed, so this is not an invalid response;
// `done_reason` is what separates a truncated turn from one that simply
// stopped without a visible answer.
function emptyResponseMessage(doneReason: string | undefined): string {
  const cause =
    doneReason === undefined ? "" : ` (Ollama reported done_reason ${doneReason})`;
  return `Ollama completed the turn without any response text${cause}. Reasoning-capable models can spend the turn on hidden reasoning, most often when generation is truncated before a visible answer.`;
}

function elapsedMilliseconds(now: number, startedAt: number): number {
  return Math.max(0, now - startedAt);
}
