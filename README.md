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

`src/site/public/robots.txt` and `src/site/public/_headers` are copied into the build unchanged. Content-hashed bundles are emitted under `/static/` and cached as immutable; stable-named files under `/assets/` revalidate daily.

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
