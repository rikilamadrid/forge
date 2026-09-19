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

5. **A settings-only ticket cannot pass orchestrated integration.** Eligibility
   is store-based — `skills/orchestrate/SKILL.md:70` states that the store is
   the board and eligibility is computed "from the configured store and nothing
   else" — so a zero-diff ticket does unblock its dependants correctly. But
   `skills/orchestrate/actions/integrate.md:25` finds a claim's pull request by
   its branch and requires green required CI "at the PR's current head", and
   line 59 merges "only the approved current head". A claimed worker that
   produces no commits has no pull request and no head, so it can never reach
   integration; the claim strands. Ticket `05.5` is the concrete case: its whole
   deliverable is GitHub repository settings. It is therefore completed directly
   through the normal `/ticket` lifecycle, outside `/orchestrate`, and no dummy
   commit or pull request is invented to satisfy the tooling. Upstream, either
   integration needs a zero-diff path that completes a claim without a merge, or
   the engine needs to refuse such a claim at dispatch rather than at
   integration.
6. **The engine's ticket-key marker is not the one an existing project wrote.**
   `skills/orchestrate/engine/store.mjs:31` matches
   `/^<!--\s*pathfinder:ticket\s+(\d+\.\d+)\s*-->$/` against the **first line of
   the issue body only** (`store.mjs:167`). A project that configured a GitHub
   Issues store before `4.4.0` wrote its own marker — here
   `<!-- pathfinder-ticket-key: NN.TT -->`, still documented in
   `skills/ticket/store.md` as "the way `context/tracker.md` says". The engine
   reads neither `tracker.md`'s prose nor the older marker, so it silently
   reported `No tickets` against 18 real issues. Silently: an empty board is
   indistinguishable from an unstarted project, and nothing named the marker it
   was looking for. Issues 1–18 remain invisible to the board; Feature 05's
   tickets carry the engine marker. Upstream, the refusal that already exists
   for a missing ticket-store marker should have a twin — a board that finds
   issues but no recognisable key should say which marker it expected.
7. **A GitHub store needs status labels that nothing creates.**
   `store.mjs:197-216` derives status from a single `status: <word>` label and
   reads an open issue with none as unrecognised, which makes it ineligible.
   `skills/ticket/store.md` says `setup-tracker` creates those labels with the
   store's other labels, but `skills/setup-tracker/SKILL.md:55` also says "do
   not create labels, tags, or tracker conventions unless requested" — and a
   project that configured its tracker by hand never ran it. The five
   `status: *` labels and `gate: human` were created here by hand on
   2026-09-19 before the Feature 05 tickets were filed. Related: `tracker.md`
   documented status as a `## Status` body section, which is what the six
   earlier Features used and what `templates/ticket.template.md` still carries;
   the GitHub reader never looks at it.

## Contract observed

Orchestration coordinates **execution of tickets that already exist in the
configured store**. It does not orchestrate discovery, specification, or ticket
slicing. With an empty store the engine returns `plan-features` and stops,
naming `to-specs`, `to-tickets`, or `kickstart-pathfinder` and deferring to that
workflow's own human approval. This is a deliberate boundary, not a gap:
planning is a human-gated act, and `start` refuses to plan and dispatch in one
invocation.
