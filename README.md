# 🔥 Forge

## The Local AI Kit

Forge is reusable infrastructure for giving AI agents, developer tools, and
applications practical access to language models running on machines you
control.

Forge is currently experimental. Its first milestone is specified, not yet
implemented.

## Why Forge?

Local inference can already answer useful questions, but every caller should
not have to reinvent configuration, HTTP integration, response parsing, error
handling, and execution metrics. Forge aims to provide that thin layer while
keeping the runtime replaceable and the evidence visible.

The project belongs to a family of AI-agent kits:

- 🗺️ **Pathfinder** — AI Workflow Kit
- 🧙‍♂️ **Lorekeeper** — AI Second Brain Kit
- 🔥 **Forge** — Local AI Kit

A personal assistant such as LAMA may eventually consume these kits. Forge
itself remains generic: it contains no personal configuration, private data, or
LAMA-specific behavior.

## Current architecture

Forge starts from a working reality: an Ollama HTTP API serving a Qwen model on
another machine on the local network.

```text
coding agent / developer tool
        |
        v
      Forge
        |
        v
InferenceProvider boundary
        |
        v
Ollama HTTP API on the LAN -> Qwen
        |
        v
response + model, latency, token, and timing evidence
```

Ollama is the first runtime, not Forge's identity. The design calls for one
small provider contract and one Ollama adapter—enough to permit another backend
later, without building a speculative plugin system now.

## Feature 01: Remote Local Inference

The first vertical slice lets a developer or coding agent perform the
equivalent of:

```sh
forge ask "Review this TypeScript function for bugs"
```

Forge sends the prompt to the configured Ollama runtime and returns the
answer. JSON mode exposes the structured response and available execution
evidence for tooling.

Feature 01 is complete only when a real request travels from the development
machine, through Forge and the LAN, to Ollama/Qwen and back. A mocked response
or HTTP 200 alone is not enough.

See the [Feature specification](context/features/01-remote-local-inference.md).

### CLI

Install and build Forge with:

```sh
npm install
npm run build
```

Supply the private values through the process environment, then run:

```sh
forge ask "Review this TypeScript function for bugs"
```

Inside an unlinked development checkout, the equivalent command is:

```sh
npm run dev -- ask "Review this TypeScript function for bugs"
```

The command accepts exactly one non-empty prompt argument followed optionally
by `--json`. Requests time out after 120 seconds.

#### Human-readable output

`forge ask "<prompt>"` writes the model response and available evidence to
standard output:

```text
<response>

Provider: ollama
Model: <model reported by Ollama>
Client latency: <milliseconds> ms
Tokens: prompt <count|unavailable> | completion <count|unavailable> | total <count|unavailable>
Ollama timings:
  Total: <milliseconds> ms
  Load: <milliseconds> ms
  Prompt evaluation: <milliseconds> ms
  Completion evaluation: <milliseconds> ms
```

Only timing rows supplied by Ollama are printed. When none are supplied, Forge
prints `Ollama timings: unavailable`. Human-readable failures go to standard
error as `Forge error [<category>]: <message>` and exit non-zero without a stack
trace by default.

#### JSON output

`forge ask "<prompt>" --json` writes exactly one JSON object plus a trailing
newline to standard output. A successful result has this contract:

```json
{
  "success": true,
  "provider": "ollama",
  "model": "<model reported by Ollama>",
  "output": "<response>",
  "metrics": {
    "clientLatencyMs": 123.4,
    "promptTokens": 12,
    "completionTokens": 24,
    "totalTokens": 36,
    "totalDurationMs": 5250,
    "loadDurationMs": 250,
    "promptEvalDurationMs": 300,
    "completionEvalDurationMs": 4000
  }
}
```

Every metric except `clientLatencyMs` is optional and omitted when unavailable.
Forge derives `totalTokens` only when both component counts are present. A
failed JSON invocation also writes exactly one object to standard output and
exits non-zero:

```json
{
  "success": false,
  "error": {
    "category": "configuration",
    "message": "<actionable message>"
  },
  "evidence": {}
}
```

`statusCode` may appear under `error`; `provider`, `model`, `clientLatencyMs`,
and `doneReason` may appear under `evidence`. Stable categories are `usage`,
`configuration`, `network`, `timeout`, `http`, `invalid_response`,
`empty_response`, `provider`, and `internal`. JSON failures leave standard error empty so callers can always
parse standard output.

#### Metric mapping

Forge converts Ollama nanoseconds to milliseconds at the adapter boundary:

| Ollama field | Forge field |
| --- | --- |
| `prompt_eval_count` | `promptTokens` |
| `eval_count` | `completionTokens` |
| both counts | `totalTokens` (derived sum) |
| `total_duration` | `totalDurationMs` |
| `load_duration` | `loadDurationMs` |
| `prompt_eval_duration` | `promptEvalDurationMs` |
| `eval_duration` | `completionEvalDurationMs` |

`clientLatencyMs` is measured by Forge around the complete HTTP operation and
is independent of provider-reported timing.

Reasoning-capable Ollama models such as `qwen3.5:9b` may generate hidden
reasoning tokens alongside the visible answer, and Ollama counts both in
`eval_count`. `completionTokens` therefore reports Ollama's completion-side
evaluation count, which is not necessarily the token count of the visible
answer text in `output`. Treat it as the work the runtime performed, not as a
measure of response length.

#### Turns with no visible answer

Ollama returns hidden reasoning in a `thinking` field, separate from
`response`. A turn can therefore finish with `done: true` while `response` is
empty — most often because generation was truncated before the model produced a
visible answer, which Ollama reports as `done_reason: "length"`.

Such a payload is well formed, so Forge does not call it an invalid response.
It fails with the `empty_response` category and a non-zero exit status, because
an empty answer does not satisfy the contract that a successful result carries
response text. When Ollama supplies `done_reason`, Forge repeats it under
`evidence.doneReason` so callers can tell a truncated turn from one that simply
stopped without answering, without parsing the message text.

Forge never emits the `thinking` content. Hidden reasoning is treated as
sensitive intermediate state and stays out of `output`, error messages, and
evidence.

#### Opt-in live verification

Forge reads `OLLAMA_HOST` and `FORGE_MODEL` from the process environment and
does not load `.env` files itself. From a trusted local checkout with an
ignored `.env`, an explicit live verification can use:

```sh
set -a
source .env
set +a
npm run dev -- ask "<non-sensitive development prompt>"
npm run dev -- ask "<non-sensitive development prompt>" --json
unset OLLAMA_HOST FORGE_MODEL
```

Do not publish the `.env`, private host, prompt, or raw terminal capture.

## Local-first principles

- Consume the working local inference setup; do not redesign it.
- Treat remote LAN inference as normal—never assume Ollama runs on localhost.
- Keep prompts and responses ephemeral by default.
- Preserve useful model, latency, token, and provider timing evidence.
- Keep contracts explicit, typed, and small.
- Add abstractions only when the current vertical slice uses them.

## Configuration and privacy

Machine-specific settings such as `OLLAMA_HOST` and `FORGE_MODEL` will be
provided through configuration. Safe examples will be committed; real private
LAN addresses, credentials, prompts, personal information, Lorekeeper data,
and LAMA configuration will not be.

Use `.env.example` as a reference and export its two values through your
preferred local environment setup. Forge reads them directly from the process
environment and never commits their private values.

Forge does not expose Ollama to the public Internet and will not modify or
manage the existing Ollama/Qwen installation.

## Current status

Feature 01 is complete. Forge's human-readable and JSON delegation paths are
live-verified against the existing LAN Ollama/Qwen runtime, including normalized
execution evidence and explicit handling for completed turns with no visible
answer.
