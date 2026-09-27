# Pinned Wonder Wagon compiler

`cli.mjs` is a verbatim copy of Wonder Wagon's built `packages/foundation/dist/cli.js`
at `rikilamadrid/wonder-wagon-ui@323d9accce129640c6e31d1ac67ca4162913f26f`
(PR #11, "add the family doorway and responsive identity layout"). It is
build-time tooling only: the npm package allowlist excludes `scripts/`, and the
generated runtime identity has no imports. The MIT license is included.

SHA-256: `b4f03d89b8abd5d8f060ee6448b592666c48b8f4e777f19accbe1b9c11608e7e`.
To verify, check out that commit, run `bun install && bun run build` in the
repository root, and hash `packages/foundation/dist/cli.js`.

The `layout: "responsive"` generator option is opt-in. Wonder Wagon's default
renderer bytes are frozen. This source pin lets Forge adopt the shared narrow
layout without an unreleased registry dependency or a version bump. When a
published `wonder-wagon-ui` contains this API, switch the compiler import back to
`wonder-wagon-ui/cli`, delete this pin, and confirm the drift check passes.
