# Plan — Tier Variants (Phase 4)

## Context

The `BenefitPolicyWizard` currently handles create, edit, and view modes in one component. The spec (FLOW_BENEFIT_POLICY_MANAGEMENT.md) treats these as separate screens:
- **SCR-POL-02-CREATE** → wizard (already built)
- **SCR-POL-04** → policy detail page with 4 tabs

The wizard's `view` mode currently shows the wrong tabs (Benefit Policy Details / Pool / Groups / Utilisation). It needs to become a dedicated detail view.

## Scope

**In:**
- Dedicated `PolicyDetailView` component for viewing a policy (replaces wizard in view mode)
- 4 tabs: Overview | Tier Variants | Assigned Orgs | Audit Log
- Overview tab: read-only summary of policy config + base benefit structure
- Tier Variants tab: left nav (220px) + right panel
  - Base panel (read-only) showing all groups/services/base amounts
  - Per-tier panel: eligibility rules + benefit overrides
  - Add tier inline in nav
  - Remove tier with confirmation
  - Override count badges in nav
- Update `policies/page.tsx` to route view mode to detail, create/edit to wizard

**Out:**
- Real API integration (stays mock)
- Audit log data (empty state + placeholder table)
- Assigned Orgs full assign/remove flow (basic table + empty state)
- Tier sort order drag-and-drop
- Department select beyond a simple multi-select (we don't have a departments API yet)

**Deferred:**
- Tier eligibility conflict detection system (overlapping rules are allowed per spec)
- Clone now copies tiers (update clone logic to include mock tiers)

## Task Breakdown

### Task 1 — Split view mode into `PolicyDetailView`
**What done looks like:**
- New file `components/host/policies/policy-detail-view.tsx`
- Accepts `policy`, `groups`, `benefits`, `tiers[]` props
- Header: policy name H1 + status badge + subtitle (cadence summary) + [Edit][Clone][Deactivate/Delete]
- Horizontal tabs: Overview | Tier Variants | Assigned Orgs | Audit Log
- Overview tab renders read-only policy basics, pool config, and benefit groups
- `policies/page.tsx` updated: `mode="view"` renders `PolicyDetailView`, `mode="create"|"edit"` renders `BenefitPolicyWizard`

**Depends on:** nothing (can start immediately)
**Risk:** low — mostly moving existing render logic out of the wizard

### Task 2 — Tier Variants tab layout + Base panel
**What done looks like:**
- 220px left nav showing: Base (always first) + list of tier variants
- Active item styling: purple bg tint + 2px purple left border
- Base panel (right): read-only cards showing all groups → services → base amounts
- "Edit base amounts →" link routes to edit wizard (F3)
- Locked state if policy status is draft: "Activate to configure tiers" with CTA

**Depends on:** Task 1
**Risk:** low

### Task 3 — Add tier + tier panel (eligibility + overrides)
**What done looks like:**
- [+ Add tier] button in left nav → inline name input → Enter confirms, Escape cancels
- New tier created with status="incomplete", auto-selected
- Right panel shows:
  - Eligibility: employment type chips (multi-select) + department multi-select
  - Group cards: each group from base, with service rows showing amount input
  - Empty amount input = inherit → placeholder shows base amount greyed out
  - Value set = override → input has purple border
  - [Save tier] button persists tier + overrides
- Nav updates override count: "inherits all" | "3 overrides" | orange dot + "incomplete"

**Depends on:** Task 2
**Risk:** medium — state management for tier overrides is the most complex part

### Task 4 — Remove tier + confirmation
**What done looks like:**
- [Remove tier] button on tier panel
- AlertDialog: "Remove [name]? Employees on this tier revert to base at next assignment refresh."
- Confirm → soft-delete (filter from local state) → nav removes item → panel defaults to Base

**Depends on:** Task 3
**Risk:** low

### Task 5 — Assigned Orgs tab + Audit Log tab (placeholder)
**What done looks like:**
- Assigned Orgs: table with columns org name | assigned date | assigned by | active employees | [Remove]
- [+ Assign to org] button → multi-select dialog (reuse `LinkPolicyModal` pattern)
- Audit Log: empty state "No audit events yet"

**Depends on:** Task 1
**Risk:** low — can be done in parallel with Tasks 2–4

### Task 6 — Wire up + polish
**What done looks like:**
- `policies/page.tsx` manages `tiers` state alongside `policies`
- Clone updated to deep-copy tiers + overrides
- Edit CTA from detail view opens wizard in edit mode
- View CTA from wizard (after create/edit) navigates back to detail view
- Build passes, no type errors

**Depends on:** Tasks 1–5
**Risk:** low

## Simplest Path

If time-constrained, ship **Tasks 1 + 2 + 3** only. That gives:
- A clean detail view
- Base panel showing inherited amounts
- Add tier + set overrides

Task 4 (remove) and Task 5 (org assignment/audit) are supporting features that don't block the core value.

## Risks

1. **State complexity** — tier overrides need to stay in sync with base benefits. If a base benefit is edited, tier overrides referencing it should remain valid (the override amount is independent, only the benefitId link matters).
2. **Component size** — the detail view could get large. If it exceeds ~600 lines, split Tier Variants into its own sub-component `tier-variants-tab.tsx`.
3. **Employment type validation** — the spec says tier eligibility must be a subset of policy.eligibleEmploymentTypes. We'll validate on save and show an inline error.
