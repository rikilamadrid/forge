# Ticket Tracker

- Store: GitHub Issues
- Repository: `rikilamadrid/forge`
- URL: `https://github.com/rikilamadrid/forge/issues`
- Access: GitHub CLI (`gh`) authenticated for an account with issue access
- Ticket location: Repository issues
- Ticket key: A stable hidden body marker in the form `<!-- pathfinder-ticket-key: NN.TT -->`; the issue title also begins with `[NN.TT]` for human readability, but the body marker is canonical
- Status: Open issues carry `Proposed`, `Ready`, or `In Progress` under `## Status`; `Complete`, `Cancelled`, or `Superseded` updates the body status and closes the issue
- Blockers: Ticket keys under `## Blocked by`, with GitHub issue links when known

GitHub Issues is the sole canonical ticket store. Feature specifications remain
under `context/features/`; there are no ticket copies under `context/tickets/`.
