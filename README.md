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

The first vertical slice will let a developer or coding agent perform the
equivalent of:

```sh
forge ask "Review this TypeScript function for bugs"
```

Forge will send the prompt to the configured Ollama runtime and return the
answer. A JSON mode will expose the structured response and available execution
evidence for tooling.

Feature 01 is complete only when a real request travels from the development
machine, through Forge and the LAN, to Ollama/Qwen and back. A mocked response
or HTTP 200 alone is not enough.

See the [Feature specification](context/features/01-remote-local-inference.md).

### Current CLI slice

Ticket 01.1 implements the first human-readable delegation path. Install and
build it with:

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

The command accepts exactly one non-empty prompt argument. It prints the model
response followed by the `ollama` provider identity, the model name reported by
Ollama, and client-observed latency in milliseconds. Requests time out after
120 seconds. Errors are written to standard error with a non-zero exit status
and no stack trace by default.

Forge reads `OLLAMA_HOST` and `FORGE_MODEL` from the process environment; it
does not load `.env` files itself. `--json` and complete provider metrics are
planned for Ticket 01.2 and are not available yet.

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

Ticket 01.1 is in progress. Its CLI, Ollama adapter, and deterministic tests are
implemented; Feature 01 remains incomplete until its later evidence contract
and final verification ticket are complete.
