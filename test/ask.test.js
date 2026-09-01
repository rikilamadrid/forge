import assert from "node:assert/strict";
import test from "node:test";

import { ask } from "../dist/src/ask.js";

test("delegates a prompt through the provider contract", async () => {
  const observed = [];
  const provider = {
    async generate(request) {
      observed.push(request);
      return {
        success: true,
        provider: "test-provider",
        model: "test-model",
        output: "Useful review",
        metrics: { clientLatencyMs: 12 },
      };
    },
  };

  const result = await ask(provider, "Review this function");

  assert.deepEqual(observed, [{ prompt: "Review this function" }]);
  assert.equal(result.output, "Useful review");
});

test("rejects an empty prompt before calling the provider", async () => {
  let called = false;
  const provider = {
    async generate() {
      called = true;
      throw new Error("should not run");
    },
  };

  await assert.rejects(ask(provider, "   "), /Prompt must not be empty/);
  assert.equal(called, false);
});
