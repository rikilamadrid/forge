import assert from "node:assert/strict";
import test from "node:test";

import { loadConfig } from "../dist/src/config.js";

test("loads a remote Ollama host and model", () => {
  assert.deepEqual(
    loadConfig({
      OLLAMA_HOST: "http://ollama.test:11434/",
      FORGE_MODEL: "qwen-test",
    }),
    {
      ollamaHost: "http://ollama.test:11434",
      model: "qwen-test",
    },
  );
});

test("requires both configuration values", () => {
  assert.throws(() => loadConfig({ FORGE_MODEL: "qwen-test" }), /OLLAMA_HOST is required/);
  assert.throws(() => loadConfig({ OLLAMA_HOST: "http://ollama.test:11434" }), /FORGE_MODEL is required/);
});

test("rejects non-HTTP Ollama hosts", () => {
  assert.throws(
    () => loadConfig({ OLLAMA_HOST: "file:///tmp/ollama", FORGE_MODEL: "qwen-test" }),
    /must use http:\/\//,
  );
});
