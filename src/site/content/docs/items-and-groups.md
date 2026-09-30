---
title: "Items and Groups | Planban docs"
description: "What Planban Items and Groups are, when to create a Group, how Items move into and out of Groups, why Groups do not nest, and what Group progress shows."
path: /docs/items-and-groups/
updated: 2026-09-30
sources: plugins/planban/skills/planban/references/planban-protocol.md (Work Item Model); plugins/planban/skills/planban/references/planban-house-style.md (Product terms); plugins/planban/skills/planban-help/SKILL.md; plugins/planban/skills/planban-create/SKILL.md; README.md (First Run); src/core/storage.ts (createGroup, moveCard, assertGroupLifecycle); src/cli.ts (create-group, move-card); plugins/planban/mcp/server.mjs (planban_create_group, planban_move_card); src/web/mainBoardProjection.ts (groupRollup)
---

# Items and Groups

In Planban, an Item is one independently trackable outcome, and a Group is a Main Board card that owns related Items and gives them their own status columns and priority order.

Every card on a Planban board is one of the two. Planban's hierarchy is exactly one level deep: a Group owns Items, and nothing else nests.

## What is an Item?

An Item is one outcome that can be prioritised, completed and reviewed on its own: a feature, a bug fix, a release or a piece of research. It has a title, a Status, a priority, a summary, a next action, a Spec and, when the work needs one, a Plan.

An Item either stands alone on the Main Board or belongs to one Group. An Item never owns other work, and it never turns into a Group.

## What is a Group?

A Group is a card on the Main Board that owns related Items. It has its own title, objective, Status, priority on the Main Board, Spec and history. Inside it, its Items have their own Statuses and their own priority order, so you can see and plan that part of the project on its own.

The Group's objective says why its Items belong together and what larger outcome they produce. Agents supply one when they create a Group, unless you ask them not to or the larger outcome is not yet clear.

## When should I create a Group rather than an Item?

Create an Item for a concrete outcome that can be prioritised, completed and reviewed independently. Create a Group when several Items contribute to one larger outcome and need their own internal list of Statuses and priorities.

Decide before you create the work. If a proposed piece of work already contains several outcomes that could each be delivered independently, create a Group and its Items rather than hiding a backlog inside one Item's Spec or Plan. Checklists inside a Spec or Plan are execution notes, not uncreated Items.

Do not create a Group only to act as a label or category, or for a structure you might need later. Use tags for labels.

## How do I put Items into a Group?

On the board, drag one Item onto another to create a Group from the two, or drag an Item into an existing Group. When you group two Items, Planban asks for a title and an optional objective, then creates the Group and places both Items inside it in one step. Their ids, Specs, Plans, Statuses and history do not change.

Agents do the same with the MCP tools: `planban_create_group` creates a Group around existing Items, and `planban_move_card` moves an Item into a Group with `parentId`, or back to the Main Board with `parentId: null`. With the CLI:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" create-group "Larger outcome" --summary "Outcome these Items achieve together" --item <card-id> --item <card-id> --cwd /path/to/repo -o json
node "$PLANBAN_ROOT/bin/planban.mjs" move-card <card-id> --parent <group-id> --cwd /path/to/repo -o json
node "$PLANBAN_ROOT/bin/planban.mjs" move-card <card-id> --board --cwd /path/to/repo -o json
```

Moving an Item from one Group to another removes the old ownership and adds the new one in a single change. You can also create an empty Group and add Items later.

## Can a Group contain another Group?

No. A Group cannot be placed inside another Group, and an Item inside a Group cannot own work. Planban rejects both moves: `A Group cannot be placed inside another Group.` If you need a deeper breakdown, split the outcome into separate Groups on the Main Board.

## What happens to an Item's status when it moves into a Group?

Its Status stays the same. Where an Item sits (on the Main Board or in a Group) and what stage it is at (its Status) are separate choices, so moving an Item never changes its Status unless you ask for that too. The move places the Item in the matching Status column inside the Group, at a priority you choose or at the end of that column.

## What is Group progress?

Group progress is a summary of the Items directly inside a Group, such as how many are Complete out of the total, with a preview of the Items still open. It is shown on the Group's card and when you open the Group.

Group progress does not set the Group's own Status. You or your agent move the Group between Statuses yourselves. One rule links them: a Group cannot move to Complete or Archived while any of its Items is still open. See [Status and priority](/docs/status-and-priority/).
