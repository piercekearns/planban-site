import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig } from "vite";

function resolveSiteCommit() {
  if (process.env.PLANBAN_SITE_COMMIT) return process.env.PLANBAN_SITE_COMMIT;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "local-uncommitted";
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "planban-site-release-identity",
      transformIndexHtml() {
        return [{
          tag: "meta",
          attrs: {
            name: "planban-site-commit",
            content: resolveSiteCommit(),
          },
          injectTo: "head",
        }];
      },
    },
  ],
  root: "src/site",
  server: {
    host: "127.0.0.1",
    port: 4320,
    strictPort: false,
  },
  build: {
    outDir: "../../dist/site",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve("src/site/index.html"),
        privacy: resolve("src/site/privacy/index.html"),
      },
    },
  },
});
