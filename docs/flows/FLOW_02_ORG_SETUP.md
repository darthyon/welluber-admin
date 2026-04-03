# Flow 2 — Host Admin: Organization Setup — April 2026

**Who:** Host Admin (primary), Org Admin (secondary activation)  
**Platform:** Host Portal (Host) → Org Portal (Org Admin)  
**From:** New organization contract signed  
**To:** Org Admin has portal access, branches configured, policies assigned, wallet created, ready for employee enrollment  
**Entry condition:** Host Admin logged in with Super Admin role. New company is contracted to use Welluber.  
**Failure exits:** Missing required fields, invalid registration number, magic link expired, email validation fails.

---

## Happy Path

**PHASE 1: HOST ADMIN CREATES ORG ACCOUNT**

**1. Host:** Navigates to Organization Management [NAVIGATE]  
   — Sees: **Workforce Health Dashboard** (list of all organizations)
   — Features: Tactical Triage Toolbar (Status, Needs Action, Service Category), Utilization Ring Charts
   — CTA: "Add Organization"

**2. System:** Displays org account creation form [NAVIGATE]  
   — Fields:  
   — Company name (text)  
   — Registration number (text)  
   — Industry (dropdown)  
   — Org type (radio: SME | Enterprise | NGO)  
   — Financial year start date (date picker)  
   — Subscription plan (dropdown: Standard, Premium, Enterprise)

**3. Host:** Enters org details

**4. System:** Validates inputs [VALIDATE]  
   → If company name is empty: error "Company name required"  
   → If registration number is empty: error "Registration number required"  
   → If registration number already exists: error "Organization with this registration number already exists"  
   → If all inputs valid: proceed to step 5

**5. Host:** Clicks "Create Organization"

**6. System:** Creates org account [API] [PERSIST]  
   — Org account created with status = Active (v1: no approval workflow)  
   — Default HQ branch created automatically  
   — Logs action: "User [Host email] created organization '[Name]' on [timestamp]"

**7. System:** Shows org detail view [NAVIGATE]  
   — Summary: org name, reg number, status (Active), subscription plan  
   — CTAs: Edit | Add Branch | Add Admin | Assign Policies | Configure Wallet | Manage Employees

**8. Host:** Next step is to add Org Admin user  
   — CTA: "Add Admin"

---

**PHASE 2: HOST ADDS ORG ADMIN USER**

**9. System:** Displays org admin user form [NAVIGATE]  
   — Fields: Name (text), Email (text), Role (fixed: Org Admin)

**10. Host:** Enters Org Admin details (name + email)

**11. System:** Validates inputs [VALIDATE]  
   → If name is empty: error "Name required"  
   → If email is empty or invalid: error "Valid email required"  
   → If email already registered as Org Admin for another org: warning "This email is already an Org Admin elsewhere. They can manage multiple organizations."  
   → If all inputs valid: proceed to step 12

**12. Host:** Clicks "Send Invite"

**13. System:** Creates Org Admin user record + sends magic link [API] [PERSIST]  
   — User record created with role = Org Admin, status = Pending Activation  
   — Magic link generated (60 min expiry)  
   — Email sent to Org Admin: "You've been added as Org Admin for [Organization Name]. Click here to activate your account: [link]"  
   — Logs action: "User [Host email] invited Org Admin '[Email]' to organization '[Org Name]' on [timestamp]"

**14. System:** Shows confirmation toast  
   — "Invite sent to [Email]. They can activate their account within 60 minutes."

**15. HOST:** Continues org setup in parallel (while Org Admin is activating)  
   — CTAs: "Assign Policies" | "Create Branch Wallet" | "Send Payment Link"

---

**PHASE 3: ORG ADMIN RECEIVES & ACTIVATES**

**16. Org Admin:** Receives email at corporate inbox  
   — Opens email from Welluber  
   — Clicks magic link

**17. System:** Routes via universal link [NAVIGATE]  
   — Link scheme: `welluber://org-admin-setup/[token]`  
   — Deep link routing: opens Welluber Org Portal directly (never browser)  
   — Browser fallback (if not installed): branded page with "Open in Welluber App" deep link  
   — ⚠️ CRITICAL: Binding must NOT complete in browser.

**18. System:** Validates token [VALIDATE]  
   → If token expired (>60 min): show error "Link expired. Request a new invite."  
   → If token invalid/tampered: show error "Invalid link. Try again or contact support."  
   → If token valid: proceed to step 19

**19. Org Admin:** Completes account setup [NAVIGATE]  
   — Prompts: Name (pre-filled from invite), Password-free SSO setup (Google/Apple)  
   — Org Admin: confirms name, selects SSO method, authenticates

**20. System:** Binds org admin to account [API] [PERSIST]  
   — User status: Pending Activation → Active  
   — Token invalidated (single-use)  
   — Logs action: "Org Admin [Name] activated account for organization [Org Name] on [timestamp]"

**21. System:** Routes to Org Portal dashboard [NAVIGATE]  
   — Org Admin sees: dashboard, organization overview, CTAs for next steps

**22. Org Admin:** Org Portal is now fully accessible  
   — Can: manage employees, assign policies, top-up wallet, view utilization  
   — Org Admin activation complete

---

**PHASE 4: HOST ASSIGNS POLICIES & WALLET (PARALLEL)**

**Back to Host (from step 15):**

**23. Host:** Assigns policies to org [NAVIGATE]  
   — Clicks "Assign Policies"  
   — Multi-select list of active policies (created by Host in Flow 4)  
   — Only policies Host has marked as "Active" are shown

**24. Host:** Selects one or more policies [NAVIGATE]  
   — Selected policies will be available in Org Admin's policy assignment wizard

**25. Host:** Clicks "Assign"

**26. System:** Adds policies to org [API] [PERSIST]  
   — Policies added to assigned_orgs list  
   — Org Admin will now see these policies when assigning to employees  
   — Logs action: "User [Host email] assigned [N] policies to organization '[Org Name]' on [timestamp]"

**27. Host:** Creates branch wallet [NAVIGATE]  
   — Clicks "Configure Wallet"  
   — Shows: Branch (default: HQ)  
   — Fields: Model (radio: Cash Balance | Credit Limit), Currency (fixed: MYR)

**28. Host:** Selects wallet model [NAVIGATE]  
   — Cash Balance: org pre-funds (pays upfront)  
   — Credit Limit: org billed on cycle (post-usage)

**29. System:** Creates wallet record [API] [PERSIST]  
   — Wallet created with status = Active  
   — Balance = 0 (unfunded)  
   — Model saved  
   — Logs action: "User [Host email] created wallet for [Org Name], [Branch], model=[Model]"

**30. Host:** Sends payment link to Org Finance [NAVIGATE]  
   — Clicks "Send Payment Link"  
   — Generates unique payment link (similar to SP setup Flow 3, Branch E)  
   — Sends email to Org Finance email (Host enters):  
   — "Fund Welluber wallet for [Organization Name]: [payment link]"  
   — Link valid: 7 days (configurable)

**31. System:** Logs payment link generation [PERSIST]  
   — Link token stored, expiry recorded  
   — Logs action: "User [Host email] sent payment link to [Finance Email] for organization '[Org Name]'"

**32. Host:** Org setup config complete [NAVIGATE]  
   — Dashboard shows: org activated, admin assigned, policies assigned, wallet created  
   — Summary: "Organization '[Name]' is ready for employee enrollment"

---

**PHASE 5: ORG FINANCE FUNDS WALLET (OPTIONAL, PARALLEL)**

**Finance Admin:** Receives payment link email  
   — Clicks link  
   — Redirected to Payment Gateway (Billplz, iPay88, FPX, etc.)  
   — Enters: desired wallet top-up amount  
   — Authenticates + pays

**Payment Gateway:** Returns result  
   — SUCCESS: wallet credited immediately, Host + Finance notified  
   — FAILED: Finance can retry via same link (until expiry)

---

## Failure Exits

### Failure: Validation Error (Org Account Creation)

**User sees:** Inline error: "Company name required" or "Registration number already exists"

**Host can:**
- Correct the input and save again
- Cancel and discard

---

### Failure: Invalid Email (Org Admin)

**User sees:** Error: "Valid email required"

**Host can:**
- Correct the email
- Resend invite to different email

---

### Failure: Magic Link Expired

**Org Admin sees:** "Link expired. Request a new invite."

**Host can:**
- Resend invite via Org Admin user list (click user → "Resend Invite")
- Org Admin can then activate with new link

---

### Failure: Payment Link Expired

**Finance Admin sees:** "This link has expired. Ask HR to send a new payment link."

**Host can:**
- Generate new payment link on-demand from org detail page

---

### Failure: Org Admin with Multiple Orgs

**Scenario:** Same person invited as Org Admin for multiple organizations

**Flow:**
- Each invite creates separate user record per org  
- Org Admin logs in, sees all organizations they manage  
- Dashboard tab/switcher shows: "Org A | Org B | Org C"  
- Can switch between orgs seamlessly
- Warning shown first time: "You manage multiple organizations. Ensure you're viewing the correct one."

---

## Edge Cases

**1. Organization Name Typo, Needs Correction**

**Scenario:** Host creates "Acme Coporation" (typo), should be "Acme Corporation"

**Flow:**
- Host clicks org → "Edit"  
- Corrects name to "Acme Corporation"  
- Saves changes  
- Org Admin sees updated name in portal

---

**2. Org Admin Email Wrong, Need to Re-Invite**

**Scenario:** Host invites john@acmecorp.com, but correct email is john.doe@acmecorp.com

**Flow:**
- Magic link sent to wrong email (never delivered)  
- Host navigates to Org Admin list → finds john@acmecorp.com entry  
- Clicks "Delete" or "Update Email"  
- Creates new invite with correct email (john.doe@acmecorp.com)  
- Previous token invalidated (single-use expiry applies)

---

**3. Multiple Org Admins for Same Organization**

**Scenario:** Host wants to add 3 Org Admins (CEO, CFO, HR Manager)

**Flow:**
- Host repeats steps 9–14 three times  
- Creates three separate user records  
- Sends three separate magic links  
- Each Org Admin independently activates  
- All three see same organization in portal (shared access)  
- All three can perform org-level actions (employee mgmt, wallet, policy assignment)

---

**4. Org Created, But No Policies Assigned by Host**

**Scenario:** Host forgets to assign policies before Org Admin tries to enroll employees

**Flow:**
- Org Admin logs in, navigates to "Assign Policies"  
- Wizard shows: "No policies available. Contact your Welluber account manager."  
- Org Admin: can't proceed with employee enrollment until Host assigns policies  
- Host: can assign policies anytime (retroactively)

---

**5. Wallet Funded, But Policy Not Yet Assigned**

**Scenario:** Finance funds wallet RM 100,000, but Host hasn't assigned any policies yet

**Flow:**
- Wallet has balance, but no employees can transact (no policy entitlements)  
- Once policies assigned, employees can transact  
- Blocking rule: org_wallet >= employee_entitlement (enforced at checkout)  
- Balance remains, unaffected by timing of policy assignment

---

**6. Org Admin Activation Link Shared (Security Risk)**

**Scenario:** Org Admin receives link, forwards to colleague (unintended)

**Flow:**
- Link is single-use, but not IP-restricted (v1 simplification)  
- First person to click link binds account  
- Token then becomes invalid  
- Second person gets: "Link already used" error  
- Recommendation: Host resends link if needed, Org Admin doesn't share

---

**7. Financial Year Start Date in Future**

**Scenario:** Host sets financial year start = 2026-07-01 (3 months in future)

**Flow:**
- Stored in org profile  
- Used for policy refresh cycle calculations  
- If policy refresh_start_reference = "Org Financial Year Start", benefits refresh on 2026-07-01  
- Until then: employees' benefit pools don't auto-refresh (proration applies)

---

## Handoff to Claude Code

**Screens needed:**
- Organization List (all orgs, status badges, filters, create CTA)
- Organization Creation form (company name, reg no., industry, org type, FY start, subscription plan)
- Organization Detail / Edit (show current values, CTAs for branches, admin users, policies, wallet)
- Org Admin User form (name + email, invite CTA)
- Org Admin Invite confirmation (success message, email sent notification)
- Policy Assignment selector (multi-select list of available policies)
- Wallet Configuration (model selection, payment link generation)
- Payment link email template (sent to Finance email)

**Key implementation notes:**
- No approval workflow: org status = Active immediately (v1 simplification)
- Default HQ branch: created automatically with org account
- Magic link routing: universal link scheme, no browser fallback for binding
- Single-use tokens: invalidated after successful use or 60-min expiry
- Concurrent Host/Org Admin: phases run in parallel (not sequential)
- Multiple Org Admins: separate user records per admin, shared org access
- Policy assignment: must occur before employee enrollment (not blocking, but required for checkout)
- Wallet model: Cash Balance or Credit Limit (set at creation, immutable per v1)
- All operations logged to audit trail with timestamp + user email

