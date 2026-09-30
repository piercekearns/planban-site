---
title: "Install Planban in Codex | Planban docs"
description: "Install Planban as a Codex plugin: what you need, the one-prompt install, manual commands for macOS, Linux and Windows, a local clone, and how to check it works."
path: /docs/install-codex/
updated: 2026-09-30
sources: README.md (Install With Codex, Install With Codex details, Manual Install); package.json; plugins/planban/.mcp.json; .agents/plugins/marketplace.json; plugins/planban/.codex-plugin/plugin.json; scripts/configure-local-plugin.mjs; plugins/planban/scripts/launch-planban.mjs; plugins/planban/scripts/runtime-dependencies.mjs; src/server/server.ts
---

# Install Planban in Codex

Planban installs in Codex as a Git-backed plugin marketplace named `planban`, and it needs Node.js 22.12.0 or later with npm on your machine.

Once installed, Planban adds its commands to Codex, runs its MCP server for your sessions, and opens the board in the Codex in-app browser beside the thread. Planban runs locally: the plugin, its server and your boards all live on your machine.

## What do I need before installing?

You need Codex desktop, and Node.js `>=22.12.0` with npm. Planban runs locally and uses Node.js for its server, CLI and MCP tools. Check both before you start:

```bash
node --version
npm --version
```

If you ask Codex to install Planban, it checks these first. If Node.js or npm is missing or too old, Codex explains why Planban needs them and asks before installing or upgrading Node.js. The manual steps below also use the `codex` command line, and the local clone steps use `git`.

## How do I install Planban by asking Codex?

Paste this prompt into a Codex thread:

```text
Install Planban from piercekearns/planban. Follow the Install With Codex details in the public GitHub README exactly, verify the plugin and MCP tools work, open the interactive tutorial in the Codex in-app browser, then ask whether I want to set up Planban for a local project.
```

Codex then follows the install steps written for it in the README:

1. Check that Node.js and npm are available, and ask before installing or upgrading Node.js.
2. Add the Planban marketplace.
3. Locate the installed marketplace folder.
4. Run `npm install` there.
5. For a local clone install, configure the Planban MCP runtime before installing the plugin.
6. Install the Planban plugin.
7. Verify that the plugin and MCP tools are available.
8. Open the interactive Planban tutorial in the Codex in-app browser.
9. Ask whether to set up Planban for one of your local projects.

## How do I install Planban manually on macOS or Linux?

Run these commands in a terminal:

```bash
codex plugin marketplace add piercekearns/planban
PLANBAN_ROOT="$(codex plugin marketplace list | awk '$1 == "planban" { print $2 }')"
cd "$PLANBAN_ROOT"
npm install
node scripts/configure-local-plugin.mjs "$PWD"
codex plugin add planban@planban
codex plugin list --marketplace planban
node plugins/planban/scripts/launch-planban.mjs --tutorial
```

In order, they add the `planban` marketplace, store its folder in `PLANBAN_ROOT`, install Planban's dependencies there, point the plugin's MCP server at that folder, install the `planban@planban` plugin, list it to confirm, and start the local app with the tutorial.

The last command prints the local tutorial URL. Open it, or ask Codex to open it in the in-app browser. Keep the `PLANBAN_ROOT` folder in mind: the [Planban CLI](/docs/cli/) runs from it.

## How do I install Planban with PowerShell on Windows?

Run these commands in PowerShell:

```powershell
codex plugin marketplace add piercekearns/planban
$planbanRuntime = (codex plugin marketplace list --json | ConvertFrom-Json).marketplaces | Where-Object { $_.name -eq 'planban' } | Select-Object -ExpandProperty root
Set-Location $planbanRuntime
npm install
node scripts/configure-local-plugin.mjs "$PWD"
codex plugin add planban@planban
node plugins/planban/scripts/launch-planban.mjs --tutorial
```

These do the same work as the macOS and Linux commands. The second line reads the marketplace folder from the JSON form of `codex plugin marketplace list`. Open the printed tutorial URL when the last command finishes.

## How do I install Planban from a local clone?

Clone the repository and install from the clone when you want to run Planban from a checkout you control:

```bash
git clone https://github.com/piercekearns/planban.git
cd planban
npm install
node scripts/configure-local-plugin.mjs "$PWD"
codex plugin marketplace add "$PWD"
codex plugin add planban@planban
node plugins/planban/scripts/launch-planban.mjs --tutorial
```

For a local clone, `configure-local-plugin.mjs` must run before `codex plugin add`. It writes `plugins/planban/.mcp.json` so the plugin's MCP server starts from your clone, with `PLANBAN_REPO_ROOT` set to it. A Git-backed marketplace install can use the shipped MCP configuration without this step, although the manual commands above run it anyway.

## How do I check that the install worked?

`codex plugin list --marketplace planban` lists the Planban plugin. The launcher then reports the tutorial URL, in one of these forms:

```output
Planban started at http://127.0.0.1:4317/tutorial?mode=first-run
Planban already running at http://127.0.0.1:4317/tutorial?mode=first-run
```

Start a new Codex session and type `/pb`. Codex opens the board in the in-app browser when it can, and always replies with a clickable board URL, such as `Planban is open: [Open the verified board](URL)`. If the Planban Demo board from the tutorial is your only board, `/pb` opens it.

If Codex has no Planban tools in the new session, see [Troubleshooting Planban](/docs/troubleshooting/).

## What happens on first launch if I skip `npm install`?

A Git-backed marketplace install can prepare itself. After you add the marketplace and install `planban@planban`, start a new Codex session and ask to open Planban. On first launch, Planban installs its missing dependencies in the marketplace folder before the MCP server starts. Node.js and npm must already be available to Codex.

Codex gives the MCP server two minutes to start (`startup_timeout_sec: 120`). If a slow network needs longer, finish `npm install` in the marketplace folder yourself and try again. Installer output goes to stderr, so the MCP connection stays clean while it runs.

## Why does Planban poll for changes on Windows?

On Windows, Planban uses polling to watch its small local planning state folder. This avoids native file-watcher permission failures and keeps board updates live.

You can force polling on other platforms by setting the environment variable `CHOKIDAR_USEPOLLING=1` for the Planban server. Next, [set up Planban for a project](/docs/set-up-a-project/).
