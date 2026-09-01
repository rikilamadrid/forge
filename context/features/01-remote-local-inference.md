# Remote Local Inference

## Status

In Progress

## Goal

Prove that a coding or development machine can delegate a useful prompt through Forge to the existing Qwen model served by Ollama on another LAN machine and receive a usable response with trustworthy execution evidence.

## Context

- Read: `context/project-overview.md`, `context/coding-standards.md`, `context/ai-interaction.md`, and Ollama's generate-response contract before implementation.
- Relevant area: Proposed `src/cli.ts`, `src/ask.ts`, `src/inference.ts`, `src/config.ts`, `src/providers/ollama.ts`, and corresponding tests.
- Avoid: Modifying the Ollama/Qwen machine, introducing general plugin infrastructure, or adding any excluded agent, retrieval, UI, hosting, or benchmarking capability.

## Requirements

- Expose a CLI contract of `forge ask "<prompt>"` for human-readable output and `forge ask "<prompt>" --json` for one machine-readable JSON result.
- Expose the same provider-neutral ask use case to programmatic callers; the CLI must remain an adapter rather than the owner of inference behavior.
- Define the smallest provider boundary needed now: an `InferenceProvider` with one asynchronous generation operation accepting a provider-neutral request and returning a provider-neutral structured result.
- Implement Ollama as the first provider using its HTTP API and non-streaming generation for a deterministic first contract.
- Read the Ollama base URL and default model from `OLLAMA_HOST` and `FORGE_MODEL`; validate missing or malformed configuration before making a request.
- Do not assume localhost and do not commit a real private address. Provide `.env.example` with non-sensitive placeholders.
- Return response text plus evidence identifying provider/runtime, answered model, success, client-observed latency, prompt token count, completion token count, total token count, and available provider timing fields.
- Normalize timing fields to documented millisecond values for callers while keeping the mapping from Ollama's response explicit and tested. Missing optional metrics must remain absent or null, never fabricated as zero.
- Represent failures as actionable structured errors that distinguish configuration, network/timeout, non-success HTTP, invalid response, and provider-reported failures. Human output must be concise; JSON output must remain machine-readable.
- Apply a finite request timeout. The precise default may be an implementation constant, but it must be documented and testable.
- Do not persist prompts or responses and do not emit them in diagnostic logs beyond the requested command output.
- Keep production dependencies at zero unless implementation reveals a concrete need and the human approves it.
- Test configuration validation, request construction, response parsing, metric normalization, success output, JSON output, and representative failure paths without requiring the live Ollama machine.
- Provide an explicit, opt-in live verification command or procedure that uses configured private values without committing them.

## Out of Scope

- LAMA, Lorekeeper integration, or Pathfinder product integration.
- RAG, embeddings, vector databases, agents, multi-agent orchestration, model routing, cloud fallback, streaming, chat history, tool calling, or persistence.
- Web UI, dashboard, hosted API, public SaaS, remote Internet exposure, authentication, or authorization.
- Model discovery, installation, pulling, selection UI, lifecycle management, or changes to the working Ollama/Qwen host.
- Benchmark suites, comparative scoring, or optimization beyond recording evidence from the call.
- A provider registry, dynamically loaded plugins, or a generalized transport framework.

## Acceptance Criteria

- From the coding/development machine, `forge ask "<useful coding prompt>"` reaches the configured Ollama host on the LAN and prints a usable Qwen answer.
- The same live invocation in `--json` mode emits valid JSON containing `success`, `provider`, the model reported by Ollama, response text, client latency, and every token/timing metric Ollama supplies.
- The structured result reports prompt, completion, and total token counts when Ollama supplies the component counts; the total is derived and clearly documented if Ollama does not return it directly.
- Captured live evidence identifies the command or procedure, the provider and model, successful completion, elapsed time, and available token counts without recording the private LAN address or private prompt content.
- A successful mock HTTP response alone cannot satisfy the live acceptance criterion; evidence demonstrates the full development-machine → Forge → LAN → Ollama/Qwen → Forge path.
- Human-readable mode presents the answer clearly and makes provider/model, latency, and token evidence available without exposing internal response details.
- Missing or invalid `OLLAMA_HOST` or `FORGE_MODEL` fails before network activity with an actionable message and non-zero exit status.
- Network refusal/timeout, non-success HTTP responses, and malformed Ollama payloads each fail with the correct structured error category, useful context, and non-zero CLI exit status without a stack trace by default.
- Automated tests cover the provider contract, Ollama request/response mapping, metric normalization, configuration, CLI modes, and failure categories and pass without access to Ollama.
- Static type checking and the production build pass, and no committed file contains the real LAN host, credentials, private prompts, personal information, Lorekeeper data, or LAMA-specific configuration.

## Notes / Decisions

- The proposed structured success shape is `{ success: true, provider, model, output, metrics }`; the failure shape is `{ success: false, error, evidence }`. Exact TypeScript field names may be refined in tickets, but the evidence contract above may not be weakened.
- The Ollama adapter translates provider-specific fields such as prompt/evaluation counts and durations. Provider-specific wire types must not leak into the ask use case or CLI.
- Use Node's native `fetch`, `AbortSignal` timeout support, argument parsing, and test runner; use TypeScript as the only initial development dependency unless a concrete gap is demonstrated.
- The repository structure proposed for implementation is:

  ```text
  src/
    cli.ts
    ask.ts
    config.ts
    inference.ts
    providers/
      ollama.ts
  test/
    ask.test.ts
    config.test.ts
    ollama.test.ts
    cli.test.ts
  .env.example
  package.json
  tsconfig.json
  ```
