---
title: "Install Planban in Claude Code | Planban docs"
description: "Install Planban as a Claude Code plugin: what you need, the one-prompt install, the manual commands, a local clone, and how to check the plugin and MCP server work."
path: /docs/install-claude-code/
updated: 2026-09-30
sources: README.md (Install, Install With Claude Code, Install With Claude Code details); .claude-plugin/marketplace.json; plugins/planban/.claude-plugin/plugin.json; plugins/planban/hooks/hooks.json; plugins/planban/scripts/claude-session-context.mjs; plugins/planban/scripts/runtime-root.mjs; plugins/planban/skills/pb/SKILL.md; plugins/planban/skills/planban-help/SKILL.md; release/notes/v1.1.6.md
---

# Install Planban in Claude Code

Planban installs in Claude Code as the `planban` plugin from the `planban` marketplace, which adds six `/planban:` commands, the Planban MCP server and a session-start hook to Claude Code.

Once installed, Claude can open your board in the Claude Code browser pane beside the session and keep it current with Planban's MCP tools. Planban runs locally: the plugin, its server and your boards all live on your machine.

## What do I need before installing?

You need Claude Code with its `claude` command line, and Node.js `>=22.12.0` with npm. Planban's MCP server, local app and CLI all run on Node.js.

The board opens beside the session in the Claude Code desktop app, which provides the browser pane. Planban support for Claude Code arrived in v1.1.6.

## How do I install Planban by asking Claude?

Paste this prompt into a Claude Code session:

```text
Install Planban from piercekearns/planban. Follow the Install With Claude Code details in the public GitHub README exactly, verify the plugin and MCP tools work, open the interactive tutorial in the browser pane, then ask whether I want to set up Planban for a local project.
```

Claude runs the same commands as the manual install below, checks that the MCP server connects, opens the tutorial in the browser pane, and then asks whether to set up Planban for one of your projects.

## How do I install Planban manually?

Run these commands in a terminal:

```bash
claude plugin marketplace add piercekearns/planban
PLANBAN_ROOT="$HOME/.claude/plugins/marketplaces/planban"
cd "$PLANBAN_ROOT"
npm install
claude plugin install planban@planban
claude mcp list
node plugins/planban/scripts/launch-planban.mjs --tutorial
```

In order, they add the `planban` marketplace, store its folder in `PLANBAN_ROOT`, install Planban's dependencies there, install the `planban@planban` plugin, list MCP servers to confirm the connection, and start the local app with the tutorial.

Then start a new Claude Code session. Keep the `PLANBAN_ROOT` folder in mind: the [Planban CLI](/docs/cli/) runs from it.

## How do I install Planban from a local clone?

Clone the repository and add the clone as the marketplace when you want to run Planban from a checkout you control:

```bash
git clone https://github.com/piercekearns/planban.git
cd planban
npm install
claude plugin marketplace add "$PWD"
claude plugin install planban@planban
```

Claude Code records the clone as the marketplace's source, and Planban's runtime resolves to it. Claude Code copies the plugin's skills, hooks and scripts into its plugin cache when you install, so after you change anything under `plugins/planban/`, reinstall the plugin as described in [Update Planban](/docs/updating/#why-does-claude-code-need-a-reinstall-to-pick-up-plugin-changes).

## How do I check that the install worked?

`claude mcp list` should show `plugin:planban:planban` as connected.

Start a new Claude Code session, then type `/planban:pb` in a project to open its board, or `/planban:planban-tutorial` for the tour. Type `/planban:` to list every Planban command. Claude replies with a clickable board URL, such as `Planban is open: [Open the verified board](URL)`.

If the Planban commands or tools are missing, see [Troubleshooting Planban](/docs/troubleshooting/).

## Why should I run `npm install` before the first session?

Run `npm install` in the marketplace folder before your first session so the MCP server starts quickly. The plugin can install missing dependencies on first launch, but Claude Code gives MCP servers only a short startup window. On a slow network, the first connection can fail until the dependencies are present.

## Where does the board open?

Claude opens the board in the Claude Code browser pane when the desktop app provides one, and always replies with the clickable board URL. It makes one attempt to open the pane. If the pane is not available or the attempt fails, Claude returns the link with one short reason, as in `Planban is running: [Open the verified board](URL)`. It does not open an external browser as a first attempt.

The board is served by the local Planban app, usually at `http://127.0.0.1:4317/boards/<repo-id>`.

## What does the session-start hook do?

When a Claude Code session starts in a project that uses Planban, the hook adds a short note to the session. It names the board and its usual URL, tells Claude to read `.planban/agent-context.md` before changing the board, to use the Planban MCP tools with the project's absolute path as `cwd`, and to include the board URL in its reply after changes.

In a linked git worktree, the note also says that the board belongs to the main checkout. The hook has a 10-second timeout and never blocks the session: if the project does not use Planban, it adds nothing.

## Do Codex and Claude Code share the same boards?

Yes. Planban is installed separately in each host, but every install on a device shares the same device-local boards. A board you create from Codex is the same board you open from Claude Code. See [Install Planban in Codex](/docs/install-codex/) to add the other host, then [set up Planban for a project](/docs/set-up-a-project/).
