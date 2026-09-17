#!/usr/bin/env node
// Verify a packed forge-local-ai-kit tarball before it is trusted.
//
// This script is the single source of truth for what the package artifact must
// contain and do. CI and RELEASING.md invoke it; neither restates its rules.
//
// Usage: node scripts/verify-package.mjs <path-to-tarball>
//
// Every check has a name. The first failing check is reported to stderr as
// `verify-package: FAIL <name> — <detail>` and the process exits 1.

import { execFile } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const packageRoot = fileURLToPath(new URL("../", import.meta.url));

// The complete list of what may ship. Anything else is a leak.
const allowedPath =
  /^(README\.md|LICENSE|package\.json|dist\/src\/(?:.+\/)?[^/]+\.(?:js|d\.ts))$/;
const requiredPaths = [
  "dist/src/index.js",
  "dist/src/index.d.ts",
  "dist/src/cli.js",
  "README.md",
  "LICENSE",
  "package.json",
];
const expectedRootExports = ["ForgeError", "createForge"];
const internalSubpath = "forge-local-ai-kit/dist/src/config.js";

class VerificationError extends Error {
  constructor(name, detail) {
    super(detail);
    this.name = name;
  }
}

// Child-process failures carry whole stack traces; keep the line that says why.
function summarize(error) {
  const text = `${error.stderr ?? ""}`.trim() || error.message;
  const reason = text.match(/^.*Error(?: \[[A-Z_]+\])?: .*$/m);
  return reason ? reason[0].trim() : text.split("\n")[0];
}

function check(condition, name, detail) {
  if (!condition) {
    throw new VerificationError(name, detail);
  }
  console.log(`ok ${name}`);
}

async function listTarball(tarball) {
  const { stdout } = await execute("tar", ["-tf", tarball]);
  return stdout
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((path) => path.replace(/^package\//, ""))
    .sort();
}

async function readTarballManifest(tarball) {
  const { stdout } = await execute("tar", ["-xOf", tarball, "package/package.json"]);
  return JSON.parse(stdout);
}

async function verifyContents(tarball) {
  const files = await listTarball(tarball);
  const unexpected = files.filter((path) => !allowedPath.test(path));
  check(
    unexpected.length === 0,
    "file-allowlist",
    `unexpected packaged file(s): ${unexpected.join(", ")}`,
  );
  const missing = requiredPaths.filter((path) => !files.includes(path));
  check(
    missing.length === 0,
    "required-entry-points",
    `missing required file(s): ${missing.join(", ")}`,
  );
  return files;
}

async function verifyManifest(tarball) {
  const manifest = await readTarballManifest(tarball);
  const repository = JSON.parse(
    await readFile(join(packageRoot, "package.json"), "utf8"),
  );
  check(
    manifest.name === "forge-local-ai-kit",
    "manifest-name",
    `expected name forge-local-ai-kit, found ${manifest.name}`,
  );
  check(
    manifest.license === "MIT",
    "manifest-license",
    `expected license MIT, found ${manifest.license}`,
  );
  check(
    !("private" in manifest),
    "manifest-private",
    "the packaged manifest still carries a private field",
  );
  check(
    JSON.stringify(manifest.dependencies ?? {}) === "{}",
    "manifest-dependencies",
    `expected no production dependencies, found ${JSON.stringify(manifest.dependencies)}`,
  );
  check(
    manifest.version === repository.version,
    "manifest-version",
    `packaged version ${manifest.version} differs from repository version ${repository.version}`,
  );
  return manifest;
}

async function verifyConsumer(tarball, version) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "forge-verify-package-"));
  try {
    const consumer = join(temporaryRoot, "consumer");
    const environment = {
      ...process.env,
      npm_config_cache: join(temporaryRoot, "npm-cache"),
    };
    await mkdir(consumer);
    await writeFile(
      join(consumer, "package.json"),
      JSON.stringify({ private: true, type: "module" }),
    );

    await execute(
      "npm",
      ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
      { cwd: consumer, env: environment },
    ).then(
      () => check(true, "consumer-install", ""),
      (error) => check(false, "consumer-install", summarize(error)),
    );

    const imported = await execute(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        'import * as root from "forge-local-ai-kit"; console.log(JSON.stringify(Object.keys(root).sort()));',
      ],
      { cwd: consumer },
    ).catch((error) => check(false, "root-import", `root import failed: ${summarize(error)}`));
    const exportsFound = JSON.parse(imported.stdout);
    check(
      JSON.stringify(exportsFound) === JSON.stringify(expectedRootExports),
      "root-import",
      `expected root exports ${expectedRootExports.join(", ")}, found ${exportsFound.join(", ")}`,
    );

    const subpath = await execute(
      process.execPath,
      ["--input-type=module", "--eval", `await import(${JSON.stringify(internalSubpath)});`],
      { cwd: consumer },
    ).then(
      () => ({ refused: false, stderr: "" }),
      (error) => ({ refused: true, stderr: error.stderr ?? "" }),
    );
    check(
      subpath.refused && /ERR_PACKAGE_PATH_NOT_EXPORTED/.test(subpath.stderr),
      "subpath-refused",
      subpath.refused
        ? `${internalSubpath} failed for another reason: ${subpath.stderr.trim()}`
        : `${internalSubpath} was importable; internal subpaths must be refused`,
    );

    const bin = await execute(join(consumer, "node_modules", ".bin", "forge"), ["--version"], {
      cwd: consumer,
    }).catch((error) => check(false, "bin-version", `forge --version failed: ${summarize(error)}`));
    check(
      bin.stdout.trim() === version,
      "bin-version",
      `forge --version printed ${bin.stdout.trim()}, expected ${version}`,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function main(argv) {
  const [target] = argv;
  if (target === undefined) {
    console.error("usage: node scripts/verify-package.mjs <path-to-tarball>");
    return 2;
  }
  const tarball = resolve(target);
  try {
    await access(tarball).catch(() =>
      check(false, "tarball-exists", `no file at ${tarball}`),
    );
    const files = await verifyContents(tarball);
    const manifest = await verifyManifest(tarball);
    await verifyConsumer(tarball, manifest.version);
    console.log(
      `verify-package: OK ${tarball} (${files.length} files, ${manifest.name}@${manifest.version})`,
    );
    return 0;
  } catch (error) {
    if (error instanceof VerificationError) {
      console.error(`verify-package: FAIL ${error.name} — ${error.message}`);
      return 1;
    }
    throw error;
  }
}

process.exitCode = await main(process.argv.slice(2));
