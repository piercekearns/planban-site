---
title: "Where Planban stores your data | Planban docs"
description: "What Planban keeps in your project's .planban/ folder and in ~/.planban on your machine, whether to commit it, how much history it keeps, and what it never uploads."
path: /docs/data-storage/
updated: 2026-09-30
sources: README.md (Local Storage, Updates); src/core/paths.ts; src/core/storage.ts (initializeProject, appendEvent); src/core/protocol.ts (buildAgentContext); src/core/demo.ts; src/core/history.ts (HISTORY_RETENTION, pruneHistory, resolveHistoryDoc); src/core/registry.ts (deleteBoard, duplicateBoard, archiveBoard); src/core/types.ts (PlanbanProjectManifest); src/core/version.ts; src/server/server.ts (listen, fetchLatestUpdateManifest); plugins/planban/scripts/launch-planban.mjs (launchLogPath); .gitignore
---

# Where Planban stores your data

Planban keeps two small discovery files in your project's `.planban/` folder and keeps all live board state, Specs, Plans and history in a planning root on your own machine at `~/.planban`, outside your repository.

Keeping the live board outside the repository means it is not tied to a branch: every branch and worktree of a project sees the same board.

## What is in my project's `.planban/` folder?

Two files, both written when you [set up the project](/docs/set-up-a-project/):

- **`project.json`**: the manifest. It records the board id (`repoId`), marks Planban as enabled, and says that storage is local. Agents and the board use it to find the right board.
- **`agent-context.md`**: generated guidance for agents. It lists the live roadmap path, the manifest path, the planning root and the board URL, names the Planban tools, and sets out the status protocol and what to do when Planban is not installed in a host.

Neither file holds your Items or documents.

## Should I commit `.planban/` to my repository?

We recommend adding `.planban/` to your project's `.gitignore`. `agent-context.md` contains absolute paths from your machine, such as your home folder, and the board those paths point at exists only on that machine. Planban's own repository ignores `.planban/` the same way.

Each device that works on the project runs set-up once to create its own discovery files and its own board. Do not commit `~/.planban` either: it is your device's planning state, not part of any project.

The managed Planban block in `AGENTS.md` contains no machine paths, so you can commit `AGENTS.md` as normal.

## What is in `~/.planban`?

| Path | What it holds |
| --- | --- |
| `index.json` | The registry of every board on this device |
| `repos/<repo-id>/roadmap.json` | A board's live state: its project, columns and every card |
| `repos/<repo-id>/events.ndjson` | A log of changes to that board, one line per event |
| `repos/<repo-id>/items/<card-id>/spec.md` | A card's Spec |
| `repos/<repo-id>/items/<card-id>/plan.md` | A card's Plan, when it has one |
| `repos/<repo-id>/history/` | Earlier versions of the board and its documents |
| `demo/planban-demo/` | The project folder of the Planban Demo board |
| `detached/` | Project folders for boards made with **duplicate board** |
| `backups/boards/` | Timestamped copies of deleted boards |
| `logs/launch-<port>.log` | Output from the most recent background start of the local app on that port |

The local board app serves this data only on `127.0.0.1`, so it is reachable from your machine alone.

## How much history does Planban keep?

Every change to a board records a version in its history, with who made it (you, an agent, an import or the system), what changed and which cards and documents it touched. Open **Board history** from the board's **More Board actions** menu to browse versions and restore the board, a card or a document.

Planban keeps every version from the last 90 days, and always at least the latest 100 versions, whatever their age. Older versions beyond both limits are removed. When you restore a document, Planban looks back through up to 25 earlier versions of it.

## Does Planban upload any of my data?

No. Your boards, Items, Specs, Plans and history stay on your machine.

While a board is open, Planban checks public version metadata on GitHub to see whether an update is available. That request fetches a small public file and sends no board contents, repository paths, logs or project details. See [Update Planban](/docs/updating/#what-does-the-update-check-send-to-github).

Feedback is drafted by your agent from context on your machine, and nothing is posted to GitHub until you approve the exact text. See [How do I report a bug or send feedback?](/docs/troubleshooting/#how-do-i-report-a-bug-or-send-feedback)

## How do I back up or delete a board?

To keep a copy of everything, copy the `~/.planban` folder. To make a working copy of one board, duplicate it: the copy gets its own id and leaves the source untouched.

You can archive a board to hide it from board lists without deleting anything, and restore it later. Deleting a board removes its planning state, but first copies it to `~/.planban/backups/boards/<repo-id>-<timestamp>-<folder>`. It never touches your project repository. On the board, deleting asks you to type the board id to confirm; the CLI's `delete-board` requires `--yes`:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" delete-board <repoId> --yes
```

See the [CLI reference](/docs/cli/#which-commands-manage-boards) for `archive-board`, `restore-board` and `duplicate-board`.
