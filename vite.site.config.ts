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

export default defineConfig(({ isSsrBuild }) => ({
  appType: "mpa",
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
  build: isSsrBuild
    ? {
      // Server bundle used only by scripts/prerender-site.mjs; never deployed.
      outDir: "../../dist/site-server",
      emptyOutDir: true,
      copyPublicDir: false,
      rollupOptions: {
        input: resolve("src/site/entry-server.tsx"),
      },
    }
    : {
      outDir: "../../dist/site",
      emptyOutDir: true,
      // Content-hashed bundles live apart from the stable-named files in
      // public/assets so only they receive immutable caching (see _headers).
      assetsDir: "static",
      rollupOptions: {
        input: {
          main: resolve("src/site/index.html"),
        },
      },
    },
}));
