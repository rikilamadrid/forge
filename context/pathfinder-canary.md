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

## First orchestrated run — Feature 05, ticket 05.1, 2026-09-19

The first real `/orchestrate start` on this project. One `developer` worker,
three independent `tester` rounds, one human gate, one squash merge, one clean
release. What follows is what the run exposed, good and bad.

### What worked exactly as documented

- **Claim creation is atomic and correct.** `refs/pathfinder/claims/05.1`, the
  worktree, and the branch were created together, and `--announce` posted the
  ownership note with its `pathfinder:orchestrate claimed` marker and the full
  execution profile.
- **Status transitions through labels are reliable.** `status: proposed` on
  `/ticket load` → `status: ready` → `status: in-progress` on `/ticket start`,
  with exactly one status label present at every point.
- **The gate flag is a flag, not a status.** `gate: human` was added alongside
  `status: in-progress` and removed on resolve. The two never collided.
- **Claims outlive sessions, as `skills/orchestrate/SKILL.md` §The model
  promises.** A tester session died mid-review to a harness rate limit. The
  claim ref, worktree, branch and state file were all intact afterwards, and
  the review resumed from its own recorded position with nothing re-derived.
- **`check` and `release` were accurate.** `check` reported `candidate` with a
  correct `mergeBase`, and `release` removed the worktree, local branch and
  claim ref cleanly after the squash merge.

### Findings

8. **A ticket key appears twice in its own branch name.**
   `skills/orchestrate/engine/claim.mjs:120` builds the branch as
   `` `ticket/${key}-${slugify(row.title)}` ``, and `titleOf` in
   `engine/store.mjs` strips only a `NN.TT — ` title prefix. It does not strip
   the `[NN.TT]` form that `context/tracker.md` documents and every issue in
   this repository uses, so the key survives into the slug. Ticket `05.1`
   produced `ticket/05.1-05-1-brand-foundations-prototype-evidenc` — key twice,
   and the 40-character slug cap truncating `evidence` to `evidenc`. Cosmetic:
   the claim, worktree and ref are all valid and the run completed normally.
   Upstream, either `titleOf` should also strip `[NN.TT]`, or `slugify` should
   drop a leading key before the cap applies.

9. **A forge auto-close leaves the ticket unreadable, and blocks its
   dependants.** The pull request body said `Closes #26`, so merging closed the
   issue while it still carried `status: in-progress`. `engine/store.mjs:197-216`
   reads a closed issue with a status label as `Unrecognised`, and
   `engine/board.mjs` never lets an unrecognised ticket unblock a dependent. For
   the window between the merge and `/ticket complete`, the board read
   `05.1  Unrecognised  status unrecognised: ticket is closed but still labelled
   status: in-progress` and `05.2  blocker 05.1 has an unrecognised status`.
   `skills/orchestrate/actions/integrate.md` step 7 does warn that "a forge
   auto-close is not the entire completion transition" and names the label
   removal, so this is documented rather than unknown — but the engine offers no
   command for it, the repair is manual, and an orchestrator that merged and
   stopped would leave the board wedged with no error raised anywhere. Upstream,
   completion should remove the obsolete label itself.

10. **`release` does not remove the remote ticket branch.** After
    `orchestrate release 05.1` removed the worktree, local branch and claim ref,
    `refs/heads/ticket/05.1-05-1-brand-foundations-prototype-evidenc` still
    existed on `origin`. Integration deliberately avoids `gh pr merge
    --delete-branch`, because that would also try to delete the local branch that
    the claim's worktree still has checked out, so nothing in the documented
    sequence ever deletes the remote one. A project with short-lived branches
    accumulates one stale remote branch per completed ticket. Upstream, `release`
    should delete the remote branch too, or say that the human must.

### Observed, not a defect

- **The review loop earned its cost.** Numeric checking was clean at every
  round — all 12 palette rows, 37 contrast rows and the 18-row tint table
  recomputed against Sharma's published CIEDE2000 vectors with zero arithmetic
  errors, across three independent rounds. Every defect found was in prose: a
  false claim about the repository, an overgeneralised rule that contradicted a
  definition six lines away, and a determination silently dropped when the
  paragraph containing it was deleted. Two of the three were introduced *by a
  repair round*, which is the argument for the whole-document coherence pass
  that caught them rather than another pass over the numbers.
- **The tester overruled its own earlier round.** Round 1 asked for a rounding
  change the developer refused with an argument; round 2 adjudicated under three
  white-point conventions and found the developer right and round 1 wrong. A
  reviewer that can reverse itself on evidence is worth more than one that
  defends its prior findings.
- **The two-repair-round gate rule did its job.** The worker resolved a genuine
  contradiction between two approved requirements by changing one of them, and
  flagged that it had. The gate surfaced a better option — one that kept the
  approved rule intact — that neither the worker nor the orchestrator would have
  had authority to choose alone.

## Second orchestrated run — Feature 05, ticket 05.2, 2026-09-20

One `developer` worker, a `tester` review interrupted mid-run by a harness rate
limit and resumed in a later session, one squash merge. The run raised no new
defect class. It is recorded because it put a second occurrence behind finding
9, proved the direction of the fix for finding 10, and confirmed the claim
model's resilience property a second time.

### Findings 9 and 10, revisited

**Finding 9 recurred. This is the second confirmed occurrence.** The pull
request body said `Closes #27`, so the squash merge closed the issue while it
still carried `status: in-progress` — the same sequence that produced the
finding on `05.1`. The store read the ticket as unreadable for the window
between the merge and `/ticket complete`, exactly as
`engine/store.mjs:197-216` describes, and the repair was again manual: remove
the obsolete label by hand. Two occurrences in two consecutive tickets, from
the ordinary documented workflow rather than from any mistake, make this the
default outcome of a forge auto-close and not an edge case. It strengthens the
upstream recommendation already recorded under finding 10: completion should
remove the lifecycle status label itself, ideally before closing the issue or
atomically with it, so an auto-close can never leave the store wedged.

**Finding 10 has a proven cleanup remedy.** This run merged with
`gh pr merge --squash --delete-branch` rather than the documented `release`
sequence. The remote ticket branch was deleted successfully, and the local
branch — which the claim's worktree still owned — was not. Critically, the
GitHub CLI did not wedge on that conflict: it skipped the local delete, said
why, and printed the exact repair,
`git worktree remove … && git branch -D …`, which then ran cleanly after the
claim was released. The concern that kept integration away from
`--delete-branch` is therefore real but non-blocking, and the ordering that
resolves it is proven. Record this as the direction for the upstream fix:
orchestrated integration should delete the remote branch during the merge and
defer local branch cleanup until after claim and worktree release, instead of
leaving the remote branch to accumulate.

### Observed, not a defect

- **Claims survive a harness interruption — second confirmation.** The `05.1`
  run already recorded a tester session dying to a rate limit with its claim
  intact. The same thing happened here, across a session boundary rather than
  within one: the review of `05.2` was interrupted and resumed later.
  `refs/pathfinder/claims/05.2`, the worktree and the branch were all healthy
  afterwards, and the ref still pointed at the original base commit rather than
  drifting to the work head. Resume required no reconstruction of ownership
  state and no re-derivation of what the claim covered — the four resume checks
  were reads that confirmed what was already there. This is a positive property
  of the claim model: ownership is durable state in Git, not session state, so
  an interruption costs the work in flight and nothing else.

## Contract observed

Orchestration coordinates **execution of tickets that already exist in the
configured store**. It does not orchestrate discovery, specification, or ticket
slicing. With an empty store the engine returns `plan-features` and stops,
naming `to-specs`, `to-tickets`, or `kickstart-pathfinder` and deferring to that
workflow's own human approval. This is a deliberate boundary, not a gap:
planning is a human-gated act, and `start` refuses to plan and dispatch in one
invocation.
