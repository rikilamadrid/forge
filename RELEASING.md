# Releasing forge-local-ai-kit

This file is the whole release process. Follow it from a clean checkout, in order,
in one shell session. It describes a manual release; nothing is published
automatically.

## Policy

### Versioning

Forge follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While
the major version is `0`:

- **MINOR** (`0.x.0`): a breaking change to the public library API, the CLI
  contract, or the supported Node.js range.
- **PATCH** (`0.x.y`): backward-compatible changes, fixes, packaging changes, and
  documentation that ships in the tarball.

Moving to `1.0.0` is a separate human decision and is not covered here.

### Changelog

- [`CHANGELOG.md`](CHANGELOG.md) is maintained by hand in Keep a Changelog format.
- A pull request that changes user-visible behavior or the shipped artifact adds
  its line under `## [Unreleased]` in that same pull request. Refactors, tests,
  and workflow-only changes need no entry.
- `CHANGELOG.md` is not shipped in the npm package. The GitHub Release carries the
  version's section.

### Versions and tags

- The `version` in `package.json` changes only in a release pull request. Feature
  and ticket pull requests never bump it.
- Release tags are annotated `vX.Y.Z` tags on `main` commits only. A tag reaches
  `origin` only after its package is published and verified.
- `0.1.0` predates tagging and has no tag.

### Package verification

[`scripts/verify-package.mjs`](scripts/verify-package.mjs) is the single
definition of what the package artifact must contain and do. This process runs it
and does not restate its checks.

### Branch protection

`main` requires the `CI` check and requires the branch to be up to date. Merge
only when GitHub considers the pull request mergeable under those rules. Never
use the repository admin bypass, and never pass `--admin` to `gh pr merge`.

## Process

Requirements: Node.js 22+, npm, `git`, and the GitHub CLI (`gh`) authenticated
for `rikilamadrid/forge`. You need an npm account with publish rights only at
step 6.

### 1. Preconditions

```sh
git checkout main
git fetch origin
git status
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" && echo "main is in sync"
gh auth status
gh run list --workflow CI --commit "$(git rev-parse HEAD)"
RELEASE_DIR="$(mktemp -d)" && echo "$RELEASE_DIR"
```

Continue only when:

- `git status` reports a clean working tree and `main is in sync` is printed;
- the `CI` run for this exact commit shows `completed` `success`.

`RELEASE_DIR` holds the release notes and tarballs outside the repository. The
later steps use it, so stay in this shell.

npm authentication is not a precondition. It is checked at the publication gate.

### 2. Release pull request

Choose the bump from the policy above: `patch` or `minor`.

Work out the version the bump produces, and check nothing has claimed it. These
commands only read; nothing is modified yet.

```sh
BUMP=patch   # or: BUMP=minor
VERSION="$(node -p '
const [major, minor, patch] = require("./package.json").version.split(".").map(Number);
process.argv[1] === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
' "$BUMP")" && echo "$VERSION"
git tag -l "v$VERSION"                             # must print nothing
git ls-remote --tags origin "v$VERSION"            # must print nothing
npm view "forge-local-ai-kit@$VERSION" version     # must fail with E404
```

If either tag exists or npm prints a version, that version is already taken.
Stop; nothing has been changed. Otherwise bump the manifest and create the
release branch; the uncommitted bump moves with it:

```sh
npm version "$BUMP" --no-git-tag-version
test "$(node -p 'require("./package.json").version')" = "$VERSION" && echo "manifest is v$VERSION"
git checkout -b "release/v$VERSION"
```

If the bump does not produce `$VERSION`, discard it with
`git restore package.json package-lock.json` and stop.

Move the `Unreleased` entries into a dated section for this version:

```sh
node -e '
const fs = require("node:fs");
const [version, date] = process.argv.slice(1);
const heading = "## [Unreleased]\n";
const text = fs.readFileSync("CHANGELOG.md", "utf8");
if (!text.includes(heading)) throw new Error("CHANGELOG.md has no Unreleased section");
fs.writeFileSync("CHANGELOG.md", text.replace(heading, `${heading}\n## [${version}] - ${date}\n`));
' "$VERSION" "$(date -u +%Y-%m-%d)"
```

Extract that section as the release notes. The command fails if the section is
missing or empty:

```sh
node -e '
const fs = require("node:fs");
const [version] = process.argv.slice(1);
const lines = fs.readFileSync("CHANGELOG.md", "utf8").split("\n");
const start = lines.findIndex((line) => line.startsWith(`## [${version}] - `));
if (start === -1) throw new Error(`CHANGELOG.md has no ${version} section`);
const end = lines.findIndex((line, index) => index > start && line.startsWith("## ["));
const notes = lines.slice(start + 1, end === -1 ? undefined : end).join("\n").trim();
if (notes === "") throw new Error(`the ${version} section is empty`);
process.stdout.write(`${notes}\n`);
' "$VERSION" > "$RELEASE_DIR/release-notes.md" && cat "$RELEASE_DIR/release-notes.md"
```

Review the change before committing anything:

```sh
git status --short
git diff
```

It must touch only `package.json`, `package-lock.json`, and `CHANGELOG.md`. On
the first release from this process, the lockfile's own `version` moving from
`0.0.0` to the new version is expected. Commit only once the diff is what you
expect:

```sh
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): v$VERSION"
git push -u origin "release/v$VERSION"
gh pr create --base main --head "release/v$VERSION" \
  --title "chore(release): v$VERSION" --body-file "$RELEASE_DIR/release-notes.md"
PR="$(gh pr view "release/v$VERSION" --json number -q .number)" && echo "$PR"
gh run watch "$(gh run list --workflow CI --commit "$(gh pr view "$PR" --json headRefOid -q .headRefOid)" --event pull_request --json databaseId -q '.[0].databaseId')" --exit-status
gh pr checks "$PR" --required
```

The run can take a few seconds to appear after a push; if `gh run watch` finds no
run, run it again. Do not use `gh pr checks --watch --required`: the required
`CI` check is only reported after every matrix cell finishes, so that command
exits early. Continue only when the run succeeds and `CI` shows `pass`.

### 3. Merge after human approval

A human approves the release pull request. Then check that GitHub will accept the
merge under the normal protection rules:

```sh
gh pr view "$PR" --json mergeStateStatus
```

If `mergeStateStatus` is `BEHIND`, `main` moved since the branch was created.
Update the branch normally and wait for `CI` again, then re-check:

```sh
gh pr update-branch "$PR"
gh run watch "$(gh run list --workflow CI --commit "$(gh pr view "$PR" --json headRefOid -q .headRefOid)" --event pull_request --json databaseId -q '.[0].databaseId')" --exit-status
gh pr checks "$PR" --required
gh pr view "$PR" --json mergeStateStatus
```

Merge only when `mergeStateStatus` is `CLEAN`:

```sh
gh pr merge "$PR" --squash --delete-branch
git checkout main
git pull --ff-only
test "$(git rev-parse HEAD)" = "$(gh pr view "$PR" --json mergeCommit -q .mergeCommit.oid)" && echo "HEAD is the release commit"
node -p 'require("./package.json").version'
gh run list --workflow CI --commit "$(git rev-parse HEAD)"
```

The push run for the merge commit can take a few seconds to appear. Watch it to
the end:

```sh
gh run watch "$(gh run list --workflow CI --commit "$(git rev-parse HEAD)" --event push --json databaseId -q '.[0].databaseId')" --exit-status
```

Continue only when `HEAD is the release commit` is printed, the version is
`$VERSION`, and the `CI` run for this commit succeeded.

### 4. Tag locally

```sh
git tag -a "v$VERSION" -m "forge-local-ai-kit v$VERSION"
git cat-file -t "v$VERSION"            # must print: tag
git rev-parse "v$VERSION^{commit}"     # must equal the release commit
```

Do not push the tag yet. It reaches `origin` in step 9, after publication is
verified.

### 5. Verify the artifact

Build and pack from the tagged commit, with nothing left over from earlier work:

```sh
rm -rf dist node_modules && npm ci && npm test && npm pack --pack-destination "$RELEASE_DIR" && node scripts/verify-package.mjs "$RELEASE_DIR/forge-local-ai-kit-$VERSION.tgz"
TARBALL="$RELEASE_DIR/forge-local-ai-kit-$VERSION.tgz"
shasum -a 1 "$TARBALL"
tar -tzf "$TARBALL" | wc -l
git status --short                     # must print nothing
```

Continue only when the script ends with `verify-package: OK`. Record the
tarball's shasum and file count; step 8 compares the registry against them.

### 6. Publication gate — stop here

**This is a hard stop.** Publishing cannot be undone in practice: npm restricts
unpublishing and the version number is claimed permanently. Approving the release
pull request did not approve publication.

Check npm authentication now, immediately before publishing:

```sh
npm whoami
```

If it prints no account, a human runs `npm login --auth-type=web` and then
`npm whoami` again.

Report to the human, and wait for their explicit approval to publish:

- the version, the release commit, and the local tag `v$VERSION`;
- the tarball path, shasum, and file count from step 5;
- the `verify-package: OK` result;
- the npm account from `npm whoami`.

Do not continue without that approval.

If publication is declined, delete the local tag and stop. The release ends here.
`main` still carries the unpublished version; what happens to it next is the
human's decision.

```sh
git tag -d "v$VERSION"
```

### 7. Publish the verified tarball

Publish the tarball verified in step 5, not a fresh pack:

```sh
npm publish "$TARBALL"
```

### 8. Verify the published package

The registry can take a minute to serve a new version. Re-run a command that
reports the version as not found rather than continuing past it.

```sh
npm view "forge-local-ai-kit@$VERSION" dist.shasum dist.fileCount
npm view forge-local-ai-kit dist-tags.latest
mkdir "$RELEASE_DIR/registry"
npm pack "forge-local-ai-kit@$VERSION" --prefer-online --pack-destination "$RELEASE_DIR/registry"
shasum -a 1 "$RELEASE_DIR/registry/forge-local-ai-kit-$VERSION.tgz"
node scripts/verify-package.mjs "$RELEASE_DIR/registry/forge-local-ai-kit-$VERSION.tgz"
```

Continue only when:

- `dist.shasum` and the fetched tarball's shasum both equal the shasum recorded in
  step 5, and `dist.fileCount` equals the recorded file count;
- `dist-tags.latest` is `$VERSION`;
- the script ends with `verify-package: OK` for the fetched tarball.

If any check fails, stop and report it to the human. Do not push the tag.

### 9. Push the tag and create the GitHub Release

```sh
git push origin "v$VERSION"
gh release create "v$VERSION" --verify-tag --title "v$VERSION" --notes-file "$RELEASE_DIR/release-notes.md"
gh release view "v$VERSION"
```

`--verify-tag` makes `gh` refuse to create the release unless the pushed tag
already exists, so GitHub never creates a lightweight tag of its own.

The release is complete. Remove the working directory:

```sh
rm -rf "$RELEASE_DIR"
```
