# 🔥 Forge — The Local AI Kit

Forge is a small, installable TypeScript kit for calling language models that
run on machines you control. Applications and developer tools can use its root
API, while humans and scripts can use the packaged `forge` executable. Both
interfaces share the same configuration validation, inference path, Ollama
adapter, result mapping, and structured errors.

Forge currently supports one runtime: an Ollama HTTP API serving a model such
as `qwen3.5:9b` on a trusted local network. It is ESM-only, requires Node.js 22
or newer, and has zero production dependencies.

Forge is not published to the npm registry. Install it from a locally produced
tarball until publication is separately approved.

## Install from the packed artifact

Build and pack Forge from a trusted checkout:

```sh
npm install
npm run build
mkdir -p /tmp/forge-package
npm pack --pack-destination /tmp/forge-package
```

The pack command prints the generated filename, currently similar to
`forge-local-ai-kit-0.0.0.tgz`. Install that tarball in a separate Node.js 22+
ESM project:

```sh
cd /path/to/consumer
npm install /tmp/forge-package/forge-local-ai-kit-0.0.0.tgz
```

The artifact exposes one package root, `forge-local-ai-kit`, plus the `forge`
bin. Internal provider modules and Ollama wire types are not public subpaths.
The package remains `private: true`; these instructions do not publish it.

## TypeScript API

Import the factory and public contracts from the package root:

```ts
import {
  createForge,
  ForgeError,
  type InferenceResult,
} from "forge-local-ai-kit";

const forge = createForge({
  provider: "ollama",
  host: process.env.OLLAMA_HOST!,
  model: process.env.FORGE_MODEL!,
  timeoutMs: 120_000,
});

try {
  const result: InferenceResult = await forge.ask(
    "Review this TypeScript function for correctness.",
  );
  console.log(result.output);
  console.log(result.provider, result.model, result.metrics);
} catch (error) {
  if (error instanceof ForgeError) {
    console.error(error.category, error.message, error.evidence);
  } else {
    throw error;
  }
}
```

The public API is deliberately small:

```ts
interface CreateForgeOptions {
  provider: "ollama";
  host: string;
  model: string;
  timeoutMs?: number;
}

interface ForgeAskOptions {
  signal?: AbortSignal;
}

interface Forge {
  ask(prompt: string, options?: ForgeAskOptions): Promise<InferenceResult>;
}

function createForge(options: CreateForgeOptions): Forge;
```

`host` must be an HTTP or HTTPS Ollama base URL. `model` is the exact model
name requested from Ollama. `timeoutMs` is optional and defaults to 120000.

### Cancellation

Pass a native `AbortSignal` when the caller needs to cancel abandoned work:

```ts
const controller = new AbortController();
const pending = forge.ask("Review this change.", {
  signal: controller.signal,
});

controller.abort();
await pending;
```

Caller cancellation rejects with a `ForgeError` whose category is `aborted`.
Forge's configured deadline rejects with `timeout`. The categories stay
distinct whether cancellation happens while fetching or consuming the response
body.

## Structured results and metrics

A successful call resolves this provider-neutral shape:

```ts
interface InferenceResult {
  success: true;
  provider: string;
  model: string;
  output: string;
  metrics: InferenceMetrics;
}
```

Example JSON:

```json
{
  "success": true,
  "provider": "ollama",
  "model": "qwen3.5:9b",
  "output": "A useful answer.",
  "metrics": {
    "clientLatencyMs": 1234.5,
    "promptTokens": 18,
    "completionTokens": 42,
    "totalTokens": 60,
    "totalDurationMs": 1100,
    "loadDurationMs": 20,
    "promptEvalDurationMs": 80,
    "completionEvalDurationMs": 900
  }
}
```

`clientLatencyMs` is always present and measures the complete operation from
Forge. Other metrics are included only when Ollama supplies their source data:

| Ollama field | Forge metric | Unit |
| --- | --- | --- |
| `prompt_eval_count` | `promptTokens` | tokens |
| `eval_count` | `completionTokens` | tokens |
| both counts | `totalTokens` | derived tokens |
| `total_duration` | `totalDurationMs` | milliseconds |
| `load_duration` | `loadDurationMs` | milliseconds |
| `prompt_eval_duration` | `promptEvalDurationMs` | milliseconds |
| `eval_duration` | `completionEvalDurationMs` | milliseconds |

Missing metrics remain absent; Forge does not invent zero values. Ollama may
include hidden-reasoning work in `eval_count`, so `completionTokens` describes
runtime work and is not necessarily the visible output's token count.

## Structured errors

Known failures reject with the exported `ForgeError`. It provides a stable
`category`, a safe `message`, optional `statusCode`, and structured `evidence`
containing available provider, model, latency, or completion-reason details.

The categories are:

- `usage` — the prompt or CLI invocation is invalid
- `configuration` — required options or environment values are invalid
- `aborted` — the caller cancelled through its `AbortSignal`
- `timeout` — Forge's configured deadline expired
- `network` — the configured runtime could not be reached
- `http` — Ollama returned a non-success HTTP response without provider detail
- `invalid_response` — the response was not valid completed Ollama JSON
- `empty_response` — the turn completed without visible response text
- `provider` — Ollama returned a structured provider error
- `internal` — an unexpected failure was safely normalized for CLI output

Forge never exposes Ollama's `thinking` content. A completed thinking-only turn
fails as `empty_response`; `evidence.doneReason` is retained when available,
without copying hidden reasoning into output, errors, or evidence.

## Installed CLI

The same tarball installs the `forge` executable. In the consuming project:

```sh
export OLLAMA_HOST="http://your-trusted-ollama-host:11434"
export FORGE_MODEL="qwen3.5:9b"
export FORGE_TIMEOUT_MS="120000" # optional

./node_modules/.bin/forge ask "Review this TypeScript function for bugs"
./node_modules/.bin/forge ask "Review this TypeScript function for bugs" --json
```

The CLI accepts exactly one non-empty prompt and an optional `--json` flag.
Human-readable success writes the response followed by provider, model,
latency, token counts, and available Ollama timings. Human-readable failures go
to standard error and exit non-zero without a stack trace.

JSON mode writes exactly one result or failure object plus a trailing newline
to standard output. This makes it suitable for scripts while preserving the
same result, metric, timeout, and error semantics as the library. Caller-owned
`AbortSignal` cancellation is available through the library API.

`FORGE_TIMEOUT_MS` must be a positive finite number when supplied. The CLI does
not load `.env` files; environment loading belongs to the invoking shell or
application.

## One execution path

The public factory and installed CLI converge before inference:

```text
TypeScript caller ─┐
                  ├─> createForge ─> ask ─> Ollama adapter ─> Ollama/Qwen
installed CLI ────┘          │                         │
                             └─ shared results/errors ─┘
```

The CLI is an argument, environment, and presentation adapter over
`createForge`. It does not construct a separate provider path or remap metrics
and errors independently. Applications do not import `OllamaProvider` or
provider wire types.

Ollama is Forge's first and currently only provider. Keeping the public result
and error contracts provider-neutral avoids coupling consumers to Ollama's wire
format; it does not claim another provider, routing, or plugin system exists.

## Local-first and privacy boundaries

- Keep Ollama on a trusted network; Forge does not expose it to the Internet.
- Provide machine-specific hosts, model names, and timeouts at runtime.
- Never commit `.env`, real LAN addresses, credentials, or private prompts.
- Prompts and responses are ephemeral; Forge adds no persistence or telemetry.
- Only the explicitly requested response is returned or printed.
- Hidden reasoning is never surfaced.
- Forge does not discover, install, pull, configure, or modify models.
- Forge contains no LAMA-, Lorekeeper-, or user-specific behavior or data.

## Development and verification

From the Forge checkout:

```sh
npm test
npm run check
npm run build
npm pack --dry-run
```

The deterministic package test creates the real tarball, installs it into a
clean temporary ESM consumer, imports the package root, compiles against the
shipped declarations, rejects private subpath imports, and invokes the
tarball-installed CLI against local controlled infrastructure.

Live verification is intentionally opt-in. Source the ignored private
environment only for the verification process, install one generated tarball
into a clean external consumer, and exercise both that installed root API and
that installed `forge` bin. Retain only sanitized path, provider/model,
completion, latency, token, and normalized timing evidence—never the host,
prompt, output text, hidden reasoning, credentials, or raw terminal capture.

## Current status

Feature 01's CLI delegation and evidence contracts are complete. Forge is now
locally packable and installable as `forge-local-ai-kit`; registry publication
remains a separate, unapproved release decision.
