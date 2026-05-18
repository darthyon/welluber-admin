# WellUber Admin — Claude Code Instructions

Read `AGENTS.md` first. It is the single source of truth for stack, design system,
shared components, constraints, and verification commands.

This file adds Claude Code–specific guidance only.

---

## Knowledge Graph

Before analyzing code structure, run `/graphify query "<question>"` in this session,
or read `graphify-out/GRAPH_REPORT.md` for the prebuilt summary.

The graph has 1,679 nodes, 4,111 edges, 118 communities. Built from:
`app/`, `components/`, `features/`, `lib/`, `hooks/`, `types/`.

Key god nodes to be aware of when making changes:

| Node | Edges | Location |
|------|-------|----------|
| `cn()` | 300 | `lib/utils.ts` |
| `Button` | 89 | `components/ui/button.tsx` |
| `OrganizationDetailContent` | 47 | `app/(host)/organizations/[id]/page.tsx` |
| `StatusBadge` | 41 | `components/shared/status-badge.tsx` |
| `ActionPopover` | 33 | `components/shared/action-popover.tsx` |
| `BenefitPolicyWizard` | 23 | `components/host/policies/benefit-policy-wizard.tsx` |

Use `/graphify query` to traverse the graph, `/graphify explain` for node deep-dives,
`/graphify path` to find connections between two concepts.

After significant changes: `/graphify --update` to refresh incrementally.

---

## Memory

Project memory lives in `.claude/projects/…/memory/`. Check it for context on
prior decisions before starting new work.
