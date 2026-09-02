// Minimal ambient declarations for the few Node.js runtime surfaces this kit
// uses, matching the project's convention of hand-declaring them instead of
// depending on @types/node. Extend only with what source actually calls.

declare module "node:fs" {
  export function readFileSync(path: URL, encoding: "utf8"): string;
}
