---
description: How to audit design based on UX, usability, and design system adherence
---

# UX & Usability Audit Workflow

Use this workflow to evaluate existing or proposed designs. This process ensures that the UI is not only visually consistent with "The Gold Standard" but also functional, accessible, and efficient for the target persona.

## Phase 1: Context & Persona Mapping
Before auditing, identify:
1.  **The Actor**: Host Admin, Org Admin, or Service Provider? (Mental models differ).
2.  **The Goal**: What is the user trying to achieve? (e.g., "Top up branch wallet").
3.  **The Flow**: Is this a high-frequency task or a one-time configuration?

## Phase 2: Heuristic Evaluation (The 10 Heuristics)
Audit the screen against Nielsen's 10 Usability Heuristics. Pay special attention to:
-   **Visibility of System Status**: Are loading states, success messages, and active tabs clear?
-   **Match between System & Real World**: Does the terminology align with `docs/prd.md`?
-   **User Control & Freedom**: Is there a clear "Cancel" or "Back" for destructive actions?
-   **Consistency & Standards**: Does it follow the established patterns in `docs/design.md`?
-   **Error Prevention**: Are destructive actions (e.g., "Deactivate Employee") sufficiently gated?

## Phase 3: Design Adherence (The Gold Standard)
Verify strictly against `docs/design.md`:
-   **Typography**: `13px` for nav/headers, `14px` for body, `12px` for labels. No `font-bold` (max 600).
-   **Color Usage**: Indigo reserved for primary CTAs only. Everything else neutral/muted.
-   **Case**: Strictly **Title Case** for all labels and headers (exception: sidebar headers).
-   **Spacing**: `gap-3` (12px) for grids, `p-4` or `p-5` for cards.
-   **Icons**: Phosphor `regular` (inactive) vs `fill` (active), always 16px in nav.

## Phase 4: Scorecard & Reasoning
Provide a summary table and detailed reasoning.

### Usability Scorecard
| Metric | Score (1-5) | Reasoning |
|---|---|---|
| **Findability** | | Can users find the target action/information instantly? |
| **Efficiency** | | How many clicks/steps to complete the primary task? |
| **Accessibility** | | ARIA labels, contrast, focus rings, keyboard nav. |
| **Adherence** | | Does it feel like it belongs in the WellUber ecosystem? |

> **Score Legend:** 1: Poor/Blocker | 2: Needs Work | 3: Acceptable | 4: Good | 5: Exceptional

## Phase 5: Actionable Summary
Categorize findings into:
1.  **Critical Fixes**: Usability blockers that must be addressed immediately.
2.  **UX Improvements**: Enhancements to friction points or clarity.
3.  **Visual Alignment**: Minor tweaks to adhere to the design system.

---

## Final Output Structure
When presenting the audit, always follow this structure:
### 1. Audit Summary
[Brief overview of the current state]

### 2. The Scorecard
[Insert Table]

### 3. Detailed Reasoning
- **Strength**: [Point] - [Reason]
- **Weakness**: [Point] - [Reason]

### 4. Action Plan
- [ ] Action item 1 (Critical)
- [ ] Action item 2 (Polish)
- [ ] Action item 3 (Structural)

// turbo-all
## Audit Verification
1. Run `pnpm lint` to catch obvious accessibility or prop issues.
2. If the audit leads to changes, invoke `/edit-design` or `/revise-structure`.
