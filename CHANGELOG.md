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
