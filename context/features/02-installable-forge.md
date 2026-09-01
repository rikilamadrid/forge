# Installable Forge

## Status

In Progress

## Goal

Make Forge a locally packable and installable ESM package whose public TypeScript API and existing `forge` CLI share the same inference implementation, so a Node.js application such as LAMA can consume Forge without spawning or reimplementing it.

## Context

- Read: `package.json`, `tsconfig.json`, `src/ask.ts`, `src/cli.ts`, `src/config.ts`, `src/inference.ts`, `src/providers/ollama.ts`, Feature 01, and the package sections of `README.md`.
- Relevant area: the package root export, build output, npm manifest, CLI adapter, public declarations, packed-artifact verification, and README.
- Avoid: changing Feature 01 result/metric meanings, exposing Ollama wire payloads, publishing a package, or designing for hypothetical providers.
- Downstream evidence: LAMA is a Node.js 22 ESM application that submits one prompt, needs the complete success evidence, maps structured Forge failures to its own safe errors, and cancels abandoned requests with a native `AbortSignal`.

## Requirements

- Use the planned package identity `forge-local-ai-kit`. The unscoped `forge` name is already published; no public package currently exists under this planned name. Recheck immediately before any future publication.
- Keep the package ESM-only on Node.js 22+, with TypeScript declarations generated from source and zero production dependencies.
- Expose one root package entry point and no public subpaths. The root exports only `createForge`, `ForgeError`, and the types required to configure, call, and interpret Forge; provider adapters, wire types, CLI formatting, and test seams remain internal.
- Use this minimal public shape:

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

- Preserve Feature 01 success and failure semantics: `ask` resolves the existing structured success result and rejects known failures with the exported structured `ForgeError`. Add only the cancellation category needed to distinguish an external abort from Forge's configured timeout.
- Keep `provider: "ollama"` as a literal configuration discriminator, not a registry or routing mechanism. Do not expose `InferenceProvider` or `OllamaProvider` from the package root.
- Make the CLI load environment configuration, call `createForge`, and retain its exact human-readable, `--json`, exit-status, timeout, metric, and privacy behavior.
- Define explicit package exports for ESM JavaScript and declarations, preserve the `forge` bin, and use a package file allowlist so the artifact contains only runtime/declaration output and intended package documentation/metadata. Do not ship source, tests, Pathfinder files, adapters, private configuration, or unrelated repository content.
- Keep `private: true` and do not publish during this Feature. Registry publication, final version selection, npm authentication, scope ownership, license selection, release automation, and provenance are later human release decisions.
- Prove the real tarball rather than only repository-relative imports: pack locally, install it into a clean temporary external Node.js 22 ESM consumer, import the root API, compile a TypeScript consumer against the shipped declarations, and invoke the installed `forge` executable.
- Update the README around the working kit story: local packed installation until publication is approved, TypeScript usage, CLI usage, configuration, structured results/errors, Ollama relationship, provider independence, and privacy.

## Out of Scope

- Publishing or reserving an npm package; changing npm account, scope, 2FA, token, license, release, CI/CD, or provenance configuration.
- A CommonJS build, browser bundle, alternate runtime, monorepo, separate SDK repository, daemon, HTTP API, plugin system, provider registry, dependency-injection framework, capability negotiation, or second provider.
- Streaming, cloud inference, model routing or management, benchmarking, documentation website, LAMA implementation changes, Lorekeeper integration, or Pathfinder product integration.

## Acceptance Criteria

- A clean temporary ESM consumer installs the locally generated tarball and successfully imports `createForge` from `forge-local-ai-kit` without reaching into `dist` or source paths.
- A TypeScript consumer compiles against the declarations in that same installed tarball and sees only the approved root API; an internal subpath import fails through the export boundary.
- The installed package's `createForge({ provider: "ollama", host, model })` delegates a useful live prompt through Forge to the existing M1 Ollama runtime and returns a usable `qwen3.5:9b` response with the Feature 01 provider, model, token, latency, timing, error, empty-response, and hidden-reasoning contracts intact.
- An aborted library request produces the documented structured cancellation failure, while Forge's configured timeout remains distinguishable and deterministic tests require no live model.
- The `forge` executable installed from the same tarball passes deterministic CLI coverage and a sanitized live smoke call without changing its Feature 01 behavior.
- `npm pack --dry-run` and tarball inspection show only the intended files, including executable JavaScript and matching declarations, and exclude `.env`, source, tests, workflow files, private hosts, prompts, and credentials.
- Existing tests plus package-consumer, declaration, cancellation, CLI-compatibility, build, and type checks pass with zero production dependencies.
- The README accurately describes what works from the packed artifact and does not claim npm registry availability or publication.

## Notes / Decisions

- Registry reconnaissance on 2026-09-01 found `forge@2.3.0` already published, no public `forge-local-ai-kit`, no public `@rikilamadrid/forge`, and no authenticated npm account on the development machine. The unscoped descriptive name avoids assuming ownership of a GitHub-matching npm scope.
- The current dry-run artifact contains 116 files, including source, tests, project context, and Pathfinder skills. Feature 02 must replace that accidental package surface with an explicit allowlist.
- The public API intentionally exports a factory and result/error types, not the provider interface or adapter. A second provider would be evidence for revisiting the options union, not for adding machinery now.
