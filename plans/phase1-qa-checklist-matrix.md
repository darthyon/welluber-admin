# Phase 1 QA Checklist Matrix

Date: 2026-05-08
Scope: Benefit Policy Phase 1 (1.0-1.5)

## Gate Results

| Gate | Command / Check | Result | Notes |
|---|---|---|---|
| Type Safety | `pnpm exec tsc --noEmit` | PASS | No TypeScript errors in current workspace state. |
| Policy Integrity | `pnpm check:policy` | PASS | Integrity now validates employee policy and assigned group FK links. |
| Targeted Lint (policy slice) | `pnpm exec eslint <changed files>` | PASS (warnings only) | No errors; existing warnings remain in pre-existing code. |

## Phase 1 Acceptance Matrix

| Phase Item | Acceptance Target | Status | Evidence |
|---|---|---|---|
| 1.0 POL-LEGACY Cleanup | No `POL-LEGACY` refs in employee policy links; real policy IDs and group IDs used | PASS | `lib/mock-data/seed.ts` mapped to `POL-20260115-*` with `assignedGroupIds`. |
| 1.0 Integrity Extension | Employee policy and group references validated | PASS | `lib/policy/integrity.ts` checks `missing-employee-policy` and `missing-employee-group`. |
| 1.1 Inline Glossary | Tooltip `?` help available for key policy terms | PASS | `components/shared/field-help.tsx`, `lib/policy-glossary.ts`, wired in both policy surfaces. |
| 1.2 Smarter Defaults | All 4 employment types preselected; Prorated defaults to Monthly | PASS | Default state updated in both wizards; Prorated onSelect sets `prorateUnit` fallback. |
| 1.2 Activation Hint | Copy reads "Immediately on join (most common)" | PASS | Activation mode descriptions updated in both policy surfaces. |
| 1.3 Consequence Summary Modal | Launch shows coverage, reassignment, activation summary before confirm | PASS | `components/host/policies/policy-launch-confirm-modal.tsx` wired in wizard submit path. |
| 1.4 Validation Wiring | Shared validation lib used; actionable messages shown | PASS | `validateBenefit` and `validateGroupInsert` integrated in both policy wizards. |
| 1.5 Draft Auto-save | Draft save/restore/discard, clear on success | PASS | `hooks/use-policy-draft.ts` + banner/restore/clear wired in create wizard flow. |

## Manual UI Verification (Recommended Next Run)

Run in browser to complete UX signoff:

1. Open new policy wizard cold: verify all four employment types are selected.
2. Set Utilisation to Prorated: verify Prorate Unit defaults to Monthly.
3. Add shared group without cap: verify actionable error appears.
4. Set fixed co-payment above amount: verify inline validation message appears.
5. Click Launch on Step 5: verify consequence modal shows coverage, reassignment, and activation lines.
6. Cancel modal and confirm wizard state preserved.
7. Reopen with partial form data: verify draft banner appears and Resume restores full state.

## Notes For Phase 2 Readiness

- Naming normalization for policy surfaces is completed and consistent with handbook style.
- Policy noun and verb constraints are preserved (`Benefit Policy`, `Create`, `Assign`).
- Data/integrity baseline is stable enough to start Phase 2 work.
