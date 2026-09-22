# Forge Identity and Public Presentation

## Status

In Progress

## Goal

Forge presents one deliberate identity — the village smithy of the ecosystem,
signed by the Maker's Mark — across every public surface: a deployed one-page
website, the GitHub repository, and the npm package page, released as
`forge-local-ai-kit@0.1.2` through the existing `RELEASING.md` process.

## Context

- Read: `RELEASING.md` (§Policy, §Process), `scripts/verify-package.mjs`
  (the `allowedPath` allowlist and `requiredPaths`), `package.json`
  (`files`, public metadata), `README.md`, `context/project-overview.md`
  (§Delivery Workflow, §Durable Decisions)
- Relevant area: `README.md`, `package.json`, `assets/`, `site/`, `prototypes/`,
  `.github/workflows/ci.yml`
- Avoid: `src/`, `test/`, `scripts/verify-package.mjs`. This Feature changes no
  runtime behavior and no verified artifact contract.

Approved direction (human decision, 2026-09-18): **Forge — The Village Smithy**,
combining the smithy world and voice, the Maker's Mark identity system, and the
Quench's restraint and accent discipline. The approved visual prototype is the
canvas at `https://claude.ai/artifact/VSAxJ1uxLrx3jFKS7VqAcy`.

Three repository constraints shape this Feature and are not negotiable:

1. **No binary or vector asset can ship in the npm tarball.** `allowedPath` in
   `scripts/verify-package.mjs` permits only `README.md`, `LICENSE`,
   `package.json`, and `dist/src/**` JavaScript and declarations. Every image the
   README references must therefore be an absolute URL to a file that lives in
   the repository but outside the package.
2. **npm does not honour `<picture>` theme switching.** GitHub does. One asset
   must read correctly on both a white and a dark ground, so the README lockup
   carries its own iron panel rather than relying on a transparent background.
3. **`README.md` ships in the tarball.** Changing it changes the artifact, which
   `RELEASING.md` §Versioning classifies as PATCH. The npm page cannot be
   updated without publishing, so the README work and the release are one chain.

## Requirements

### Brand foundations

- Record the identity system in a single durable document under `context/`:
  the Maker's Mark and its two states, the wordmark lockup, the palette, the
  type system, the voice, the tagline-by-context rule, and the hallmark usage
  rule.
- **Maker's Mark**: the letter F struck in a hexagonal punch. Solid at 32px and
  below (punch filled, F knocked out in the ground colour); struck at 48px and
  above (open punch outline, bronze above the quench line, steel below).
- **Palette**: a warmed iron ground, one bronze signature accent, one cool steel
  neutral for structure. No gradients, no texture overlays. Approved adjustment
  1 warms the ground beyond the prototype's `#121110`; approved adjustment 2
  widens the separation between Forge bronze and Pathfinder's ember `#E0611F`.
  Both adjustments resolve to exact values in this Feature.
- **Typography**: a display face with a crafted quality, a plain body face, and
  a mono that carries everything the machine says or is typed at it.
- **Taglines by context**: "Where local intelligence is shaped into tools." in
  the website hero; "Every tool bears the mark." heading any hallmark or
  verification section; "Shaped locally. Marked, measured, yours." as the README
  and npm supporting line.
- **Hallmark rule**: the Maker's Mark appears beside verified work and evidence,
  and nowhere else. An unverified claim carries no mark. This rule binds every
  surface in this Feature.
- Every text and background pair used on any surface meets WCAG AA (4.5:1, or
  3:1 at 24px and above), and the pairs are recorded with their ratios.

### Identity assets

- Assets live in a repository directory outside the package — `assets/` — and
  are excluded from the tarball by the existing `files` allowlist.
- Produce: Maker's Mark SVG in both states and in the light-ground variant;
  the wordmark lockup; favicon files at 16, 32, and 180px; a README header
  lockup that reads on both white and dark grounds; an Open Graph / social card;
  and the architecture graphic.
- Every asset is hand-authored SVG where the surface allows it, with PNG raster
  only where a surface requires raster (favicon, OG card, GitHub social
  preview).
- Assets referenced from `README.md` use absolute
  `https://raw.githubusercontent.com/rikilamadrid/forge/main/assets/…` URLs so
  they resolve identically on GitHub and on npm.

### Public website

- A one-page, mobile-first site in `site/`, built with Astro and configured for
  static output, deployable to Vercel from the `site/` root directory.
- Sections: hero with the wordmark, Maker's Mark and hero tagline; a plain
  subline; the architecture diagram `Your app → Forge → Ollama → local model`;
  the real install command; a real `createForge()` example taken from the
  current public API; the local-first story; an evidence and provenance section
  headed "Every tool bears the mark."; and GitHub and npm links.
- The evidence section shows only facts that can be cited from the repository or
  the registry. A figure with no source is not displayed.
- The site shows Forge's place beside Pathfinder, Lorekeeper and LAMA as roles
  in one ecosystem, without restyling or misrepresenting those projects.
- The site has no analytics, no tracking, no external runtime dependency, and no
  network request at view time beyond its own static assets and web fonts.
- `site/` is a separate npm workspace-free directory with its own manifest. It
  must not affect the root `npm ci`, `npm run check`, `npm test`, `npm pack`, or
  `node scripts/verify-package.mjs`.
- The site is deployed to the Vercel project `forge-kit`
  (`prj_NBg9Fpt9yvYBaFbHXGLrc5FLvnM9`, team `rikilamadrids-projects`), configured
  as a planning precondition on 2026-09-19: Root Directory `site`, framework
  preset Astro, connected to `github.com/rikilamadrid/forge`, no custom domain.
  The site's build must satisfy that preset — an Astro project in `site/` whose
  `npm run build` emits static output.

### Continuous integration

- `.github/workflows/ci.yml` gains a `site` job that installs and builds the
  static site on `ubuntu-latest`, so a broken site build fails the pull request
  rather than being found on Vercel.
- The aggregate job named `CI` changes from `needs: test` to
  `needs: [test, site]` and asserts both results. Its name, and therefore the
  required branch-protection context, stays exactly `CI`. No new required
  context is created.
- The existing package matrix — Ubuntu Node.js 22 and 24, macOS Node.js 22, with
  `npm ci`, `npm run check`, `npm test`, `npm pack`, and
  `node scripts/verify-package.mjs` — is unchanged.

### GitHub repository presentation

- `README.md` opens with the Maker's Mark lockup, the positioning line, and the
  supporting tagline, replacing the current emoji heading.
- The README keeps every section that makes it genuine developer documentation —
  requirements, setup, library usage, CLI usage, configuration, results and
  metrics, failures, privacy, scope. Identity is added to the opening and the
  evidence presentation; the reference material is not cut for marketing.
- The README carries the architecture graphic, the CI badge, an evidence line,
  the website link, and the npm link.
- A plain-text architecture fallback remains in the README so it is readable
  where images do not load.
- Repository About description, topics, and website link are updated to match.
  A custom GitHub social preview image was originally required here, uploaded
  through repository settings. That requirement was made **optional** on
  2026-09-22 after GitHub was found to expose no supported mechanism for it —
  see §Notes / Decisions. The public website's Open Graph metadata is the
  automated, version-controlled source of truth for Forge's social
  presentation, and GitHub's generated repository card is acceptable for this
  Feature.

### npm package presentation

- The published README renders correctly on npm: absolute image URLs, no
  `<picture>` dependency, no relative links, and install, requirements, and the
  minimal API visible without scrolling past marketing.
- Review `description`, `keywords`, and `homepage` in `package.json`.
  `homepage` moves to the deployed site URL. `repository`, `bugs`, `author`, and
  `license` are already correct and change only if evidence says otherwise.
- No metadata is invented for search ranking. A keyword is added only if it
  describes what Forge actually is.
- The package artifact contract is preserved exactly: `files`,
  `scripts/verify-package.mjs`, `allowedPath`, and `requiredPaths` are unchanged,
  and the packed file list stays at the same 17 entries.

### Release

- A `0.1.2` PATCH release through the nine steps of `RELEASING.md`, because
  `README.md` and `package.json` metadata ship in the tarball and the npm page
  cannot be refreshed without publishing.
- `CHANGELOG.md` gains its entries in the pull requests that make the changes,
  under `## [Unreleased]`, per existing policy.
- No new release automation, no publishing from CI, and no change to the
  publication gate as a hard human stop.

### Prototype evidence

- The approved prototype's artboard sources are preserved under `prototypes/`
  as design evidence, labelled as evidence and not as production code.
- The approved direction is recorded under `## Durable Decisions` in
  `context/project-overview.md`, including what the prototype proved must not
  reach production.

## Out of Scope

- Runtime behavior, the public API, CLI behavior, inference, and new providers.
- Release automation, publishing from CI, trusted publishing, and provenance
  attestations.
- Package rename and any change to the package artifact contract.
- A custom domain, a blog, a documentation portal, analytics, and i18n.
- Redesigning or restyling LAMA, Pathfinder, or Lorekeeper.
- Creating a new required branch-protection context. The site build joins the
  existing `CI` aggregate rather than standing beside it.

## Acceptance Criteria

- The identity document exists in `context/` and states the mark, its two size
  states, exact palette values with contrast ratios, the type system, the voice,
  the tagline-by-context rule, and the hallmark rule.
- Every asset named in Requirements exists under `assets/`, and no asset appears
  in `npm pack --dry-run` output.
- The site builds to static output from `site/`, renders correctly at 390px and
  at desktop width, contains every named section, and is reachable at the
  `forge-kit` Vercel production URL.
- `.github/workflows/ci.yml` builds the site on every pull request, the
  aggregate job is still named `CI`, and it fails when either the package matrix
  or the site build fails.
- Every evidence figure shown on the site or in the README is traceable to a
  repository file, a CI run, or the registry.
- `README.md` renders correctly on GitHub and, after publication, on npm: images
  resolve, no broken links, and install and minimal usage are visible early.
- `npm run check`, `npm test`, `npm pack`, and `node scripts/verify-package.mjs`
  pass on the packed tarball, reporting the same 17 files and all eleven named
  checks.
- `forge-local-ai-kit@0.1.2` is published after the human publication gate, the
  registry copy is verified, and `dist-tags.latest` is `0.1.2`.
- The prototype sources are under `prototypes/`, and the approved direction is
  recorded in `context/project-overview.md` under `## Durable Decisions`.

## Notes / Decisions

- Approved 2026-09-18: Forge — The Village Smithy, with the Maker's Mark as the
  identity system and the Quench's accent discipline. Approved with three
  adjustments: warm the iron ground, widen the bronze/ember separation, and use
  the taglines by context.
- The exact warmed iron value and the exact bronze value are implementation
  decisions inside this Feature, constrained by the two approved adjustments and
  by the AA contrast requirement.
- The Vercel project was created and configured as a planning precondition on
  2026-09-19, so the website, README, and repository-presentation tickets can run
  in parallel instead of waiting on a deployment. The expected production URL is
  `https://forge-kit.vercel.app`; Vercel assigns the domain at the first
  deployment, so the website ticket records the real URL and the integration
  ticket reconciles it if it differs.
- Ordering constraint: the README's absolute asset URLs point at `main`. Verified
  2026-09-19 that the repository is public and
  `raw.githubusercontent.com/rikilamadrid/forge/main/<path>` serves `200` for a
  path present on `main` and `404` only for a path that does not exist. Because
  the assets ticket is a hard predecessor merged before the README ticket starts,
  those URLs resolve throughout the README ticket's pull request. This is a
  merge-order constraint inside the Feature, not a ticket edge.
- `vercel link` writes `.vercel/` and a `.env.local` holding an OIDC token, and
  appends `.vercel` and `.env*` to `.gitignore`. That generated `.env*` line sits
  after the existing `!.env.example` negation and therefore shadows it. The
  website ticket must add `.vercel` and `.env.local` by hand, above
  `!.env.example` or as exact entries, and must not accept the generated `.env*`
  rule. None of these files were left in the tree by the planning precondition.
- **The custom GitHub social preview image is optional, decided 2026-09-22.**
  The original requirement stands recorded above and is not withdrawn as a
  wish: a custom card uploaded through repository settings. It is no longer a
  blocking acceptance criterion, for two verified reasons.
  - GitHub exposes no supported mechanism to set it. Checked on 2026-09-22
    against a token holding `repo`, `workflow`, `gist`, and `read:org`, so this
    is a missing capability and not a permissions gap: none of GitHub's 259
    GraphQL mutations matches `opengraph`, `social`, `preview`, or `image`;
    `UpdateRepositoryInput` has no image field; the REST paths
    `/repos/{owner}/{repo}/social-preview`, `/social_preview`,
    `/settings/social-preview`, and `/opengraph` all return `404`; a `PATCH`
    to `/repos/{owner}/{repo}` carrying `social_preview` or `open_graph_image`
    returns `200` and is silently ignored, leaving `usesCustomOpenGraphImage`
    `false`; and `gh repo edit` has no such flag.
  - The only working path is GitHub's own settings form, a
    session-cookie-authenticated browser upload. That is **intentionally
    outside this project's automated workflow**: it cannot be committed,
    reviewed, replayed, or verified by CI, so the Feature does not depend on
    it.
- The revised acceptance criterion for repository presentation is the About
  description, the topics, and the logged-out public page — all verifiable
  through `gh api` and an unauthenticated fetch. Social presentation itself is
  carried by the website's Open Graph metadata, which is version-controlled in
  `site/src/pages/index.astro`, built by the `site` job inside the required
  `CI` check, and served from the canonical production URL
  `https://forge-kit-nu.vercel.app`: `og:image` resolves `200` as `image/png`
  from `assets/og-card.png` on `main`, and `twitter:card` is
  `summary_large_image`.
- The optional human-only follow-up, outside Feature 05: produce a
  GitHub-canvas 1280x640 card and upload it through repository settings.
  `assets/README.md` records that no such asset exists — `og-card.png` is
  1200x630, the Open Graph canvas — and **no 1280x640 asset is to be invented
  to satisfy the earlier wording**. Until someone does both by hand, GitHub
  serves its generated card, which already carries the correct description.
- The repository-presentation ticket changes repository settings and may produce
  no diff. Its completion evidence is a settings read-back and a logged-out check
  of the public repository page, and it must not manufacture a commit to satisfy
  tooling. Integration depends on its store status, not on a merge. It is
  completed directly with `/ticket complete`, outside an orchestrated worker —
  see `## Notes / Decisions` on why.
- Prototype evidence and the durable identity decision live with Brand
  Foundations rather than in a ticket of their own: the approved prototype, the
  rationale, and the resolved values are one body of reasoning.
- Pathfinder canary finding, 2026-09-19: dependency eligibility is store-based —
  `skills/orchestrate/SKILL.md` §The model states the store is the board and
  eligibility is computed "from the configured store and nothing else" — so a
  zero-diff ticket unblocks its dependants correctly. But
  `skills/orchestrate/actions/integrate.md` step 2 finds a claim's pull request
  by its branch and requires green required CI at that pull request's head, and
  steps 5 and 6 merge an approved head. A claimed worker with no commits produces
  no pull request and no head, so it cannot pass integration. The
  repository-presentation ticket is therefore completed directly rather than
  dispatched as an orchestrated worker, and no dummy commit is invented. Record
  this in `context/pathfinder-canary.md`.
