export interface InferenceRequest {
  prompt: string;
}

export interface InferenceMetrics {
  clientLatencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  totalDurationMs?: number;
  loadDurationMs?: number;
  promptEvalDurationMs?: number;
  completionEvalDurationMs?: number;
}

export interface InferenceResult {
  success: true;
  provider: string;
  model: string;
  output: string;
  metrics: InferenceMetrics;
}

export interface InferenceProvider {
  generate(request: InferenceRequest): Promise<InferenceResult>;
}

export type ForgeErrorCategory =
  | "usage"
  | "configuration"
  | "network"
  | "timeout"
  | "http"
  | "invalid_response"
  | "provider"
  | "internal";

export interface FailureEvidence {
  provider?: string;
  model?: string;
  clientLatencyMs?: number;
}

interface ForgeErrorOptions {
  statusCode?: number;
  evidence?: FailureEvidence;
}

export class ForgeError extends Error {
  readonly category: ForgeErrorCategory;
  readonly statusCode?: number;
  readonly evidence: FailureEvidence;

  constructor(
    category: ForgeErrorCategory,
    message: string,
    options: ForgeErrorOptions = {},
  ) {
    super(message);
    this.name = "ForgeError";
    this.category = category;
    this.evidence = options.evidence ?? {};
    if (options.statusCode !== undefined) {
      this.statusCode = options.statusCode;
    }
  }
}

export interface InferenceFailure {
  success: false;
  error: {
    category: ForgeErrorCategory;
    message: string;
    statusCode?: number;
  };
  evidence: FailureEvidence;
}

export function toInferenceFailure(error: unknown): InferenceFailure {
  const forgeError =
    error instanceof ForgeError
      ? error
      : new ForgeError("internal", "Unexpected Forge failure.");

  return {
    success: false,
    error: {
      category: forgeError.category,
      message: forgeError.message,
      ...(forgeError.statusCode === undefined
        ? {}
        : { statusCode: forgeError.statusCode }),
    },
    evidence: forgeError.evidence,
  };
}
