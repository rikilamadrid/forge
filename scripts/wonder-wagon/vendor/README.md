# Pinned Wonder Wagon compiler

`cli.mjs` is an exact copy of Wonder Wagon's built `packages/foundation/dist/cli.js`
from the parallel terminal-family-identity change. It is build-time tooling only;
the npm package allowlist excludes `scripts/`, and generated runtime identity has
no imports. MIT license is included. Upstream commit provenance will be recorded
before this branch merges.

SHA-256: `8b985538461158673eeaf087e0b6745f310d09910196cd404d35a3e47594d6f5`.

The new `layout: "responsive"` generator option is intentionally opt-in. Published
Wonder Wagon 0.1.0 default renderer bytes are frozen. This source pin lets Forge
adopt shared narrow layout without an unreleased registry dependency or a version
bump. When a Wonder Wagon release contains this exact API, switch the compiler
import back to `wonder-wagon-ui/cli` and delete this source pin after drift checks.
