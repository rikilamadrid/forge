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

On a light ground each of the three elements drops to the darker member of its
own family — the same substitution the solid state already makes when its punch
goes from Bronze to Dark bronze. The punch outline and the F above the quench
line become Dark bronze `#85601A`; the F below it becomes Quench `#646C73`. The
geometry, the stroke width and the two-tone hot/quenched reading are unchanged;
only lightness moves. The reasoning and the measured ratios are in
[The light ground](#the-light-ground).

### Between 33px and 47px

Use the **solid** state. The struck state is not permitted below 48px.

At 47px the punch outline's 1.5-unit stroke renders at 2.2 device pixels and the
counters of the F close up, so the two-tone quench reading is lost while the
hairline is still thin enough to alias. Solid is therefore the default state and
struck is the exception, permitted only at 48px and above. There is no
interpolation and no third state.

### Surfaces that must serve both grounds

Both states are defined on both grounds, so **size alone decides the state** and
a surface that has to present on either ground keeps whichever state its size
gives it. Only the palette swaps: every element drops to the darker member of
its own family on Bone and returns to its iron-ground token on Iron. The mark
never changes structure between a reader's light and dark theme.

The README header lockup is therefore struck at 48px, on Bone and on Iron
alike — GitHub renders a README in both themes, and the struck state holds on
both grounds. The website hero at 72px sits on a ground Forge controls and is struck
on Iron.

### Sizes in use

| Size | State | Surface |
| --- | --- | --- |
| 16px | solid | favicon, inline beside a verified fact |
| 24px | solid | navigation |
| 32px | solid | app icon, favicon |
| 48px | struck | README header lockup — see above |
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

On the iron ground the wordmark is set in Chalk `#F7F3EC`: 16.72:1 on Iron,
16.13:1 on Hearth, 15.49:1 on Billet. All three clear 4.5:1, so the wordmark
holds at any size the lockup permits. On the light ground it is set in Iron
`#17130D` on Bone `#F2EDE6`, 15.88:1.

The wordmark is never set in Bronze, Brass or Steel. The mark is the only bronze
element in the lockup, and a bronze wordmark beside it would read as two accents
and spend the single-accent budget on type.

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
| Dark bronze | `#85601A` | 43.40 | 43.97 | 79.1° | the mark on a light ground, in both states |

The three share one hue across a 0.55° spread. They are one accent at three
lightnesses, not three accents.

**Bronze appears once per view as emphasis.** At most one bronze accent-text or
mono-accent element in a view — that is the whole restraint. The Maker's Mark is
outside it: the [hallmark rule](#hallmark-rule) alone decides where the mark
appears, and a view carrying six pieces of verified evidence carries six marks.
Marks are a repeated system element and read as one; bronze emphasis draws the
eye and is rationed. So a view may hold several marks and one bronze accent
phrase, and must not hold two bronze accent phrases.

Brass is a separate token with its own use — links — and is not rationed.

### Steel — structure only, never decoration

| Token | Hex | L\* | C\* | h_ab | Use |
| --- | --- | --- | --- | --- | --- |
| Steel | `#8A9299` | 60.12 | 4.90 | 252.9° | secondary text; the struck mark below the quench line, on the iron ground |
| Ash | `#818890` | 56.38 | 5.22 | 260.3° | captions and section labels |
| Quench | `#646C73` | 45.18 | 5.15 | 253.3° | connectors, arrows, and rules that carry meaning; the struck mark below the quench line, on the light ground |

### Text tones

| Token | Hex | L\* | Use |
| --- | --- | --- | --- |
| Chalk | `#F7F3EC` | 95.97 | display headings |
| Bone | `#F2EDE6` | 93.95 | body text; also the light ground itself |

### The light ground

Bone `#F2EDE6` is also a ground. On it exactly these pairs are permitted:

| Element | Colour | Ratio on Bone |
| --- | --- | --- |
| All text — display, body, caption, mono | Iron `#17130D` | 15.88:1 |
| The Maker's Mark, solid state | Dark bronze `#85601A` punch, Bone knock-out | 4.89:1 |
| The Maker's Mark, struck state — punch outline | Dark bronze `#85601A` | 4.89:1 |
| The Maker's Mark, struck state — F above the quench line | Dark bronze `#85601A` | 4.89:1 |
| The Maker's Mark, struck state — F below the quench line | Quench `#646C73` | 4.58:1 |

No other token is permitted on Bone, and no token above is permitted outside
the row that names it. Steel (2.71:1), Ash (3.08:1), Bronze (2.27:1) and Brass
(1.69:1) all fail 4.5:1 there, so none of them is ever text on Bone. Quench
reaches 4.58:1 and clears that threshold, and is still not text on Bone: the
light ground carries no secondary-text tier at all — it exists for the mark and
for plain text, and text on Bone is Iron or it is not shown. Quench appears on
Bone only as the struck mark's lower bar, where it is a non-text graphical
object against 3:1. Every one of these pairs is in [Contrast](#contrast) as an
explicit row, so none of them is rediscovered and argued for again.

**The struck state's light-ground variant is a substitution, not a new
colour.** Its iron-ground tokens fail on Bone at all three of its elements,
each against the 3:1 that SC 1.4.11 requires of a non-text graphical object —
and the punch itself is the worse failure, not the quenched bar:

| Element | Iron-ground token | Ratio on Bone | vs 3:1 |
| --- | --- | --- | --- |
| Punch outline | Bronze `#C8973F` | 2.2669:1 | fail |
| F above the quench line | Bronze `#C8973F` | 2.2669:1 | fail |
| F below the quench line | Steel `#8A9299` | 2.7106:1 | fail |

So each element drops to the darker member of its own family, exactly as the
solid state's punch already drops from Bronze to Dark bronze:

| Element | Light-ground token | Ratio on Bone | vs 3:1 |
| --- | --- | --- | --- |
| Punch outline | Dark bronze `#85601A` | 4.8928:1 | pass |
| F above the quench line | Dark bronze `#85601A` | 4.8928:1 | pass |
| F below the quench line | Quench `#646C73` | 4.5830:1 | pass |

Quench is Steel's own hue: h_ab 253.31 against Steel's 252.91, a 0.40° spread —
tighter than the bronze family's own 0.55° — at C\* 5.15 against 4.90. The two
differ essentially in lightness, ΔL\* 14.94, a smaller step than the approved
Bronze → Dark bronze swap's 22.17. The two-tone hot/quenched reading therefore
survives the substitution: Dark bronze against Quench is CIEDE2000 28.00,
close to the 30.15 that separates Bronze and Steel on the iron ground.

No colour is invented. All three substitutes are existing named tokens, and the
rows above are in [Contrast](#contrast).

### Approved adjustment 1 — the warmed iron ground

The ground is `#17130D`, warmer than the prototype's `#121110`.

| Measure | `#121110` | `#17130D` | Change |
| --- | --- | --- | --- |
| CIELAB a\* | 0.19 | 0.63 | +0.44 |
| CIELAB b\* | 0.66 | 3.73 | +3.06 |
| Chroma C\* | 0.69 | 3.78 | +3.09 (×5.47) |
| HSL saturation | 5.9% | 27.8% | ×4.72 |
| CIEDE2000 | — | — | 2.91 |

Unrounded: a\* 0.188182 → 0.632221; b\* 0.664835 → 3.726975, a change of
3.062140; C\* 0.690954 → 3.780217, a change of 3.089263 and a ratio of 5.4710.
The b\* change is +3.06, not the +3.07 the rounded columns would give.

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
at D65, 2°, with the white point derived from chromaticity (0.3127, 0.3290) —
Xn 0.950456, Yn 1, Zn 1.089058 — over the standard sRGB-to-XYZ matrix.
Perceptual distances are CIEDE2000.

Every figure in this document is rounded from the unrounded computation, never
derived from the rounded columns around it. A stated change can therefore differ
in its last digit from the difference of the two rounded values shown beside it.
Near-neutral tones are the sensitive case: the chroma of `#121110` is 0.69, so
its ratios shift in the second decimal under a different white-point convention.
The pipeline above is the one that produced every number here, and a
recomputation should use it. One detail matters to anyone who does: the white
point is derived from the chromaticity rather than normalised to the matrix.
The IEC 61966-2-1 matrix has row sums (0.950470, 1, 1.088830), which are not
quite (0.950456, 1, 1.089058), so sRGB white does not land exactly achromatic
here — Lab(`#FFFFFF`) computes C\* 0.0142 rather than 0. The offset is far below
anything reportable at the precision this document states, but a recomputation
that normalises the white point to the matrix instead will differ from these
figures in their last digits.

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
| Dark bronze `#85601A` | Bone `#F2EDE6` | 4.89:1 | 3:1 | pass | the solid punch on the light ground |
| Bone `#F2EDE6` | Dark bronze `#85601A` | 4.89:1 | 3:1 | pass | the F knocked out of the solid punch on the light ground |
| Dark bronze `#85601A` | Bone `#F2EDE6` | 4.89:1 | 3:1 | pass | struck-state punch outline on the light ground |
| Dark bronze `#85601A` | Bone `#F2EDE6` | 4.89:1 | 3:1 | pass | struck-state F above the quench line on the light ground |
| Quench `#646C73` | Bone `#F2EDE6` | 4.58:1 | 3:1 | pass | struck-state F below the quench line on the light ground |
| Quench `#646C73` | Iron `#17130D` | 3.47:1 | 3:1 | pass | architecture connectors and arrows |
| Quench `#646C73` | Hearth `#1B1711` | 3.34:1 | 3:1 | pass | architecture connectors and arrows |
| Quench `#646C73` | Billet `#1F1B15` | 3.21:1 | 3:1 | pass | architecture connectors and arrows |

Quench on Billet computes 3.2095:1 against a 3:1 requirement — the thinnest
margin in this document. Darkening Quench or lightening Billet by any
appreciable amount breaks SC 1.4.11 for every connector drawn on a card. Neither
token moves without recomputing this row.

### Forbidden on the light ground

Bone `#F2EDE6` carries Iron text, the Dark bronze mark, and Quench as that
mark's quenched bar in the struck state — nothing else. The pairs below are
recorded so they are not rediscovered and proposed again.

| Foreground | Background | Ratio | Threshold | Result |
| --- | --- | --- | --- | --- |
| Chalk `#F7F3EC` | Bone `#F2EDE6` | 1.05:1 | 4.5:1 | fail — do not use |
| Brass `#E0B166` | Bone `#F2EDE6` | 1.69:1 | 4.5:1 | fail — do not use |
| Bronze `#C8973F` | Bone `#F2EDE6` | 2.27:1 | 4.5:1 | fail — do not use |
| Steel `#8A9299` | Bone `#F2EDE6` | 2.71:1 | 4.5:1 | fail — do not use |
| Ash `#818890` | Bone `#F2EDE6` | 3.08:1 | 4.5:1 | fail — do not use |
| Bronze `#C8973F` | Bone `#F2EDE6` | 2.27:1 | 3:1 | fail — do not use: the punch outline is a graphical object, held to 3:1 rather than 4.5:1, and fails that too |
| Steel `#8A9299` | Bone `#F2EDE6` | 2.71:1 | 3:1 | fail — do not use: this is why the struck mark's lower bar is Quench on Bone |
| Quench `#646C73` | Bone `#F2EDE6` | 4.58:1 | 4.5:1 | passes, and is still forbidden **as text** — the light ground carries no secondary-text tier. Permitted as the struck mark's lower bar, against 3:1 |

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
