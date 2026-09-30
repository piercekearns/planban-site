# Planban website

This repository is the canonical source for [planban.ai](https://planban.ai/). The Planban application and plugin live in the separate [Planban product repository](https://github.com/piercekearns/planban).

## Local development

Use Node.js 22.12 or later.

```sh
npm ci
npm run site:preflight
npm run site:preview -- --host 127.0.0.1 --port 4320
```

`site:preflight` type-checks the site, builds `dist/site`, and audits the source, Pages Function, and generated output for private paths, secrets, and private-only content.

## Pages and prerendering

Every page is listed once in `src/site/routes.ts` with its path, output file, title, descriptions, and the source files that define it. `site:build` builds the client bundle, builds a server bundle from `src/site/entry-server.tsx`, and runs `scripts/prerender-site.mjs`, which renders each route to complete HTML (`index.html`, `privacy/index.html`, `404.html`) and writes `sitemap.xml`. The browser then hydrates the prerendered markup from `src/site/entry-client.tsx`.

To add a page, add a route to `src/site/routes.ts` and render it in `PlanbanPublicWebsite`. Canonical facts such as the released Planban version and the canonical description live in `src/site/site-facts.ts`; the home page JSON-LD is generated from them.

Long-form pages (`/claude-code/`, `/codex/`, `/what-is-an-agent-native-kanban-board/`) and the home page FAQ are written in Markdown under `src/site/content/`. Front matter gives the title, meta description, path, and updated date. At build time the `planban-site-content-markdown` plugin in `vite.site.config.ts` turns each file into a small JSON block tree using `src/site/content/markdown.ts`, which supports only headings, paragraphs, lists, fenced code, one captioned image per figure, and inline code, bold, italics, and links. `ContentPage` renders it inside the subpage shell with copy buttons on code blocks, a breadcrumb, and the "Applies to Planban vX" line, which reads the version from `site-facts.ts`; write `{{planbanVersion}}` in copy that names the version. To add a content page, add the Markdown file and a `markdownRoute(...)` entry in `src/site/routes.ts`; the route gets TechArticle and BreadcrumbList JSON-LD and a sitemap entry.

`src/site/public/robots.txt` and `src/site/public/_headers` are copied into the build unchanged. Content-hashed bundles are emitted under `/static/` and cached as immutable; stable-named files under `/assets/` revalidate daily.

## Docs and llms.txt

The public docs at `/docs/` are Markdown files under `src/site/content/docs/`, rendered by the same `ContentPage`. `src/site/docs.ts` is the ordered docs registry: each entry names a page's Markdown file, its section and its breadcrumb name. The registry builds the `/docs/` routes, the generated link list on `/docs/`, each page's previous/next links and section navigation, and `/llms.txt`, so a page cannot be in one and missing from another. To add a docs page, add its Markdown file (with a `sources:` front matter line listing the Planban product files it was checked against) and one registry entry.

The registry imports only each page's front matter and headline (`page.md?meta`). The full documents are not in the main bundle: each is its own chunk, which `entry-client.tsx` loads for the current page before hydrating. A line `<!-- component: name -->` in Markdown places a generated block, such as the docs index (`docs-index`) or the release table (`release-history`, from `src/site/releases.ts`). Pipe tables are supported.

`scripts/prerender-site.mjs` writes `dist/site/llms.txt` from the registry, and `_headers` serves it with `X-Robots-Tag: noindex`. `site:audit` checks that every sitemap URL has a page, every internal link and `#anchor` resolves, `llms.txt` lists every docs page, and page copy has no em dashes.

The sitemap `lastmod` for each route is the date of the last commit touching its source files, so CI checks out full commit history.

## Deployment

Pull requests and `main` must pass `npm run site:preflight`. A reviewed commit on `main` deploys to the existing `planban-public-website` Cloudflare Pages project through GitHub Actions. This preserves the existing domain, environment variables, Functions configuration, and deployment history without coupling website builds to Planban application releases.

The GitHub repository needs scoped `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` Actions secrets. Cloudflare's obsolete automatic builds from the Planban product repository must remain disabled after this workflow is enabled.

The audited manual fallback is:

```sh
npm run site:deploy
```

The fallback refuses to deploy a dirty checkout. It deploys the current branch and verifies that `https://planban.ai/` serves the exact local commit after a production-branch deployment.

To exercise the complete local release gate without contacting Cloudflare, run:

```sh
PLANBAN_SITE_DRY_RUN=1 npm run site:deploy
```

## Environment variables

The email form uses these Cloudflare Pages variables:

- `VITE_PLANBAN_SIGNUP_ENDPOINT=/api/subscribe`
- `RESEND_API_KEY`
- `RESEND_SEGMENT_ID`

Optional public social URLs use `VITE_PLANBAN_X_URL` and `VITE_PLANBAN_YOUTUBE_URL`.

Do not commit credentials or local environment files.
