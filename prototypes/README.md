# Prototypes

Everything in this directory is **design evidence for Feature 05**. It is not
production code, it is not adopted into production without an explicit feature
decision, and it does not ship: `prototypes/` is outside the `files` allowlist
in `package.json` and appears in no tarball.

Read it to see what was explored and what was decided against. Do not copy
values out of it. The resolved values live in `context/brand-identity.md`, and
where the two disagree the identity document is correct.

## `forge-identity-2026-09-18/`

The artboard sources of the approved visual prototype, the canvas
`https://claude.ai/artifact/VSAxJ1uxLrx3jFKS7VqAcy`, as published on
2026-09-18. The direction it carries — **Forge — The Village Smithy** — was
approved by the human on 2026-09-18 with three adjustments.

| File | Artboard |
| --- | --- |
| `canvas.json` | the canvas index: artboard frames, order, and section titles |
| `Main.dc.html` | desktop landing page, 1440×3240 |
| `Mobile.dc.html` | mobile landing page, 390×2260 |
| `Mark.dc.html` | the Maker's Mark, both size states, and applied uses |
| `Palette.dc.html` | palette exploration and the bronze-versus-ember comparison |
| `Type.dc.html` | the three-face type system |
| `Taglines.dc.html` | three hero taglines, compared |
| `Ecosystem.dc.html` | Forge beside Pathfinder, Lorekeeper, and LAMA |

These are Design Component (`.dc.html`) sources for the canvas editor. They
depend on a `support.js` runtime that is not in this repository and on Google
Fonts links, so they do not render standalone here and are not a starting point
for any shipped markup.

## What the prototype proved must not reach production

Recorded so a later ticket does not reintroduce it.

1. **`#6E7479` as caption text.** Computed 3.99:1 on the prototype ground and
   3.67:1 on its card surface, against a 4.5:1 requirement. It fails on every
   ground in the prototype. Replaced by Ash `#818890`.
2. **`#4A5259` as a connector or arrow that carries meaning.** Computed 2.37:1
   and 2.19:1, against the 3:1 required of non-text graphical objects. Replaced
   by Quench `#646C73`.
3. **The prototype ground `#121110` and the prototype bronze `#C98B3E`.**
   Superseded by approved adjustments 1 and 2. Resolved to Iron `#17130D` and
   Bronze `#C8973F`.
4. **The prototype's bronze/brass hue split.** Bronze sat at h_ab 71.6° while
   brass sat at 79.3°, so the "one signature accent" was two hues. Production
   uses one accent hue at three lightnesses.
5. **Every evidence figure shown in the artboards, copied as a literal.**
   `qwen3.5:9b` is an invented model identifier — the repository names no model,
   and `.env.example` carries the placeholder `qwen-model-name`. `[MS] ms` is an
   unfilled placeholder. `17 files`, `43 tests green` and
   `forge-local-ai-kit@0.1.1` happen to be true — verified 2026-09-19:
   `npm pack --dry-run` reports 17 entries, `npm test` reports 43 passing, and
   the manifest version is `0.1.1` — but in the artboards they are typed strings
   with no source. Under the hallmark rule a figure is displayed only when it is
   traceable to a repository file, a CI run, or the registry, and cited where it
   is shown. Each must be re-derived at the surface, never copied from here.
6. **The ad-hoc tints invented per artboard** — `#9BA1A7`, `#C7C2BA`,
   `#B9BEC3`, `#D9D4CC`, `#E0DAD1`, `#A8AEB3`, `#CBA167`, `#343A3F`, `#3A3F44`,
   `#262320`, `#221B12`, `#16130F`, `#1F1D1A`, `#F0CE95`. None is a named
   token. Production surfaces use only the tokens in
   `context/brand-identity.md`.
7. **The `.dc.html` markup itself**, for the reason above: it is editor source,
   not a web page.
