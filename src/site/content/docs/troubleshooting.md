---
title: "Troubleshooting Planban | Planban docs"
description: "Fixes for common Planban problems: missing tools, runtime not found, a project that is not initialized, a busy port, the launch log, the board not opening, and stale plugins."
path: /docs/troubleshooting/
updated: 2026-09-30
sources: plugins/planban/scripts/runtime-root.mjs; plugins/planban/scripts/start-planban-mcp.mjs; src/core/storage.ts (loadState); plugins/planban/scripts/project-dir.mjs; plugins/planban/scripts/launch-planban.mjs (port and stale-process messages, --port, launchLogPath); plugins/planban/mcp/server.mjs (launchBoard); plugins/planban/.mcp.json; README.md (Manual Install, Install With Claude Code details, Feedback With Codex); plugins/planban/skills/pb/SKILL.md; plugins/planban/skills/planban-feedback/SKILL.md; src/web/main.tsx (feedback dialog, More Board actions menu); src/server/server.ts (polling); SUPPORT.md; SECURITY.md; .github/ISSUE_TEMPLATE/
---

# Troubleshooting Planban

Most Planban problems come from an MCP server that did not start, a stale plugin cache, a busy port or a project that has not been set up, and each has a specific fix.

Start with the message you see, if there is one. Planban's error messages are quoted below exactly, so you can search this page for them.

## Why are the Planban tools missing from my session?

The Planban MCP server did not start for that session. Check these in order:

1. **Start a new session.** A session only picks up a newly installed or updated plugin when it starts.
2. **Check the plugin.** In Claude Code, `claude mcp list` should show `plugin:planban:planban` as connected. In Codex, `codex plugin list --marketplace planban` should list the plugin.
3. **Install dependencies.** Run `npm install` in your Planban marketplace folder. The server can install them on first start, but a slow network can outlast the host's startup window: two minutes in Codex, and a shorter window in Claude Code.
4. **Check Node.js.** The host must be able to run Node.js `>=22.12.0` and npm.

When the server fails to start, it writes `Planban MCP startup failed:` and the reason to stderr.

## What does "Planban runtime not found" mean?

The plugin started but could not find the Planban checkout it runs from. The full message is:

```output
Planban runtime not found. Reinstall the Planban marketplace in your host (codex plugin marketplace add / claude plugin marketplace add), or run scripts/configure-local-plugin.mjs from a complete Planban checkout and reinstall the plugin.
```

Add the marketplace again with your host's command from the install page, then reinstall the plugin and start a new session. For a local clone, run `node scripts/configure-local-plugin.mjs "$PWD"` in the clone, then reinstall. If an older cached plugin still contains `__PLANBAN_REPO_ROOT__`, refresh the marketplace and reinstall the plugin.

For another MCP host, `PLANBAN_REPO_ROOT does not contain a complete Planban runtime` means the variable points at the wrong folder; set it to your clone. See [Use Planban from other MCP hosts](/docs/other-mcp-hosts/).

## What does "Planban is not initialized" mean?

Planban could not find a set-up project for the folder it was given. It looks for `.planban/project.json` in that folder, its parents up to the top of the git repository, and the main checkout of a linked worktree. The message names the folder it tried: `Planban is not initialized in <folder>`.

Check that the agent passed the project's absolute path as `cwd`. If the project has never been set up on this device, [set it up](/docs/set-up-a-project/).

A related message, `Planban roadmap is missing at <path>`, means the project's discovery files exist but the live board is not on this device, for example because `.planban/` was copied from another machine. Running set-up with the same `--repo-id` creates an empty board at that path.

## What if port 4317 is already in use?

The local board app uses port 4317 by default. If another program holds it, the launcher stops with:

```output
Port 4317 is already in use by another service. Stop that process or choose a different Planban port.
```

Stop that program, or start Planban on another port from your Planban folder:

```bash
node plugins/planban/scripts/launch-planban.mjs --cwd /path/to/repo --port <port>
```

If an older Planban process answers on the port but cannot serve the board, the launcher tries to stop it and start a fresh one. If it cannot, it reports that the web bundle is unavailable and asks you to stop the stale process on that port. Board URLs then use the new port, so trust the URL in the agent's reply over the usual `4317`.

## Where is Planban's launch log?

When the launcher starts the local app in the background, it writes the app's output to:

```output
~/.planban/logs/launch-<port>.log
```

The log is replaced on each start. If the app exits or does not become healthy within 15 seconds, the launcher's error includes the end of this log, after `Server log:`.

## Why did the board not open beside my session?

Opening the board beside the session is optional; the link is what counts. The agent makes one attempt to show the board, and if that fails it still replies with `Planban is running: [Open the verified board](URL)` and one short reason. Click the link to open the board in your browser.

- **Codex:** the board opens in the in-app browser through Codex's browser tools. When those are unavailable, the agent says the board is running but automatic in-app opening is unavailable.
- **Claude Code:** the board opens in the browser pane of the desktop app. Where there is no pane, you get the link.
- **Other MCP hosts:** the agent does not try; you always get the link.

## Why do my plugin changes not appear in Claude Code?

Claude Code runs the plugin from its plugin cache, which it refreshes only when the plugin's version number changes. After changing anything under `plugins/planban/` in a local clone, uninstall and reinstall the plugin, then start a new session. See [Update Planban](/docs/updating/#why-does-claude-code-need-a-reinstall-to-pick-up-plugin-changes).

## Why are board updates slow to appear on Windows?

On Windows, Planban watches its planning folder by polling once a second instead of using native file watching, which can fail with permission errors. Changes from an agent can take a moment to appear on the board, but they stay live. To use polling on other platforms too, set `CHOKIDAR_USEPOLLING=1` for the Planban server.

## How do I report a bug or send feedback?

Run `/planban-feedback` in Codex or `/planban:planban-feedback` in Claude Code, and describe what happened. The agent uses the conversation you have already had, checks your Planban version and install, searches existing issues and recent fixes, and recommends one route: a comment on a matching issue, a new issue, or updating first. It shows you the exact text and destination, and posts nothing until you approve. It recommends a pull request only when a fix has already been made and verified.

On the board, choose **Feedback / Bug** from the **More Board actions** menu. The dialog offers **Copy prompt** and **Open in Codex**. In Claude Code, choose **Copy prompt** and paste the prompt into your session.

You can also open an issue directly at https://github.com/piercekearns/planban/issues/new/choose. Remove private board contents, local paths, logs and personal project details before posting publicly. Report security problems privately, as described in the [security policy](https://github.com/piercekearns/planban/security/policy).
