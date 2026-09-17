# Release Engineering

## Status

Proposed

## Goal

Make Forge safely and repeatably releasable: every push to `main` and every pull request is verified by CI on a clean machine, the versioning and changelog policy is written down, and a deterministic manual release process is documented and then proven by cutting and verifying `forge-local-ai-kit@0.1.1` from it.

## Context

- Read: `package.json`, `package-lock.json`, `README.md`, `context/features/03-public-npm-release.md` (artifact verification requirements and the publication gate), the Feature 03 entry in `context/history.md` (published file count and shasum), and the Delivery Workflow, Technology, and Commands sections of `context/project-overview.md`.
- Relevant area: `.github/workflows/`, `scripts/`, release documentation at the repository root, the manifest version, git tags, GitHub Releases, and the registry state of `forge-local-ai-kit`.
- Avoid: `src/` and `test/`. This Feature changes no runtime, CLI, or test behavior; the existing suite is what CI runs.
- Repository state on 2026-09-16: no `.github/` directory, workflows, git tags, GitHub Releases, branch protection, or rulesets. GitHub Actions is enabled with default read-only workflow permissions. `forge-local-ai-kit@0.1.0` is the only published version (2026-09-03, 17 files, shasum `599ee65b44e7882bcd896a78d502d802fa79acd4`, no provenance attestation). `npm test` is fully deterministic — the live Qwen verification is a manual step, not a test — so CI needs no Ollama host.

## Requirements

### Package verification script — the single source of truth

- Add `scripts/verify-package.mjs`, Node.js built-ins only, no new dependencies. It is the one place the package-content contract lives; CI and `RELEASING.md` invoke it and never restate the contract.
- Given a tarball path it extracts into a temporary directory and asserts, naming the failing assertion and exiting non-zero on the first failure:
  - the file list contains only `dist/src/**/*.js`, `dist/src/**/*.d.ts`, `README.md`, `LICENSE`, and `package.json`, and includes `dist/src/index.js`, `dist/src/index.d.ts`, and `dist/src/cli.js`;
  - the tarball's `package.json` has `name` `forge-local-ai-kit`, `license` `MIT`, no `private` field, empty `dependencies`, and a `version` equal to the repository manifest's;
  - a clean consumer directory installs the tarball, imports `createForge` and `ForgeError` from the package root, is refused an internal subpath such as `forge-local-ai-kit/dist/src/config.js`, and runs the installed `forge --version` printing the tarball's version.
- It is not listed in `files` and does not ship.

### CI baseline

- Add one GitHub Actions workflow, `.github/workflows/ci.yml`, with workflow name `CI`, triggered on pushes to `main` and on pull requests targeting `main`.
- Each job runs, in order: `npm ci`, `npm run check`, `npm test`, `npm pack` to create the artifact, and `node scripts/verify-package.mjs <tarball>`. The YAML contains no file-list or manifest assertions of its own.
- Runtime coverage is three cells: `ubuntu-latest` with Node.js 22 and 24, and `macos-latest` with Node.js 22. Not the full 2×2 matrix.
- The workflow declares `permissions: contents: read`, uses no secrets, and uses only `actions/checkout` and `actions/setup-node`, each pinned to a full commit SHA with the version in a trailing comment.
- CI never contacts an Ollama host. Live verification stays a documented manual step.
- The README header shows the `CI` workflow status badge.
- After the workflow has run successfully on `main` (the push run following the merge), and with the human's approval, enable branch protection on `main` requiring the `CI` status check. Change nothing else in branch policy. If declined, record that under Notes / Decisions.

### Versioning and changelog policy

- Semantic Versioning with the 0.x rule made explicit: while the major version is `0`, a breaking change to the public library API, the CLI contract, or the supported Node.js range bumps MINOR; backward-compatible changes, fixes, packaging changes, and documentation that ships in the tarball bump PATCH. Moving to `1.0.0` is a separate future human decision and not part of this Feature.
- Add a hand-maintained `CHANGELOG.md` at the repository root in Keep a Changelog format: an `## [Unreleased]` section followed by one section per released version, newest first, each dated. Backfill `## [0.1.0] - 2026-09-03` from `context/history.md`; do not invent entries.
- Every pull request that changes user-visible behavior or the shipped artifact adds its line under `Unreleased` in the same pull request. Refactors, tests, and workflow-only changes need no entry.
- The manifest `version` changes only in a release pull request. Feature and ticket pull requests never bump it.
- `CHANGELOG.md` must not be included in the npm package; `files` in `package.json` does not change. The GitHub Release carries the version's section.

### Deterministic manual release process

- Add `RELEASING.md` at the repository root. It contains the complete process as exact commands in order, so that a person following only that file from a clean checkout reaches the publication gate with a verified artifact and no undocumented step:
  1. Preconditions: `main` checked out and clean, `CI` green on `HEAD` (`gh run list`), `npm whoami` returning the publishing account.
  2. Release pull request from a `release/vX.Y.Z` branch: `npm version <patch|minor> --no-git-tag-version`, move `Unreleased` entries to a new dated version section, commit as `chore(release): vX.Y.Z`, open the pull request, wait for `CI`.
  3. Squash merge after human approval, then `git checkout main && git pull`.
  4. Tag: annotated `vX.Y.Z` on the merged `main` commit only, pushed to `origin`. Never tag a branch commit.
  5. Artifact verification from that commit: `rm -rf dist node_modules && npm ci && npm test && npm pack`, then `node scripts/verify-package.mjs <tarball>`; record the tarball's shasum and file count. The document does not restate what the script checks.
  6. Publication gate: stop and obtain explicit human approval to publish. This approval is separate from accepting the release pull request.
  7. `npm publish <tarball>` — publish the verified tarball, not a fresh pack.
  8. Post-publish verification: `npm view forge-local-ai-kit@X.Y.Z dist.shasum dist.fileCount` match the recorded values, and a clean external consumer installs `forge-local-ai-kit@X.Y.Z` from the registry, imports `createForge` and `ForgeError` from the root, and runs `forge --version` printing `X.Y.Z`.
  9. GitHub Release `vX.Y.Z` from the tag, body taken from the changelog section.
- Treat npm authentication as a publication-gate concern only, exactly as Feature 03: it does not block slicing, implementation, or pre-publication verification. At the gate, if `npm whoami` shows no account, stop and ask the human to run `npm login --auth-type=web`.
- Prove the process by executing `RELEASING.md` once for real, releasing `0.1.1`. The README badge is a change to the shipped artifact, so `0.1.1` is a PATCH under the policy above. A dry run alone is not sufficient. Publication happens only after the human's explicit approval at step 6.
- When the release completes, resolve the `CI/CD`, `Versioning and changelog`, and `Release process` rows in `context/project-overview.md` to what was actually built, and remove `TBD` from them.

## Out of Scope

- Release automation of any kind: publishing from CI, npm trusted publishing or OIDC, provenance attestations, automatic tag or GitHub Release creation, release tooling such as release-please or Changesets, and npm credentials in the repository or in GitHub secrets. That is a later Feature, planned only after `0.1.1` proves the manual path.
- Any change under `src/` or `test/`; any inference, provider, result, metric, error, or CLI behavior change.
- New devDependencies, linters, formatters, or coverage tooling.
- Retroactive tagging of `v0.1.0`: its exact publish commit is not recorded, and the changelog notes that `0.1.0` predates tagging.
- Branch-policy changes beyond the required `CI` status check.
- `1.0.0`, a second provider, a documentation site, npm account or 2FA configuration, and any LAMA change.

## Acceptance Criteria

- `node scripts/verify-package.mjs` passes against a freshly packed tarball, is shown to fail with a named assertion on a temporary violation (an extra file in `files`, or a missing entry point) that is then reverted, and is absent from `npm pack --dry-run`.
- A pull request against `main` triggers `CI`, and the run is green on all three cells from a checkout with no committed `dist/`; each cell's log shows the verification script invoked on the packed tarball.
- The README badge resolves to the `CI` workflow on `rikilamadrid/forge`.
- Branch protection on `main` requires the `CI` check, applied only after a successful push run on `main`, or its refusal is recorded.
- `CHANGELOG.md` exists with `Unreleased` and a `0.1.0` section backfilled from history; `npm pack --dry-run` does not list it.
- `RELEASING.md` documents the nine steps with exact commands, including the publication gate and post-publish verification, and delegates artifact checks to the script.
- `forge-local-ai-kit@0.1.1` is published only after explicit human approval; annotated tag `v0.1.1` exists on a `main` commit; GitHub Release `v0.1.1` exists with the changelog section; registry `dist.shasum` and `dist.fileCount` match the verified tarball; a clean external consumer installs `0.1.1` from the registry and `forge --version` prints `0.1.1`.
- `context/project-overview.md` carries no `TBD` in the `CI/CD`, `Versioning and changelog`, or `Release process` rows, and each row matches what shipped.
- `npm test`, `npm run check`, and `npm run build` pass; `dependencies` remains empty; `devDependencies` is unchanged.

## Notes / Decisions

- Approved on 2026-09-17:
  1. GitHub Actions is the CI platform. The remote host is GitHub, Actions is enabled on the repository, and it adds no dependency.
  2. CI coverage is Ubuntu with Node.js 22 and 24, and macOS with Node.js 22 — three cells, not the full matrix. Windows is not a supported platform.
  3. The 0.x SemVer rule stated above; `1.0.0` remains a separate future decision.
  4. Hand-maintained Keep a Changelog `CHANGELOG.md`, excluded from the npm package.
  5. The process is proven by a real `0.1.1` release, not a dry run, keeping this project's rule that mocked evidence is insufficient. The human may still decline at the publication gate; the Feature then stops at step 6 and records that.
  6. No retroactive `v0.1.0` tag.
  7. Branch protection requiring `CI`, applied only after the workflow has succeeded on `main`, with no unrelated branch-policy changes.
  8. Release automation is deferred to a later Feature.
  9. `scripts/verify-package.mjs` is the single deterministic source of truth for package verification; CI and `RELEASING.md` invoke it rather than duplicating the contract.
- `0.1.0` was published as npm user `riki.lamadrid`. The npm identity, 2FA method, and token remain the human's and are provided at the gate, never stored in the repository.
- Actions are pinned to commit SHAs because the repository does not require SHA pinning and a workflow that runs on every pull request is the project's main supply-chain exposure.
