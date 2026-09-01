import type { InferenceProvider, InferenceResult } from "./inference.js";

export async function ask(
  provider: InferenceProvider,
  prompt: string,
): Promise<InferenceResult> {
  if (prompt.trim().length === 0) {
    throw new Error("Prompt must not be empty.");
  }

  return provider.generate({ prompt });
}
