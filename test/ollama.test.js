import assert from "node:assert/strict";
import test from "node:test";

import { OllamaProvider } from "../dist/src/providers/ollama.js";

function provider(options = {}) {
  return new OllamaProvider({
    host: "http://ollama.test:11434",
    model: "qwen-test",
    ...options,
  });
}

async function rejectsWith(promise, expected) {
  await assert.rejects(promise, (error) => {
    for (const [key, value] of Object.entries(expected)) {
      assert.deepEqual(error[key], value);
    }
    return true;
  });
}

test("maps a non-streaming response and every available metric", async () => {
  const calls = [];
  const times = [100, 142.5];
  const ollama = provider({
    now: () => times.shift(),
    fetch: async (input, init) => {
      calls.push({ input: input.toString(), init });
      return new Response(
        JSON.stringify({
          model: "qwen-test:latest",
          response: "A useful answer",
          done: true,
          total_duration: 5_250_000_000,
          load_duration: 250_000_000,
          prompt_eval_count: 12,
          prompt_eval_duration: 300_000_000,
          eval_count: 24,
          eval_duration: 4_000_000_000,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  });

  const result = await ollama.generate({ prompt: "Review this function" });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].input, "http://ollama.test:11434/api/generate");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    model: "qwen-test",
    prompt: "Review this function",
    stream: false,
  });
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(result, {
    success: true,
    provider: "ollama",
    model: "qwen-test:latest",
    output: "A useful answer",
    metrics: {
      clientLatencyMs: 42.5,
      promptTokens: 12,
      completionTokens: 24,
      totalTokens: 36,
      totalDurationMs: 5250,
      loadDurationMs: 250,
      promptEvalDurationMs: 300,
      completionEvalDurationMs: 4000,
    },
  });
});

test("omits unavailable optional metrics instead of inventing zeros", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () =>
      new Response(
        JSON.stringify({
          model: "qwen-test",
          response: "A useful answer",
          done: true,
          prompt_eval_count: 0,
        }),
      ),
  });

  const result = await ollama.generate({ prompt: "Review this function" });

  assert.deepEqual(result.metrics, {
    clientLatencyMs: 0,
    promptTokens: 0,
  });
  assert.equal("totalTokens" in result.metrics, false);
});

test("categorizes a provider-reported failure", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () =>
      new Response(JSON.stringify({ error: "model is unavailable" }), {
        status: 404,
      }),
  });

  await rejectsWith(ollama.generate({ prompt: "Review this function" }), {
    category: "provider",
    statusCode: 404,
  });
});

test("categorizes a non-success HTTP response without provider details", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () => new Response("not json", { status: 502 }),
  });

  await rejectsWith(ollama.generate({ prompt: "Review this function" }), {
    category: "http",
    statusCode: 502,
  });
});

test("categorizes malformed success JSON as an invalid response", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () => new Response("not json", { status: 200 }),
  });

  await rejectsWith(ollama.generate({ prompt: "Review this function" }), {
    category: "invalid_response",
  });
});

test("rejects incomplete or invalid success fields", async () => {
  const incomplete = provider({
    now: () => 10,
    fetch: async () => new Response(JSON.stringify({ done: true })),
  });
  const invalidMetric = provider({
    now: () => 10,
    fetch: async () =>
      new Response(
        JSON.stringify({
          model: "qwen-test",
          response: "answer",
          done: true,
          eval_count: -1,
        }),
      ),
  });

  await rejectsWith(incomplete.generate({ prompt: "Review this function" }), {
    category: "invalid_response",
  });
  await rejectsWith(invalidMetric.generate({ prompt: "Review this function" }), {
    category: "invalid_response",
  });
});

test("categorizes a network refusal without exposing the host", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () => {
      throw new Error("connect ECONNREFUSED http://ollama.test:11434");
    },
  });

  await assert.rejects(
    ollama.generate({ prompt: "Review this function" }),
    (error) => {
      assert.equal(error.category, "network");
      assert.doesNotMatch(error.message, /ollama\.test/);
      return true;
    },
  );
});

test("categorizes a configured request timeout", async () => {
  const ollama = provider({
    timeoutMs: 1,
    fetch: async (_input, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(new Error("aborted")));
      }),
  });

  await rejectsWith(ollama.generate({ prompt: "Review this function" }), {
    category: "timeout",
  });
});

// Payload shape observed live against qwen3.5:9b: `thinking` is a sibling of
// `response`, and a turn truncated before it produced a visible answer still
// returns `done: true` with `done_reason: "length"`.
function thinkingOnlyPayload(extra = {}) {
  return {
    model: "qwen-test",
    response: "",
    thinking: "SECRET-REASONING chain of thought that must never be surfaced",
    done: true,
    prompt_eval_count: 24,
    eval_count: 20,
    ...extra,
  };
}

test("reports a thinking-only turn as an empty response, not an invalid one", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () =>
      new Response(JSON.stringify(thinkingOnlyPayload({ done_reason: "length" }))),
  });

  await assert.rejects(
    ollama.generate({ prompt: "Explain quicksort" }),
    (error) => {
      assert.equal(error.category, "empty_response");
      assert.equal(error.evidence.doneReason, "length");
      assert.equal(error.evidence.provider, "ollama");
      assert.equal(error.evidence.model, "qwen-test");
      return true;
    },
  );
});

test("never surfaces hidden reasoning content in an empty response failure", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () =>
      new Response(JSON.stringify(thinkingOnlyPayload({ done_reason: "length" }))),
  });

  await assert.rejects(
    ollama.generate({ prompt: "Explain quicksort" }),
    (error) => {
      assert.doesNotMatch(error.message, /SECRET-REASONING/);
      assert.equal(
        JSON.stringify(error.evidence).includes("SECRET-REASONING"),
        false,
      );
      return true;
    },
  );
});

test("treats a whitespace-only response as an empty response", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () =>
      new Response(
        JSON.stringify(thinkingOnlyPayload({ response: " \n\t ", done_reason: "stop" })),
      ),
  });

  await rejectsWith(ollama.generate({ prompt: "Explain quicksort" }), {
    category: "empty_response",
  });
});

test("omits doneReason from evidence when Ollama does not report one", async () => {
  const ollama = provider({
    now: () => 10,
    fetch: async () => new Response(JSON.stringify(thinkingOnlyPayload())),
  });

  await assert.rejects(
    ollama.generate({ prompt: "Explain quicksort" }),
    (error) => {
      assert.equal(error.category, "empty_response");
      assert.equal("doneReason" in error.evidence, false);
      return true;
    },
  );
});

test("keeps a malformed payload distinct from an empty response", async () => {
  const missingResponseField = provider({
    now: () => 10,
    fetch: async () =>
      new Response(JSON.stringify({ model: "qwen-test", done: true })),
  });
  const unfinishedTurn = provider({
    now: () => 10,
    fetch: async () =>
      new Response(JSON.stringify({ ...thinkingOnlyPayload(), done: false })),
  });

  await rejectsWith(missingResponseField.generate({ prompt: "Explain quicksort" }), {
    category: "invalid_response",
  });
  await rejectsWith(unfinishedTurn.generate({ prompt: "Explain quicksort" }), {
    category: "invalid_response",
  });
});

test("still succeeds when a reasoning model returns a short visible answer", async () => {
  const ollama = provider({
    now: () => {
      return 0;
    },
    fetch: async () =>
      new Response(
        JSON.stringify(
          thinkingOnlyPayload({ response: "4", done_reason: "stop" }),
        ),
      ),
  });

  const result = await ollama.generate({ prompt: "What is 2+2?" });
  assert.equal(result.success, true);
  assert.equal(result.output, "4");
  assert.equal(result.metrics.completionTokens, 20);
});
