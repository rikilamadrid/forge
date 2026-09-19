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
| `readme-header.svg` | the README and npm opening | struck, mark 48px, carries its own iron panel |
| `favicon-16.png` | browser tab | solid, 16×16 |
| `favicon-32.png` | browser tab, app icon | solid, 32×32 |
| `favicon-180.png` | `apple-touch-icon` | struck, 180×180 |
| `og-card.png` | Open Graph and social preview | struck, mark 96px, card 1200×630 |
| `architecture.svg` | the data path, in the README and on the site | carries its own iron panel, 529.205×72 |

The four mark files carry no background. The solid state's F is painted the
ground colour it is named for, because `brand-identity.md` knocks the F out in
the ground rather than stroking it. Use each file on the ground in its name.

`readme-header.svg` and `architecture.svg` carry their own iron panel. npm does
not honour `<picture>` theme switching, so one asset has to read on a white and
a dark ground alike. Carrying the ground is how it does that.

## The state rule

Size alone decides the state. Solid at 32px and below, struck at 48px and
above, solid between 33 and 47px. `favicon-180.png` is struck because 180 is
above 48 — the size is not in the `Sizes in use` table, and the general rule is
what resolves it.

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

`architecture.svg` is outlined the same way: Instrument Sans at weight 400 for
three labels, Bricolage Grotesque at weight 700 for `Forge`.

No file here references a font, a raster, or a network resource.

## Two things this directory does not decide

**The architecture graphic carries no Maker's Mark.** The hallmark rule puts
the mark beside verified work and evidence and nowhere else. A diagram of the
data path cites no figure, so it earns no mark. `brand-identity.md` pins no
mark size for this graphic and says a ticket that needs one reports the gap;
this graphic does not need one, so the gap stands unfilled rather than guessed.

**There is no separate GitHub social preview image.** `brand-identity.md` pins
the Open Graph card at 1200×630 with a 96px mark and pins nothing for GitHub's
preview, which GitHub sizes at 1280×640 — a different canvas and a different
aspect ratio. Reporting that gap is the instruction; inventing a canvas is not.
`og-card.png` is the Open Graph card and only that.
