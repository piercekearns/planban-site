---
title: "Update Planban | Planban docs"
description: "How Planban tells you an update is ready, what the board's update buttons do in Codex, the commands to update in Codex and Claude Code, and what the update check sends."
path: /docs/updating/
updated: 2026-09-30
sources: README.md (Updates, Install With Claude Code details, Manual Install); release/latest.json; src/core/version.ts; src/core/updatePreflight.ts (recommendedAction, buildFallbackPrompt); src/core/updateRunner.ts (buildUpdateCommandPlan); src/cli.ts (update); src/web/main.tsx (update panel); src/server/server.ts (fetchLatestUpdateManifest); release/notes/v1.1.6.md (Updating)
---

# Update Planban

Planban checks public version metadata on GitHub while a board is open and shows an update notice, and you then update it from the board, through your agent, or with your host's plugin commands.

Planban never updates itself silently. After any update, start a new agent session so it loads the new version.

## How do I know an update is available?

While a board is open, the local app checks the latest published release. When a newer version exists, the board shows a small update notice. Open it to see what has changed, with a link to the release notes. You can also ask your agent: `Check whether Planban has updates.`

Each release is listed in the [changelog](/docs/changelog/).

## What do "Update now" and "Update with Codex" do?

These buttons are in the board's update panel and are built for Codex installs. Before it offers them, Planban inspects the install.

- **Update now** appears when Planban can prove the install is safe to update directly: a Git-backed marketplace install or a local clone, with no unexpected local changes and the needed commands available. Planban shows its progress, refreshes the local install, restarts the local app and reopens the board you were viewing.
- **Update with Codex** appears when direct update is not safe: the install shape is unclear, dependencies are missing, a migration is needed, or local files would be overwritten. It opens a draft prompt in Codex that asks your agent to inspect the install, update it safely, verify the plugin and MCP tools, and open the right page afterwards. **Copy update prompt** puts the same prompt on your clipboard.
- **Setup needed** appears when a command Planban needs is missing: `node`, `npm`, `git` or `codex`. **Copy setup prompt** and **Open setup prompt in Codex** ask your agent to install it.

In Claude Code, update with the plugin commands below.

## How do I update Planban in Codex?

Choose **Update now** or **Update with Codex** on the board, or update from a terminal. For a Git-backed marketplace install, upgrade the marketplace and reinstall the plugin:

```bash
codex plugin marketplace upgrade planban
codex plugin add planban@planban
```

For a local clone, update the clone first, then reinstall. These are the steps Planban's own updater runs:

```bash
cd "$PLANBAN_ROOT"
git fetch origin main
git merge --ff-only FETCH_HEAD
npm install
node scripts/configure-local-plugin.mjs "$PWD"
codex plugin add planban@planban
```

Then start a new Codex session. If an older cached plugin still contains `__PLANBAN_REPO_ROOT__`, refresh the marketplace and reinstall the plugin, then start a new session.

## How do I update Planban in Claude Code?

Update the marketplace, then the plugin:

```bash
claude plugin marketplace update planban
claude plugin update planban@planban
```

When a release changes dependencies, also run `npm install` in the marketplace folder (`$HOME/.claude/plugins/marketplaces/planban`). Then start a new Claude Code session.

## Why does Claude Code need a reinstall to pick up plugin changes?

Claude Code copies the plugin's skills, hooks and scripts into its plugin cache when you install. The Planban runtime itself runs from the marketplace folder. `claude plugin update` refreshes the cache only when the plugin's version number changes, which every release does.

If you run Planban from a local clone and change anything under `plugins/planban/` without a new version number, reinstall the plugin, then start a new session:

```bash
claude plugin uninstall planban@planban
claude plugin install planban@planban
```

## Why do I need to start a new session after updating?

A running session keeps the Planban MCP server it started with, along with its configuration. An idle session keeps that server process alive and does not see the update until it restarts. Opening a board does not refresh it either. Start a new session in Codex or Claude Code after every update.

Some releases also change the guidance that set-up writes into your projects. The release notes say so, and you can refresh a project's guidance by [running set-up again](/docs/set-up-a-project/#how-do-i-refresh-a-projects-generated-guidance-after-an-update).

## What does the update check send to GitHub?

The check downloads one public file, `release/latest.json`, from the Planban repository on GitHub. The request carries a timestamp to avoid stale caches and identifies itself as `planban-update-check`. It sends no board contents, repository paths, logs or project details.

The file lists the latest version, a summary, the release notes link and release-specific update instructions, which the **Update with Codex** prompt includes. If the check fails, the board says it could not check for updates and nothing else changes.
