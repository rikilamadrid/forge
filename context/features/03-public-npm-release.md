# Public npm Release

## Status

Complete

## Goal

Publish Forge to the public npm registry as MIT-licensed `forge-local-ai-kit@0.1.0`, so an unrelated Node.js 22+ ESM consumer — LAMA first — can run `npm install forge-local-ai-kit` and use the already-approved root API and `forge` executable without a local tarball.

## Context

- Read: `package.json`, `tsconfig.json`, `src/cli.ts`, `src/index.ts`, `README.md`, `test/package.test.js`, `test/cli.test.js`, and `context/features/02-installable-forge.md`.
- Relevant area: npm manifest and release metadata, licensing, the CLI argument surface, README as the npm landing page, packed-artifact verification, and the publication gate.
- Avoid: inference, provider, result, metric, and error implementations. Feature 02 proved them from the installed artifact and this Feature does not reopen them.
- Downstream evidence: LAMA currently spawns the CLI and its next Feature migrates to `import { createForge, ForgeError } from "forge-local-ai-kit"`. LAMA reads its own environment and passes normalized options to `createForge`; it does not need Forge's internal config or environment helpers.

## Requirements

- Publish under the existing name `forge-local-ai-kit` at version `0.1.0`. Reverify availability against the registry immediately before publication; if the name is no longer free, stop and ask rather than choosing another name or scope.
- Remove `"private": true` so publication is possible. This is the only reason to remove it, and no other manifest semantics change with it.
- License the work MIT: a repository `LICENSE` file reading `Copyright (c) 2026 Ricardo Lamadrid`, and a matching `"license": "MIT"` field. Add no other licensing terms, restrictions, or notices.
- Add `"prepack": "npm run build"` so `npm pack` and `npm publish` always regenerate `dist/` first. A clean checkout with no `dist/` must still produce a complete, current artifact.
- Add the npm metadata that makes the package page usable and its source traceable: `repository`, `homepage`, `bugs`, `keywords`, and `author` as name `Ricardo Lamadrid` with url `https://github.com/rikilamadrid`. Publish no email address. Do not add release automation, provenance, or CI configuration.
- Keep the public contract exactly as Feature 02 approved it: one root entry point exporting `createForge`, `ForgeError`, and the approved types; ESM-only; Node.js 22+; zero production dependencies; no public subpaths. Do not export `loadConfig`, `Environment`, `ForgeConfig`, provider classes, or wire types.
- Preserve the installed `forge` executable and its Feature 01 `ask` behavior — human-readable output, `--json`, exit statuses, timeouts, metrics, and privacy — unchanged.
- Add `--help` and `--version` to the CLI. Both currently fail as `usage` errors, which is wrong for a published executable. `--help` writes the supported commands and configuration variables to standard output and exits `0`; `--version` writes the package version and exits `0`. `forge` with no arguments keeps its existing usage failure. `--version` must report the real published version, read from the package manifest rather than duplicated in source.
- Rewrite the README as the npm landing page, concise enough for a first release: what Forge is, `npm install forge-local-ai-kit`, minimum local-runtime requirements including a running Ollama and a pulled model, a same-machine `localhost` example, a remote local-network example, CLI usage, library usage, required configuration, the success and failure contract, and the local-first privacy boundary. Remove every claim that Forge is unpublished or installable only from a tarball.
- Verify the real artifact before publication: `npm pack --dry-run`, tarball inspection, and a clean external consumer that installs the tarball, imports the root, compiles against the shipped declarations, fails on an internal subpath, and runs the installed `forge` bin. No source, test, context, skill, `.env`, private host, or development file may ship.
- Do not publish until the human explicitly approves publication as a separate decision from accepting the work.
- Treat npm authentication as a publication-gate concern only. It must not block slicing, implementation, or any pre-publication verification. At the gate, if `npm whoami` shows no account, stop and ask the human to run `npm login --auth-type=web`, then confirm ownership with `npm whoami` before publishing. Do not work around authentication, and do not publish under another account, scope, or package name without approval.
- After approved publication, verify the registry package from a completely clean external consumer: `npm install forge-local-ai-kit@0.1.0`, root import, declaration resolution, installed CLI, and confirmation that the published artifact's file list matches the inspected tarball.

## Out of Scope

- Any LAMA change, including its migration from the CLI to the library API.
- Release automation, CI/CD, provenance/attestation, changelog generation, git tags beyond what publication requires, npm organizations or scopes, and deprecation or unpublish workflows.
- A documentation website, examples repository, or expanded guide beyond the README.
- Inference, provider, result, metric, error, or cancellation behavior changes; a second provider; CommonJS; streaming; or any new runtime capability.
- Versions after `0.1.0` and the policy for choosing them.

## Acceptance Criteria

- `package.json` declares `forge-local-ai-kit@0.1.0`, `"license": "MIT"`, no `private` field, a `prepack` build, and the source-traceability metadata, with `dependencies` still empty.
- A repository `LICENSE` file contains the MIT text with the correct holder, and the license ships in the artifact.
- Deleting `dist/` and running `npm pack` produces a complete, current tarball, proving `prepack` closes the stale-build gap.
- `npm pack --dry-run` and tarball inspection show only build output, `README.md`, `LICENSE`, and `package.json`.
- A clean external consumer installs the tarball, imports `createForge` and `ForgeError` from the package root, compiles a TypeScript consumer against the shipped declarations, is refused an internal subpath import, and runs the installed `forge` bin.
- `forge --help` and `forge --version` exit `0` with useful output, `--version` matches the manifest version, and every existing `ask`, `--json`, failure, and exit-status test still passes.
- The README reads as a first-release npm landing page covering all ten required topics and claims nothing untrue about availability.
- `npm test`, `npm run check`, and `npm run build` pass with zero production dependencies.
- The name is reverified as available immediately before publication, and publication happens only after explicit human approval.
- After publication, a completely clean consumer installs `forge-local-ai-kit@0.1.0` from the registry and reproduces the library import, declarations, and CLI, with a published file list matching the pre-publication tarball.

## Notes / Decisions

- Registry check on 2026-09-02: `https://registry.npmjs.org/forge-local-ai-kit` returns 404, so the name is unclaimed; the unscoped `forge` name remains taken. `npm whoami` returns 401, so no npm account is authenticated on this machine.
- `--help` and `--version` are an additive CLI surface, not a change to `ask`. They are required because a published executable that fails on `--version` is a defect for consumers, and they are the only new behavior this Feature introduces.
- `context/project-overview.md` records `Release process` and `CI/CD` as `TBD`. This Feature resolves the first release only. Ongoing versioning policy, changelog, provenance, and CI remain unresolved human decisions.
- Approved on 2026-09-02: MIT with `Copyright (c) 2026 Ricardo Lamadrid`; npm author `Ricardo Lamadrid` identified by `https://github.com/rikilamadrid` rather than an email; `--help` and `--version` additions approved, both exiting `0`, with the version read from package metadata.
- The npm account identity, 2FA method, and publish token are the human's and are provided at the publication gate, not stored in the repository. Authentication is deliberately deferred to that gate and does not block implementation.
