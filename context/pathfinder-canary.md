# Pathfinder Canary Findings

Forge runs a pre-release Pathfinder kit on purpose. This file records what that
exposes, so the findings survive the session that found them.

Fixes belong upstream in the Pathfinder repository, never here. Nothing in this
file is a Forge work item.

## Installation

- Kit version `4.4.0`, unreleased at install time: no git tag, no GitHub
  release, and npm's latest `create-pathfinder` was `4.3.0`.
- Installed by `create-pathfinder` from the Pathfinder working copy at commit
  `65c8fa5` (`chore: prepare the 4.4.0 release (#126)`), run from a detached
  worktree pinned to that commit because the Pathfinder repository's `main` had
  already moved past it.
- Command: `create-pathfinder --yes --force --mode orchestrator --agents claude-code,codex`.
- When `4.4.0` is released, re-run the official installer and confirm no drift.

## Findings

1. **An existing tracker gets no ticket-store marker.** The orchestration engine
   refuses to read the store until `context/tracker.md` carries a
   `<!-- pathfinder:ticket-store <kind> <owner/repo> -->` marker. The installer
   neither writes it nor warns, so every project that configured a store before
   `4.4.0` hits the refusal on first use and has to add the line by hand.
2. **The installer does not ignore `.pathfinder/`.** `claim` refuses to run
   until the project's `.gitignore` covers the worktree directory, and the
   engine deliberately never edits that file. A fresh install therefore cannot
   claim a ticket until a person adds the line. `git check-ignore` decides, so
   `.pathfinder/` works as well as the documented `/.pathfinder/`.
3. **The shipped agent guides carry Pathfinder's own repository guidance.**
   `CLAUDE.md` and `AGENTS.md` both tell a destination project that "for
   Pathfinder's own repository" the Git and release workflow lives in
   `CONTRIBUTING.md` rather than `context/project-overview.md`. The wording is
   conditional, so it misleads rather than breaks, but it is Pathfinder's own
   repository leaking into every project it installs into.
4. **Old ticket branches read as stale claims.** `orchestrate status` reports
   `01.2`, `01.3`, and `02.1` as stale claims with "worktree missing; resume or
   release". They are ordinary local branches left over from completed Features,
   never orchestration claims: no claim ref, no worktree, no state file. Any
   project that adopts orchestration after delivering tickets by hand inherits
   phantom claims on its board.

## Contract observed

Orchestration coordinates **execution of tickets that already exist in the
configured store**. It does not orchestrate discovery, specification, or ticket
slicing. With an empty store the engine returns `plan-features` and stops,
naming `to-specs`, `to-tickets`, or `kickstart-pathfinder` and deferring to that
workflow's own human approval. This is a deliberate boundary, not a gap:
planning is a human-gated act, and `start` refuses to plan and dispatch in one
invocation.
