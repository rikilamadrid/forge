# Forge terminal identity acceptance

The four-row punch is Forge's existing approved struck F geometry, now visible on
`forge --help` and interactive no-argument invocation (`npx forge-local-ai-kit`).
One blank line follows the identity, then Forge's one line of voice, taken from the
approved README description: “Forge calls language models running on machines you
control.” Piped help has neither.
The bronze punch and steel lower bar are product-owned; Wonder Wagon owns layout,
capability detection, name/version/serial placement, and narrow stacking.

`*.ansi` files are actual CLI stdout captured through a PTY with the stated width.
`*.txt` files remove SGR escapes and normalize PTY CRLF. The manifest records
commands, environment overrides, dimensions, checksums, and contract comparisons.
Wide, 32-column, NO_COLOR, ASCII, ANSI-256, ANSI-16, TERM=dumb, no-argument, and
successful command specimens are included. The success specimen uses an explicit
local HTTP Ollama fixture and fixed measurement clock, not real model inference.

Run after `npm run build`:

```sh
python3 scripts/terminal/capture.py --baseline /path/to/main/dist/src/cli.js \
  --baseline-revision 14a4fcf79a0f70c4e2a7c825c6b2446e1ad0d798
```

The baseline must retain its package manifest two directories above `cli.js`.
`contract-proof.json` records 60 pipe comparisons of exact stdout bytes, stderr
bytes, and exit status against that baseline: no-argument usage, help, help with
`--json`, version, invalid command (plain and JSON), bare `--json`, missing prompt,
unconfigured `ask` (the configuration failure, plain and JSON), and a successful
human and JSON result, each under normal, `FORCE_COLOR=3`, `NO_COLOR`,
`WW_ASCII=1`, and `TERM=dumb`. Configured runs share the local fixture and fixed
measurement clock; no output bytes are normalized.

Full tests cover configuration failures, JSON failures, public API boundaries,
capability behavior, tiny widths, and clean consumer tarball installation. There
are no package/version/dependency changes. `--help --json` retains its historical
help precedence and now suppresses human identity in a TTY as well as in a pipe.
Human no-argument invocation intentionally opens help with exit 0; its non-TTY
usage error and exit 1 are unchanged. Answer and error rendering are unchanged.
