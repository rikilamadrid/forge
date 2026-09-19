# Project Overview

Durable, project-wide context.

Keep this concise. Feature scope, active work, history, and temporary
planning belong elsewhere.

Two words keep an unmade decision visible:

- `TBD` — a human decision is still required
- `None` — considered and intentionally excluded

Leave nothing blank. A blank field is indistinguishable from an abandoned one.

## Project

- Name: Forge 🔥 — The Local AI Kit
- Stage: prototype
- Repo type: library and CLI
- Primary goal: Let AI agents, developer tools, and applications delegate useful work to local LLM runtimes through a small, measurable, provider-independent interface.

## Product

- Problem: Working local inference runtimes lack a reusable integration layer with stable contracts, safe configuration, useful errors, and execution evidence for developer tooling.
- Primary user: Developers and coding-agent authors who want to use LLMs running on machines they control.
- First useful outcome: A coding or development machine sends a prompt through Forge to the existing remote Ollama/Qwen runtime and receives a usable answer with execution metrics.
- Distinctive quality: Thin, local-first infrastructure that preserves runtime evidence and avoids coupling callers to one provider.
- Avoid becoming: A personal assistant, agent framework, model manager, benchmarking platform, or cloud AI service.

## Scope

### In

- A TypeScript/Node library core and CLI entry point for remote local inference.
- Ollama as the first runtime behind a minimal provider boundary.
- Environment-based host and model configuration with safe examples.
- Structured success, failure, token, latency, and provider/model evidence.
- Contract/parsing tests and a real end-to-end verification path against the existing LAN runtime.

### Out

- LAMA or personal configuration.
- Lorekeeper integration or Pathfinder integration beyond project delivery.
- RAG, embeddings, vector databases, autonomous or multi-agent orchestration.
- Model routing, cloud fallback, model installation, or model management.
- Web UI, dashboard, public SaaS, remote Internet exposure, or elaborate benchmarking.
- Changes to the existing Ollama/Qwen installation.

## Requirements and Open Decisions

Record only what constrains the work. An open decision stays `TBD` until a
human resolves it.

| Type | Item | Notes |
| --- | --- | --- |
| Requirement | Consume the existing remote Ollama HTTP API | Forge must not modify or replace the working inference machine. |
| Requirement | Remote LAN hosts are first-class | Never assume Ollama is on localhost. |
| Requirement | Preserve execution evidence | Include provider, model, outcome, client latency, token counts, and available Ollama timings. |
| Requirement | Keep machine-specific values out of Git | Commit `.env.example`, never real LAN addresses, credentials, private prompts, personal data, or Lorekeeper data. |
| Requirement | Keep Forge generic | No LAMA-specific behavior or configuration. |
| Preference | TypeScript on Node.js with minimal dependencies | Use platform capabilities where practical. |
| Constraint | Provider independence without speculative extensibility | Add one interface required by the Ollama implementation, not a plugin system. |
| Constraint | Feature 01 proves real delegation | An HTTP 200 or fully mocked test is insufficient evidence. |
| Requirement | Publish as the unscoped `forge-local-ai-kit` on the public npm registry, MIT licensed | Resolved by Feature 03: `0.1.0` published 2026-09-03. Later versions follow the Delivery Workflow release rows. |

## System

Record only important project-wide architecture and constraints.

- Architecture: A small application service accepts a provider-neutral inference request, delegates through an `InferenceProvider` contract, and returns a structured result. A CLI adapts terminal input/output; an Ollama adapter owns HTTP and response parsing.
- Main components: CLI adapter, ask use case, provider contract and result types, environment configuration, Ollama provider adapter.
- Constraints: No provider registry, dependency injection framework, persistence layer, or network server in Feature 01.

```text
developer/coding agent -> Forge CLI or library -> InferenceProvider
  -> Ollama HTTP API on LAN -> Qwen -> structured result + evidence
```

## Technology

The stack an agent must follow rather than choose. Keep the rows this project
actually has.

| Layer | Choice | Reason |
| --- | --- | --- |
| Platform/runtime | Node.js 22+ | Provides native `fetch`, stable modern ESM support, and a broad LTS-compatible baseline. |
| Language(s) | TypeScript, strict mode | Strong contracts are important at configuration and provider boundaries. |
| UI/presentation | CLI with human-readable output and `--json` mode | Serves humans and coding tools without a web UI. |
| Backend/application | Provider-neutral ask use case plus Ollama HTTP adapter | Keeps the first slice thin and permits one later backend without a plugin framework. |
| Data storage and access | None | Feature 01 returns results directly and stores no prompts or responses. |
| Auth | None | The baseline is a trusted LAN API; remote Internet exposure is excluded. |
| Testing | Node test runner with injected/fake HTTP for contract tests; explicit opt-in live smoke test | Minimizes dependencies while separating deterministic tests from real-system evidence. |
| Build and package tooling | npm, TypeScript compiler, ESM | Uses the standard Node toolchain with minimal setup. |

## Commands

The commands an agent runs to verify its own work.

```text
install: npm install
run/dev: npm run dev -- ask "<prompt>"
test: npm test
lint/static analysis: npm run check
build/package: npm run build
```

## Delivery Workflow

| Area | Choice |
| --- | --- |
| Git workflow | Short-lived Feature/ticket branches from `main` |
| Default branch | `main` |
| Branch naming | `feature/NN-short-name` or `ticket/NN.TT-short-name` |
| Commit convention | Conventional Commits |
| Review policy | Human acceptance is required; tester review verifies the Feature contract before completion. |
| Merge strategy | Squash merge after approval |
| CI/CD | GitHub Actions workflow `CI` (`.github/workflows/ci.yml`) on pushes to `main` and pull requests targeting it: `npm ci`, `npm run check`, `npm test`, `npm pack`, and `node scripts/verify-package.mjs` on the packed tarball, across Ubuntu with Node.js 22 and 24 and macOS with Node.js 22. `main` requires the `CI` check with strict up-to-date branches. No publishing from CI. |
| Versioning and changelog | Semantic Versioning since `0.1.0` (2026-09-03), with the 0.x rule in `RELEASING.md`: a breaking public API, CLI, or Node.js range change bumps MINOR; everything else bumps PATCH. Hand-maintained `CHANGELOG.md` in Keep a Changelog format, updated in the same pull request as the change and never shipped in the package; the manifest `version` changes only in a release pull request. |
| Release process | The nine steps in `RELEASING.md`, run by hand: preconditions, release pull request, squash merge with CI verified on the exact merged commit, local annotated `vX.Y.Z` tag, clean pack verified by `scripts/verify-package.mjs`, the publication gate as a hard human stop, `npm publish` of that exact tarball, registry verification of the downloaded copy, then the tag push and `gh release create --verify-tag`. Proven by `0.1.1` (2026-09-18). |

## Environments and Integrations

| Area | Choice | Notes |
| --- | --- | --- |
| Local development | Node.js on the coding/development machine | Unit and contract tests must not require the live inference machine. |
| Preview/staging | None | No hosted service is planned. |
| Production | None | Feature 01 is an experimental local tool. |
| Configuration and secrets | Environment variables with a committed `.env.example` | `OLLAMA_HOST` and `FORGE_MODEL` are required; real values stay uncommitted. |
| External services/APIs | Existing Ollama HTTP API on a trusted LAN | Qwen model already exists and is managed outside Forge. |

## Quality Priorities

Rank only what matters for this project, highest first.

1. Correctness and diagnosable evidence
2. Privacy and safe configuration
3. Small, comprehensible contracts

| Concern | Target or decision |
| --- | --- |
| Correctness/reliability | Validate configuration and Ollama responses; distinguish transport, HTTP, parse, and runtime failures; verify end to end. |
| Security/privacy | Do not log or persist prompts/responses by default; never commit private addresses or data; do not expose Ollama to the Internet. |
| Accessibility | Human-readable CLI output and errors; no visual interface in Feature 01. |
| Performance | Measure client-observed latency and preserve provider timing data; no performance target until baseline evidence exists. |
| Supported platforms | macOS and Linux on Node.js 22+ for Feature 01. |

## Durable Decisions

Decisions that outlive a Feature, including approved prototype direction and
anything a prototype proved must not reach production.

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-09-01 | Build around the existing Ollama/Qwen LAN runtime. | Preserve working momentum and avoid infrastructure churn. |
| 2026-09-01 | Keep Forge independent of LAMA and personal data. | Forge is reusable infrastructure intended for a public repository. |
| 2026-09-01 | Start with one provider contract and one Ollama adapter. | Enable future substitution without speculative plugin architecture. |
| 2026-09-01 | Use structured results internally and offer human and JSON CLI output. | The same evidence must serve people, tools, and later comparisons. |
| 2026-09-02 | License Forge MIT and publish it as the unscoped `forge-local-ai-kit`. | Public, reusable infrastructure needs a permissive license and a name that assumes no npm scope ownership. |
| 2026-09-18 | Run Forge on a pre-release Pathfinder 4.4.0 kit, installed by `create-pathfinder` from the Pathfinder working copy at commit `65c8fa5` (`chore: prepare the 4.4.0 release (#126)`), in `orchestrator` execution mode. | Forge is the deliberate real-world canary for Pathfinder's orchestration capability before 4.4.0 is tagged and published. Re-run the official installer once 4.4.0 ships and confirm no drift. |
| 2026-09-18 | Adopt **Forge — The Village Smithy** as the identity: the smithy world and voice, the Maker's Mark as the identity system, and the Quench's restraint and single-accent discipline. Approved with three adjustments — warm the iron ground, widen the Forge bronze / Pathfinder ember separation, and use the three taglines by context. The adjustments were resolved to exact values in ticket 05.1: ground Iron `#17130D` (chroma C\* 0.69 → 3.78 against the prototype's `#121110`, CIEDE2000 2.91) and Bronze `#C8973F` (hue separation from ember `#E0611F` widened from 20.4° to 28.5°, CIEDE2000 from 16.05 to 21.81). The full system, with a computed WCAG AA contrast table, is `context/brand-identity.md`, which is the single source every Feature 05 surface reads. | Forge is public, reusable infrastructure whose credibility rests on evidence, so it needs one deliberate craft identity with a hallmark rule — the Maker's Mark beside verified work and nowhere else — rather than generic infrastructure branding. Recording exact values once stops every later surface from inventing its own. |
| 2026-09-18 | The approved prototype is preserved under `prototypes/` as labelled design evidence, and is not production code. What it proved must **not** reach production: caption tone `#6E7479` (computed 3.99:1 and 3.67:1 against a 4.5:1 requirement); connector tone `#4A5259` (2.37:1 and 2.19:1 against 3:1); the prototype ground `#121110` and bronze `#C98B3E`, superseded by the approved adjustments, and the prototype card surface `#1B1A18`, replaced by Billet `#1F1B15`; the prototype's split bronze/brass hues, which made the "one signature accent" two; the artboards' evidence figures as literals, because each is a typed string with no source and so cannot be cited where it is shown — among them the unfilled `[MS] ms`, and `qwen3.5:9b`, which is real (it is the live-verification model recorded in `context/history.md`) but is not the `qwen3:8b` the README documents; the eighteen ad-hoc per-artboard tints that are not named tokens; and the `.dc.html` markup itself, which is canvas-editor source. | A prototype is evidence, not a starting point. Naming what it got wrong is what keeps a later ticket from copying it back in. |

## Learning

- What the human wants to understand: Whether useful coding work can be delegated to the existing local model, with enough evidence to compare it later with cloud-model work.
- Preferred lesson format: Markdown
