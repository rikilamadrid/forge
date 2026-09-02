# Project History

Compact record of completed work.

## Completed

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
