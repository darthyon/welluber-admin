# FLOW — Benefit Policy Management (Host Portal)

**Epic:** EPIC 04\
\
**Actor:** Host Admin (god-mode), HR Org Admin (read-only on policies)\
\
**Screens:** SCR-POL-01 through SCR-POL-07\
\
**Entry:** Host navigates to /policies\
\
**Phase map:** P1=CRUD foundation · P2=Activation+modal · P3=Clone · P4=Tiers · P5=Orgs+Audit

***

## STATUS RULES

| Status      | HR sees | Can assign | Can edit                      | Can delete                  |
| ----------- | ------- | ---------- | ----------------------------- | --------------------------- |
| draft       | No      | No         | Yes (full)                    | Yes                         |
| active      | Yes     | Yes        | Yes (future assignments only) | No                          |
| deactivated | No      | No         | No                            | Yes if 0 active assignments |

> CRITICAL: Editing active policy never retroactively affects existing Benefit Assignments.

***

## SCREENS

**SCR-POL-01** Policy list

- Table: name | status badge | eligible types | group count | assigned orgs | created date | actions
- Actions: [Create policy] primary CTA | row kebab: Clone | Deactivate (active) | Delete (draft)
- Filters: status pill toggle (All|Draft|Active|Deactivated) + name search (debounce 300ms)
- Empty state: icon + "No policies yet" + [Create policy]

**SCR-POL-02-CREATE** Policy creation wizard

- Steps: Basics → Pool config → Groups & services → Review
- Back navigation free. Forward requires current step validation.

**SCR-POL-03-MODAL** Post-creation modal

- Fires after save-as-draft. Overlays detail page.
- Shows: policy name + status badge + group count (read-only badge)
- CTAs: [Activate & set up tiers →] | [View policy] | skip link "Skip — let org admin handle tiers"
- Activate CTA: sets status=active [API][PERSIST] → navigates to Tier Variants tab

**SCR-POL-04** Policy detail (4 tabs)

- Header (all tabs): name H1 + status badge + subtitle (cadence summary) + [Edit][Clone][Deactivate/Delete]
- Tab: Overview | Tier Variants | Assigned Orgs | Audit Log

**SCR-POL-05** Tier Variants tab

- Layout: 220px left nav (tier list) + right content panel
- Left nav items: tier name + muted override count ("3 overrides" | "inherits all" | orange dot "incomplete")
- Active item: purple bg tint + 2px purple left border

**SCR-POL-06** Assigned Orgs tab

- Table: org name | assigned date | assigned by | active employees | [Remove]
- [+ Assign to org] → multi-select dialog, active orgs only

**SCR-POL-07** Audit Log tab

- Table: timestamp | actor | action | field-level diff
- Filters: date range + actor
- Pagination: 20/page

***

## FLOWS

### F1: Create policy [Phase 1 + 2]

**1.** HOST: navigate to SCR-POL-01 [NAVIGATE]\
\
**2.** HOST: click [Create policy]\
\
**3.** SYSTEM: render wizard Step 1 [NAVIGATE]\
\
**4.** HOST: complete Steps 1–4 (see wizard field spec below)\
\
**5.** SYSTEM: validate on each Continue [VALIDATE] — see Validation section\
\
**6.** HOST: click [Save as draft] on Step 4\
\
**7.** SYSTEM: persist policy (status=draft) + groups + benefits [API][PERSIST]\
\
**8.** SYSTEM: log "created policy [name] with [N] groups" [AUDIT]\
\
**9.** SYSTEM: render completion modal SCR-POL-03-MODAL [NAVIGATE]\
\
**10.** HOST: choose action\
\
→ Activate & set up tiers: `POST /policies/:id/activate` [API][PERSIST] → navigate to Tier Variants tab\
\
→ View policy: dismiss modal → Overview tab\
\
→ Skip: dismiss modal → Overview tab

***

### F2: View policy [Phase 1]

**1.** HOST: click row on SCR-POL-01 [NAVIGATE]\
\
**2.** SYSTEM: load SCR-POL-04, default Overview tab [API]\
\
**3.** All data read-only in Overview

***

### F3: Edit policy [Phase 1 + 2]

**1.** HOST: click [Edit] on SCR-POL-04 header\
\
**2.** SYSTEM: render edit wizard, pre-populated [NAVIGATE]\
\
**3.** SYSTEM: if policy active AND has assigned orgs → show banner "Changes apply to future assignments only" [VALIDATE]\
\
**4.** HOST: edit any step\
\
**5.** HOST: click [Save changes]\
\
**6.** SYSTEM: validate [VALIDATE]\
\
**7.** SYSTEM: persist updates [API][PERSIST]\
\
**8.** SYSTEM: log field-level diff [AUDIT]\
\
**9.** SYSTEM: toast "Policy updated" → navigate to Overview tab [NAVIGATE]

***

### F4: Configure tier variants [Phase 4]

**Entry guard:** policy must be active. If draft → show locked state + "Activate to configure tiers".

**4a. Add tier**\
\
**1.** HOST: click [+ Add tier] in left nav\
\
**2.** SYSTEM: append inline name input in nav list\
\
**3.** HOST: type name → Enter to confirm | Escape to cancel\
\
**4.** SYSTEM: create TierVariant (status=incomplete) [API][PERSIST]\
\
**5.** SYSTEM: auto-select new tier → render Tier panel on right\
\
**6.** HOST: set eligibility rules (employment type chips + dept select)\
\
**7.** HOST: set benefit overrides in group cards (empty = inherit base)\
\
**8.** HOST: click [Save tier]\
\
**9.** SYSTEM: persist tier + overrides [API][PERSIST]\
\
**10.** SYSTEM: update nav override count [NAVIGATE]\
\
**11.** SYSTEM: toast "Tier saved"

**4b. Base panel (read-only)**

- Shows all groups + services + base amounts
- [Edit base amounts →] links to F3 (Edit policy), not in-panel edit

**4c. Override input behaviour**

- Empty field = inherit → placeholder shows base amount greyed out
- Value set = override → input shows purple border
- Override count in nav: null overrides = "inherits all" | N overrides = "N override(s)" | tier has no services = "incomplete" (orange dot)

***

### F5: Remove tier [Phase 4]

**1.** HOST: click [Remove tier] on Tier panel\
\
**2.** SYSTEM: AlertDialog "Remove [name]? Employees on this tier revert to base at next assignment refresh."\
\
**3.** HOST: confirm\
\
**4.** SYSTEM: soft-delete tier + overrides [API][PERSIST]\
\
**5.** SYSTEM: nav removes item, panel defaults to Base [NAVIGATE]\
\
**6.** SYSTEM: log [AUDIT]

***

### F6: Clone policy [Phase 3]

**1.** HOST: click [Clone] on SCR-POL-04 or kebab on SCR-POL-01\
\
**2.** SYSTEM: dialog with pre-filled name "[Original] — Copy" (editable)\
\
**3.** HOST: edit name if needed → [Clone]\
\
**4.** SYSTEM: validate name unique [VALIDATE]\
\
**5.** SYSTEM: deep copy policy + groups + benefits + tiers + overrides, status=draft, cloned_from=original.policy_id [API][PERSIST]\
\
**6.** SYSTEM: navigate to new policy SCR-POL-04 [NAVIGATE]\
\
**7.** SYSTEM: banner "Cloned from [Original name]"\
\
**8.** SYSTEM: log on both original and clone [AUDIT]

***

### F7: Deactivate policy [Phase 2]

**1.** HOST: click [Deactivate]\
\
**2.** SYSTEM: check active assignments [API]\
\
**3.** SYSTEM: AlertDialog "Deactivate? Existing assignments unaffected. No new assignments possible."\
\
→ if active assignments exist: add non-blocking warning "Policy has [N] active employee assignments."\
\
**4.** HOST: confirm\
\
**5.** SYSTEM: status = deactivated [API][PERSIST]\
\
**6.** SYSTEM: remove from org assignment dropdowns immediately\
\
**7.** SYSTEM: toast "Policy deactivated" [AUDIT]

***

### F8: Delete policy [Phase 1 + 2]

**Permitted only:** draft OR deactivated with 0 active assignments.

**1.** HOST: click [Delete] (visible only on draft/deactivated)\
\
**2.** SYSTEM: check active benefit assignments [API]\
\
→ if any: block, error "Cannot delete — [N] active assignments reference this policy."\
\
→ if none: AlertDialog "Permanently delete [name]? This cannot be undone."\
\
**3.** HOST: confirm\
\
**4.** SYSTEM: hard-delete policy + groups + benefits + tiers + overrides [API][PERSIST]\
\
**5.** SYSTEM: navigate to SCR-POL-01 [NAVIGATE]\
\
**6.** SYSTEM: toast "Policy deleted" [AUDIT]

***

## WIZARD FIELD SPEC

### Step 1 — Basics

| Field                     | Component               | Rules                                                                 |
| ------------------------- | ----------------------- | --------------------------------------------------------------------- |
| Policy name               | Text input              | Required. Max 100. Unique in host account.                            |
| Description               | Text input              | Optional. Max 300.                                                    |
| Eligible employment types | Multi-select chip group | Required. Min 1. Options: Full-time, Part-time, Contract, Internship. |

### Step 2 — Pool config

| Field                   | Component    | Rules                                                                       |
| ----------------------- | ------------ | --------------------------------------------------------------------------- |
| benefit_pool_type       | Radio        | Required. Individual | Shared.                                              |
| utilization_mode        | Radio        | Required. Fixed | Prorated.                                                 |
| prorate_unit            | Select       | Required if Prorated. Hidden if Fixed.                                      |
| refresh_cycle           | Radio/Select | Required. Constrained by prorate_unit if Prorated.                          |
| refresh_start_reference | Radio        | Required. fy_start | join_date | custom_date.                               |
| refresh_custom_date     | Date picker  | Required if refresh_start_reference = custom_date. Must be today or future. |

> Compound rule: if Prorated, refresh_cycle must be ≥ prorate_unit. Invalid combos blocked.

### Step 3 — Groups & services

| Element             | Rules                                                                        |
| ------------------- | ---------------------------------------------------------------------------- |
| Group card          | Editable name inline. Distribution type toggle. Max 1 group name per policy. |
| max_usage_per_cycle | Optional integer per group. Null = no cap.                                   |
| Service checklist   | Select from TaxonomyMainService. Checked = one Benefit record created.       |
| benefit_amount      | RM input per checked service. Required, >0.                                  |
| co_payment_required | Toggle per service. Default off.                                             |
| co_payment_value    | RM or % input. Required if co_payment_required=true, >0.                     |
| Min groups          | At least 1 group required.                                                   |
| Min services        | At least 1 service checked per group.                                        |

### Step 4 — Review

- Read-only summary of Steps 1–3
- Info callout: "Saved as Draft. Activate to make visible to orgs."
- CTA: [Save as draft]

***

## VALIDATION RULES

### Step 1

| Condition                  | Error                                    |
| -------------------------- | ---------------------------------------- |
| name empty                 | "Policy name is required"                |
| name > 100                 | "Max 100 characters"                     |
| name not unique            | "A policy with this name already exists" |
| no eligible_roles selected | "Select at least one employment type"    |

### Step 2

| Condition                              | Error                                                    |
| -------------------------------------- | -------------------------------------------------------- |
| Prorated + no prorate_unit             | "Select a prorate unit for Prorated mode"                |
| refresh_cycle invalid for prorate_unit | "[cycle] is not valid for [unit] prorate. Valid: [list]" |
| custom_date ref + no date              | "Enter a custom refresh date"                            |
| custom_date in past                    | "Refresh date must be today or future"                   |

### Step 3

| Condition                      | Error                                          |
| ------------------------------ | ---------------------------------------------- |
| 0 groups                       | "Add at least one benefit group"               |
| group with 0 services          | "Select at least one service for [group name]" |
| service checked, amount empty  | "Enter an amount for [service name]"           |
| amount ≤ 0                     | "Amount must be greater than 0"                |
| co_payment_required + no value | "Enter a co-payment value"                     |
| co_payment_value ≤ 0           | "Co-payment value must be greater than 0"      |

### Tier variants

| Condition                              | Error                                    |
| -------------------------------------- | ---------------------------------------- |
| tier name empty                        | "Tier name is required"                  |
| tier name not unique in policy         | "A tier with this name already exists"   |
| no eligible_employment_types on tier   | "Select at least one employment type"    |
| tier type not in policy eligible_roles | "[type] is not eligible for this policy" |
| override amount ≤ 0                    | "Amount must be greater than 0"          |
| override max_usage ≤ 0                 | "Max uses must be greater than 0"        |

***

## AUDIT EVENTS

All actions log: actor email, timestamp, entity id, action type, diff where applicable.

| Event                   | Trigger                                     |
| ----------------------- | ------------------------------------------- |
| policy.created          | F1 save-as-draft                            |
| policy.activated        | F1 or standalone activate                   |
| policy.edited           | F3 save — include field-level diff          |
| policy.deactivated      | F7 confirm                                  |
| policy.deleted          | F8 confirm                                  |
| policy.cloned           | F6 confirm — log on both original and clone |
| policy.assigned_to_org  | F-org assign                                |
| policy.removed_from_org | F-org remove                                |
| tier.created            | F4a confirm                                 |
| tier.edited             | F4a save tier                               |
| tier.removed            | F5 confirm                                  |

***

## EDGE CASES

### Active policy edited while assigned to orgs

- Changes persist. Apply to future assignments only.
- Existing employee assignments: immutable. No retroactive recalc.
- Adding new group: existing assignments do not gain it. HR must re-assign.

### Tier eligibility conflicts

- Two tiers with overlapping rules: allowed. No system error. HR resolves at assignment time.
- Tier includes employment type not in policy.eligible_roles: blocked (validation error).
- All tiers deleted: valid. Policy falls back to base amounts for all.

### Clone

- Name collision: validation error on dialog.
- Clone of clone: allowed. cloned_from = immediate parent only.
- Cloned policy always status=draft regardless of original status.
- Clone includes all tiers + overrides.

### Delete

- active policy: [Delete] button not rendered.
- deactivated + active assignments: delete blocked with count.
- deactivated + 0 assignments: allowed after AlertDialog.

***

## OPEN QUESTIONS

| ID    | Question                                                                               | Owner           |
| ----- | -------------------------------------------------------------------------------------- | --------------- |
| OQ-01 | HR Org Admin — can they configure tier variants post-v1, or Host-only at launch?       | Product         |
| OQ-02 | Service removed from active policy — existing Active vouchers honoured or invalidated? | Product + Legal |
| OQ-03 | Tier sort order in nav = display order in HR assignment wizard? Confirm.               | Design          |
| OQ-04 | max_usage_per_cycle — hard cap (block claim) or soft cap (warn only)?                  | Engineering     |
| OQ-05 | [Phase 2] Dependent benefit config — policy level or tier level?                       | Product         |
