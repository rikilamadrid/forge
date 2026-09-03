# Project History

Compact record of completed work.

## Completed

### 2026-09-03 — Feature 03: Public npm Release

- Outcome: Forge is published to the public npm registry as MIT-licensed `forge-local-ai-kit@0.1.0`, so any Node.js 22+ ESM consumer can `npm install forge-local-ai-kit` and use the root `createForge`/`ForgeError` API and the installed `forge` executable without a local tarball. The manifest dropped `private`, gained a `prepack` build and source-traceability metadata, the CLI gained `--help` and `--version`, and the README became the npm landing page.
- Verification: 43 deterministic tests, type check, and production build; a `prepack` proof that packs a complete artifact from a deleted `dist/`; tarball inspection recording 17 files and shasum `599ee65b44e7882bcd896a78d502d802fa79acd4`, reproduced byte-identically across repacks and matching the published `dist.shasum`. Clean external consumers — one from the tarball, one from the registry — each proved the root ESM import, TypeScript declaration compilation under strict `NodeNext`, refusal of `loadConfig`/`Environment`/`ForgeConfig` and of every internal subpath, and the installed bin across `--version`, `--help`, usage failure, and the `ask` success and failure contracts. No source, test, context, skill, `.env`, or private host file ships, and no configured host appears in any failure message.
- Commit/PR: GitHub Issues #8, #9, #10, and #11; pull requests #12, #13, and #14. Published as npm user `riki.lamadrid` after separate human approval at the publication gate.
- Follow-up: `Release process` and `CI/CD` remain `TBD` in `context/project-overview.md`. Ongoing versioning policy, changelog, provenance, and release automation are still unresolved human decisions. LAMA's migration from the CLI to the library API is its own Feature.

### 2026-09-02 — Feature 02: Installable Forge

- Outcome: Forge is a locally packable, installable ESM kit, `forge-local-ai-kit`, whose root API and packaged `forge` executable share one configuration, inference, result, and error path; the artifact ships only build output and README, stays `private: true`, and adds caller cancellation without changing Feature 01 semantics.
- Verification: 40 deterministic tests, type check, production build, tarball inspection, and a clean external consumer proving root import, declaration compilation, subpath rejection, and installed CLI; sanitized live `qwen3.5:9b` runs from the installed artifact for both the library API and the installed CLI, with abort, timeout, and configuration failures distinguished and no host, prompt, or hidden reasoning retained.
- Commit/PR: GitHub Issues #4 and #5; pull requests #6 and #7.
- Follow-up: npm registry publication, version selection, license, and release automation remain unapproved human release decisions.

### 2026-09-01 — Feature 01: Remote Local Inference

- Outcome: Forge delegates human-readable and JSON prompts through the existing LAN Ollama runtime, returns usable Qwen answers with normalized evidence, and distinguishes completed turns with no visible response without exposing hidden reasoning.
- Verification: 28 deterministic tests, type checking, production build, privacy scans, and sanitized live `qwen3.5:9b` verification passed.
- Commit/PR: `29f50b8`; GitHub Issues #1, #2, and #3.
- Follow-up: None.
