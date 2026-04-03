# Flow 3 — Host Admin: Service Provider Setup — April 2026

**Who:** Host Admin (Welluber HQ)  
**Platform:** Host Portal  
**From:** Org/SP registration queue or Host Admin manual creation  
**To:** SP Admin has portal access, branches configured, commission + tax profile set, ready to create vouchers  
**Entry condition:** Host Admin logged in with Super Admin role. New wellness centre contracted to partner with Welluber.  
**Failure exits:** Missing required fields, banking details validation errors, commission schema incomplete, concurrent edits.

---

## Happy Path

**1. Host:** Navigates to SP management section [NAVIGATE]  
   — Sees list of SPs (active, pending, suspended)

**2. System:** Loads SP list [API]

**3. Host:** Decides action:  
   → If creating new SP: click "Add SP" → Branch A (Create SP Account)  
   → If editing existing SP: click SP row → Branch B (Edit SP Details)  
   → If configuring commission: click SP → click "Commission Schema" → Branch C (Configure Commission)  
   → If setting tax profile: click SP → click "Tax Profile" → Branch D (Set Tax Profile)  
   → If adding SP Admin user: click SP → click "Team" → Branch E (Add SP Admin)

---

## Branch A: Create New SP Account

From step 3 (if Host clicks "Add SP"):

**1. System:** Displays SP account creation form [NAVIGATE]  
   — Fields: Company name, Registration no., Service categories (multi-select from taxonomy), Description, Website, PIC contact details (name, email, phone)

**2. Host:** Enters SP details

**3. System:** Validates inputs [VALIDATE]  
   → If company name is empty: error "Company name required"  
   → If registration no. is empty: error "Registration number required"  
   → If no service categories selected: error "Select at least one service category"  
   → If all inputs valid: proceed to step 4

**4. Host:** Clicks "Save SP Account"

**5. System:** Creates SP account [API] [PERSIST]  
   — SP created with status = Active (v1: no approval workflow)  
   — Default values: is_tax_registered = FALSE, tax_rate = 0.08  
   — Logs action: "User [Host email] created SP '[Name]' on [timestamp]"

**6. System:** Shows SP detail view [NAVIGATE]  
   — Summary: SP name, reg no., status (Active), service categories, PIC contact  
   — CTAs: Edit | Add Admin | Commission Schema | Tax Profile | Suspend | Delete

**7. Host:** Clicks "Add Admin" to add SP Admin user  
   — Exit: SP account created, ready for admin user + commission setup

---

## Branch B: Edit SP Details

From step 3 (if Host clicks on existing SP and edits):

**1. System:** Displays SP detail form (editable) [NAVIGATE]  
   — All fields from account creation editable except status and creation date

**2. Host:** Updates SP details (name, categories, description, website, PIC contact)

**3. System:** Validates [VALIDATE]  
   → Same checks as creation

**4. Host:** Clicks "Save Changes"

**5. System:** Updates SP account [API] [PERSIST]  
   — Changes saved  
   — Logs action: "User [Host email] edited SP '[Name]': [specific changes] on [timestamp]"

**6. System:** Shows confirmation toast  
   — **Exit:** Edit complete

---

## Branch C: Configure Commission Schema

From step 3 (if Host clicks SP → "Commission Schema"):

**1. System:** Displays commission configuration page [NAVIGATE]  
   — Shows all service categories that this SP has selected during account creation  
   — Table: Service Category | Commission Rate (Redeemed) | Commission Rate (Expired) | Last Updated | effective_from (date, optional)

**2. System:** Loads current commission rates for this SP [API]  
   — If no schema exists: show empty table with placeholder values

**3. Host:** Configures rates per service category  
   — Per category: enters Redeemed rate (0.10–0.30) and Expired rate (0.10–0.30)  
   — Can set both to same value or different  
   — Optional: future_dated change (effective_from date)

**4. System:** Validates rates in real-time [VALIDATE]  
   → If any rate < 0.10 or > 0.30: show inline error "Rate must be between 10% and 30%"  
   → If all rates valid: enable Save button

**5. Host:** Clicks "Save Commission Schema"

**6. System:** Saves commission schema [API] [PERSIST]  
   — All rates persisted per category  
   — If effective_from date set: future rate change scheduled  
   — last_updated timestamp recorded  
   — Logs action: "User [Host email] configured commission for SP '[Name]': [rate breakdown] on [timestamp]"

**7. System:** Shows confirmation toast  
   — "Commission schema saved. New rates apply to transactions from [date]"  
   — **Exit:** Commission config complete

---

## Branch D: Set Tax Profile

From step 3 (if Host clicks SP → "Tax Profile"):

**1. System:** Displays tax profile form [NAVIGATE]  
   — Fields:  
   — is_tax_registered (toggle: Yes/No)  
   — tax_reg_no (text, required if is_tax_registered = TRUE)  
   — tax_rate (decimal, default 0.08, editable)

**2. System:** Loads current tax profile [API]  
   — Shows existing values or defaults

**3. Host:** Configures tax profile  
   — Toggle is_tax_registered: Yes (registered for SST) or No (below threshold or exempt)  
   — If Yes: enter tax_reg_no (SP's SST registration number)  
   — Optionally adjust tax_rate if different from 8% (for future-proofing)

**4. System:** Validates inputs [VALIDATE]  
   → If is_tax_registered = TRUE but tax_reg_no is empty: error "Tax registration number required"  
   → If tax_rate < 0 or > 1: error "Tax rate must be between 0% and 100%"  
   → If all inputs valid: proceed to step 5

**5. Host:** Clicks "Save Tax Profile"

**6. System:** Saves tax profile [API] [PERSIST]  
   — Tax profile persisted  
   — Logs action: "User [Host email] set tax profile for SP '[Name]': is_tax_registered=[value], tax_reg_no=[value], tax_rate=[value] on [timestamp]"

**7. System:** Shows confirmation toast  
   — "Tax profile saved. SST de-calculation will apply to all transactions."  
   — **Exit:** Tax profile config complete

---

## Branch E: Add SP Admin User

From step 3 (if Host clicks SP → "Team" or "Add Admin"):

**1. System:** Displays SP Admin user form [NAVIGATE]  
   — Fields: Name (text), Email (text)

**2. Host:** Enters SP Admin details (name + email)

**3. System:** Validates inputs [VALIDATE]  
   → If name is empty: error "Name required"  
   → If email is empty or invalid: error "Valid email required"  
   → If email already registered as SP Admin for another SP: warning "This email is already a SP Admin elsewhere. They can manage multiple SPs."  
   → If all inputs valid: proceed to step 4

**4. Host:** Clicks "Send Invite"

**5. System:** Creates SP Admin user record + sends magic link [API] [PERSIST]  
   — User record created with role = SP Admin, status = Pending Activation  
   — Magic link generated (60 min expiry)  
   — Email sent to SP Admin: "You've been added as SP Admin for [SP Name]. Click here to activate your account."  
   — Logs action: "User [Host email] invited SP Admin '[Email]' to SP '[Name]' on [timestamp]"

**6. System:** Shows confirmation toast  
   — "Invite sent to [Email]. They can activate their account within 60 minutes."  
   — **Exit:** SP Admin invite sent

**SP Admin receives email → clicks magic link → universal link opens SP Portal app directly (no browser) → completes account setup (name, password-free SSO) → Logged into SP Portal**

---

## Failure Exits

### Failure: Validation Error (SP Account Creation)

**User sees:** Inline error: "Company name required" or "Select at least one service category"

**User can:**
- Correct the input and save again
- Cancel and discard

---

### Failure: Validation Error (Commission Rates)

**User sees:** Inline error: "Rate must be between 10% and 30%"

**User can:**
- Correct the rate
- Contact commercial team if special rate needed outside 10–30% range

---

### Failure: Validation Error (Tax Profile)

**User sees:** Inline error: "Tax registration number required" or "Tax rate must be between 0% and 100%"

**User can:**
- Correct the input
- Leave tax_registered = FALSE if SP is exempt

---

### Failure: Magic Link Expired

**SP Admin sees:** "This link has expired. Request a new invite from your Welluber account manager."

**Host can:**
- Resend invite via SP Admin user list (click user → "Resend Invite")

---

## Edge Cases

**1. SP with Multiple Service Categories**
   - SP registered for Fitness + Mental Health + Massage (3 categories)  
   - Commission schema shows all 3 categories with separate rate rows  
   - Host can set different commission rates per category (e.g. Fitness 12%, Mental Health 20%, Massage 15%)

**2. Tax Profile Toggle Change**
   - SP originally is_tax_registered = FALSE  
   - Host toggles to TRUE, enters tax_reg_no  
   - New profile applies to all future transactions  
   - Past transactions (where is_tax_registered was FALSE) remain immutable

**3. Commission Rate Change for Active SP**
   - SP has existing transactions with old commission rate  
   - Host updates commission rates  
   - New rates apply only to future transactions  
   - Past transactions retain original rates (immutable)  
   - UI clearly states: "Changes apply to new transactions only"

**4. Future-Dated Commission Rate**
   - Host sets commission rate with effective_from = 30 days in future  
   - Current rate applies until effective_from date  
   - System automatically applies new rate on that date (via cron)  
   - UI shows: "New rate [X%] scheduled for [date]"

**5. SP Admin with Multiple SP Roles**
   - Same person (email) added as SP Admin for 2 different SPs  
   - They see both SPs in their SP Portal dashboard  
   - Can manage services + claims for both  
   - Warning shown first time: "You are now admin for multiple SPs. Ensure you're viewing the correct SP."

**6. SP Suspension**
   - Host clicks SP → "Suspend"  
   - SP status: Active → Suspended  
   - All SP vouchers automatically hidden from marketplace (Activated → Paused)  
   - No new claims can be submitted  
   - SP Admin still has portal access but can't publish or edit  
   - Existing vouchers in redemption period still valid (member can redeem)

---

## Handoff to Claude Code

**SCR-IDs needed:**
- SCR-SP-01 (SP List)
- SCR-SP-02 (SP Detail / Edit)
- SCR-SP-03 (Commission Schema Editor)
- SCR-SP-04 (Tax Profile Editor)
- SCR-SP-05 (Team / SP Admin User Management)

**Screens that need new components:**
- SP account creation form (multi-step or single form with sections)
- Commission schema editor (rate table with real-time validation per category)
- Tax profile form (toggle + conditional fields)
- SP Admin invite form (name + email)
- SP list (with status badges, filter by active/suspended)

**Key implementation notes:**
- Commission rates apply only to future transactions (immutable ledger)
- Tax profile toggle is non-blocking (both registered and non-registered SPs can operate)
- Magic link routing same as Org Admin (universal link, no browser fallback)
- SP Admin can be added before commission/tax config (both are optional to start, but blocking for voucher publish)
- All changes logged to audit trail with timestamp + user email

