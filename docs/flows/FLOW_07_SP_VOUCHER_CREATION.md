# Flow 7 — SP: Voucher Creation & Lifecycle — April 2026

**Who:** SP Admin (primary), Host Admin (assisted override/support)  
**Platform:** SP Portal (Web)  
**From:** SP voucher catalog dashboard  
**To:** Voucher published, visible on marketplace when activation period starts  
**Entry condition:** SP account set up (Flow 3), commission schema + tax profile configured. SP ready to list services.  
**Failure exits:** Commission schema missing, weights don't sum to 1.0, invalid dates (end < start), insufficient branch coverage.

---

## Happy Path

**1. SP Admin:** Navigates to Voucher Catalog [NAVIGATE]  
   — Sees: list of all vouchers (Draft, Published, Activated, Paused, Ended)  
   — Status badges, creation date, CTAs: Create | Edit | Publish | Pause | End

**2. SP Admin:** Clicks "Create Voucher" [NAVIGATE]  
   — System: shows voucher creation form (multi-step or single form with sections)

**SECTION 1 — Voucher Basics:**

**3. SP Admin:** Enters basic info  
   — Fields:  
   — Voucher name (text): e.g., "1-Month Gym Pass"  
   — Description (long text): what's included, benefits, terms  
   — Final price (RM, no decimals): Gross amount (SST-inclusive)  
   — Example: "RM 200" (displayed to member, all-inclusive)

**4. System:** Validates inputs [VALIDATE]  
   → If name is empty: error "Voucher name required"  
   → If price < 0: error "Price must be positive"  
   → If all inputs valid: proceed

**SECTION 2 — Service Lines (Core):**

**5. SP Admin:** Adds service lines [NAVIGATE]  
   — Per line: add row with fields:  
   — Main Service (dropdown, from taxonomy): select which service this line represents  
   — Custom sub-service label (optional, free text): e.g., "Peak Hours Unlimited", "60-min deep tissue + hot stone"  
   — Duration (numeric + unit): quantity and unit (session/min/hr/day/month/year)  
   — Weight (decimal): proportional split (must sum to 1.0 across all lines)  
   — Example row: Gym Access | "Peak Hours Unlimited" | 1 month | weight 0.6

**6. SP Admin:** Adds multiple lines (if multi-service voucher)  
   — Example: Gym (weight 0.6) + Therapy (weight 0.4) → total 1.0  
   — Each line maps to a Main Service → commission calculated per line

**7. System:** Real-time weight validation [VALIDATE]  
   — As SP adds lines: sum weights in real-time  
   — Display: "Total weight: 0.6/1.0" or "✓ Weights sum to 1.0"  
   — Error if sum > 1.0 or < 1.0: "Weights must sum to exactly 1.0"  
   — Save button disabled until sum = 1.0

**8. SP Admin:** Confirms weights = 1.0  
   — Proceeds when validation passes

**SECTION 3 — Activation & Redemption Periods:**

**9. SP Admin:** Sets activation period [NAVIGATE]  
   — Fields:  
   — Start date (required, date picker): when voucher appears on marketplace  
   — End date (optional): when voucher stops being available  
   — If no end date: listed indefinitely  
   — Validation: start_date must be >= today, end_date must be >= start_date

**10. SP Admin:** Sets redemption period [NAVIGATE]  
   — Fields (one of two options):  
   — Option A: "On Exact Date" → date picker (member must redeem by this exact date)  
   — Option B: "After Purchase Date" → numeric value + unit (hr/day/month/year)  
   — Example Option A: "Redeem by 2026-06-30"  
   — Example Option B: "Valid for 30 days after purchase"  
   — Validation: both options result in a future expiry date

**11. System:** Clarifies activation vs redemption [NOTIFY]  
   — Tooltip: "Activation period = when package is purchasable. Redemption period = how long voucher is valid after purchase."

**SECTION 4 — Branch Coverage:**

**12. SP Admin:** Scopes branches [NAVIGATE]  
   — Option A: "All branches" (voucher available at any SP branch)  
   — Option B: "Specific branches" (multi-select, only select branches)  
   — Shows: all branches the SP has set up  
   — Validation: at least one branch must be selected

**13. SP Admin:** Selects branches (if Option B)

**SECTION 5 — Review & Save:**

**14. SP Admin:** Reviews voucher summary [NAVIGATE]  
   — Shows: name, price, services (breakdown), activation period, redemption period, branches  
   — CTA: "Save as Draft" or "Save and Publish"

**15a. IF "Save as Draft":**

**15a-1. System:** Saves voucher [API] [PERSIST]  
   — Status: Draft  
   — Not visible on marketplace  
   — Can be edited anytime  
   — Logs: "Created draft voucher [Name] for SP [SP Name]"

**15a-2. System:** Shows draft summary [NAVIGATE]  
   — "Voucher saved as draft"  
   — CTAs: Edit | Publish | Delete (draft only) | View Preview (how it appears on marketplace)

**15b. IF "Save and Publish":**

**15b-1. System:** Saves + publishes [API] [PERSIST]  
   — Status: Published (not yet Activated, only when activation_period starts)  
   — Logs: "Published voucher [Name]"

**15b-2. System:** Shows published summary [NAVIGATE]  
   — "Voucher published! Will appear on marketplace on [start_date]"  
   — Can be: Paused, Edited, Ended

**16. EXIT Voucher Creation:** Voucher saved/published

---

## Voucher Status Machine

```
Draft
  ↓ [SP clicks "Publish"]
Published (waiting for activation_period start)
  ↓ [activation_period start_date arrives via cron]
Activated (visible & purchasable on marketplace)
  ↓ [SP pauses or admin intervention]
  ├→ Paused (hidden from marketplace, can resume)
  │  ↓ [SP clicks "Resume"]
  │  └→ Activated
  └→ [SP ends or activation_period end_date arrives]
     └→ Ended (no new purchases, existing vouchers valid through redemption period)
```

---

## Happy Path — Editing & Lifecycle Management

**1. SP Admin:** Views published voucher [NAVIGATE]  
   — Sees: all details, status badge, CTAs: Edit | Pause | End | View Analytics (Phase 2)

**2a. SP Admin edits voucher [NAVIGATE]  
   — Clicks "Edit"  
   — Can modify: name, description, price, service lines, activation/redemption periods, branches  
   — **Cannot modify after Activated:** activation_period (locked to prevent retroactive changes)  
   — Changes saved, voucher remains in current status

**2b. SP Admin pauses voucher [NAVIGATE]  
   — Clicks "Pause"  
   — Status: Activated → Paused  
   — Marketplace: voucher hidden (no new purchases)  
   — Existing Active vouchers: still valid for redemption  
   — SP can: "Resume" to re-list

**2c. SP Admin ends voucher [NAVIGATE]  
   — Clicks "End"  
   — Status: any → Ended  
   — Marketplace: hidden (no new purchases)  
   — Existing Active vouchers: still valid through redemption period  
   — Cannot restart once Ended

**3. System (Cron):** Manages lifecycle automatically [CRON]  
   — Published → Activated when activation_period start_date arrives  
   — Activated → Ended when activation_period end_date arrives  
   — Active vouchers → Expired when redemption_period expires (per individual voucher purchase, not SP-level)

**4. EXIT Voucher Lifecycle:** Voucher throughout its lifecycle

---

## Edge Cases

**1. Multi-Service Voucher with Unequal Weights**

**Scenario:** SP creates voucher with:
- Gym Access (weight 0.5)
- Personal Training (weight 0.4)

**Flow:**
- Real-time validation: "Total weight: 0.9/1.0 (need 0.1 more)"  
- SP can: add another line with weight 0.1, or adjust existing weights to sum to 1.0  
- Example fix: Gym 0.6 + Training 0.4 = 1.0 ✓  
- Save button enabled

---

**2. Custom Sub-Service Label with Special Characters**

**Scenario:** SP enters: "60-min @ Peak Hours + hot stone (add-on) — RM 50 extra"

**Flow:**
- System: accepts free-text label (no validation on content)  
- Label stored as-is, displayed to member  
- Commission: calculated from Main Service, not the label  
- Member sees: "Personal Training — 60-min @ Peak Hours + hot stone (add-on) — RM 50 extra"

---

**3. Activation Period Starts Tomorrow, Redemption 60 Days**

**Scenario:** SP creates voucher on 2026-03-31:
- Start: 2026-04-01
- End: none (indefinite)
- Redemption: 60 days after purchase

**Flow:**
- Published today, Activated tomorrow  
- Member purchases on 2026-04-01: redeemable until 2026-05-30  
- Member purchases on 2026-12-31: redeemable until 2027-01-29  
- Each voucher gets its own redemption countdown based on purchase date

---

**4. Exact Redemption Date in Past**

**Scenario:** SP tries to set redemption period "On Exact Date: 2026-03-15" (today is 2026-03-31)

**Flow:**
- System validation: "Redemption date must be in future"  
- Error: SP must correct to future date

---

**5. Multiple Service Lines, Different Tax Status**

**Scenario:** SP is_tax_registered = TRUE. Voucher includes:
- Gym Access (taxonomy: Fitness, taxable)
- Meditation (taxonomy: Mindfulness, may be exempt in some jurisdictions)

**Flow:**
- System: applies tax_rate (8%) uniformly to entire voucher  
- No per-service tax override (simplified for v1)  
- Both services treated with same tax treatment  
- If audit required later, Host can override per-SP tax rate

---

**6. Branch Deleted After Voucher Created**

**Scenario:** SP created voucher scoped to "Finance Branch". Then Host Admin deletes that branch.

**Flow:**
- Voucher: still references deleted branch (soft delete)  
- System: orphaned voucher can't be purchased (no valid branch)  
- SP must: edit voucher, select different branch  
- Or: contact support

---

**7. SP Commission Schema Doesn't Include All Voucher Services**

**Scenario:** SP adds voucher with "Meditation" service, but commission schema only covers Fitness + Massage (not Mindfulness category)

**Flow:**
- System: blocks publish  
- Error: "Commission schema not configured for Mindfulness category. Add commission rates before publishing."  
- SP must: contact Host to add commission rate for missing category (Flow 3, Branch C)

---

**8. Host Admin Creates Voucher on SP Behalf**

**Scenario:** SP can't access portal, Host Admin assists (god-mode override)

**Flow:**
- Host navigates to SP detail (SCR-SP-05)  
- Clicks "Create Voucher on Behalf" (optional Host feature)  
- Same creation form as SP Admin  
- Voucher saved under SP's account  
- Audit log: "Host Admin [Name] created voucher [Name] for SP [Name] on [timestamp]"

---

**9. Paused Voucher, Multiple Resume/Pause Cycles**

**Scenario:** SP pauses voucher, resumes next day, pauses again after a week

**Flow:**
- Status transitions: Activated → Paused → Activated → Paused  
- Marketplace visibility: toggled per each transition  
- Existing Active vouchers: always valid (not affected by voucher status)  
- Member can still redeem purchased vouchers, regardless of current voucher status on marketplace

---

**10. Co-Payment on Voucher (Future)**

**Scenario:** PRD currently has co-payment at policy level, not voucher level. But SP might want "RM 50 co-payment for this service"

**Flow:**
- v1: Co-payment is policy-driven, not voucher-driven  
- Voucher price is final price (all-inclusive)  
- Policy defines which benefits require co-payment + amount  
- No per-voucher co-payment override in v1 (defer to v2)

---

## Failure Exits

### Failure: Weights Don't Sum to 1.0

**User sees:** Error message: "Weights must sum to exactly 1.0. Current total: 0.9"

**SP Admin can:**
- Add another service line with remaining weight
- Adjust existing weights
- Delete unnecessary lines

---

### Failure: Commission Schema Missing

**User sees:** Error during publish  
**Message:** "Commission schema not configured for [Category]. Contact Welluber to set up commission rates."

**SP Admin can:**
- Contact Host Admin to configure commission (Flow 3)
- Save as Draft and publish later

---

### Failure: Invalid Redemption Date

**User sees:** Error: "Redemption date must be in future."

**SP Admin can:**
- Select valid future date

---

### Failure: No Branches Specified

**User sees:** Error: "Select at least one branch for this voucher."

**SP Admin can:**
- Select "All branches" or choose specific ones

---

## Handoff to Claude Code

**Screens needed:**
- Voucher Catalog list (all vouchers, status badges, filters, create CTA)
- Voucher creation form (multi-section: basics, service lines, activation/redemption, branches, review)
- Service line builder (drag-drop rows, Main Service dropdown, weight input, custom label text, real-time sum validation)
- Activation period picker (start/end dates, validation)
- Redemption period picker (toggle: exact date vs after purchase, duration input)
- Branch selector (radio: all vs specific, multi-select list)
- Voucher detail / edit (show current state, edit CTAs, pause/end/resume buttons)
- Voucher preview (how it appears on marketplace to members)

**Key implementation notes:**
- Service line weights: real-time validation (must sum to 1.0 before save)
- Custom sub-service labels: free text, no validation (display-only, not taxonomy)
- Commission calculation: based on Main Service (taxonomy), not custom label
- Activation vs redemption: distinct periods (clearly labeled in UI)
- Status machine: Draft → Published → Activated (auto) → Paused/Ended → Ended (auto or manual)
- Branch scoping: all or subset, at least one required
- Commission schema blocking: if service category missing rates, can't publish (error + guidance)
- Edit restrictions: activation_period locked after Activated status (prevent retroactive changes)
- Host override: god-mode create on SP behalf (logged, audit trail)
- All state transitions logged to audit trail with timestamp + actor

