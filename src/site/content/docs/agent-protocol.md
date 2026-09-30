---
title: "How agents work with the board | Planban docs"
description: "The Planban protocol agents follow: when they change an Item's Status, why finished work waits for your review, what they report, and how new sessions find the board."
path: /docs/agent-protocol/
updated: 2026-09-30
sources: plugins/planban/skills/planban/references/planban-protocol.md (Roadmap Status Protocol, Updating Roadmap State, Post-mutation handoff, Agent handoff prompts, First Reads, Board Opening); src/core/protocol.ts (buildAgentContext); src/core/storage.ts (buildAgentsBlock, assertBaseRevision); plugins/planban/mcp/server.mjs (PLANBAN_MCP_INSTRUCTIONS, baseRevision); plugins/planban/scripts/claude-session-context.mjs; plugins/planban/scripts/project-dir.mjs; PRODUCT.md (principle 2)
---

# How agents work with the board

The Planban protocol is the set of rules an agent follows when it changes a board: it moves an Item to In Progress when implementation starts, leaves finished work In Progress for your review, and marks work Complete only when you say so.

You own the project's intent, priority and acceptance. Agents are trusted editors of the plan within that authority: they keep the board current so you do not have to transcribe their progress, and they do not redefine the project or declare work accepted.

## When does an agent change an Item's status?

An agent moves an Item to In Progress when you ask it to start implementing the Item, or when it goes ahead with implementation work on it. These do not count as starting:

- opening or linking an agent thread or session;
- reading context;
- planning or discussing the approach.

As the work changes, the agent also keeps the Item's summary and next action current, and updates the Spec or Plan when the work changes them.

## Why does finished agent work stay In Progress?

Because Complete means you have accepted the work. When an agent finishes its implementation and its own checks, it leaves the Item In Progress and changes the summary and next action to say the work is ready for your review or testing.

The agent moves the Item to Complete only when you explicitly ask, confirm completion after reviewing or testing it, or clearly waive your own review. Its own passing tests show the work is ready for review; they are not permission to complete it. The MCP tool backs this up by refusing a move to Complete without `completionConfirmed: true`. See [Who can mark work Complete?](/docs/status-and-priority/#who-can-mark-work-complete)

## What does the agent tell me after changing the board?

After it opens the board, or after it finishes a whole batch of changes you asked for, the agent replies with the exact board URL as a clickable link. It takes the URL from the last tool result. If that URL is not yet verified, it calls `planban_launch_board` once to verify it.

In a host with a browser beside the session, the agent makes one attempt to show the board there for the whole batch, not after every write. If showing the board fails, the changes still stand: the agent returns the link with at most one short reason.

## Why does the agent make one change at a time?

Several writes to the same board at once could overwrite each other, so agents make one change at a time on each board. Planban also locks the board while it saves each change.

Tools that change Items accept an optional `baseRevision`: the board revision the agent last read. If the board has changed since, the change is refused with `Roadmap changed from revision <old> to <new>. Reload before saving.` and the agent reloads before trying again. Documents have the same protection through `expectedMtimeMs`.

## How does an agent find the board in a new session?

Setting up a project gives every new session a way in:

- **`.planban/project.json`** names the board.
- **`.planban/agent-context.md`** gives the live roadmap path, the board URL, the tool names and the status protocol. Agents read it before changing the board.
- **The managed block in `AGENTS.md`** tells agents that read `AGENTS.md` that the project uses Planban and points them at both files.
- **The Claude Code session-start hook** adds the board id, its usual URL and the same pointers when a session starts.

Agents pass the project's absolute path as `cwd` to the Planban tools. From a subfolder, Planban finds the nearest folder above that has `.planban/project.json`. From a linked git worktree, it finds the main checkout's board; see [Planban in git worktrees](/docs/git-worktrees/).

When you type `/pb` or `/planban`, the agent opens the current project's board. If the project is not set up, it opens the only registered board, or the all-boards selector when there are several.

## What does a handoff to a new agent session include?

When one agent hands an Item to a new thread or session, the handoff prompt carries enough to start without rediscovery:

- the repository path;
- the board URL;
- the card id and its current Status;
- the Group it belongs to, when it has one;
- the paths of its Spec and Plan;
- a launch token, when there is one;
- the status protocol above.

To carry one card into a session yourself, use its **Copy Item reference** button (**Copy Group reference** on a Group) and paste the reference into the agent chat where you want to work.
