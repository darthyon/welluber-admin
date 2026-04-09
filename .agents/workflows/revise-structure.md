---
description: Guidelines for revising system structure, data flow, or entity hierarchy
---

# Revise Structure Workflow

Use this workflow when a request involves changing how data is organized, moving fields between entities, or altering the application's overall hierarchy (e.g., "Move Service Category to Brand level"). This workflow focuses on the "domino effect" of structural changes.

## Phase 1: Impact Analysis (Mapping the Dominoes)
1.  **Identify the Source**: Determine where the entity or field currently lives (Type, Zod Schema, or Route).
2.  **Trace Dependencies**:
    - **Data Layer**: Search for all occurrences of the entity in `features/` (schemas, actions, hooks, types).
    - **UI Layer**: Find all pages (`app/`) and components (`components/`) that consume this data.
    - **Logic Layer**: Check business logic (e.g., calculations in `lib/` or server actions) that relies on the current hierarchy.
3.  **URL & Navigation**: Assess if shifting the structure changes route parameters (e.g., `/organizations/[id]` -> `/brands/[id]`).

## Phase 2: Structural Refinement
1.  **Core Types & Schemas**: Update the "Source of Truth" first (e.g., `types.ts` or `schemas.ts`).
2.  **Data Fetching & Mutations**: Update server actions and client hooks to reflect the new parent-child relationships.
3.  **Page Routes**: Refactor route structures and breadcrumbs to align with the new hierarchy.

## Phase 3: UI Inference & Design Hand-off
1.  **Assess Visual Impact**: Determine if the structural change requires moving form fields, updating tables, or changing navigation labels.
2.  **Invoke Edit Design**: If the structural change necessitates UI refinements, invoke the `/edit-design` workflow for surgical visual updates.
3.  **Guidance vs. Execution**: Inform the user if major visual redesigns are needed that fall outside of surgical edits.

## Phase 4: Document Guidance
1.  **Notify User**: Identify system docs that are now technically "stale" (e.g., `docs/design.md`, `FLOWS_SUMMARY.md`, or specific flow files).
2.  **Action**: Explicitly inform the user: *"The structure for X has changed. You may want to update [Doc Name] to reflect this new hierarchy later."* Do NOT auto-update these files unless specifically instructed.

## Phase 5: Verification & Sync
1.  **Build Integrity**: 
    ```bash
    pnpm typecheck && pnpm lint
    ```
2.  **Permission Check**: Verify if the new hierarchy affects permission scopes (e.g., a field moving from Organization Admin to Brand level).
3.  **Breadcrumb Check**: Ensure navigation paths correctly reflect the new structure.

// turbo-all
## Final Verification
1. Run `pnpm dev` and verify that data flows correctly through the new hierarchy.
2. Confirm with the user that the "domino effect" has been contained across the system.
