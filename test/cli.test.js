import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../dist/src/cli.js", import.meta.url));
const packageVersion = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
).version;

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

async function withServer(context, response) {
  let requestBody = "";
  const server = createServer((request, outgoing) => {
    request.setEncoding("utf8");
    request.on("data", (chunk) => (requestBody += chunk));
    request.on("end", () => {
      outgoing.writeHead(response.status ?? 200, {
        "content-type": response.contentType ?? "application/json",
      });
      outgoing.end(response.body);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  assert.notEqual(address, null);
  assert.equal(typeof address, "object");
  return {
    environment: {
      OLLAMA_HOST: `http://127.0.0.1:${address.port}`,
      FORGE_MODEL: "qwen-test",
    },
    requestBody: () => requestBody,
  };
}

const successPayload = {
  model: "qwen-test:latest",
  response: "The function can return undefined.",
  done: true,
  total_duration: 5_250_000_000,
  load_duration: 250_000_000,
  prompt_eval_count: 12,
  prompt_eval_duration: 300_000_000,
  eval_count: 24,
  eval_duration: 4_000_000_000,
};

test("prints help and exits zero without reaching configuration", async () => {
  // No OLLAMA_HOST: reaching configuration loading would fail non-zero, so a
  // clean exit proves --help is served before configuration and the network.
  const result = await runCli(["--help"]);

  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /forge ask "<prompt>" \[--json\]/);
  assert.match(result.stdout, /--help/);
  assert.match(result.stdout, /--version/);
  assert.match(result.stdout, /OLLAMA_HOST/);
  assert.match(result.stdout, /FORGE_MODEL/);
  assert.match(result.stdout, /FORGE_TIMEOUT_MS/);
});

test("prints the manifest version and exits zero without reaching configuration", async () => {
  const result = await runCli(["--version"]);

  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.equal(result.stdout, `${packageVersion}\n`);
});

test("serves --version even when combined with other arguments", async () => {
  const result = await runCli(["ask", "Review this function", "--version"]);

  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.equal(result.stdout, `${packageVersion}\n`);
});

test("prints categorized usage and exits non-zero", async () => {
  const result = await runCli([]);

  assert.equal(result.code, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    'Forge error [usage]: Usage: forge ask "<prompt>" [--json]\n',
  );
});

test("validates configuration before network activity", async () => {
  const result = await runCli(["ask", "Review this function"]);

  assert.equal(result.code, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Forge error \[configuration\]/);
  assert.match(result.stderr, /OLLAMA_HOST is required/);
  assert.doesNotMatch(result.stderr, /at .*cli/);
});

test("applies the configured finite timeout and preserves JSON failure shape", async (context) => {
  const server = createServer(() => {});
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const address = server.address();
  assert.notEqual(address, null);
  assert.equal(typeof address, "object");

  const result = await runCli(["ask", "Review this function", "--json"], {
    OLLAMA_HOST: `http://127.0.0.1:${address.port}`,
    FORGE_MODEL: "qwen-test",
    FORGE_TIMEOUT_MS: "5",
  });

  assert.equal(result.code, 1);
  assert.equal(result.stderr, "");
  const failure = JSON.parse(result.stdout);
  assert.deepEqual(
    {
      ...failure,
      evidence: { ...failure.evidence, clientLatencyMs: 0 },
    },
    {
      success: false,
      error: {
        category: "timeout",
        message: "Ollama request timed out after 5 ms.",
      },
      evidence: {
        provider: "ollama",
        model: "qwen-test",
        clientLatencyMs: 0,
      },
    },
  );
  assert.equal(typeof failure.evidence.clientLatencyMs, "number");
});

test("prints the exact human-readable success contract", async (context) => {
  const server = await withServer(context, {
    body: JSON.stringify(successPayload),
  });
  const result = await runCli(
    ["ask", "Review this function"],
    server.environment,
  );

  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.match(
    result.stdout,
    /^The function can return undefined\.\n\nProvider: ollama\nModel: qwen-test:latest\nClient latency: \d+\.\d ms\nTokens: prompt 12 \| completion 24 \| total 36\nOllama timings:\n  Total: 5250\.0 ms\n  Load: 250\.0 ms\n  Prompt evaluation: 300\.0 ms\n  Completion evaluation: 4000\.0 ms\n$/,
  );
  assert.deepEqual(JSON.parse(server.requestBody()), {
    model: "qwen-test",
    prompt: "Review this function",
    stream: false,
  });
});

test("prints exactly one JSON success object", async (context) => {
  const server = await withServer(context, {
    body: JSON.stringify(successPayload),
  });
  const result = await runCli(
    ["ask", "Review this function", "--json"],
    server.environment,
  );

  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.equal(result.stdout.trim().split("\n").length, 1);
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(
    { ...parsed, metrics: { ...parsed.metrics, clientLatencyMs: 0 } },
    {
      success: true,
      provider: "ollama",
      model: "qwen-test:latest",
      output: "The function can return undefined.",
      metrics: {
        clientLatencyMs: 0,
        promptTokens: 12,
        completionTokens: 24,
        totalTokens: 36,
        totalDurationMs: 5250,
        loadDurationMs: 250,
        promptEvalDurationMs: 300,
        completionEvalDurationMs: 4000,
      },
    },
  );
  assert.equal(typeof parsed.metrics.clientLatencyMs, "number");
});

test("prints exactly one JSON failure object and exits non-zero", async () => {
  const result = await runCli(["ask", "Review this function", "--json"]);

  assert.equal(result.code, 1);
  assert.equal(result.stderr, "");
  assert.equal(result.stdout.trim().split("\n").length, 1);
  assert.deepEqual(JSON.parse(result.stdout), {
    success: false,
    error: {
      category: "configuration",
      message: "OLLAMA_HOST is required. Set it to the Ollama API base URL.",
    },
    evidence: {},
  });
});

test("routes usage failures to JSON when --json is requested", async () => {
  const result = await runCli(["ask", "", "--json"]);

  assert.equal(result.code, 1);
  assert.equal(result.stderr, "");
  assert.equal(result.stdout.trim().split("\n").length, 1);
  assert.deepEqual(JSON.parse(result.stdout), {
    success: false,
    error: {
      category: "usage",
      message: 'Usage: forge ask "<prompt>" [--json]',
    },
    evidence: {},
  });
});

test("rejects --json standing in for the prompt", async () => {
  const result = await runCli(["ask", "--json"]);

  assert.equal(result.code, 1);
  assert.equal(result.stderr, "");
  assert.deepEqual(JSON.parse(result.stdout), {
    success: false,
    error: {
      category: "usage",
      message: 'Usage: forge ask "<prompt>" [--json]',
    },
    evidence: {},
  });
});

test("reports unavailable timings without inventing rows", async (context) => {
  const server = await withServer(context, {
    body: JSON.stringify({
      model: "qwen-test:latest",
      response: "The function can return undefined.",
      done: true,
    }),
  });
  const result = await runCli(
    ["ask", "Review this function"],
    server.environment,
  );

  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.match(
    result.stdout,
    /^The function can return undefined\.\n\nProvider: ollama\nModel: qwen-test:latest\nClient latency: \d+\.\d ms\nTokens: prompt unavailable \| completion unavailable \| total unavailable\nOllama timings: unavailable\n$/,
  );
});

test("presents provider failures without a stack trace or private host", async (context) => {
  const server = await withServer(context, {
    status: 404,
    body: JSON.stringify({ error: "model is unavailable" }),
  });
  const result = await runCli(
    ["ask", "Review this function"],
    server.environment,
  );

  assert.equal(result.code, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    "Forge error [provider]: Ollama reported an error: model is unavailable\n",
  );
  assert.doesNotMatch(result.stderr, /127\.0\.0\.1|at .*cli/);
});
