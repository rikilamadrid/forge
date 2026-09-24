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

Extended, 2026-09-24, by **Feature 06 — Forge identity completion**, approved in
six decisions: the hallmark plate as the lockup's object state, Bone as Forge's
product day ground, a depth exception for objects only, the plate's homes, the
README header and first-screen composition, and the quench rule in colour-capable
human CLI output. Two earlier rulings are recorded here for the first time:
Forge keeps Iron `#17130D` as its **product** night while Workshop Night
`#17191C` remains the Wonder Wagon **system** night, and **Bronze is Forge's one
visible signal** while **Ember is its product enamel** and never a general-purpose
UI accent. Forge is the first external Wonder Wagon foundation consumer, serial
`FG-047`.

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
gives it. Only the palette swaps: every drawn element — the solid state's punch,
and in the struck state the punch outline and both halves of the F — drops to
the darker member of its own family on Bone and returns to its iron-ground token
on Iron. The solid state's F is not drawn but knocked out, so it takes the
ground colour either way: Iron `#17130D` on Iron, Bone `#F2EDE6` on Bone. The
mark never changes structure between a reader's light and dark theme.

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
| 96px | struck | Open Graph card, 1200×630 |

The Open Graph card's mark is pinned at 96px because a 1200×630 card is commonly
rendered at about half its authored width in a feed, where a 96px mark reads as
48px — the struck state's own floor. The npm page and the repository page both
render `README.md`, so the mark they show is the README header lockup at 48px
rather than a size of their own. The architecture graphic has no pinned size; a
ticket that needs one reports the gap.

## The hallmark plate

The lockup's **object state**, at 96px and above. Below that the lockup is drawn
bare; the plate is not a fourth size of the mark but the object the struck mark
sits inside.

A squat chamfered plate in fired Ember enamel, holding the struck mark in a
recessed **iron well**, the wordmark in Chalk beside it, the serial in plate type
bottom-right, and two bronze rivets as hardware. Geometry is defined in units of
**M**, the mark's box height, so the plate scales with the mark it holds.

| Measure | Value at M = 96 | In units of M |
| --- | --- | --- |
| Plate | 504 × 378 | `5.25 × M` wide, `3.9375 × M` tall (ratio 4:3) |
| Plate chamfer | 24 | `0.25 × M` |
| Well | 144 × 144 at x = 48, vertically centred | `1.5 × M` square, `0.5 × M` from the left |
| Well chamfer | 12 | `0.125 × M` |
| Mark in the well | 96, struck, centred | `M` |
| Wordmark | type 86.4, cap optically centred on the mark | the lockup's own `0.90 × M` |
| Gap, well to wordmark | 36 | the lockup's own `0.375 × M` |
| Serial | plate type 14.4, right-aligned at x = 456, baseline y = 330 | `0.15 × M`, inset `0.5 × M` |
| Rivet countersink | r = 9, Iron | `0.09375 × M` |
| Rivet | r = 6, Bronze | `0.0625 × M` |

**The mark never sits directly on enamel.** Bronze on Ember measures 1.96 at
night and 2.29 by day, against the 3:1 a non-text graphical object is held to.
The iron well is what makes the plate legal — and it is the family's "one well"
rule, applied again at rivet scale so no bronze anywhere on the plate touches
enamel.

### Homes

| Surface | Plate? |
| --- | --- |
| Website hero | yes |
| Open Graph card, GitHub social preview | yes |
| `favicon-180` | yes, the **icon state**: enamel, chamfer, well and an 88px struck mark, without the wordmark, the serial or the rivets, none of which survive at 180px |
| README header | **no** — a quiet surface on a host page |
| npm | **no** — the README header is what npm renders |
| The CLI | **never** |

The plate does not widen the [hallmark rule](#hallmark-rule). It appears exactly
where the bare lockup already appears as identity, and nowhere the mark was not
already permitted.

### The plate between environments

Only the enamel moves. The well is Iron in both environments, so the mark inside
it keeps its iron-ground tokens, and the wordmark and serial are Chalk on both.

| Element | Night | Day |
| --- | --- | --- |
| Enamel | Ember `#C2402A` | Ember day `#B03A26` |
| Well | Iron `#17130D` | Iron `#17130D` |
| Mark in the well | Bronze / Steel | Bronze / Steel |
| Wordmark, serial | Chalk `#F7F3EC` | Chalk `#F7F3EC` |
| Rivet, countersink | Bronze in Iron | Bronze in Iron |

## Wordmark lockup

The wordmark is `Forge`, sentence case, set in the display face at weight 700
with `letter-spacing: -0.02em`.

Let **M** be the mark's box height.

| Measure | Value |
| --- | --- |
| Wordmark type size | `0.90 × M` |
| Resulting cap height | `0.594 × M`, optically centred on the mark |
| Gap, mark right edge to wordmark left sidebearing | `0.375 × M` |
| Clear space, all four sides of the lockup bounding box | `0.5 × M` |
| Minimum lockup width | 120px |
| Minimum mark size, standing alone | 16px |

The type size governs and the cap height follows from it. Bricolage Grotesque
carries a cap height of 660/1000 em (OS/2 `sCapHeight`, invariant across the
`wght` and `opsz` axes, since MVAR records no `cpht`), so `0.660 × 0.90 =
0.594`. This row first read `0.64 × M`, which was derived against `Avenir
Next` — the first fallback in the display stack, cap height 0.708 em — rather
than against the recorded display face: `0.708 × 0.90 = 0.6372`. The assets in
`assets/` were always drawn to the type size and are unchanged.

Centring, not a flat fit, is what aligns the two. The cap is optically centred
on the mark, so the cap and the mark's flats share a centre line. The flats
themselves sit at `1.5` and `30.5` on the mark's 32-unit grid, a flat-to-flat
height of `29/32 = 0.90625 × M`, which no `0.90 × M` setting's cap height
meets.

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

A warmed iron ground, one bronze signature accent, one cool steel structural
neutral, and one product enamel reserved for objects.

**No texture overlays, on any surface, ever. No gradients behind text, ever.**
Feature 06 retired the blanket ban on depth **for objects only**: see
[Depth, objects only](#depth-objects-only).

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

### Ember — product enamel, the object only

| Token | Hex | Use |
| --- | --- | --- |
| Ember | `#C2402A` | the enamel of the hallmark plate, on the night ground |
| Ember day | `#B03A26` | the same enamel on the day ground; also the day link |

Ember is Forge's **product enamel**: the fired colour of an object, not a UI
accent. It appears on the hallmark plate, and through the plate on the website
hero, the social cards and `favicon-180`. It is never body text, never a CLI
byte, and never a general-purpose accent competing with Bronze.

Ember day `#B03A26` has one further use, and only one: it is the **link colour
of the day environment**, where it measures 5.18 on Bone. Brass fails there
(1.69) and Bronze fails there (2.27), so the light ground needs a link token of
its own, and Ember day is the one that clears 4.5:1.

**Bronze remains Forge's single primary visible signal** — the mark, one accent
phrase per view, the CLI's name. Ember does not share that budget, because it is
never emphasis: it is the surface an object is made of.

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

Bone `#F2EDE6` is also a ground. Feature 06 promoted it from a variant the mark
had to survive on to **Forge's product day environment**, parallel to the Iron
night ruling: Iron `#17130D` is Forge's product night and Workshop Night
`#17191C` stays the Wonder Wagon system night; Bone `#F2EDE6` is Forge's product
day and Quiet Paper `#FBF3DE` stays the system day. Both are product-specific
differentiation carried by Forge's own theme and adapter, not token drift.

| Role | Night | Day |
| --- | --- | --- |
| Ground | Iron `#17130D`; Hearth insets; Billet cards | Bone `#F2EDE6` |
| Display, 24px and above | Chalk `#F7F3EC` | Iron `#17130D` |
| Body | Bone `#F2EDE6` | Iron `#17130D` |
| Secondary, caption, label | Steel, Ash | **Iron** — the light ground has no secondary tier |
| Link | Brass `#E0B166` | Ember day `#B03A26` |
| Mark | Bronze / Steel | Dark bronze / Quench |
| Enamel | Ember `#C2402A` | Ember day `#B03A26` |
| Hairline, decorative only | Scale `#322C24` | Iron at 16% |
| Operating surfaces — code, commands, the machine's own output | Billet on Iron | **Billet on Iron, unchanged** |

The last row is the one that surprises. A code block carries what the machine
says, so it is an operating plate rather than a card, and it keeps the iron
ground in **both** environments. That is why the day column needs no second
surface tier and invents no new token: every pair inside an operating plate is
already a row in [Contrast](#contrast).

On it exactly these pairs are permitted:

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

## Depth, objects only

The shipped rule forbade gradients and texture overlays on every surface.
Feature 06 retires that ban **for objects and for nothing else**.

| Surface | Depth |
| --- | --- |
| The hallmark plate | yes |
| Genuinely tactile controls — a lever, a button a reader presses | yes |
| Cards, panels, code surfaces, diagrams, generic containers | **no** — these stay flat |

The stack, when it is permitted, is the Wonder Wagon one:

| Layer | Value |
| --- | --- |
| Machined top rim | `inset 0 1px 0 rgba(255, 250, 240, 0.22)` |
| Well inset | a pure-black low-alpha inset on the recess's top edge |
| Cast shadow | pure black, low alpha, under the object |
| Pressed state | the cast shadow replaced by an inset |

On a light ground a white rim says nothing, so there the rim is dropped and the
cast shadow carries the depth alone, at roughly half the alpha it takes on iron.
Exact alpha values are implementation-level polish and are tuned in visual QA;
the rule above is what does not move.

**No texture overlays anywhere. No gradients behind text.** Neither is affected
by this exception.

### Chamfers, not radii

Forge's object edge is an **8px chamfer**, not a corner radius — the family rule
is that products share no corner radius, and this is Forge's answer to it. The
hallmark plate is chamfered at `0.25 × M`; controls and operating surfaces are
chamfered at 8px. Quiet cards keep an 8px radius, because they are not objects.

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

## The terminal

The CLI is the most restrained surface Forge has, and it stays that way. One
identity colour, generated from `@wonder-wagon/themes` into `src/identity.ts`
and drift-checked in CI; severity in the terminal's own eight ANSI colours,
never a brand colour; no glyph beyond `·`, `—` and the quench rule's `─`.

### The quench rule

The identity's one structural mark in human output: a fixed **24-column** rule
between the answer and the metrics — **8 cells** carrying the brand colour,
**16 cells** quenched — drawn in `─` (U+2500). Hot above the line, measured
below it, which is the whole identity in one line.

| Condition | Rule |
| --- | --- |
| A colour-capable terminal, 24 columns or wider | drawn |
| Colour off — a pipe, `NO_COLOR`, `FORCE_COLOR=0`, `TERM=dumb` | **absent** |
| Narrower than 24 columns | **absent** — dropped whole, never wrapped and never shortened |
| `--json`, and every other machine-readable byte | **absent**; machine-readable output never passes through the terminal at all |

Gating it on colour is what keeps the promise that piped and `NO_COLOR` bytes
are identical to 0.1.2. A rule that wraps is worse than no rule, and a rule that
shrinks to fit is a second, unmeasured mark — so the narrow case drops it
entirely.

The quenched 16 cells are the terminal's own **dim**, not a literal Steel
`#8A9299`. `src/identity.ts` is generated and carries one brand colour; a second
hex written by hand into `terminal.ts` would be an identity byte living outside
the drift check. Dim is also what the metric labels beneath the rule already
use, so the quenched run and the measured block read as one surface.

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
| Chalk `#F7F3EC` | Ember `#C2402A` | 4.68:1 | 4.5:1 | pass | the plate's wordmark and serial, night |
| Chalk `#F7F3EC` | Ember day `#B03A26` | 5.46:1 | 4.5:1 | pass | the plate's wordmark and serial, day |
| Ember day `#B03A26` | Bone `#F2EDE6` | 5.18:1 | 4.5:1 | pass | the link, day environment |
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
| Ember `#C2402A` | Iron `#17130D` | 3.58:1 | 3:1 | pass | the plate's boundary on the night ground |
| Ember `#C2402A` | Hearth `#1B1711` | 3.45:1 | 3:1 | pass | the plate on an inset |
| Ember `#C2402A` | Billet `#1F1B15` | 3.31:1 | 3:1 | pass | the plate on a card |
| Ember day `#B03A26` | Bone `#F2EDE6` | 5.18:1 | 3:1 | pass | the plate's boundary on the day ground |
| Ember day `#B03A26` | Quiet Paper `#FBF3DE` | 5.45:1 | 3:1 | pass | the plate on the system day ground |
| Ember day `#B03A26` | white | 6.04:1 | 3:1 | pass | the plate on a white host page |
| Ember `#C2402A` | GitHub dark `#0D1117` | 3.66:1 | 3:1 | pass | the plate bare on GitHub dark |
| Iron `#17130D` | Ember `#C2402A` | 3.58:1 | 3:1 | pass | the iron well, night |
| Iron `#17130D` | Ember day `#B03A26` | 3.06:1 | 3:1 | pass | the iron well, day — the thinnest margin on the plate |

Quench on Billet computes 3.2095:1 against a 3:1 requirement — the thinnest
margin in this document. Darkening Quench or lightening Billet by any
appreciable amount breaks SC 1.4.11 for every connector drawn on a card. Neither
token moves without recomputing this row.

### Forbidden on the light ground, and on enamel

Bone `#F2EDE6` carries Iron text, the Dark bronze mark, Quench as that mark's
quenched bar in the struck state, and Ember day as the link — nothing else.
Ember enamel carries Chalk and nothing else. The pairs below are
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
| Bronze `#C8973F` | Ember `#C2402A` | 1.96:1 | 3:1 | fail — this is why the mark sits in an iron well and never on enamel |
| Bronze `#C8973F` | Ember day `#B03A26` | 2.29:1 | 3:1 | fail — the same, by day |
| Steel `#8A9299` | Ember `#C2402A` | 1.64:1 | 3:1 | fail — the quenched bar of the mark is never on enamel either |
| Bone `#F2EDE6` | Ember `#C2402A` | 4.44:1 | 4.5:1 | fail — body text is never on enamel; the plate's type is Chalk, and display-sized |
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
