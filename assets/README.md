# Forge identity assets

Every file here is drawn from `context/brand-identity.md`. That document is the
source of the geometry, the palette, the state rule, and the lockup measures.
Nothing here introduces a value it does not carry.

These files ship with the repository and never with the package. The `files`
allowlist in `package.json` and the `allowedPath` pattern in
`scripts/verify-package.mjs` permit only `README.md`, `LICENSE`,
`package.json`, and `dist/src/**`, so `assets/` cannot enter the tarball.
Anything that references an asset must use an absolute URL:

```
https://raw.githubusercontent.com/rikilamadrid/forge/main/assets/<file>
```

## The files

| File | Surface | State and size |
| --- | --- | --- |
| `mark-solid-iron.svg` | inline beside a verified fact; navigation; app icon | solid, `0 0 32 32`, iron ground |
| `mark-solid-light.svg` | the same, on a light ground | solid, `0 0 32 32`, Bone ground |
| `mark-struck-iron.svg` | website hero; anywhere 48px and above on iron | struck, `0 0 32 32`, iron ground |
| `mark-struck-light.svg` | 48px and above on a light ground | struck, `0 0 32 32`, Bone ground |
| `lockup-iron.svg` | mark and wordmark together on the iron ground | struck, mark 48px, lockup 226.363×96 |
| `lockup-light.svg` | mark and wordmark together on a light ground | struck, mark 48px, lockup 226.363×96 |
| `readme-header.svg` | the README and npm opening | struck, mark 48px, 1200×200, carries its own iron panel |
| `hallmark-plate-iron.svg` | the website hero | the plate, mark 96px in its iron well, 504×378, no ground of its own |
| `favicon-16.png` | browser tab | solid, 16×16 |
| `favicon-32.png` | browser tab, app icon | solid, 32×32 |
| `favicon-180.png` | `apple-touch-icon` | the plate, icon state, struck mark 88px, 180×180 |
| `og-card.png` | Open Graph card | the plate, mark 96px, card 1200×630 |
| `github-preview.png` | GitHub social preview | the plate, mark 96px, card 1280×640 |
| `architecture.svg` | the data path, in the README and on the site | carries its own iron panel, 529.205×72 |

`hallmark-plate-iron.svg` carries no background either: the surface that
places it owns the ground, and the plate is the same object on both. Only the
enamel moves between environments — Ember night `#C2402A` is the file's own
value, and the day environment overrides the `.enamel` class to Ember day
`#B03A26`. Nothing else in the plate changes, because the mark inside it sits
on the iron of the well and never on enamel.

The four mark files carry no background. The solid state's F is painted the
ground colour it is named for, because `brand-identity.md` knocks the F out in
the ground rather than stroking it. Use each file on the ground in its name.

`readme-header.svg` and `architecture.svg` carry their own iron panel. npm does
not honour `<picture>` theme switching, so one asset has to read on a white and
a dark ground alike. Carrying the ground is how it does that.

## The state rule

Size alone decides the state. Solid at 32px and below, struck at 48px and
above, solid between 33 and 47px. The plate is a third state, not a fourth
size: it is the object the struck mark sits inside at 96px and above, and
`brand-identity.md` defines its geometry in units of the mark's box height.

`favicon-180.png` carries the plate's **icon state**: the enamel, the chamfer,
the iron well and the struck mark at 88px, without the wordmark, the serial or
the rivets, none of which survive at 180px. The mark is struck because 88 is
above 48.

## How the wordmark is drawn

The wordmark is outlined paths, not `<text>`.

`brand-identity.md` sets the wordmark in Bricolage Grotesque at weight 700.
An SVG that names a font renders with whatever the reader's machine happens to
have, and GitHub and npm serve these files as images, where no web font loads
at all. Outlines remove the question: the shapes are in the file and every
renderer draws the same wordmark.

The outlines were taken from Bricolage Grotesque (SIL Open Font License 1.1,
Atelier Triay) at `wght` 700, `wdth` 100, with kerning applied by HarfBuzz and
`letter-spacing: -0.02em` as the lockup measures require. The optical size axis
is set to the rendered type size in pixels, which is what a browser's default
`font-optical-sizing: auto` produces for the same text at the same size.

`architecture.svg` is outlined the same way: Instrument Sans (SIL Open Font
License 1.1, The Instrument Sans Project Authors) at weight 400 for three
labels, Bricolage Grotesque at weight 700 for `Forge`.

The plate's own type — the `Forge` wordmark at `0.90 × M` and the serial
`FG-047 · MAKER 047` in plate type — is outlined by the same pipeline, so the
plate references no font either.

Its four labels read `Your app`, `Forge`, `Ollama`, `local model`. The
capitalisation is deliberate: `Forge` and `Ollama` are product names, and
`Your app` begins the sentence the diagram reads as — the same sentence its
`aria-label` spells out, `Your app sends a prompt to Forge, Forge calls
Ollama, Ollama runs a local model`. A local model is a common noun and no
particular product, so it is set like one.

No file here references a font, a raster, or a network resource.

Outlining has one cost worth stating: a later change to the display face in
`brand-identity.md` will not propagate here. The shapes are frozen in the
files, so every asset that carries type has to be regenerated.

## Cap height, and how the lockup is centred

The type size governs. `brand-identity.md` specifies `0.90 × M`, and Bricolage
Grotesque carries a cap height of 660/1000 em, so the cap measures `0.660 ×
0.90 = 0.594 × M` — 28.512px against the 48px mark in `lockup-iron.svg`,
`lockup-light.svg` and `readme-header.svg`. The document first recorded `0.64 ×
M`, a figure derived against `Avenir Next`, the first fallback in the display
stack, rather than against the recorded display face. That row now reads `0.594
× M`. The assets were drawn to the type size from the start and did not change.

The rule a future lockup must reproduce is the centre line, not a flat fit. The
cap is optically centred on the mark: cap top 33.744, cap bottom 62.256, centre
48.0 — which is the centre of the 48px mark box and of the hexagon's flats,
themselves at `1.5` and `30.5` on the 32-unit grid. Flat-to-flat is `29/32 =
0.90625 × M`, so no cap height of a `0.90 × M` setting fits the flats; sharing
their centre is what the lockup does instead.

## Two things this directory does not decide

**The architecture graphic carries no Maker's Mark.** The hallmark rule puts
the mark beside verified work and evidence and nowhere else. A diagram of the
data path cites no figure, so it earns no mark. `brand-identity.md` pins no
mark size for this graphic and says a ticket that needs one reports the gap;
this graphic does not need one, so the gap stands unfilled rather than guessed.

**The architecture graphic still carries no Maker's Mark**, and the plate does
not change that: the plate is the lockup's object state, not a hallmark, and a
diagram of the data path still cites no figure.

`github-preview.png` closes the gap this file used to report. Feature 06 pinned
GitHub's 1280×640 canvas alongside the Open Graph card's 1200×630, and both now
carry one composition at their own aspect ratios. Uploading it is a human
action in repository settings; GitHub does not read it from the repository.
