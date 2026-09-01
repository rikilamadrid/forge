import assert from "node:assert/strict";
import test from "node:test";

import { OllamaProvider } from "../dist/src/providers/ollama.js";

test("sends a non-streaming generation request and maps the minimal result", async () => {
  const calls = [];
  const times = [100, 142.5];
  const provider = new OllamaProvider({
    host: "http://ollama.test:11434",
    model: "qwen-test",
    now: () => times.shift(),
    fetch: async (input, init) => {
      calls.push({ input: input.toString(), init });
      return new Response(
        JSON.stringify({
          model: "qwen-test:latest",
          response: "A useful answer",
          done: true,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  });

  const result = await provider.generate({ prompt: "Review this function" });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].input, "http://ollama.test:11434/api/generate");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    model: "qwen-test",
    prompt: "Review this function",
    stream: false,
  });
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(result, {
    provider: "ollama",
    model: "qwen-test:latest",
    output: "A useful answer",
    clientLatencyMs: 42.5,
  });
});

test("rejects an incomplete Ollama response", async () => {
  const provider = new OllamaProvider({
    host: "http://ollama.test:11434",
    model: "qwen-test",
    fetch: async () => new Response(JSON.stringify({ done: true }), { status: 200 }),
  });

  await assert.rejects(
    provider.generate({ prompt: "Review this function" }),
    /invalid completed response/,
  );
});

test("fails on a non-success Ollama response", async () => {
  const provider = new OllamaProvider({
    host: "http://ollama.test:11434",
    model: "missing-model",
    fetch: async () => new Response("missing", { status: 404 }),
  });

  await assert.rejects(
    provider.generate({ prompt: "Review this function" }),
    /HTTP 404/,
  );
});

test("aborts a request after the configured timeout", async () => {
  const provider = new OllamaProvider({
    host: "http://ollama.test:11434",
    model: "qwen-test",
    timeoutMs: 1,
    fetch: async (_input, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(new Error("aborted")));
      }),
  });

  await assert.rejects(
    provider.generate({ prompt: "Review this function" }),
    /timed out after 1 ms/,
  );
});
