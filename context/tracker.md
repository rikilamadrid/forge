# Ticket Tracker

<!-- pathfinder:ticket-store github-issues rikilamadrid/forge -->

- Store: GitHub Issues
- Repository: `rikilamadrid/forge`
- URL: `https://github.com/rikilamadrid/forge/issues`
- Access: GitHub CLI (`gh`) authenticated for an account with issue access
- Ticket location: Repository issues
- Ticket key: A stable hidden marker on the **first line** of the issue body, in
  the form `<!-- pathfinder:ticket NN.TT -->`. This is the form
  `skills/orchestrate/engine/store.mjs` matches, and it matches the first line
  only. The issue title also begins with `[NN.TT]` for human readability, but
  the body marker is canonical.
- Status: A single `status:` label, which is GitHub's native field for this and
  therefore the only copy. An open issue carries exactly one of
  `status: proposed`, `status: ready`, or `status: in-progress`. `Complete` is
  the issue closed with no status label; `Cancelled` and `Superseded` are the
  issue closed carrying `status: cancelled` or `status: superseded`. The issue
  body carries no `## Status` section — two copies of one status drift.
- Blockers: Ticket keys under `## Blocked by`, one per list item, as the first
  backticked key on the line, with the blocker's GitHub issue number in
  parentheses at the end: ``- `05.2` — why this ticket needs it (#27)``.
  Write `None` when nothing blocks the ticket.
- Gate label: `gate: human` flags a worker waiting on a human decision. It is a
  flag, not a status, and sits alongside the one status label.

GitHub Issues is the sole canonical ticket store. Feature specifications remain
under `context/features/`; there are no ticket copies under `context/tickets/`.

## Marker history

Issues 1–18, the tickets of Features 01–04, carry an earlier marker,
`<!-- pathfinder-ticket-key: NN.TT -->`, written before the orchestration
engine existed. The engine does not recognise it, so those issues do not appear
on the board. They are all closed and nothing depends on them, so they are left
as they are rather than rewritten. Feature 05 onward uses the form above.
See `context/pathfinder-canary.md` findings 6 and 7.
