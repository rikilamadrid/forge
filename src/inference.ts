export interface InferenceRequest {
  prompt: string;
}

export interface InferenceResult {
  provider: string;
  model: string;
  output: string;
  clientLatencyMs: number;
}

export interface InferenceProvider {
  generate(request: InferenceRequest): Promise<InferenceResult>;
}
