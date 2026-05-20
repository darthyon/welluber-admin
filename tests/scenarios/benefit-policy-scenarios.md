# Benefit Policy — Scenario Test Cases

Covers **Add**, **Edit**, and **View** flows. Each scenario states preconditions, actor, steps, and expected outcome. Scenarios marked `[INVALID]` test validation/rejection paths.

---

## ADD — Create Benefit Policy

### BP-ADD-01 · Happy path: full policy from scratch → activate

**Actor:** Host admin  
**Precondition:** No draft saved in localStorage

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Create New Policy" | Wizard opens at Step 1 (Basics), all fields blank |
| 2 | Enter name "Sejahtera Wellness FY2026", description, select Full-Time employment type | Fields accept input, Next enabled |
| 3 | Advance to Step 2 (Pool Config) | Step 1 validates, Pool Config form loads |
| 4 | Set pool type Individual, cap RM 1,200, utilisation Fixed, refresh Yearly, start month January | Inputs accept values |
| 5 | Advance to Step 3 (Benefit Groups) | Pool Config validates, Groups canvas loads empty |
| 6 | Add group "Physical Wellbeing", add service FX-GYM at RM 200, add service FX-PT at RM 150 | Group card renders with two service rows, total = RM 350 |
| 7 | Advance to Step 4 (Assign Employees) | Step 3 validates, employee selector loads |
| 8 | Select 3 employees from org | Employees tagged |
| 9 | Advance to Step 5 (Review) | Summary renders: name, pool, 1 group, 2 services, 3 assignees |
| 10 | Click "Launch Policy" | Post-creation modal appears with Activate / View / Skip options |
| 11 | Click "Activate" | Policy status = "active", toast shown, wizard closes |

**Valid** ✓

---

### BP-ADD-02 · Save as draft mid-wizard, resume, complete

**Actor:** Host admin  
**Precondition:** No existing draft

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open wizard, fill Step 1 fully | Fields valid |
| 2 | Click "Save Draft" | Toast "Draft saved", wizard stays open |
| 3 | Close wizard (Cancel) | Wizard closes, draft persists in localStorage |
| 4 | Re-open wizard | "Resume draft?" prompt appears |
| 5 | Click "Resume" | Wizard restores to last saved state with Step 1 data intact |
| 6 | Complete Steps 2–5, click "Save as Draft" on Review | Policy saved with status "draft" |

**Valid** ✓

---

### BP-ADD-03 · Start from template, customise, save draft

**Actor:** Host admin  
**Precondition:** Policy templates available (standard-health, executive-wellness, contractor-lite)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open wizard | Template picker shown at top |
| 2 | Select "Standard Health" template | Step 1 pre-filled: name "Standard Health Policy", Fixed/Yearly/Individual, groups populated |
| 3 | Change name to "Maju Retail Wellness FY2026", update cap from RM 1,500 to RM 1,000 | Fields accept edits |
| 4 | Remove the "Nutritional Support" group | Group card removed, remaining groups intact |
| 5 | Save as Draft on Review step | policy.clonedFrom = undefined, policy.templateId = "standard-health", status = "draft" |

**Valid** ✓

---

### BP-ADD-04 `[INVALID]` · Step 1 — submit with empty name

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open wizard, leave name blank, fill all other Step 1 fields | Name field shows no error yet |
| 2 | Click "Next" | Inline error "Policy name is required" under name field, wizard stays on Step 1 |

**Invalid** ✗ — Step 1 must block until name is provided

---

### BP-ADD-05 `[INVALID]` · Step 2 — cap amount set to 0

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Complete Step 1 | Advance to Pool Config |
| 2 | Set totalCapAmount = 0 | Field accepts 0 |
| 3 | Click "Next" | Error "Cap must be greater than 0", cannot advance |

**Invalid** ✗

---

### BP-ADD-06 `[INVALID]` · Step 3 — advance with zero benefit groups

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Complete Steps 1–2 | Advance to Benefit Groups |
| 2 | Click "Next" without adding any group | Error "At least one benefit group is required", step blocked |

**Invalid** ✗

---

### BP-ADD-07 `[INVALID]` · Step 3 — group with no services

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Reach Step 3, add group "Empty Group" | Group card appears |
| 2 | Leave group with 0 services, click "Next" | Error "Each group must have at least one service", step blocked |

**Invalid** ✗

---

### BP-ADD-08 `[INVALID]` · Step 3 — same service in two groups

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Add group A with service FX-GYM | Group A: FX-GYM |
| 2 | Add group B, attempt to select FX-GYM | FX-GYM greyed out / shows conflict warning "Already assigned to Physical Wellbeing" |
| 3 | Attempt to save/advance | Blocked until conflict resolved |

**Invalid** ✗ — services must belong to exactly one group

---

### BP-ADD-09 `[INVALID]` · Prorated mode with no prorateUnit

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Step 2: set utilisationMode = "Prorated", leave prorateUnit blank | prorateUnit field shows as required |
| 2 | Click "Next" | Error "Prorate unit required when utilisation is Prorated", step blocked |

**Invalid** ✗

---

### BP-ADD-10 `[INVALID]` · Dependent coverage added, dependentsPoolType not set

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Step 1: add dependent coverage "Spouse" | Dependent section expands |
| 2 | Step 2: leave dependentsPoolType unset | No error yet |
| 3 | Click "Next" on Step 2 | Error "Dependent pool type required when dependents are covered", step blocked |

**Invalid** ✗

---

## EDIT — Modify Existing Benefit Policy

### BP-EDIT-01 · Edit active policy — name/description only

**Actor:** Host admin  
**Precondition:** "Acme Employee Wellness Policy FY2026" exists, status = "active"

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open policy detail, click "Edit" | Wizard opens in edit mode, all fields pre-populated |
| 2 | Change name to "Acme Employee Wellness Policy FY2026 (Revised)" | Name field updates |
| 3 | Advance through all steps unchanged, click "Save" | Policy saves, status remains "active", name updated in header |

**Valid** ✓

---

### BP-EDIT-02 · Add new benefit group to active policy

**Actor:** Host admin  
**Precondition:** Policy has 2 existing groups

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open wizard in edit mode, navigate to Step 3 | Existing groups shown |
| 2 | Add group "Vision Care", add service OP-EYE at RM 300 | New group card appears |
| 3 | Save | Policy groupCount = 3, new group and benefit persisted |

**Valid** ✓

---

### BP-EDIT-03 · Change pool type Individual → Shared on active policy

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open wizard in edit mode, Step 2 | benefitPoolType shows "Individual" |
| 2 | Switch to "Shared" | Warning banner: "Changing pool type affects existing entitlements" |
| 3 | Acknowledge and save | Pool type updated, warning dismissed, status unchanged |

**Valid** ✓ — warning required, not a block

---

### BP-EDIT-04 · Promote draft policy to Active

**Actor:** Host admin  
**Precondition:** Policy status = "draft"

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open draft policy detail | Status badge "Draft", Edit button visible |
| 2 | Click "Edit" | Wizard opens in edit mode |
| 3 | On Review step, set status picker to "Active" | Status selector shows "Active" |
| 4 | Save | Policy status = "active", badge updates, effectiveDate = today |

**Valid** ✓

---

### BP-EDIT-05 · Deactivated policy — edit button hidden

**Actor:** Host admin  
**Precondition:** Policy status = "deactivated"

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open deactivated policy detail | Header shows "Deactivated" badge |
| 2 | Check for Edit button | No Edit button present |
| 3 | Check action menu | Only "Clone" and "Delete" available; no edit entry |

**Valid** ✓ — deactivated = view-only

---

### BP-EDIT-06 `[INVALID]` · Remove all benefit groups from active policy

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open wizard in edit mode, Step 3 | Groups listed |
| 2 | Delete all groups one by one | Groups removed, canvas empty |
| 3 | Click "Next" | Error "At least one benefit group is required", step blocked |

**Invalid** ✗

---

### BP-EDIT-07 `[INVALID]` · Set cap to negative number

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open wizard in edit mode, Step 2 | Cap field shows current value |
| 2 | Clear field, type -500 | Field accepts characters |
| 3 | Click "Next" | Error "Cap must be a positive amount", step blocked |

**Invalid** ✗

---

## VIEW — Read Policy Detail

### BP-VIEW-01 · View active policy — all sections render

**Actor:** Host admin  
**Precondition:** Policy status = "active", has 2 groups, 4 benefits

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click policy row in list | PolicyDetailView opens, default to Overview tab |
| 2 | Overview: Basics section | Name, description, employment types, eligibility shown |
| 3 | Overview: Pool & Cycle section | Pool type, cap, utilisation mode, refresh cycle shown |
| 4 | Overview: Benefit Groups section | 2 group cards, each with service rows and RM amounts |

**Valid** ✓

---

### BP-VIEW-02 · View draft policy — correct actions shown

**Actor:** Host admin  
**Precondition:** Policy status = "draft"

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open draft policy | Status badge = "Draft" |
| 2 | Check header actions | Edit button visible, no Deactivate button |
| 3 | Check kebab menu | Clone, Delete available; Deactivate absent |

**Valid** ✓

---

### BP-VIEW-03 · View deactivated policy — correct actions shown

**Actor:** Host admin  
**Precondition:** Policy status = "deactivated"

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open deactivated policy | Status badge = "Deactivated" |
| 2 | Check header actions | Delete button visible, no Edit, no Deactivate |
| 3 | Check kebab menu | Clone, Delete available |

**Valid** ✓

---

### BP-VIEW-04 · View policy with 0 benefit groups

**Actor:** Host admin  
**Precondition:** Draft policy exists with no groups configured

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open policy | Overview tab loads |
| 2 | Benefit Groups section | Empty state: "No benefit groups configured" |

**Valid** ✓

---

### BP-VIEW-05 · Tier Variants tab

**Actor:** Host admin  
**Precondition:** Policy has Base + 1 tier variant

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Tier Variants" tab | TierNav renders with Base tab and one named tier tab |
| 2 | Click Base tab | Base policy details shown |
| 3 | Click tier tab | Tier override details shown (different cap or groups) |

**Valid** ✓

---

### BP-VIEW-06 · Assigned Orgs tab — empty state

**Actor:** Host admin  
**Precondition:** Policy has no assigned orgs

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Assigned Orgs" tab | Empty state with "Assign to Organisation" CTA |

**Valid** ✓

---

### BP-VIEW-07 · Audit Log tab — empty for new policy

**Actor:** Host admin  
**Precondition:** Policy was just created, no actions taken

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Audit Log" tab | "No audit events yet" empty state |

**Valid** ✓

---

### BP-VIEW-08 · View policy with Prorated utilisation — cadence subtitle

**Actor:** Host admin  
**Precondition:** Policy utilisationMode = "Prorated", prorateUnit = "Monthly"

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open policy detail | Header subtitle shows cadence e.g. "Prorated · Monthly · Yearly refresh" |
| 2 | Pool & Cycle section | Prorate unit field shown alongside refresh cycle |

**Valid** ✓

---

### BP-VIEW-09 · Version policy — parentPolicyId visible

**Actor:** Host admin  
**Precondition:** Policy is a tier variant with parentPolicyId set

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open variant policy detail | Header or Overview shows version label (e.g. "V1.1") |
| 2 | Parent link or reference visible | Can navigate back to parent policy |

**Valid** ✓
