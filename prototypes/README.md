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
3. **The prototype ground `#121110`, the prototype card surface `#1B1A18`, and
   the prototype bronze `#C98B3E`.** The ground and the bronze are superseded by
   approved adjustments 1 and 2; the card surface carries no adjustment and is
   simply replaced. Resolved to Iron `#17130D`, Billet `#1F1B15` and Bronze
   `#C8973F`.
4. **The prototype's bronze/brass hue split.** Bronze sat at h_ab 71.6° while
   brass sat at 79.3°, so the "one signature accent" was two hues. Production
   uses one accent hue at three lightnesses.
5. **Every evidence figure shown in the artboards, copied as a literal.** Each
   one is a bare typed string in the markup, with nothing behind it.

   `qwen3.5:9b` (`Main.dc.html:69`, `:200`, `:208`, `Mobile.dc.html:69`,
   `Type.dc.html:67`, `Mark.dc.html:115`) is a real identifier: it is the model
   recorded for live verification in `context/history.md:24` and `:31`, and in
   `context/features/02-installable-forge.md:62`. It is not, however, the model
   this repository documents. `README.md` names `qwen3:8b` at lines 40, 66, 69,
   91, 98, 124, 172 and 262, and `.env.example` carries the placeholder
   `qwen-model-name`. A surface that copies the artboard string would show a
   model contradicting its own README, and could cite nothing for it.

   `[MS] ms` (`Main.dc.html:210`, `Mark.dc.html:115`) is an unfilled
   placeholder. `17 files` (`Mark.dc.html:124`), `43 tests green`
   (`Mark.dc.html:128`) and `forge-local-ai-kit@0.1.1` (`Type.dc.html:69`)
   happen to be true — verified 2026-09-19: `npm pack --dry-run` reports 17
   entries, `npm test` reports 43 passing, and the manifest version is `0.1.1`.

   Being true is not the standard. Under the hallmark rule a figure is displayed
   only when it is traceable to a repository file, a CI run, or the registry,
   and cited where it is shown. Every figure above must be re-derived at the
   surface that displays it, never copied from here.
6. **The ad-hoc tints invented per artboard.** None is a named token.
   Production surfaces use only the tokens in `context/brand-identity.md`.

   The list is exhaustive. Counted across the seven `.dc.html` files and
   `canvas.json` on 2026-09-19, these eighteen are every colour literal in the
   artboards other than the tones named in items 1–3, the four prototype values
   that survived as tokens (`#8A9299`, `#E0B166`, `#F2EDE6`, `#F7F3EC`) and
   Pathfinder's ember `#E0611F`, which `Palette.dc.html` shows only for
   comparison. There are no `rgb()` or `rgba()` values and no three-digit
   hexes.

   | Tint | Occurrences | L\* | Nearest production token |
   | --- | --- | --- | --- |
   | `#2E2B27` | 52 | 17.71 | Scale (ΔE00 2.71) |
   | `#9BA1A7` | 20 | 65.94 | Steel (ΔE00 5.00) |
   | `#262320` | 20 | 13.93 | Billet (ΔE00 3.21) |
   | `#171513` | 17 | 6.91 | Iron (ΔE00 2.01) |
   | `#F0CE95` | 7 | 84.40 | Brass (ΔE00 8.08) |
   | `#343A3F` | 6 | 24.05 | Scale (ΔE00 10.49) |
   | `#E0DAD1` | 5 | 87.29 | Bone (ΔE00 4.26) |
   | `#CBA167` | 5 | 68.87 | Brass (ΔE00 5.62) |
   | `#C7C2BA` | 5 | 78.62 | Bone (ΔE00 9.97) |
   | `#D9D4CC` | 4 | 85.10 | Bone (ΔE00 5.60) |
   | `#B9BEC3` | 4 | 76.73 | Steel (ΔE00 13.18) |
   | `#A8AEB3` | 4 | 70.77 | Steel (ΔE00 8.79) |
   | `#221B12` | 4 | 10.32 | Billet (ΔE00 2.30) |
   | `#8A5D22` | 3 | 43.28 | Dark bronze (ΔE00 3.87) |
   | `#3A3F44` | 3 | 26.37 | Scale (ΔE00 11.00) |
   | `#16130F` | 2 | 6.06 | Iron (ΔE00 0.98) |
   | `#2A2622` | 1 | 15.46 | Scale (ΔE00 3.09) |
   | `#1F1D1A` | 1 | 10.88 | Billet (ΔE00 2.22) |

   The nearest token is stated so a reader can see what each tint was reaching
   for, not as a substitution table. Where ΔE00 reaches 5 — the cool greys
   `#B9BEC3` (13.18), `#3A3F44` (11.00), `#343A3F` (10.49), `#A8AEB3` (8.79)
   and `#9BA1A7` (5.00), and the light warms `#C7C2BA` (9.97), `#F0CE95`
   (8.08), `#CBA167` (5.62) and `#D9D4CC` (5.60) — the tint has no production
   equivalent at all, and the surface is rebuilt from the tokens rather than
   recoloured one value at a time.
7. **The `.dc.html` markup itself**, for the reason above: it is editor source,
   not a web page.
