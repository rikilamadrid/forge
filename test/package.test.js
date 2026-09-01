import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";

const execute = promisify(execFile);
const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const compiler = fileURLToPath(
  new URL("../node_modules/typescript/bin/tsc", import.meta.url),
);

const successPayload = {
  model: "qwen-test:latest",
  response: "Installed package works.",
  done: true,
  prompt_eval_count: 3,
  eval_count: 4,
};

test("the packed artifact works for a clean external consumer", async (context) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "forge-package-test-"));
  context.after(() => rm(temporaryRoot, { recursive: true, force: true }));
  const packDirectory = join(temporaryRoot, "packed");
  const consumerDirectory = join(temporaryRoot, "consumer");
  const npmEnvironment = {
    ...process.env,
    npm_config_cache: join(temporaryRoot, "npm-cache"),
  };
  await mkdir(packDirectory);
  await mkdir(consumerDirectory);

  const packed = await execute(
    "npm",
    ["pack", "--json", "--pack-destination", packDirectory],
    { cwd: packageRoot, env: npmEnvironment },
  );
  const [artifact] = JSON.parse(packed.stdout);
  assert.notEqual(artifact, undefined);
  const tarball = join(packDirectory, artifact.filename);
  const packedFiles = artifact.files.map((file) => file.path).sort();

  assert.ok(packedFiles.includes("dist/src/index.js"));
  assert.ok(packedFiles.includes("dist/src/index.d.ts"));
  assert.ok(packedFiles.includes("dist/src/cli.js"));
  assert.ok(packedFiles.includes("README.md"));
  assert.ok(packedFiles.includes("package.json"));
  for (const path of packedFiles) {
    assert.match(
      path,
      /^(README\.md|package\.json|dist\/src\/(?:.+\/)?[^/]+\.(?:js|d\.ts))$/,
      `unexpected packed file: ${path}`,
    );
  }
  assert.equal(
    packedFiles.some((path) =>
      /^(?:src|test|context|skills|\.env)(?:\/|$)/.test(path),
    ),
    false,
  );

  const tar = await execute("tar", ["-tf", tarball]);
  const archivedFiles = tar.stdout
    .trim()
    .split("\n")
    .map((path) => path.replace(/^package\//, ""))
    .sort();
  assert.deepEqual(archivedFiles, packedFiles);

  await writeFile(
    join(consumerDirectory, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await execute(
    "npm",
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
    { cwd: consumerDirectory, env: npmEnvironment },
  );

  const installedManifest = JSON.parse(
    await readFile(
      join(
        consumerDirectory,
        "node_modules",
        "forge-local-ai-kit",
        "package.json",
      ),
      "utf8",
    ),
  );
  assert.equal(installedManifest.private, true);
  assert.deepEqual(installedManifest.dependencies, {});
  assert.deepEqual(installedManifest.exports, {
    ".": {
      types: "./dist/src/index.d.ts",
      import: "./dist/src/index.js",
    },
  });
  assert.equal("require" in installedManifest.exports["."], false);

  await writeFile(
    join(consumerDirectory, "consumer.ts"),
    `import { createForge, ForgeError, type CreateForgeOptions, type FailureEvidence, type Forge, type ForgeAskOptions, type ForgeErrorCategory, type InferenceMetrics, type InferenceResult } from "forge-local-ai-kit";

const options: CreateForgeOptions = { provider: "ollama", host: "http://127.0.0.1:11434", model: "qwen-test" };
const forge: Forge = createForge(options);
const askOptions: ForgeAskOptions = { signal: new AbortController().signal };
const result: Promise<InferenceResult> = forge.ask("hello", askOptions);
const category: ForgeErrorCategory = "aborted";
const metrics: InferenceMetrics = { clientLatencyMs: 1 };
const evidence: FailureEvidence = { provider: "ollama" };
const error: ForgeError = new ForgeError(category, "cancelled", { evidence });
void [result, metrics, error];
`,
  );
  await writeFile(
    join(consumerDirectory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2023",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        lib: ["ES2023", "DOM"],
        strict: true,
        noEmit: true,
      },
      include: ["consumer.ts"],
    }),
  );
  await execute(process.execPath, [compiler, "-p", "tsconfig.json"], {
    cwd: consumerDirectory,
  });

  await assert.rejects(
    execute(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        'await import("forge-local-ai-kit/dist/src/inference.js")',
      ],
      { cwd: consumerDirectory },
    ),
    (error) => /ERR_PACKAGE_PATH_NOT_EXPORTED/.test(error.stderr),
  );

  let requests = 0;
  const server = createServer((request, response) => {
    requests += 1;
    request.resume();
    request.on("end", () => {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(successPayload));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  assert.notEqual(address, null);
  assert.equal(typeof address, "object");
  const host = `http://127.0.0.1:${address.port}`;

  const imported = await execute(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `import * as root from "forge-local-ai-kit";
const forge = root.createForge({ provider: "ollama", host: ${JSON.stringify(host)}, model: "qwen-test" });
const result = await forge.ask("from external consumer");
console.log(JSON.stringify({ exports: Object.keys(root).sort(), result }));`,
    ],
    { cwd: consumerDirectory },
  );
  const importedResult = JSON.parse(imported.stdout);
  assert.deepEqual(importedResult.exports, ["ForgeError", "createForge"]);
  assert.equal(importedResult.result.output, "Installed package works.");

  const cli = await execute(
    join(consumerDirectory, "node_modules", ".bin", "forge"),
    ["ask", "from installed cli", "--json"],
    {
      cwd: consumerDirectory,
      env: {
        ...process.env,
        OLLAMA_HOST: host,
        FORGE_MODEL: "qwen-test",
      },
    },
  );
  assert.equal(JSON.parse(cli.stdout).output, "Installed package works.");
  assert.equal(requests, 2);
});
