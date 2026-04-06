# Flow — Host Admin: Platform Configuration & Setup Operations — April 2026

**Who:** Host Admin (Welluber HQ)  
**From:** SCR-DASH-01 (Platform Overview) or SCR-CFG-* (configuration screens)  
**To:** Configuration applied, saved, and active across platform  
**Entry condition:** Host Admin logged in with Super Admin role. Platform needs initial or ongoing configuration.  
**Failure exits:** Validation errors (invalid rates, taxonomy conflicts, unbalanced splits), concurrent edit conflicts, data integrity errors.

---

## Overview

Flow 8 has **three parallel configuration workflows** (run at different times, not sequentially):
1. **Taxonomy Management** (Service categories, main services (Tier 2), sub-services) — run once at launch, then add new categories as needed
2. **Policy Management** (Create, clone, assign policies to orgs) — ongoing, as new client contracts arrive or annual refreshes happen
3. **Commission & Cron Config** (Per-SP rates, expired voucher split, global defaults) — run per-SP onboarding and for ongoing tweaks

All three are **Host Admin only**. No approval workflow. No multi-step confirmation (except final save). Direct data model edits with validation.

---

## Workflow A: Service Taxonomy Management

### Happy Path

**1. Host:** Navigates to SCR-CFG-01 (Service Taxonomy Management) [NAVIGATE]  
   — Sees three-level tree: Categories (Tier 1) → Main Services (Tier 2) → Sub-services (Tier 3).  
   — Current taxonomy shown as collapsible tree view or flat list with hierarchy badges.

**2. System:** Loads taxonomy from database [API]  
   — Tree is pre-populated with all existing categories, main services, and sub-services.

**3. Host:** Decides what to do:  
   → If adding new category: click "Add Category" → Branch A (Add Category)  
   → If editing existing main service: click main service name → Branch B (Edit Main Service)  
   → If adding main service under existing category: click category → click "Add Main Service" → Branch B variant  
   → If deactivating (not deleting) a taxonomy item: click item → click "Deactivate" → Branch C (Deactivation)

---

### Branch A: Add New Category

From step 3 (if Host clicks "Add Category"):

**1. System:** Displays add category form [NAVIGATE]  
   — Fields: Category name (text), optional description (text), optional icon (image upload for member app display)

**2. Host:** Enters category name + description + icon (optional)

**3. System:** Validates inputs [VALIDATE]  
   → If category name is empty: show error "Category name required"  
   → If category name already exists: show error "Category already exists. Use a different name."  
   → If icon upload fails: show error "Image upload failed. Try again."  
   → If all inputs valid: proceed to step 4

**4. Host:** Clicks "Save Category"

**5. System:** Saves new category [API] [PERSIST]  
   — Category created with status = active  
   — Logs action: "User [Host email] created category '[Category name]' on [timestamp]"

**6. System:** Navigates back to SCR-CFG-01 [NAVIGATE]  
   — New category appears in tree (collapsed, no main services under it yet)  
   — Toast message: "Category created successfully"  
   — **Exit:** Category addition complete.

---

### Branch B: Edit or Add Main Service (Tier 2)

From step 3 (if Host clicks on a main service or "Add Main Service" under a category):

**Edit mode (clicked on existing main service):**

**1. System:** Displays edit form [NAVIGATE]  
   — Fields: Main Service name (text), optional description (text)  
   — Parent category (read-only, showing which category this belongs to)

**2. Host:** Updates name and/or description

**3. System:** Validates [VALIDATE]  
   → If name is empty: error "Main Service name required"  
   → If name already exists in this category: error "Main Service name already exists in this category"  
   → If valid: proceed to save

**4. Host:** Clicks "Save Main Service"

**5. System:** Updates main service [API] [PERSIST]  
   — Changes saved  
   — Logs action: "User [Host email] edited main service '[Name]' on [timestamp]"

**6. System:** Navigates back to SCR-CFG-01 [NAVIGATE]  
   — Tree refreshes  
   — Toast: "Main Service updated"  
   — **Exit:** Edit complete.

**Add mode (clicked "Add Main Service" under a category):**

**1. System:** Displays add form [NAVIGATE]  
   — Fields: Main Service name (text), optional description (text)  
   — Parent category (pre-filled, read-only)

**2. Host:** Enters main service name + description

**3. System:** Validates [VALIDATE]  
   → Same checks as edit mode

**4. Host:** Clicks "Save Main Service"

**5. System:** Creates main service [API] [PERSIST]  
   — Added to category  
   — Logs action

**6. System:** Navigates back to SCR-CFG-01 [NAVIGATE]  
   — Category now shows new main service in tree  
   — Toast: "Main Service created"  
   — **Exit:** Add complete.

---

### Branch C: Deactivate Taxonomy Item

From step 3 (if Host clicks item and clicks "Deactivate"):

**1. System:** Displays confirmation dialog [NAVIGATE]  
   — Message: "Deactivate [Item type] '[Name]'? Active benefits and packages using this service will be unaffected. New benefits and packages cannot use this service going forward."  
   — Actions: Confirm (button) | Cancel (button)

**2. Host:** Clicks Confirm

**3. System:** Checks if item is in use [API]  
   → If benefits or packages actively reference this item: show warning banner (non-blocking) "This service is currently used by [X] benefits and [Y] packages. They will be grandfathered; new uses are blocked."  
   → If not in use: proceed directly

**4. System:** Deactivates item [API] [PERSIST]  
   — Status: active → deactivated  
   — Item still visible in tree but marked with "deactivated" badge (gray, strikethrough)  
   — Logs action

**5. System:** Navigates back to SCR-CFG-01 [NAVIGATE]  
   — Tree refreshes, item shown as deactivated  
   — Toast: "Service deactivated"  
   — **Exit:** Deactivation complete.

---

## Workflow B: Policy Management

### Happy Path

**1. Host:** Navigates to SCR-HST-02 (Policy List, part of Host Portal) [NAVIGATE]  
   — Sees list of all policies: name, status (draft/active), assigned_orgs count, created date

**2. System:** Loads policies [API]

**3. Host:** Decides what to do:  
   → If creating new policy: click "Create Policy" → Branch D (Create Policy)  
   → If editing existing policy: click policy row → Branch E (Edit Policy)  
   → If cloning existing policy: click policy row → click "Clone" → Branch F (Clone Policy)  
   → If assigning policy to orgs: click policy → click "Assign to Orgs" → Branch G (Assign Policy)  
   → If deactivating policy: click policy → click "Deactivate" → Branch H (Deactivate Policy)

---

### Branch D: Create New Policy

From step 3 (if Host clicks "Create Policy"):

**1. System:** Displays policy creation form (multi-step) [NAVIGATE]  
   — Step 1: Policy basics  
   — Fields: Policy name (text), eligible roles (multi-select: Full-time, Part-time, Contract, Internship), eligible employee types (multi-select)

**2. Host:** Enters policy name and selects eligible roles/types

**3. System:** Displays Step 2: Benefit Pool Configuration  
   — Fields: benefit_pool_type (radio: Individual | Shared), utilization_mode (radio: Fixed | Prorated), prorate_unit (if Prorated), refresh_cycle (dropdown with valid options per prorate_unit), refresh_start_reference (radio: Org FY Start | Employee Join Date | Custom Date)

**4. Host:** Selects pool type, utilization mode, refresh settings

**5. System:** Validates compound field [VALIDATE]  
   → If utilization_mode = Prorated but no prorate_unit selected: error "Prorate unit required for Prorated mode"  
   → If refresh_cycle invalid for selected prorate_unit: error "Invalid refresh cycle for this prorate unit. Valid options: [list]"  
   → If refresh_start_reference = Custom Date but no date entered: error "Enter custom refresh date"  
   → If valid: proceed

**6. System:** Displays Step 3: Benefit Groups Configuration  
   — Table: add rows for each benefit group  
   — Per row: group name (text), distribution type (radio: Shared | Individual), max usage per cycle (optional, number)

**7. Host:** Adds benefit groups (e.g., Fitness RM 2,000/year, Mental Health RM 1,000/year)

**8. System:** For each group, displays Step 4: Add Benefits (Allowlist)  
   — Shows taxonomy Main Services (multi-select checkbox list)  
   — Per selected service: benefit_amount (RM input), co_payment_required (boolean), co_payment_value (if required, RM or %)

**9. Host:** Selects which services are covered in each group, sets amounts and co-pays

**10. System:** Validates amounts [VALIDATE]  
   → If benefit_amount < 0: error "Benefit amount cannot be negative"  
   → If co_payment_value but co_payment_required = false: warning "Co-payment configured but not required. Confirm?"  
   → If valid: proceed

**11. Host:** Clicks "Save Policy"

**12. System:** Creates policy [API] [PERSIST]  
   — Policy status = draft  
   — All benefit groups and benefits created  
   — Logs action: "User [Host email] created policy '[Name]' with [X] groups, [Y] benefits on [timestamp]"

**13. System:** Shows policy detail [NAVIGATE]  
   — Summary: policy name, status (draft), groups and benefits listed  
   — CTAs: Activate | Clone | Delete (draft only) | Assign to Orgs

**14. Host:** Clicks "Activate" to make policy available for org assignment

**15. System:** Activates policy [API] [PERSIST]  
   — Status: draft → active  
   — Policy now appears in assignment dropdowns for all orgs  
   — Logs action

**16. System:** Shows confirmation toast  
   — **Exit:** Policy creation complete.

---

### Branch E: Edit Existing Policy

From step 3 (if Host clicks on active policy and edits):

**1. System:** Displays policy detail [NAVIGATE]  
   — All fields editable except status and creation date  
   — **Note:** If policy is already assigned to orgs, show warning banner: "This policy is assigned to [X] orgs. Changes will apply to all assigned orgs and new employees added to those orgs."

**2. Host:** Makes edits (name, groups, benefits, amounts, co-pays, refresh settings, etc.)

**3. System:** Validates changes [VALIDATE]  
   — Same validation as create

**4. Host:** Clicks "Save Changes"

**5. System:** Updates policy [API] [PERSIST]  
   — All changes persisted  
   — **Important:** Changes apply to future assignments only. Existing Benefit Assignments are NOT retroactively recalculated.  
   — Logs action: "User [Host email] edited policy '[Name]': [specific changes] on [timestamp]"

**6. System:** Shows confirmation toast  
   — **Exit:** Edit complete.

---

### Branch F: Clone Existing Policy

From step 3 (if Host clicks policy and clicks "Clone"):

**1. System:** Displays clone form [NAVIGATE]  
   — Pre-filled fields: original policy name → new name "[Original name] — 2026 Copy"  
   — Confirm before cloning

**2. Host:** Updates policy name if desired

**3. Host:** Clicks "Clone"

**4. System:** Creates copy [API] [PERSIST]  
   — New policy created with all groups and benefits from original  
   — cloned_from field points to original policy  
   — Status = draft (not active)  
   — Logs action: "User [Host email] cloned policy '[Original name]' → '[New name]' on [timestamp]"

**5. System:** Shows cloned policy detail [NAVIGATE]  
   — Banner: "This is a clone of '[Original name]'. Edit as needed."  
   — CTA: Activate | Assign to Orgs | Delete (draft only)

**6. Host:** (Optional) edits cloned policy before activation  
   — **Exit:** Clone complete.

---

### Branch G: Assign Policy to Orgs

From step 3 (if Host clicks policy and clicks "Assign to Orgs"):

**1. System:** Displays org assignment dialog [NAVIGATE]  
   — Multi-select list of all active orgs  
   — Shows which orgs already have this policy assigned (checked, disabled for re-assignment)  
   — New orgs shown unchecked

**2. Host:** Selects one or more orgs to assign this policy to

**3. Host:** Clicks "Assign"

**4. System:** Assigns policy [API] [PERSIST]  
   — Policy added to assigned_orgs list for each selected org  
   — Org Admins will now see this policy in their Policy Assignment wizard  
   — Logs action: "User [Host email] assigned policy '[Name]' to [X] orgs: [org list] on [timestamp]"

**5. System:** Shows confirmation toast  
   — **Exit:** Assignment complete.

---

### Branch H: Deactivate Policy

From step 3 (if Host clicks policy and clicks "Deactivate"):

**1. System:** Displays confirmation dialog [NAVIGATE]  
   — Message: "Deactivate policy '[Name]'? Existing benefit assignments will be unaffected. New orgs cannot be assigned this policy going forward."  
   — Actions: Confirm | Cancel

**2. Host:** Clicks Confirm

**3. System:** Checks if policy is in use [API]  
   → If active benefit assignments exist: show warning (non-blocking) "This policy has [X] active benefit assignments. They will remain active; only new assignments are blocked."

**4. System:** Deactivates policy [API] [PERSIST]  
   — Status: active → deactivated  
   — Policy no longer available for new org assignments  
   — Logs action

**5. System:** Shows confirmation toast  
   — **Exit:** Deactivation complete.

---

## Workflow C: Commission & Cron Configuration

### Happy Path — Commission Configuration (Per-SP)

**1. Host:** Navigates to SCR-SP-04 (Commission Schema Editor), accessed from SP detail view (SCR-SP-05) [NAVIGATE]

**2. System:** Loads commission schema for this SP [API]  
   — Table: Service Category | Commission Rate (Redeemed) | Commission Rate (Expired) | Last Updated

**3. System:** Shows all service categories that this SP has selected during onboarding [API]  
   — Only those categories shown (not all taxonomy categories)

**4. Host:** Enters commission rates for each category [VALIDATE]  
   — Per rate: must be decimal 0.10 to 0.30 (10%–30%)  
   — Can set different rates for Redeemed vs Expired, or lock both to same value

**5. System:** Validates rates in real-time [VALIDATE]  
   → If any rate < 10% or > 30%: show inline error "Rates must be between 10% and 30%"  
   → If all rates valid: enable Save button

**6. Host:** Clicks "Save Commission Schema"

**7. System:** Saves rates [API] [PERSIST]  
   — Rates apply to all future transactions for this SP  
   — last_updated timestamp recorded per category  
   — Logs action: "User [Host email] configured commission for SP '[Name]': [rate breakdown] on [timestamp]"

**8. System:** Shows confirmation toast  
   — **Exit:** Commission config complete.

---

### Happy Path — Global Cron Configuration

From SCR-CFG-02 (Global Cron Settings):

**1. Host:** Navigates to SCR-CFG-02 [NAVIGATE]  
   — Sees current defaults:  
   — Voucher cancellation window: [value] [unit] (default 3 hours)  
   — Voucher validity period: [value] [unit] (default 15 days)  
   — Settlement cycle: [frequency] (default Monthly)

**2. Host:** Updates values if needed  
   — Cancellation window: numeric input + unit dropdown (minutes/hours/days)  
   — Validity period: numeric input + unit dropdown  
   — Settlement cycle: radio (Weekly / Monthly / On-Demand)

**3. System:** Validates inputs [VALIDATE]  
   → If cancellation window < 30 min or > 7 days: warning "This is outside the recommended range (30 min — 7 days). Confirm?"  
   → If validity period < 1 day or > 365 days: warning "This is outside the recommended range (1 day — 365 days). Confirm?"  
   → If valid: show preview

**4. System:** Shows impact preview (non-blocking informational)  
   — "Cancellation window change: All pending vouchers will auto-cancel after [new duration]. [X] vouchers currently pending will be affected within [timeframe]."

**5. Host:** Clicks "Save Settings"

**6. System:** Saves cron config [API] [PERSIST]  
   — New defaults apply to all future cron jobs  
   — No retroactive changes to existing vouchers  
   — Logs action: "User [Host email] updated global cron settings on [timestamp]: cancellation=[new], validity=[new], settlement=[new]"

**7. System:** Shows confirmation toast  
   — **Exit:** Cron config complete.

---

### Happy Path — Expired Voucher Policy Configuration

From SCR-CFG-03 (Expired Voucher Policy):

**1. Host:** Navigates to SCR-CFG-03 [NAVIGATE]  
   — Sees current split: % Org Refund, % SP Ledger, % Welluber Commission  
   — All must sum to 100%

**2. Host:** Adjusts percentages  
   — Three input fields or three sliders  
   — Real-time validation: sum must equal 100%

**3. System:** Validates inputs [VALIDATE]  
   → If sum ≠ 100%: show error "Percentages must sum to 100%. Current total: [X]%"  
   → If valid: enable Save button

**4. System:** Shows impact preview  
   — "For a RM 1,000 expired voucher: Org gets RM [X] refund, SP gets RM [Y] credit, Welluber keeps RM [Z]."

**5. Host:** Clicks "Save Policy"

**6. System:** Saves expired voucher split [API] [PERSIST]  
   — Split applies to all future expired vouchers (unless overridden per-SP in commission schema)  
   — Logs action: "User [Host email] updated expired voucher policy: [breakdown] on [timestamp]"

**7. System:** Shows confirmation toast  
   — **Exit:** Expired voucher policy complete.

---

## Failure Exits

### Failure: Validation Error (Taxonomy)

**User sees:** Inline error on SCR-CFG-01: "Category name required" or "Main Service name already exists"

**User can:**
- Correct the input and save again
- Cancel and discard changes

---

### Failure: Validation Error (Policy Amounts)

**User sees:** Inline error on policy creation: "Benefit amount cannot be negative" or "Invalid refresh cycle for this prorate unit"

**User can:**
- Correct the input and save again
- Cancel and discard changes
- Click help icon for explanation of valid combinations

---

### Failure: Validation Error (Commission Rates)

**User sees:** Inline error on SCR-SP-04: "Commission rate must be between 10% and 30%"

**User can:**
- Correct the rate and save again
- Contact commercial team for rate approval if desired rate is outside range

---

### Failure: Validation Error (Expired Voucher Split)

**User sees:** Error on SCR-CFG-03: "Percentages must sum to 100%. Current total: [X]%"

**User can:**
- Adjust percentages to sum to 100%
- Cancel and discard

---

### Failure: Concurrent Edit Conflict

**User sees:** Error message: "Another admin updated this configuration while you were editing. Please refresh and try again."

**User can:**
- Refresh page (reload latest data)
- Reapply their changes
- Contact support if conflict persists

---

## Edge Cases

**1. Policy Assigned to Orgs, Then Edited**
   - Host edits policy details (amounts, benefits, refresh settings)
   - Changes apply to future Benefit Assignments only
   - Existing assignments with this policy are NOT retroactively recalculated
   - UI shows warning banner when editing an assigned policy

**2. Taxonomy Item Used by Active Policies/Packages**
   - Host tries to deactivate a service category that has active benefits or packages
   - Deactivation still proceeds (non-blocking)
   - Warning shown: "This service is currently used by [X] benefits and [Y] packages. They will be grandfathered."
   - New policies/packages cannot use this service going forward

**3. Commission Rate Change for Active SP**
   - Host updates commission rates for an SP with existing transactions
   - New rates apply only to future transactions
   - Past transactions retain their original rates (immutable)
   - UI clearly states: "Changes apply to new transactions only"

**4. Refresh Settings with "Custom Date" (KIV)**
   - refresh_start_reference = Custom Date is marked TBD in PRD
   - If Host selects Custom Date option: show date picker
   - Validation: date cannot be in future
   - On save: show warning "Custom refresh dates are experimental. Ensure correct calculation before deploying to orgs."

**5. Settlement Cycle Frequency Change**
   - Host changes from Monthly to Weekly (or vice versa)
   - On save: confirmation dialog "This changes when settlement crons trigger. Existing pending payouts are unaffected. Confirm?"
   - Change applies to next scheduled cycle

**6. Utilization Mode Locked After Policy Activation**
   - Host creates policy, activates it, assigns to orgs
   - Tries to edit utilization_mode later
   - System blocks: "Cannot change utilization mode for active policies. Deactivate and create a new policy instead."

---

## Handoff to Claude Code

**SCR-IDs referenced:**
- SCR-CFG-01 (Service Taxonomy Management)
- SCR-CFG-02 (Global Cron Settings)
- SCR-CFG-03 (Expired Voucher Policy)
- SCR-CFG-04 (Payment Gateway Configuration) — not in this flow, but same area
- SCR-HST-02 (Policy List — implied, not yet in screen inventory but needs to exist)
- SCR-SP-04 (Commission Schema Editor)
- SCR-SP-05 (SP Detail View — entry point to commission config)

**Screens that need new components:**
- SCR-CFG-01 (Taxonomy tree browser, add/edit/deactivate forms, collapsible hierarchy)
- SCR-CFG-02 (Cron settings inputs with unit dropdowns, impact preview)
- SCR-CFG-03 (Percentage sliders/inputs, real-time sum validation, impact calculator)
- SCR-HST-02 (Policy list table, filter/sort, create/clone/assign/deactivate CTAs)
- Policy creation form (multi-step stepper, compound field validation for utilization_mode + refresh_cycle)
- Commission schema editor (rate table with real-time validation, toggle for Redeemed vs Expired rates)

**Screens that need edits to existing components:**
- SCR-SP-04 (Commission editor) — needs to load per-SP categories, validate rates, show last_updated timestamp
- SCR-SP-05 (SP Detail) — add link/tab to commission config

**Implementation sequence:**
1. Build taxonomy manager (SCR-CFG-01) with tree view and CRUD operations
2. Build policy management (SCR-HST-02 list + multi-step creation form)
3. Build cron config (SCR-CFG-02) with impact preview
4. Build expired voucher split config (SCR-CFG-03)
5. Build commission schema editor (SCR-SP-04) with per-SP category filtering
6. Integrate API calls for all save operations [API] [PERSIST]
7. Implement validation logic [VALIDATE] for all inputs
8. Test concurrent edit scenarios (refresh handling)
9. Test policy assignments and impact warnings (deactivation, edits on assigned policies)

**Key implementation notes:**
- Taxonomy deactivation is non-destructive (mark inactive, keep in DB, hide from new uses)
- Policy changes do NOT retroactively recalculate existing Benefit Assignments
- Commission rate changes apply only to new transactions (immutable ledger)
- All configuration changes logged to audit trail with user email, timestamp, specific changes
- Validation is real-time (inline errors on forms, not just on save)
- Impact previews are informational only (non-blocking warnings)
- Host is the only actor for all these workflows (no approval, no delegation)
- Settings changes are applied immediately to all affected future transactions (no scheduled effective dates, except commission rates which support future_dated changes via effective_from field)
