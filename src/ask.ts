import {
  ForgeError,
  type InferenceProvider,
  type InferenceResult,
} from "./inference.js";

export async function ask(
  provider: InferenceProvider,
  prompt: string,
  options: { signal?: AbortSignal } = {},
): Promise<InferenceResult> {
  if (prompt.trim().length === 0) {
    throw new ForgeError("usage", "Prompt must not be empty.");
  }

  return provider.generate({
    prompt,
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  });
}
