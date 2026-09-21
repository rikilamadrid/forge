// @ts-check
import { defineConfig } from "astro/config";

// Static output only. The site is served as files; no server runtime is
// required, and Vercel's Astro preset builds it with `npm run build`.
export default defineConfig({
  output: "static",
  trailingSlash: "never",
  build: {
    inlineStylesheets: "always",
  },
});
