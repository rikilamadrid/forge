# 🔥 Forge — The Local AI Kit

Forge calls language models running on machines you control, from TypeScript or
the command line.

If you want an application to use a local model, you normally end up writing the
same layer twice: HTTP calls to a runtime, configuration validation, timeout and
cancellation handling, token and latency metrics, and error handling that
distinguishes "the host is unreachable" from "the model returned nothing." Forge
is that layer, written once and installable.

```text
Application  →  Forge  →  local AI runtime  →  model
```

Forge is the reusable boundary in the middle. It is infrastructure: not a model,
not an agent framework, not a prompt or chain library. It has no opinion about
what you ask or why.

Forge supports one runtime today, [Ollama](https://ollama.com), reached over
HTTP on a machine you trust. It is ESM-only, requires Node.js 22 or newer, and
has zero production dependencies.

## Install

```sh
npm install forge-local-ai-kit
```

## Requirements

Forge is a client. It never installs, pulls, configures, or modifies a runtime
or a model — you bring those.

- **Node.js 22 or newer**, and an ESM project (`"type": "module"`, or `.mjs`).
- **A running Ollama server** you can reach over HTTP, on this machine or
  another one on your local network.
- **A model already pulled** on that server, for example `ollama pull qwen3:8b`.

Verify the runtime before pointing Forge at it:

```sh
ollama list                       # the model you want is in this list
curl http://localhost:11434/api/version
```

## Setup: one machine

The simplest case. Ollama runs on the same machine as your application, on its
default port.

`ollama serve` runs in the foreground and holds the terminal, so use two.

**Terminal 1 — run the server.** Skip this if Ollama is already running; the
macOS and Windows desktop apps start it for you.

```sh
ollama serve
```

**Terminal 2 — pull a model and call it.**

```sh
ollama pull qwen3:8b

export OLLAMA_HOST="http://localhost:11434"
export FORGE_MODEL="qwen3:8b"

npx forge ask "Summarize what a bloom filter is good for."
```

## Setup: two machines over a LAN

Run the model on the machine that has the memory for it, and call it from your
laptop. Nothing leaves your network.

On the **server** machine, bind Ollama to the network instead of loopback. As
above, the server holds its terminal, so use two.

**Server, terminal 1 — serve on the network.**

```sh
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

**Server, terminal 2 — pull the model.**

```sh
ollama pull qwen3:8b
```

On the **client** machine, point Forge at the server's address:

```sh
export OLLAMA_HOST="http://192.0.2.10:11434"   # your server's LAN address
export FORGE_MODEL="qwen3:8b"

npx forge ask "Summarize what a bloom filter is good for."
```

Note that `OLLAMA_HOST` means two different things by convention. To the Ollama
server it is the address to bind to (`0.0.0.0:11434`); to Forge it is the base
URL to call (`http://192.0.2.10:11434`). Forge requires the URL form.

Ollama has no authentication. Bind it to a network you trust and do not expose
that port to the Internet.

## Library usage

Import from the package root:

```ts
import {
  createForge,
  ForgeError,
  type InferenceResult,
} from "forge-local-ai-kit";

const forge = createForge({
  provider: "ollama",
  host: "http://localhost:11434",
  model: "qwen3:8b",
});

try {
  const result: InferenceResult = await forge.ask("Explain a bloom filter.");
  console.log(result.output);
  console.log(result.model, result.metrics.clientLatencyMs);
} catch (error) {
  if (error instanceof ForgeError) {
    console.error(error.category, error.message, error.evidence);
  } else {
    throw error;
  }
}
```

The whole public API:

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

`createForge`, `ForgeError`, and the public types are exported from the package
root and nowhere else. Internal modules — the provider, its wire types, and the
CLI's own environment reader — are not importable subpaths.

Forge reads no environment variables and loads no `.env` file. Your application
owns its own configuration and passes normalized values in:

```ts
const forge = createForge({
  provider: "ollama",
  host: process.env.MY_APP_OLLAMA_HOST ?? "http://localhost:11434",
  model: process.env.MY_APP_MODEL ?? "qwen3:8b",
  timeoutMs: 60_000,
});
```

### Cancellation

Pass a native `AbortSignal` to abandon work in flight:

```ts
const controller = new AbortController();
const pending = forge.ask("Explain a bloom filter.", {
  signal: controller.signal,
});

controller.abort();
await pending; // rejects with ForgeError, category "aborted"
```

Caller cancellation rejects as `aborted`. Forge's own deadline rejects as
`timeout`. The two stay distinct.

## CLI usage

Installing the package installs a `forge` executable.

```sh
forge --help      # supported commands and configuration; exits 0
forge --version   # the installed package version; exits 0

forge ask "Explain a bloom filter."
forge ask "Explain a bloom filter." --json
```

`--help` and `--version` answer offline, before any configuration or network
work. `ask` takes exactly one non-empty prompt and an optional `--json`.

Human-readable success prints the response, then provider, model, client
latency, token counts, and whichever Ollama timings were reported. Failures
print one line to standard error — `Forge error [category]: message` — with no
stack trace, and exit non-zero.

`--json` writes exactly one result or failure object, plus a newline, to
standard output. The result and error semantics are identical to the library's.

The CLI reads its configuration from the environment, and does not load `.env`
files — that belongs to your shell or process manager:

| Variable | Required | Meaning |
| --- | --- | --- |
| `OLLAMA_HOST` | yes | Base URL of the Ollama API, `http://` or `https://` |
| `FORGE_MODEL` | yes | Exact name of a model installed on that server |
| `FORGE_TIMEOUT_MS` | no | Request timeout in milliseconds; positive number |

## Configuration

The library and the CLI validate the same three things through the same code
path, so they cannot disagree.

- **`provider`** — `"ollama"`. The only supported value today.
- **`host`** — the Ollama base URL. Must parse as an `http://` or `https://`
  URL. A trailing slash is trimmed.
- **`model`** — the exact model name as Ollama knows it. Forge does not resolve
  aliases or pull missing models.
- **`timeoutMs`** — optional, defaults to `120000` (two minutes). Must be a
  positive finite number. Cold model loads are slow; raise it rather than
  fighting it.

Anything invalid rejects as a `configuration` error before a request is made.

## Results and metrics

A successful call resolves to:

```ts
interface InferenceResult {
  success: true;
  provider: string;
  model: string;
  output: string;
  metrics: InferenceMetrics;
}
```

As JSON:

```json
{
  "success": true,
  "provider": "ollama",
  "model": "qwen3:8b",
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

`clientLatencyMs` is always present and measures the whole operation as Forge
saw it. Every other metric appears only when Ollama reported its source data,
and is otherwise absent — Forge does not substitute zeros.

| Ollama field | Forge metric | Unit |
| --- | --- | --- |
| `prompt_eval_count` | `promptTokens` | tokens |
| `eval_count` | `completionTokens` | tokens |
| both counts | `totalTokens` | derived tokens |
| `total_duration` | `totalDurationMs` | milliseconds |
| `load_duration` | `loadDurationMs` | milliseconds |
| `prompt_eval_duration` | `promptEvalDurationMs` | milliseconds |
| `eval_duration` | `completionEvalDurationMs` | milliseconds |

Ollama counts hidden reasoning in `eval_count`, so `completionTokens` measures
runtime work, not the length of the visible answer.

## Failures

Known failures reject with `ForgeError`, which carries a stable `category`, a
safe `message`, an optional `statusCode`, and `evidence` holding whatever
provider, model, latency, or completion-reason detail was available.

```ts
catch (error) {
  if (error instanceof ForgeError && error.category === "timeout") {
    // retry with a longer deadline
  }
}
```

Branch on `category`, never on message text:

| Category | Meaning |
| --- | --- |
| `usage` | The prompt or CLI invocation is invalid |
| `configuration` | Required options or environment values are invalid |
| `network` | The configured runtime could not be reached |
| `aborted` | The caller cancelled through its `AbortSignal` |
| `timeout` | Forge's configured deadline expired |
| `http` | A non-success HTTP response with no provider detail |
| `invalid_response` | The response was not valid completed Ollama JSON |
| `empty_response` | The turn completed with no visible response text |
| `provider` | Ollama returned a structured provider error |
| `internal` | An unexpected failure, safely normalized |

In `--json` mode the same information arrives as `{ "success": false, "error":
{ "category", "message", "statusCode"? }, "evidence": {} }`.

Forge never surfaces Ollama's hidden `thinking` content. A turn that produced
only reasoning fails as `empty_response`, keeping `evidence.doneReason` when
available, without copying the reasoning anywhere.

## Local-first and privacy

- Prompts and responses go to the host you configure and nowhere else. Forge
  contacts no other service.
- Forge adds no persistence, no telemetry, no analytics, and no logging of
  prompts or responses. Everything is ephemeral.
- Only the requested response is returned. Hidden reasoning is never surfaced.
- Forge holds no credentials and reads no environment of its own as a library.
- Keep Ollama on a trusted network. It has no authentication of its own.
- Keep real hosts out of version control; hosts in this README are placeholders.

## Scope

Forge is deliberately small. It does not do, and does not plan to do:

- Model management — discovery, pulling, configuration, or serving.
- Prompt templating, chains, agents, tools, or memory.
- Streaming, embeddings, or chat-history management.
- CommonJS, a browser build, or public subpaths.

Ollama is the first and currently only provider. The result and error contracts
are provider-neutral so consumers are not coupled to Ollama's wire format; that
is a design choice, not a claim that other providers, routing, or a plugin
system exist.

## License

MIT © 2026 Ricardo Lamadrid. See [LICENSE](LICENSE).
