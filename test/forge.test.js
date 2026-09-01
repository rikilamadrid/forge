import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { createForge, ForgeError } from "../dist/src/index.js";

test("the root exposes only the approved runtime API", async () => {
  const root = await import("../dist/src/index.js");

  assert.deepEqual(Object.keys(root).sort(), ["ForgeError", "createForge"]);
  assert.equal(typeof createForge, "function");
  assert.equal(ForgeError.prototype instanceof Error, true);
});

test("createForge validates public configuration at the boundary", () => {
  assert.throws(
    () =>
      createForge({
        provider: "ollama",
        host: "file:///tmp/ollama",
        model: "qwen-test",
      }),
    (error) =>
      error instanceof ForgeError && error.category === "configuration",
  );
});

test("a pre-aborted public request rejects with structured cancellation", async () => {
  const forge = createForge({
    provider: "ollama",
    host: "http://127.0.0.1:1",
    model: "qwen-test",
  });
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    forge.ask("Review this function", { signal: controller.signal }),
    (error) =>
      error instanceof ForgeError &&
      error.category === "aborted" &&
      error.evidence.provider === "ollama" &&
      error.evidence.model === "qwen-test",
  );
});

test("the public timeout remains distinct from caller cancellation", async (context) => {
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
  const forge = createForge({
    provider: "ollama",
    host: `http://127.0.0.1:${address.port}`,
    model: "qwen-test",
    timeoutMs: 5,
  });

  await assert.rejects(
    forge.ask("Review this function"),
    (error) => error instanceof ForgeError && error.category === "timeout",
  );
});
