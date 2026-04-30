# Benefit Policy + Tier Variants — Test Cases

## Unit Tests

### Policy List (`policies/page.tsx`)

| ID | Test | Expected |
|---|---|---|
| PL-01 | Render with initial policies | Table shows 3 rows (Standard Health, Executive Wellness, Contractor Lite) |
| PL-02 | Click "All" status filter | Shows all 3 policies |
| PL-03 | Click "Draft" filter | Shows only Executive Wellness (1 row) |
| PL-04 | Click "Active" filter | Shows only Standard Health (1 row) |
| PL-05 | Click "Deactivated" filter | Shows only Contractor Lite (1 row) |
| PL-06 | Search "Executive" | Shows only Executive Wellness |
| PL-07 | Search "BEN-STD" | Shows only Standard Health |
| PL-08 | Search nonexistent term | Shows empty state with "Create New Policy" CTA |
| PL-09 | Click "Create New Policy" | Opens wizard in create mode |
| PL-10 | Click row (Standard Health) | Opens PolicyDetailView for policy "1" |
| PL-11 | Click kebab → "Clone" on active policy | Opens clone dialog with "Standard Health — Copy" |
| PL-12 | Click kebab → "Deactivate" on active policy | Opens confirm dialog with assignment warning if >0 |
| PL-13 | Click kebab → "Delete" on draft policy | Opens confirm dialog, on confirm removes row |
| PL-14 | Click kebab → "Delete" on deactivated policy with 0 assignments | Opens confirm dialog, on confirm removes row |
| PL-15 | Clone dialog: empty name | "Clone Policy" button disabled |
| PL-16 | Clone dialog: confirm with name | New policy appears in list as Draft, with clonedFrom |

---

### Policy Detail View (`policy-detail-view.tsx`)

| ID | Test | Expected |
|---|---|---|
| DV-01 | Open active policy detail | Header shows name, status badge "Active", cadence subtitle |
| DV-02 | Open draft policy detail | Header shows status badge "Draft", Edit button visible |
| DV-03 | Open deactivated policy detail | Header shows status badge "Deactivated", Delete button visible |
| DV-04 | Overview tab renders | Shows Basics, Pool & Cycle, Benefit Groups sections |
| DV-05 | Overview: group card with services | Shows group name, distribution type, service rows with amounts |
| DV-06 | Overview: 0 groups | Shows "No benefit groups configured" empty state |
| DV-07 | Click "Tier Variants" tab | Shows TierNav with Base + tiers |
| DV-08 | Click "Assigned Orgs" tab | Shows placeholder with assign button |
| DV-09 | Click "Audit Log" tab | Shows "No audit events yet" empty state |
| DV-10 | Click "Edit" button | Opens wizard in edit mode with pre-populated data |
| DV-11 | Click "Clone" button | Opens clone dialog (via parent callback) |
| DV-12 | Click "Deactivate" on active policy | Triggers deactivate callback |
| DV-13 | Click "Delete" on draft policy | Triggers delete callback |

---

### Tier Variants Tab (`tier-variants-tab.tsx`)

#### Base Panel

| ID | Test | Expected |
|---|---|---|
| TV-01 | Select "Base" in nav | Base panel shows all groups and services with base amounts |
| TV-02 | Base panel: group with SharedAmount | Shows "Shared Pool" label and max usage |
| TV-03 | Base panel: group with IndividualBenefitAmount | Shows "Individual" label |
| TV-04 | Draft policy Base panel | Shows amber info banner "Activate this policy to configure tier variants" |

#### TierNav

| ID | Test | Expected |
|---|---|---|
| TV-05 | Render nav with tiers | Shows Base + 3 tiers (Band 1, Band 2, Band 3) |
| TV-06 | Active tier styling | Selected tier has purple bg tint + purple left border |
| TV-07 | Incomplete tier shows orange dot | Band 3 shows orange dot, subtitle "incomplete" |
| TV-08 | Complete tier shows override count | Band 1 shows "2 overrides" |
| TV-09 | Tier with 0 overrides shows "inherits all" | Band 2 (if cleared) shows "inherits all" |
| TV-10 | Click "+ Add tier" | Inline name input appears, button hidden |
| TV-11 | Inline add: type name + Enter | New tier created, auto-selected, input cleared |
| TV-12 | Inline add: press Escape | Input cancelled, "+ Add tier" button reappears |
| TV-13 | Inline add: empty name + Enter | Nothing happens (name required) |
| TV-14 | Draft policy: "+ Add tier" disabled | Button shows tooltip "Activate this policy..." |

#### Tier Panel

| ID | Test | Expected |
|---|---|---|
| TV-15 | Select Band 1 tier | Shows eligibility chips + 2 override inputs |
| TV-16 | Toggle employment type chip | Chip toggles selected/unselected state |
| TV-17 | Employment type not in policy eligible types | Chip disabled with tooltip |
| TV-18 | Toggle department chip | Chip toggles selected/unselected |
| TV-19 | Override input empty | Placeholder shows base amount in muted color, border default |
| TV-20 | Override input with value | Border turns purple, value shown |
| TV-21 | Click clear override (×) | Input empties, border reverts, override removed |
| TV-22 | Override amount ≤ 0 | Not accepted (or shows validation) |
| TV-23 | Click "Save tier" with valid data | Status updates to "complete", nav subtitle updates |
| TV-24 | Click "Save tier" with 0 employment types | Shows validation error "Select at least one employment type" |
| TV-25 | Click "Save tier" with invalid employment type | Shows validation error "[type] is not eligible for this policy" |
| TV-26 | Click "Remove tier" | AlertDialog appears with tier name |
| TV-27 | Confirm remove tier | Tier removed from nav, panel defaults to Base |
| TV-28 | Cancel remove tier | Dialog closes, tier remains |

---

### Benefit Policy Wizard (`benefit-policy-wizard.tsx`)

#### Step 1 — Basics

| ID | Test | Expected |
|---|---|---|
| WZ-01 | Empty name + Next | Shows error "Policy name is required" |
| WZ-02 | Name > 100 chars + Next | Shows error "Max 100 characters" |
| WZ-03 | No employment types selected + Next | Shows error "Select at least one employment type" |
| WZ-04 | Valid name + at least 1 type + Next | Advances to Step 2 |
| WZ-05 | Toggle employment type chip | Chip toggles on/off |

#### Step 2 — Pool Config

| ID | Test | Expected |
|---|---|---|
| WZ-06 | Select "Prorated" without prorate unit + Next | Shows error "Select a prorate unit for Prorated mode" |
| WZ-07 | Prorated Monthly + refresh cycle Weekly | Shows error "Weekly is not valid for Monthly prorate" |
| WZ-08 | Prorated Monthly + refresh cycle Monthly | Valid, advances to Step 3 |
| WZ-09 | Custom date ref without date + Next | Shows error "Enter a custom refresh date" |
| WZ-10 | Custom date in past + Next | Shows error "Refresh date must be today or future" |
| WZ-11 | Valid pool config + Next | Advances to Step 3 |

#### Step 3 — Groups & Services

| ID | Test | Expected |
|---|---|---|
| WZ-12 | 0 groups + Next | Shows error "Add at least one benefit group" |
| WZ-13 | Group with 0 services checked + Next | Shows error "Select at least one service for [group name]" |
| WZ-14 | Service checked with amount ≤ 0 + Next | Shows error "Amount must be greater than 0" |
| WZ-15 | Co-payment enabled without value + Next | Shows error "Co-payment value must be greater than 0" |
| WZ-16 | Toggle service checkbox | Benefit row appears/disappears |
| WZ-17 | Add group button | New group card appended |
| WZ-18 | Remove group button | Group removed, associated benefits removed |
| WZ-19 | Valid groups + Next | Advances to Step 4 |

#### Step 4 — Review & Save

| ID | Test | Expected |
|---|---|---|
| WZ-20 | Review step shows summary | Displays policy name, pool config, group count |
| WZ-21 | Click "Save as Draft" | Shows post-creation modal (SCR-POL-03) |
| WZ-22 | Modal: "Activate & set up tiers" | Policy status set to active, onSuccess called |
| WZ-23 | Modal: "View policy" | Dismisses modal, onSaveDraft called |
| WZ-24 | Modal: "Skip — let org admin handle tiers" | Dismisses modal, onSaveDraft called |

#### Edit Mode

| ID | Test | Expected |
|---|---|---|
| WZ-25 | Edit active policy with assigned orgs | Shows amber banner "Changes apply to future assignments only" |
| WZ-26 | Edit deactivated policy | Banner not shown, status can be changed |
| WZ-27 | Click "Save Changes" | onSuccess called, wizard closes |

---

## Integration / E2E Tests

| ID | Test | Steps |
|---|---|---|
| E2E-01 | Create → Save Draft → Activate | 1. Click Create New Policy 2. Fill Steps 1-3 3. Save as Draft 4. Click "Activate & set up tiers" 5. Verify policy appears as Active |
| E2E-02 | Create → Skip activation | 1. Click Create New Policy 2. Fill Steps 1-3 3. Save as Draft 4. Click Skip 5. Verify policy appears as Draft |
| E2E-03 | Full tier lifecycle | 1. Open active policy detail 2. Click Tier Variants 3. Add tier "Band 4" 4. Select employment types 5. Set 2 overrides 6. Save tier 7. Verify nav shows "2 overrides" 8. Remove tier 9. Verify nav reverts to Base only |
| E2E-04 | Clone with tiers | 1. Open policy with tiers 2. Click Clone 3. Confirm clone 4. Open cloned policy detail 5. Verify Tier Variants tab shows cloned tiers with same overrides |
| E2E-05 | Edit active policy | 1. Open active policy with assigned orgs 2. Click Edit 3. Verify banner shows 4. Change name 5. Save 6. Verify name updated, status stays active |
| E2E-06 | Deactivate → Delete | 1. Open active policy 2. Click Deactivate 3. Confirm 4. Open deactivated policy 5. Click Delete 6. Confirm 7. Verify removed from list |
| E2E-07 | Org page → View policy | 1. Open org detail page 2. Click "View Policy" on assigned policy 3. Verify PolicyDetailView opens with correct data |
| E2E-08 | Org page → Edit policy | 1. Open org detail page 2. Click "View Policy" 3. Click "Edit" in detail 4. Verify wizard opens in edit mode |

---

## Edge Cases

| ID | Scenario | Expected |
|---|---|---|
| EDGE-01 | Policy with 0 groups | Wizard Step 3 shows empty state. Detail Overview shows "No benefit groups configured." |
| EDGE-02 | Policy with 0 tiers | Tier Variants tab shows Base only. "+ Add tier" available (if active). |
| EDGE-03 | Tier with all benefits overridden | Nav shows "N overrides" where N = total benefits. Status = complete. |
| EDGE-04 | Tier with 0 overrides | Nav shows "inherits all". Status = incomplete if no employment types. |
| EDGE-05 | Overlapping tier eligibility | Two tiers both have "full-time" selected. Allowed. No system error. |
| EDGE-06 | All tiers deleted | Policy falls back to base amounts. Nav shows only Base. |
| EDGE-07 | Clone of clone | Allowed. clonedFrom = immediate parent only. |
| EDGE-08 | Edit policy, add new group | Existing employee assignments do not gain new group. |
| EDGE-09 | Active policy edited while assigned | Changes persist but apply to future assignments only. |
| EDGE-10 | Delete active policy | Delete button not rendered. |
| EDGE-11 | Delete deactivated with assignments | Delete blocked with error message. |
| EDGE-12 | Search with mixed case | Case-insensitive match works. |
| EDGE-13 | Status filter + search combined | Both filters applied together. |

---

## Accessibility Tests

| ID | Test | Expected |
|---|---|---|
| A11Y-01 | Keyboard navigate TierNav | Tab into nav, arrow keys move selection, Enter selects |
| A11Y-02 | Keyboard add tier | Tab to "+ Add tier", Enter, type name, Enter confirms |
| A11Y-03 | Focus visible on all interactive elements | All buttons, inputs, tabs have visible focus ring |
| A11Y-04 | Color alone doesn't convey status | Status badges include icon + text, not just color |
| A11Y-05 | Orange incomplete dot has aria-label | "Incomplete tier" or similar for screen readers |
