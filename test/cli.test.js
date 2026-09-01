import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../dist/src/cli.js", import.meta.url));

function runCli(arguments_, environment = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...arguments_], {
      env: { PATH: process.env.PATH, ...environment },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("prints usage and exits non-zero for an unsupported invocation", async () => {
  const result = await runCli([]);

  assert.equal(result.code, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Usage: forge ask/);
});

test("validates configuration before network activity", async () => {
  const result = await runCli(["ask", "Review this function"]);

  assert.equal(result.code, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /OLLAMA_HOST is required/);
  assert.doesNotMatch(result.stderr, /at .*cli/);
});

test("prints a generated answer and basic execution evidence", async (context) => {
  let requestBody = "";
  const server = createServer((request, response) => {
    request.setEncoding("utf8");
    request.on("data", (chunk) => (requestBody += chunk));
    request.on("end", () => {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          model: "qwen-test:latest",
          response: "The function can return undefined.",
          done: true,
        }),
      );
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  assert.notEqual(address, null);
  assert.equal(typeof address, "object");

  const result = await runCli(["ask", "Review this function"], {
    OLLAMA_HOST: `http://127.0.0.1:${address.port}`,
    FORGE_MODEL: "qwen-test",
  });

  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /^The function can return undefined\./);
  assert.match(result.stdout, /Provider: ollama/);
  assert.match(result.stdout, /Model: qwen-test:latest/);
  assert.match(result.stdout, /Latency: \d+\.\d ms/);
  assert.deepEqual(JSON.parse(requestBody), {
    model: "qwen-test",
    prompt: "Review this function",
    stream: false,
  });
});
