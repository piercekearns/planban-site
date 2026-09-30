---
title: "Status and priority | Planban docs"
description: "Planban's five statuses, what priority means, how to reorder work, who marks work Complete, what archiving does, and what a blocked-by link records."
path: /docs/status-and-priority/
updated: 2026-09-30
sources: src/core/types.ts (PLANBAN_STATUSES, priority, boardRank, groupRank, blockedBy); src/core/storage.ts (STATUS_LABELS, normalizeColumnPriorities, assignHierarchyRanks, moveCard, assertGroupLifecycle, deleteArchivedCard); src/web/main.tsx; src/web/mainBoardProjection.ts (workItemRank, groupRollup); src/cli.ts (move-card, complete-card, archive-card, restore-card, update-card); plugins/planban/mcp/server.mjs (planban_move_card, planban_update_card); src/core/workItemQuery.ts; plugins/planban/skills/planban/references/planban-protocol.md (Roadmap Status Protocol); plugins/planban/skills/planban/references/planban-house-style.md (Product terms)
---

# Status and priority

Status is the board column an Item or Group sits in, one of In Progress, Up Next, Pending, Complete or Archived, and priority is its position within that column, shown on the card as P1, P2 and so on.

Status says what stage the work is at. Priority says what comes first among the work at that stage.

## What are the five statuses?

| Status | Value in tools and CLI | Meaning |
| --- | --- | --- |
| In Progress | `in-progress` | Work under way, including finished agent work waiting for your review |
| Up Next | `up-next` | Work queued to start next |
| Pending | `pending` | Work not yet started; the default Status for new Items |
| Complete | `complete` | Work you have accepted as done |
| Archived | `archived` | Work set aside; hidden from the board unless you show it |

The board shows the first four as columns. The Archived column appears when the board has archived cards and you turn on **Archive** in the board's **More Board actions** menu.

A Group has its own Status, separate from its Items. A Group cannot move to Complete or Archived while any of its Items is still open.

## What does priority mean?

Priority is a card's position in its Status column, counted from the top. The card at the top of a column is P1, the next is P2, and so on. Items inside a Group are ranked among the other Items of that Group in the same Status, and Main Board cards among the other Main Board cards.

Priority is not a separate field that you type in. Planban recalculates it whenever cards move, so it always matches the order you see.

## How do I change an Item's priority?

Drag the card up or down within its column. Agents reorder with `planban_move_card`, placing the card after another card in the same column with `afterId`, or first with `afterId: null`. With the CLI:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" move-card <card-id> --after <card-id> --cwd /path/to/repo -o json
node "$PLANBAN_ROOT/bin/planban.mjs" move-card <card-id> --first --cwd /path/to/repo -o json
```

The card you place after must be in the same column and the same place: both on the Main Board, or both in the same Group. A tool or CLI move to a new Status without a position puts the card at the bottom of that column.

## Who can mark work Complete?

You can. Complete means you have accepted the work. An agent moves work to Complete only when you ask it to, confirm completion after reviewing or testing it, or clearly waive your own review. Passing tests is evidence that work is ready for review, not permission for the agent to complete it.

When an agent finishes its part, it leaves the Item In Progress and changes the next action to say the work is ready for your review. See [How agents work with the board](/docs/agent-protocol/).

The MCP tool enforces this: `planban_move_card` refuses a move to Complete unless the call sets `completionConfirmed: true`. The CLI's `complete-card` and `move-card --status complete` have no such check; an agent that uses the CLI follows the same rule. On the board, the **Mark complete** button on a card moves it straight to Complete.

## What happens when an Item is archived?

Archiving moves the card to the Archived status. It keeps its Spec, Plan and history, and it leaves the visible columns. Archive a card from its **Archive** button, or with `archive-card` in the CLI.

Restoring an archived card moves it to **Pending**, not to the Status it had before. Use the card's **Restore** button, or `restore-card` in the CLI, then move it where you want it.

Only an archived card can be deleted, with its **Delete permanently** button, which also removes its Spec and Plan. A Group that still owns Items cannot be deleted.

## What does "blocked by" mean?

"Blocked by" records the one other card that is blocking this one. Agents set it with `planban_update_card` and `blockedBy`, and clear it with `blockedBy: null`. The CLI uses `update-card --blocked-by <card-id>` and `--clear-blocked-by`.

A card cannot block itself, and the blocking card must exist on the same board. The link does not change either card's Status. Queries and the board's filters can show only blocked or only unblocked work.
