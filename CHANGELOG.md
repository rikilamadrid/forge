# Changelog

All notable changes to `forge-local-ai-kit` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) under the 0.x rule in
[`RELEASING.md`](RELEASING.md).

## [Unreleased]

### Added

- The CLI carries a first Wonder Wagon identity slice: the name in bronze on `--help`, the
  serial `FG-047` at its foot, dimmed metric labels, and the failure category in the
  terminal's red. Colour follows the terminal — off in a pipe or under `NO_COLOR` or
  `TERM=dumb`, on under `FORCE_COLOR`, at the depth the terminal claims — so every existing
  byte of piped and `--json` output is unchanged. `src/identity.ts` is generated from
  `@wonder-wagon/themes` (a devDependency; nothing is added at run time) by
  `npm run wonder-wagon:sync` and verified by `npm run wonder-wagon:check`.
- Human-readable results carry the **quench rule**: a fixed 24-column rule between
  the answer and the metrics, eight cells in the brand colour and sixteen quenched,
  in `─` (U+2500). It is drawn only where colour is, and a terminal narrower than
  24 columns drops it whole rather than wrapping or shortening it. Piped output,
  `NO_COLOR`, `FORCE_COLOR=0`, `TERM=dumb` and `--json` are unchanged.
- The **hallmark plate**: the lockup's object state at 96px and above, the struck
  mark in a recessed iron well on an ember enamel plate. It is the website hero,
  both social cards and `favicon-180`, and it never appears in the README, on npm
  or in the CLI.
- `assets/github-preview.png`, a 1280×640 canvas for GitHub's social preview,
  closing the gap `assets/README.md` has been reporting. Uploading it is a manual
  step in repository settings.

### Changed

- The README header is a 1200×200 panel carrying the lockup, "The Local AI Kit",
  one local-first line and the serial on its own iron ground, so GitHub light,
  GitHub dark and npm render it identically. `npm install` and one command that
  actually runs now sit on the first screen. No factual claim changed: the family
  sentence, the five cited figures and every reference section are as they were.
- The website has two environments — Iron at night, Bone by day — resolved from
  `prefers-color-scheme` and overridable by a lever that remembers the choice.
  The hero is the hallmark plate; depth is on the plate and the lever and nothing
  else; code and command surfaces keep the iron ground in both environments.
- The website's two stale evidence figures are corrected against their cited
  sources: the published version reads `0.1.2` from the registry rather than
  `0.1.1`, and the test count reads `55` rather than `43`.
- `context/brand-identity.md` records the plate, Ember as product enamel, Bone as
  Forge's product day environment, the objects-only depth exception, the chamfer
  rule, the quench rule's gating, and twenty-two newly measured colour pairs.

**Every byte of piped and `--json` output is unchanged.** No public API, CLI
contract, error category, exit code or Node.js range moved, and the package still
has zero production dependencies.

## [0.1.2] - 2026-09-22

### Changed

- The README opens with the Maker's Mark header lockup, the positioning line,
  and the supporting tagline in place of the emoji heading, and adds an
  architecture graphic, a minimal-API section, and a cited evidence section.
  Every reference section it already carried is kept.
- Every image and link in the README is an absolute URL, and no `<picture>`
  element is used, so the page renders the same on GitHub and on npm.
- `homepage` points at the Forge website, <https://forge-kit-nu.vercel.app>,
  instead of the repository README anchor, and the README carries a matching
  website link.

## [0.1.1] - 2026-09-18

### Added

- The README shows the `CI` workflow status badge.

## [0.1.0] - 2026-09-03

The first public release. `0.1.0` was published before this project tagged
releases, so it has no git tag. The published artifact has 17 files and shasum
`599ee65b44e7882bcd896a78d502d802fa79acd4`.

### Added

- `forge ask "<prompt>"` delegates a prompt through an existing Ollama runtime
  on the LAN, with human-readable or JSON output, and returns the answer with
  normalized evidence.
- A completed turn with no visible response is distinguished from an answer,
  without exposing hidden reasoning.
- A root library API, `createForge` and `ForgeError`, that shares one
  configuration, inference, result, and error path with the `forge` executable.
- Caller cancellation.
- `forge --help` and `forge --version`.
- Publication to the public npm registry as MIT-licensed `forge-local-ai-kit`
  for Node.js 22+ ESM consumers, with the root `createForge`/`ForgeError` API
  and the installed `forge` executable. Internal subpaths are refused, and no
  source, test, context, skill, `.env`, or private host file ships.
