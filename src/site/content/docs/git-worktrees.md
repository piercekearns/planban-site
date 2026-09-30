---
title: "Planban in git worktrees | Planban docs"
description: "How Planban finds the right board when an agent session runs in a linked git worktree, which cwd to pass, how to tell it happened, and when it does not apply."
path: /docs/git-worktrees/
updated: 2026-09-30
sources: plugins/planban/scripts/project-dir.mjs (mainCheckoutForWorktree, resolvePlanbanProjectDir); src/core/storage.ts (getStatus, resolveProjectCwd, initializeProject); plugins/planban/scripts/claude-session-context.mjs; src/core/protocol.ts (buildAgentContext); release/notes/v1.1.6.md (Board discovery from linked git worktrees)
---

# Planban in git worktrees

When an agent session runs in a linked git worktree, Planban resolves the board that belongs to the repository's main checkout, so every worktree of a repository shares one board.

Claude Code desktop and Codex can both run sessions in worktrees. Since v1.1.6, those sessions open and change the same board as the main checkout without any set-up in the worktree.

## Why do worktrees need special handling?

Planban finds a project's board through `.planban/project.json` in the project folder. That file is a local discovery file, and it is usually ignored by git. A new linked worktree is a fresh checkout of tracked files, so it has no `.planban/` folder of its own.

The board itself does not belong to a branch. It lives on your machine under `~/.planban`, and the right board for any worktree is the one owned by the main checkout.

## How does Planban find the main checkout?

Planban starts at the folder it is given and walks up towards the root:

1. If a folder on the way has `.planban/project.json`, Planban uses that project. A manifest in the folder itself or in any parent wins.
2. The walk stops at the top of the git repository, the first folder that contains a `.git` entry. Discovery never looks above the repository.
3. If that `.git` entry is a file, the folder is a linked worktree. The file points at the worktree's git folder inside the main repository, whose `commondir` leads back to the main repository's shared `.git` folder. The folder that contains it is the main checkout.
4. If the main checkout has `.planban/project.json`, Planban uses its board.

If none of these finds a manifest, the project is not set up, and tools report `Planban is not initialized`.

## Which path should the agent pass as `cwd`?

Pass the worktree's own absolute path, the folder the session runs in. Planban resolves it to the main checkout automatically. The same works from any subfolder of the worktree or of the main checkout.

This applies to the MCP tools, the CLI's `--cwd` option, the board launcher and the Claude Code session-start hook. The one exception is setting up a project: `init` sets up exactly the folder you give it, so run it on the main checkout.

## How can I tell that worktree resolution happened?

`planban_status` and the CLI's `status` command report two extra fields when the board was found somewhere other than the folder you passed:

- `requestedCwd`: the folder you passed;
- `discoveredVia`: `worktree` when the board came from the main checkout, or `ancestor` when it came from a parent folder.

In that case `cwd` in the result is the main checkout's path. When you pass the project folder itself, neither field appears.

In Claude Code, the session-start note also says that the session runs in a linked git worktree and names the main checkout the board belongs to.

## When does worktree resolution not apply?

- **The worktree has its own `.planban/project.json`.** A manifest in the worktree, or in a parent folder inside it, wins, so that board is used.
- **The main checkout is not set up.** Set up Planban on the main checkout, not the worktree.
- **The folder is not in a git repository, or is a plain clone.** A separate clone of the same repository is its own checkout, with its own discovery files.
- **The main repository's git folder is not called `.git`.** Planban then cannot identify the main checkout and does not guess.

## Does each branch get its own board?

No. The live board is not branch-local. Every branch and every worktree of a repository reads and writes the same board, so Items, Specs and Plans stay in one place whichever branch an agent is on. Track branch-specific work as Items on that shared board.
