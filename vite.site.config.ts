import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { contentMeta, parseContentDocument } from "./src/site/content/markdown.ts";
import { planbanVersion } from "./src/site/site-facts.ts";

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
    {
      // Page copy lives in src/site/content/**/*.md (docs pages under
      // content/docs/). Each import becomes a small JSON block tree at build
      // time, rendered by ContentPage.
      name: "planban-site-content-markdown",
      enforce: "pre",
      transform(source, id) {
        // "page.md?meta" yields only the front matter and headline, so
        // navigation can list pages without bundling their full text.
        const match = /\/src\/site\/content\/(?:[a-z0-9-]+\/)*[^/]+\.md(\?meta)?$/u.exec(id);
        if (!match) return null;
        const document = parseContentDocument(source, id, { tokens: { planbanVersion } });
        const value = match[1] ? contentMeta(document, id) : document;
        return { code: `export default ${JSON.stringify(value)};`, map: null };
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
