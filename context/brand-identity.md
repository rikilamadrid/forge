# Forge Brand Identity

The single durable statement of the Forge identity. Every surface in Feature 05
— the website, the README, the npm page, the repository presentation, and every
asset under `assets/` — reads its values from this file. A later ticket that
needs a value this document does not carry reports the gap rather than inventing
one locally.

Approved direction, 2026-09-18: **Forge — The Village Smithy**. The smithy world
and voice, the Maker's Mark identity system, and the Quench's restraint and
accent discipline. Approved with three adjustments: warm the iron ground, widen
the bronze/ember separation, and use the taglines by context. The design
evidence is preserved under `prototypes/`; see `prototypes/README.md`.

This is a craft identity. It is not a cloud-platform identity, and it does not
drift toward one.

## Maker's Mark

The letter F struck in a hexagonal punch, as a smith strikes an initial into
finished work. The upper bar of the F is hot; the lower bar has been quenched.

Geometry is defined on a `0 0 32 32` viewBox.

| Element | Path |
| --- | --- |
| Hexagonal punch | `M9 1.5H23L30 16L23 30.5H9L2 16Z` |
| F, one piece (solid state) | `M12.5 9H23.5V12.4H15.9V15.5H21.5V18.9H15.9V24H12.5Z` |
| F, above the quench line (struck state) | `M12.5 9H23.5V12.4H15.9V15.5H12.5Z` |
| F, below the quench line (struck state) | `M12.5 15.5H21.5V18.9H15.9V24H12.5Z` |

The quench line is `y = 15.5` on that grid — the horizontal midline of the F.

### Solid — 32px and below

The punch is filled Bronze `#C8973F`. The F is knocked out in the ground colour,
so the mark carries no stroke and has no hairline to lose at small sizes. On a
light ground the punch is filled Dark bronze `#85601A` and the F is knocked out
in Bone `#F2EDE6`.

### Struck — 48px and above

The punch is an open outline: `fill: none`, `stroke: #C8973F`,
`stroke-width: 1.5` on the 32-unit grid. The F above the quench line is Bronze
`#C8973F`; the F below it is Steel `#8A9299`.

### Between 33px and 47px

Use the **solid** state. The struck state is not permitted below 48px.

At 47px the punch outline's 1.5-unit stroke renders at 2.2 device pixels and the
counters of the F close up, so the two-tone quench reading is lost while the
hairline is still thin enough to alias. Solid is therefore the default state and
struck is the exception, used only at 48px and above. There is no interpolation
and no third state.

### Sizes in use

| Size | State | Surface |
| --- | --- | --- |
| 16px | solid | favicon, inline beside a verified fact |
| 24px | solid | navigation |
| 32px | solid | app icon, favicon |
| 48px | struck | README header lockup |
| 72px | struck | website hero |

## Wordmark lockup

The wordmark is `Forge`, sentence case, set in the display face at weight 700
with `letter-spacing: -0.02em`.

Let **M** be the mark's box height.

| Measure | Value |
| --- | --- |
| Wordmark type size | `0.90 × M` |
| Resulting cap height | `0.64 × M`, aligned to the mark's flats |
| Gap, mark right edge to wordmark left sidebearing | `0.375 × M` |
| Clear space, all four sides of the lockup bounding box | `0.5 × M` |
| Minimum lockup width | 120px |
| Minimum mark size, standing alone | 16px |

Below 120px total width the mark stands alone and the wordmark is dropped. The
wordmark never appears without the mark on a first impression — a page header, a
README opening, a social card. It may appear alone further down a surface that
has already shown the lockup.

Nothing is placed inside the clear space: no badge, no tagline, no rule.

## Palette

A warmed iron ground, one bronze signature accent, and one cool steel
structural neutral. **No gradients and no texture overlays**, on any surface.

Ratios below are computed, not asserted; see [Contrast](#contrast).

### Iron — ground and surfaces

| Token | Hex | L\* | C\* | h_ab | Use |
| --- | --- | --- | --- | --- | --- |
| Iron | `#17130D` | 6.12 | 3.78 | 80.4° | page ground; the knock-out colour of the solid mark |
| Hearth | `#1B1711` | 8.01 | 4.48 | 81.0° | inset panels |
| Billet | `#1F1B15` | 10.03 | 4.89 | 82.3° | cards and code surfaces |
| Scale | `#322C24` | 18.40 | 6.30 | 79.7° | hairlines and card borders — decorative only |

Scale carries no information. A border that distinguishes one control from
another is not a hairline and uses Quench or Steel instead.

### Bronze — the one signature accent

| Token | Hex | L\* | C\* | h_ab | Use |
| --- | --- | --- | --- | --- | --- |
| Bronze | `#C8973F` | 65.57 | 52.70 | 79.7° | the mark, accent text, mono accent |
| Brass | `#E0B166` | 74.98 | 45.30 | 79.3° | links and link hover |
| Dark bronze | `#85601A` | 43.40 | 43.97 | 79.1° | the mark on a light ground |

The three share one hue across a 0.55° spread. They are one accent at three
lightnesses, not three accents. Bronze appears **once per view**.

### Steel — structure only, never decoration

| Token | Hex | L\* | C\* | h_ab | Use |
| --- | --- | --- | --- | --- | --- |
| Steel | `#8A9299` | 60.12 | 4.90 | 252.9° | secondary text; the struck mark below the quench line |
| Ash | `#818890` | 56.38 | 5.22 | 260.3° | captions and section labels |
| Quench | `#646C73` | 45.18 | 5.15 | 253.3° | connectors, arrows, and rules that carry meaning |

### Text tones

| Token | Hex | L\* | Use |
| --- | --- | --- | --- |
| Chalk | `#F7F3EC` | 95.97 | display headings |
| Bone | `#F2EDE6` | 93.95 | body text; also the light ground itself |

On the light-ground variant, body text is Iron `#17130D` on Bone `#F2EDE6`.

### Approved adjustment 1 — the warmed iron ground

The ground is `#17130D`, warmer than the prototype's `#121110`.

| Measure | `#121110` | `#17130D` | Change |
| --- | --- | --- | --- |
| CIELAB a\* | 0.19 | 0.63 | +0.44 |
| CIELAB b\* | 0.66 | 3.73 | +3.07 |
| Chroma C\* | 0.69 | 3.78 | +3.09 (×5.47) |
| HSL saturation | 5.9% | 27.8% | ×4.72 |
| CIEDE2000 | — | — | 2.91 |

It reads as warmed iron rather than as neutral near-black because at C\* 0.69 the
prototype ground is within a hair of the neutral axis — a grey that happens to
be measurably off-neutral — while at C\* 3.78 almost all of the added chroma
sits on b\*, the yellow axis, so the ground picks up the hue of the metal above
it without lifting its lightness out of near-black (L\* 5.12 → 6.12) and without
turning red.

The whole iron ramp moves onto the accent hue, so the ground and the metal are
the same colour at different temperatures.

### Approved adjustment 2 — separation from Pathfinder's ember

Forge bronze is `#C8973F`. Pathfinder's ember is `#E0611F`.

| Colour | Hex | L\* | C\* | h_ab | Δh_ab vs ember | CIEDE2000 vs ember |
| --- | --- | --- | --- | --- | --- | --- |
| Pathfinder ember | `#E0611F` | 56.59 | 74.09 | 51.2° | — | — |
| Prototype bronze | `#C98B3E` | 62.70 | 51.93 | 71.6° | 20.4° | 16.05 |
| **Forge bronze** | `#C8973F` | 65.57 | 52.70 | 79.7° | **28.5°** | **21.81** |

Hue separation widens by 8.05°, and perceptual distance by 5.76 CIEDE2000 units.

The prototype's own Brass `#E0B166` already sat at h_ab 79.3°, so the prototype
was internally inconsistent: its bronze and its brass were two hues, not one
accent at two lightnesses. Moving bronze onto 79.7° widens the ember separation
and repairs that inconsistency in the same move. Brass is unchanged.

Forge and Pathfinder remain siblings — both warm metal from one village — but
Forge takes the cooler, yellower side of that warmth. Ember is red-hot; bronze
is struck and cooling.

## Typography

| Role | Face | Stack |
| --- | --- | --- |
| Display | Bricolage Grotesque | `'Bricolage Grotesque', 'Avenir Next', 'Segoe UI', system-ui, sans-serif` |
| Body | Instrument Sans | `'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif` |
| Mono | IBM Plex Mono | `'IBM Plex Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace` |

**Display** is uneven, worked, and modern — the hand in the identity. Weight 600
or 700, never below 18px, tracking `-0.025em` at 40px and above and `-0.015em`
between 18px and 39px. Sentence case everywhere: no all-caps headlines.

**Body** is quiet and humanist and gets out of the way. Scale 13.5 / 15 / 17 /
19px, line height 1.55–1.65, measure capped near 65 characters.

**Mono** carries everything the machine says or that is typed at it: commands,
output, package names, version strings, model identifiers, file counts,
measured figures, and section labels. Mono is a first-class brand surface here,
because it is what the shop actually makes. Section labels are 11.5px with
`letter-spacing: 0.08em`, and are the one place all-caps is allowed.

Not used, on any surface: blackletter, faux-medieval or "forged" display faces,
letterpress or hammered texture, and all-caps slabs. The craft is in the shapes,
not in costume.

## Voice

The register of a working smithy: plain, specific, and finished. Short
declaratives. Concrete nouns. The metaphor lives in the vocabulary — shaped,
struck, marked, measured, quenched, local — and is never explained.

Forge says what a thing is and what it measured. It does not sell.

The voice must never:

- claim a figure it cannot cite from the repository, a CI run, or the registry;
- use cloud-infrastructure register — "seamless", "enterprise-grade",
  "unlock", "supercharge", "powered by AI", "next-generation";
- pad a metaphor into costume — no anvils, sparks, hammers or bellows as prose;
- use exclamation marks, emoji, or all-caps for emphasis;
- describe Forge as intelligent, magical, or effortless. It sends a prompt to a
  runtime on a machine you control and hands back a typed result.

## Taglines by context

Each line has one home. None is a general-purpose slogan and none is used twice
on the same surface.

| Line | Context |
| --- | --- |
| Where local intelligence is shaped into tools. | website hero |
| Every tool bears the mark. | any hallmark or verification heading |
| Shaped locally. Marked, measured, yours. | README and npm supporting line |

"Every tool bears the mark." is the strongest line and the worst opener: it
means nothing until the reader knows what the mark is. It earns its place only
below the fold, heading evidence.

## Hallmark rule

**The Maker's Mark appears beside verified work and evidence, and nowhere else.
An unverified claim carries no mark.**

Verified means traceable to a repository file, a CI run, or the registry, and
cited where it is shown.

The absence of the mark is the point. An unverified claim stands bare beside a
marked one, and the difference is visible at a glance. A figure that cannot be
cited is not displayed at all — it is not displayed unmarked as a workaround.

This rule binds every surface in Feature 05: the website, the README, the npm
page, the repository presentation, the Open Graph card, and the architecture
graphic. It is not decoration and it is not applied for balance.

## Contrast

Every text and background pair any Feature 05 surface uses, with its computed
ratio and the threshold it meets. Thresholds are WCAG 2.1 AA: 4.5:1 for text,
3:1 for text at 24px and above, and 3:1 for non-text graphical objects
(SC 1.4.11).

Ratios are computed from the WCAG relative-luminance definition —
`L = 0.2126R + 0.7152G + 0.0722B` over linearised sRGB channels, ratio
`(L_lighter + 0.05) / (L_darker + 0.05)`. L\*, C\*, h_ab are CIELAB and LCh(ab)
at D65, 2°. Perceptual distances are CIEDE2000.

### Text

| Foreground | Background | Ratio | Threshold | Result | Use |
| --- | --- | --- | --- | --- | --- |
| Chalk `#F7F3EC` | Iron `#17130D` | 16.72:1 | 3:1 | pass | display heading, 24px+ |
| Chalk `#F7F3EC` | Hearth `#1B1711` | 16.13:1 | 3:1 | pass | display heading, 24px+ |
| Chalk `#F7F3EC` | Billet `#1F1B15` | 15.49:1 | 3:1 | pass | card heading, 24px+ |
| Bone `#F2EDE6` | Iron `#17130D` | 15.88:1 | 4.5:1 | pass | body text |
| Bone `#F2EDE6` | Hearth `#1B1711` | 15.32:1 | 4.5:1 | pass | body text in an inset panel |
| Bone `#F2EDE6` | Billet `#1F1B15` | 14.71:1 | 4.5:1 | pass | body and code text on a card |
| Steel `#8A9299` | Iron `#17130D` | 5.86:1 | 4.5:1 | pass | secondary text |
| Steel `#8A9299` | Hearth `#1B1711` | 5.65:1 | 4.5:1 | pass | secondary text |
| Steel `#8A9299` | Billet `#1F1B15` | 5.43:1 | 4.5:1 | pass | secondary text |
| Ash `#818890` | Iron `#17130D` | 5.16:1 | 4.5:1 | pass | caption, section label |
| Ash `#818890` | Hearth `#1B1711` | 4.98:1 | 4.5:1 | pass | caption, section label |
| Ash `#818890` | Billet `#1F1B15` | 4.78:1 | 4.5:1 | pass | caption, section label |
| Bronze `#C8973F` | Iron `#17130D` | 7.01:1 | 4.5:1 | pass | accent and mono accent text |
| Bronze `#C8973F` | Hearth `#1B1711` | 6.76:1 | 4.5:1 | pass | accent and mono accent text |
| Bronze `#C8973F` | Billet `#1F1B15` | 6.49:1 | 4.5:1 | pass | accent and mono accent text |
| Brass `#E0B166` | Iron `#17130D` | 9.38:1 | 4.5:1 | pass | link, link hover |
| Brass `#E0B166` | Hearth `#1B1711` | 9.05:1 | 4.5:1 | pass | link, link hover |
| Brass `#E0B166` | Billet `#1F1B15` | 8.69:1 | 4.5:1 | pass | link, link hover |
| Iron `#17130D` | Bone `#F2EDE6` | 15.88:1 | 4.5:1 | pass | text on the light-ground variant |

### Non-text graphical objects

| Foreground | Background | Ratio | Threshold | Result | Use |
| --- | --- | --- | --- | --- | --- |
| Bronze `#C8973F` | Iron `#17130D` | 7.01:1 | 3:1 | pass | the mark on the iron ground |
| Iron `#17130D` | Bronze `#C8973F` | 7.01:1 | 3:1 | pass | the F knocked out of the solid punch |
| Steel `#8A9299` | Iron `#17130D` | 5.86:1 | 3:1 | pass | struck-state stroke below the quench line |
| Dark bronze `#85601A` | Bone `#F2EDE6` | 4.89:1 | 3:1 | pass | the mark on the light ground |
| Bone `#F2EDE6` | Dark bronze `#85601A` | 4.89:1 | 3:1 | pass | the F knocked out on the light ground |
| Quench `#646C73` | Iron `#17130D` | 3.47:1 | 3:1 | pass | architecture connectors and arrows |
| Quench `#646C73` | Hearth `#1B1711` | 3.34:1 | 3:1 | pass | architecture connectors and arrows |
| Quench `#646C73` | Billet `#1F1B15` | 3.21:1 | 3:1 | pass | architecture connectors and arrows |

### Decorative, no threshold

| Foreground | Background | Ratio | Use |
| --- | --- | --- | --- |
| Scale `#322C24` | Iron `#17130D` | 1.34:1 | hairline, card border |
| Scale `#322C24` | Billet `#1F1B15` | 1.24:1 | hairline, card border |

Scale is permitted only where the line carries no information and its absence
would change nothing a reader needs. Anything that separates one meaningful
region from another uses Quench.

### Pairs the prototype failed

Two prototype tones failed and were replaced here rather than downstream.

| Prototype pair | Ratio | Threshold | Replacement |
| --- | --- | --- | --- |
| Ash `#6E7479` on Iron `#121110` | 3.99:1 | 4.5:1 | Ash `#818890`, 5.16:1 on Iron `#17130D` |
| Ash `#6E7479` on Billet `#1B1A18` | 3.67:1 | 4.5:1 | Ash `#818890`, 4.78:1 on Billet `#1F1B15` |
| Quench `#4A5259` on Iron `#121110` | 2.37:1 | 3:1 | Quench `#646C73`, 3.47:1 on Iron `#17130D` |
| Quench `#4A5259` on Billet `#1B1A18` | 2.19:1 | 3:1 | Quench `#646C73`, 3.21:1 on Billet `#1F1B15` |
