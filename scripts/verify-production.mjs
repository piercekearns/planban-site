#!/usr/bin/env node
const productionUrl = process.env.PLANBAN_SITE_URL || "https://planban.ai/";
const expectedCommit = process.env.PLANBAN_SITE_EXPECTED_COMMIT;
const attempts = Number.parseInt(process.env.PLANBAN_SITE_VERIFY_ATTEMPTS || "8", 10);
const retryDelayMs = Number.parseInt(process.env.PLANBAN_SITE_VERIFY_DELAY_MS || "2500", 10);

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function readCommit(html) {
  return html.match(/<meta[^>]+name=["']planban-site-commit["'][^>]+content=["']([^"']+)["']/iu)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']planban-site-commit["']/iu)?.[1]
    ?? null;
}

async function readPublicPayload(response, html) {
  const scriptSources = Array.from(html.matchAll(/<script[^>]+src=["']([^"']+)["']/giu), match => match[1]);
  const scripts = await Promise.all(scriptSources.map(async (source) => {
    const scriptUrl = new URL(source, response.url);
    const scriptResponse = await fetch(scriptUrl, {
      headers: {
        "cache-control": "no-cache",
        "user-agent": "planban-site-production-verifier/1.0",
      },
    });
    return scriptResponse.ok ? scriptResponse.text() : "";
  }));
  return [html, ...scripts].join("\n");
}

const requiredPatterns = [
  { name: "Planban page title", pattern: /<title>[^<]*Planban[^<]*<\/title>/iu },
  { name: "Planban heading or wordmark", pattern: /Planban/iu },
  { name: "public GitHub link", pattern: /github\.com\/piercekearns\/planban/iu },
];

let lastFailure = "Production did not respond.";

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const response = await fetch(productionUrl, {
    headers: {
      "cache-control": "no-cache",
      "user-agent": "planban-site-production-verifier/1.0",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    lastFailure = `${response.status} ${response.statusText}`;
  } else {
    const html = await response.text();
    const publicPayload = await readPublicPayload(response, html);
    const missing = requiredPatterns
      .filter(({ pattern }) => !pattern.test(publicPayload))
      .map(({ name }) => name);
    const deployedCommit = readCommit(html);

    if (missing.length > 0) {
      lastFailure = `missing: ${missing.join(", ")}`;
    } else if (/localhost|127\.0\.0\.1|\/Users\/piercekearns/iu.test(publicPayload)) {
      lastFailure = "local-only content was found";
    } else if (expectedCommit && deployedCommit !== expectedCommit) {
      lastFailure = `expected commit ${expectedCommit}, received ${deployedCommit || "no deployment identity"}`;
    } else {
      process.stdout.write(JSON.stringify({
        ok: true,
        url: response.url,
        status: response.status,
        deployedCommit,
        checked: requiredPatterns.map(({ name }) => name),
      }, null, 2) + "\n");
      process.exit(0);
    }
  }

  if (attempt < attempts) await wait(retryDelayMs);
}

throw new Error(`Production verification failed after ${attempts} attempts: ${lastFailure}`);
