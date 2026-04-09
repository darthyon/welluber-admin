---
description: How to perform surgical or specific design edits based on descriptions or images
---

# Surgical Design Edit Workflow

Use this workflow when the user requests specific visual adjustments, layout fixes, or component-level styling changes. Focus on precision, token efficiency, and adherence to the "Gold Standard" design system.

## Phase 1: Diagnosis & Localization (Token Optimized)
1.  **Analyze Input**: 
    - **Description**: Grep for labels, placeholder text, or component names.
    - **Image**: Identify unique icons (Phosphor), layout structures, or specific data fields.
2.  **Structural Impact Check**: 
    - Before proceeding, assess if the edit requires moving data between entities or changing the application's hierarchy (e.g., "Move field X from Organization to Brand").
    - If structural changes are involved, invoke the `/revise-structure` workflow first to align the data layer before refining the UI.
3.  **Targeted Search**: 
    - `grep_search` in `app/(host)/` (pages) or `components/` (shared).
    - Use `ls -R` to find file names before reading.
4.  **Read Smart**: 
    - Do NOT read the entire file if you only need a specific section. 
    - Use `view_file` with `StartLine` and `EndLine` once you have the line number from grep.

## Phase 2: Design Adherence (The Gold Standard)
Before editing, verify against `docs/design.md` and `docs/scaffold.md`:
-   **Typography**: 
    - Body: `text-sm` (14px).
    - Nav/Section Headers: `text-[13px] font-semibold`.
    - Labels: `text-xs` (12px) font-medium.
    - **Prohibited**: NO `font-bold` (max 600 semibold), NO `uppercase` (except nav section titles), NO `tracking-widest`.
-   **Case**: Strictly **Sentence Case** (e.g., "Active policy" instead of "Active Policy").
-   **Colors**: Use CSS variables (e.g., `text-muted-foreground`, `border-border`). Accents should be Indigo (`text-primary`).
-   **Components**: Prefer `DetailSection`, `DetailField`, and `StatusBadge`.

## Phase 3: Surgical Implementation
1.  **Target the Root**: Decide if the edit should happen in a shared component (`components/shared/`) or in the local occurrence.
2.  **Symmetry Check**: If fixing a UI glitch in an "Edit" form, ensure the "Create" form isn't also affected or doesn't need the same fix.
3.  **Precise Replacement**: Use `replace_file_content` for contiguous blocks or `multi_replace_file_content` for non-contiguous changes (e.g., updating a color and its hover state).
4.  **Conditional Logic**: Use `cn()` for dynamic classes instead of template literals where possible.

## Phase 4: Validation & Verification
1.  **Build Integrity**: 
    ```bash
    pnpm typecheck && pnpm lint
    ```
2.  **Visual Confirmation**: Describe the precise change to the user (e.g., "Increased padding-bottom from p-4 to p-6 to align with the sidebar").
3.  **Responsive Check**: Verify the change doesn't break at `<1024px` (tablet) or `<640px` (mobile).

## Phase 5: Communication
- **Ask if Unclear**: If the target element is ambiguous, ask for a path or line number.
- **Suggest Improvements**: If the requested change violates "The Gold Standard" (e.g., "make it bold"), explain the standard and suggest the closest compliant styling (e.g., "using semibold/600 instead to maintain consistency").

// turbo-all
## Final Verification
1. Run `pnpm dev` (if applicable) and verify the change.
2. Update `docs/design.md` if a global pattern was modified.
