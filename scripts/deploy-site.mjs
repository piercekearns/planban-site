#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const projectName = "planban-public-website";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    env: {
      ...process.env,
      ...options.env,
    },
  });
  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stderr || result.stdout || "");
    }
    process.exit(result.status ?? 1);
  }
  return (result.stdout || "").trim();
}

const dirty = run("git", ["status", "--porcelain"], { capture: true });
if (dirty) {
  process.stderr.write("Refusing to deploy: commit or discard local changes first.\n");
  process.exit(1);
}

const branch = run("git", ["branch", "--show-current"], { capture: true });
if (!branch) {
  process.stderr.write("Refusing to deploy from a detached HEAD.\n");
  process.exit(1);
}

const commit = run("git", ["rev-parse", "HEAD"], { capture: true });
run("npm", ["run", "site:preflight"], {
  env: { PLANBAN_SITE_COMMIT: commit },
});

if (process.env.PLANBAN_SITE_DRY_RUN === "1") {
  process.stdout.write(`Dry run complete for ${branch} at ${commit}. No deployment was created.\n`);
  process.exit(0);
}

run("npx", [
  "wrangler",
  "pages",
  "deploy",
  "dist/site",
  "--project-name",
  projectName,
  "--branch",
  branch,
]);

if (branch === "main") {
  run(process.execPath, ["scripts/verify-production.mjs"], {
    env: { PLANBAN_SITE_EXPECTED_COMMIT: commit },
  });
} else {
  process.stdout.write(`Preview deployment completed for branch ${branch}.\n`);
}
