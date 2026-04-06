# Flow 6 — Org Admin: Ongoing Employee & Benefit Management — April 2026

**Who:** Org Admin (HR), Host Admin (v1 does this on behalf)  
**Platform:** Org Portal (Web)  
**From:** Employee management dashboard  
**To:** Employees bulk-invited, policies assigned, wallet funded, utilization tracked  
**Entry condition:** Org account set up (Flow 2), at least one policy assigned to org by Host. HR needs to manage employees and benefits.  
**Failure exits:** CSV format invalid, email validation fails, policy not assigned to org, insufficient wallet balance, concurrent edits.

---

## Happy Path — Part A: Add Employees via CSV

**1. Org Admin:** Navigates to Employee Management [NAVIGATE]  
   — Sees: employee list, filters, CTAs: "Upload CSV", "Add Individual", "View Active"

**2. Org Admin:** Clicks "Upload CSV" [NAVIGATE]  
   — System: shows template download + file picker

**3. Org Admin:** Downloads template (optional) [DOWNLOAD]  
   — CSV headers: Employee Code, Corporate Email, First Name, Last Name, Date of Birth, ID Type (IC|Passport), ID Number, Employment Type, Join Date, Probation End Date, Branch, Termination Date (optional)

**4. Org Admin:** Prepares CSV file  
   — Fills in employee data  
   — One row per employee

**5. Org Admin:** Uploads CSV file [NAVIGATE]  
   — Clicks "Choose File" → selects prepared CSV → "Upload"

**6. System:** Parses CSV [VALIDATE] [API]  
   — Row-by-row validation:  
   — Check: employee_code is unique within organization and not empty
   — Check: date_of_birth is valid date (YYYY-MM-DD) and in the past
   — Check: id_type in (IC, Passport) and id_number is not empty
   — Check: corporate_email is valid format (email regex)  
   — Check: employment_type in (Full-time, Part-time, Contract, Internship)  
   — Check: join_date is valid date and ≤ today  
   — Check: termination_date (if present) is valid date and ≥ join_date  
   — Check: no duplicate corporate emails within upload  
   — Returns: valid rows + error report (per bad row, specific error message)

**7. System:** Shows validation report [NAVIGATE]  
   — Table: employee code, email, error (if any)  
   — Summary: [N] valid rows, [M] invalid rows  
   — Option: "Download Error Report" (CSV)  
   — Option: "Proceed with Valid Rows Only" (recommended for partial upload)

**8. Org Admin:** Reviews errors  
   — Can: fix CSV locally and re-upload, or proceed with valid rows only

**9a. IF Errors Present:**

**9a-1. Org Admin:** Clicks "Download Error Report"  
   — CSV shows: each invalid row, specific error reason  
   — Example error: "Row 5: Invalid email format (john@company)"  
   — Example error: "Row 8: Join date in future (2026-12-01)"

**9a-2. Org Admin:** Fixes CSV, re-uploads [NAVIGATE]  
   — System: re-validates from step 6

**9b. IF All Valid or Partial Proceed:**

**9b-1. Org Admin:** Clicks "Proceed with [N] Employees"

**10. System:** Shows confirmation screen [NAVIGATE]  
   — Lists: all employees about to be imported  
   — Allows: check/uncheck individual rows before final commit  
   — Warning: "Invites will be sent to corporate emails. Ensure addresses are correct."  
   — CTA: "Confirm and Save"

**11. Org Admin:** Reviews final list  
   — Can tick/untick individual employees (prevent accidental mass-invite on test upload)  
   — Can filter by branch, employment type

**12. Org Admin:** Clicks "Confirm and Save"

**13. System:** Imports employees [API] [PERSIST]  
   — Creates Employee record per selected row  
   — Status: Active  
   — Logs: "Imported [N] employees via CSV from [org name] on [timestamp]"

**14. System:** Shows import confirmation [NAVIGATE]  
   — "Successfully imported [N] employees"  
   — Summary: count per branch, employment type  
   — Next step suggestion: "Assign policies to these employees?"  
   — CTA: "Go to Policy Assignment"

**15. EXIT Part A:** Employees uploaded, ready for policy assignment

---

## Happy Path — Part B: Assign Benefit Policies to Employees

**1. Org Admin:** Navigates to Benefit Policy Assignment [NAVIGATE]  
   — From previous confirmation, or direct: "Employee Management" → "Assign Benefit Policies"

**2. System:** Shows policy assignment wizard (3 steps) [NAVIGATE]

**STEP 1 — Select Benefit Policy:**

**3. System:** Displays available benefit policies [API]  
   — Only policies that Host has assigned to this org are shown  
   — Read-only policy contents: groups, benefits, amounts  
   — Selection: radio button (one policy at a time)

**4. Org Admin:** Selects a policy  
   — Views policy summary (benefit groups + amounts)  
   — CTA: "Next"

**STEP 2 — Select Employees:**

**5. System:** Shows employee selection interface [NAVIGATE]  
   — Multi-select list of all active employees  
   — Filters available: branch, employment type, join date range  
   — Options: "Select All" or "Deselect All"

**6. Org Admin:** Selects employees  
   — Can filter first (e.g., "Finance Branch, Full-time only")  
   — Then: check/uncheck individuals or bulk-select

**7. Org Admin:** Clicks "Next"

**STEP 3 — Review & Confirm:**

**8. System:** Shows assignment summary [NAVIGATE]  
   — Policy: [Name]  
   — Employees: [Count] selected  
   — Effective date options:  
   — "Immediately" (today)  
   — "Custom Date" (date picker)  
   — Preview: "These employees' benefits activate on [date]"

**9. System:** Auto-calculates prorated amounts [CALCULATE]  
   — For each employee: prorated_factor = days_remaining_in_cycle / total_days_in_cycle (if utilization_mode = Prorated)  
   — Shows: estimated benefit pool amounts per employee (informational)

**10. Org Admin:** Reviews estimated amounts  
   — See table: employee name, estimated pool per benefit group  
   — No manual amount entry (all derived from policy)

**11. Org Admin:** Confirms assignment [NAVIGATE]  
   — CTA: "Create Assignments"

**12. System:** Creates Benefit Assignments [API] [PERSIST]  
   — Per employee: create assignment record  
   — Fields: employee_id, policy_id, effective_start_date, calculated_benefit_pool (derived), prorated_factor  
   — Status: Active  
   — Logs: "Assigned policy [Name] to [N] employees on [timestamp]"

**13. System:** Sends bulk employee invites (optional) [NAVIGATE]  
   — Question: "Send invites to employees now?"  
   — CTA: "Send Invites" or "Skip for Now"

**14a. IF "Send Invites":**

**14a-1. System:** Sends bulk email to all assigned employees [NOTIFY]  
   — Email: "Your benefits are ready! Download Welluber and enter your Employee ID to activate your wallet."  
   — Includes: app store links, employee ID, company name  
   — Logs: "Sent bulk invites to [N] employees from org [Name]"

**14b. IF "Skip for Now":**

**14b-1. Org Admin:** Can manually trigger invites later [NAVIGATE]  
   — Employee list → select employees → "Send Invite"

**15. System:** Shows completion screen [NAVIGATE]  
   — "Policy assigned to [N] employees"  
   — Can: assign another policy (loop back to Step 1), manage wallet, view utilization dashboard

**16. EXIT Part B:** Policies assigned, employees invited (optional)

---

## Happy Path — Part C: Fund Branch Wallet

**1. Org Admin:** Navigates to Wallet Management [NAVIGATE]  
   — From dashboard or direct: "Wallet" section  
   — Shows: current balance, pending deductions, top-up history

**2. System:** Displays wallet status [API]  
   — Model: Cash Balance or Credit Limit (set by Host at org creation)  
   — Current balance: RM [X]  
   — Pending deductions: RM [Y] (from active employee entitlements)  
   — Available balance: RM [X - Y]  
   — Blocking rule indicator: if balance < entitlements, "Wallet insufficient" warning

**3. Org Admin:** Reviews wallet status  
   — Assesses: do we have enough for upcoming transactions?

**4. Org Admin:** Decides to top up [NAVIGATE]  
   — CTA: "Add Funds" or "Top Up Now"

**5. System:** Shows wallet top-up options [NAVIGATE]  
   — Option A: "Pay Directly via Gateway" (Org Admin pays now)  
   — Option B: "Send Payment Link to Finance" (CFO/Finance receives link, pays independently)

**6a. IF OPTION A — Direct Payment:**

**6a-1. Org Admin:** Enters amount [NAVIGATE]  
   — Input field: amount (RM, no decimals per policy)  
   — Validation: amount > 0

**6a-2. Org Admin:** Clicks "Proceed to Payment"

**6a-3. System:** Redirects to Payment Gateway [EXTERNAL]  
   — Gateway: Billplz, iPay88, FPX, etc. (configurable)  
   — Shows: amount, company name, invoice reference  
   — Org Admin: authenticates, completes payment

**6a-4. Payment Gateway:** Returns result [WEBHOOK/POLLING]  
   — SUCCESS or FAILED

**6a-5a. IF SUCCESS:**
   - Balance updated immediately: previous_balance + amount = new_balance  
   - System logs: "Wallet top-up RM [X] completed for org [Name]"  
   - Notify: "Funds received. Balance now RM [Y]"  
   - Any blocked employees (wallet < entitlement) now unblocked

**6a-5b. IF FAILED:**
   - Error shown: "Payment failed. Retry or contact support."  
   - Org Admin can: retry, use different payment method, contact support

---

**6b. IF OPTION B — Send Payment Link:**

**6b-1. System:** Generates payment link [GENERATE]  
   — URL: direct to payment gateway, pre-configured for org  
   — Unique token: prevents tampering  
   — No amount pre-filled (Finance decides amount)

**6b-2. Org Admin:** Enters Finance contact email [NAVIGATE]  
   — Email field: CFO/Finance email

**6b-3. System:** Sends payment link email [NOTIFY]  
   — Email to Finance: "Top up Welluber wallet for [Company Name]: [payment link]"  
   — Link valid: 7 days (configurable)

**6b-4. Finance Admin:** Receives email  
   — Clicks link → Payment Gateway  
   — Enters: desired top-up amount  
   — Authenticates + pays

**6b-5. Payment Gateway:** Returns result

**6b-6a. IF SUCCESS:**
   - Balance credited to org wallet  
   - Email sent to both Org Admin + Finance: "Top-up received. Wallet balance: RM [Y]"  
   - System logs

**6b-6b. IF FAILED:**
   - Finance notified: can retry via same link (until expiry)

**7. EXIT Part C:** Wallet funded, blocking rule released if applicable

---

## Happy Path — Part D: Manual Pool Refresh

**1. Org Admin:** Navigates to Utilization Dashboard [NAVIGATE]  
   — Views: spending metrics, benefit group utilization, employee-level view

**2. Org Admin:** Decides to manually refresh pool for employee(s) [NAVIGATE]  
   — Scenario: employee had low balance, requesting fresh allocation mid-cycle  
   — CTA: "Refresh Pool"

**3. System:** Shows pool refresh dialog [NAVIGATE]  
   — Options: "Refresh for [single employee]" or "Refresh All" (by policy/branch/etc)  
   — Warning: "Manual refresh does NOT reset cron schedule. Next auto-refresh still occurs on [date]."

**4. Org Admin:** Selects scope (individual or bulk)

**5. System:** Confirms refresh [NAVIGATE]  
   — Shows: employee(s) affected, new pool amounts  
   — CTA: "Confirm Refresh"

**6. Org Admin:** Confirms

**7. System:** Executes manual pool refresh [API] [PERSIST]  
   — Recalculates: prorated_factor based on current date + policy settings  
   — Updates: calculated_benefit_pool + last_refresh_date per assignment  
   — Logs: "Manual pool refresh for [N] employees, policy [Name], org [Name]"

**8. System:** Shows confirmation [NAVIGATE]  
   — "Pool refreshed for [N] employees. New balances:"  
   — Table: employee, benefit group, old balance, new balance

**9. System:** Notifies employees (optional) [NOTIFY]  
   — Push notifications: "Your benefit balance has been refreshed!"  
   — Shows in app on next open

**10. EXIT Part D:** Pool refreshed mid-cycle

---

## Edge Cases

**1. CSV Upload with Duplicate Corporate Emails**

**Scenario:** Upload includes two rows with same corporate email

**Flow:**
- System validation: detects duplicate within upload  
- Error report: "Row 5 and Row 8: duplicate corporate email (john@company.com)"  
- Org Admin: fixes CSV (remove or correct one), re-uploads

---

**2. Employee Already Exists in System**

**Scenario:** Org Admin uploads employee that was previously imported

**Flow:**
- System: checks if corporate_email already exists in org  
- Option A: Skip (don't reimport, show warning)  
- Option B: Update existing record (if data changed)  
- Current behavior: TBD (recommend skip + update separately)

---

**3. Employee on Probation, Policy Assigned with "After Probation Ends"**

**Scenario:** Assign policy with activation_mode = "After Probation Ends", probation ends 2026-05-15

**Flow:**
- System: creates Benefit Assignment  
- Status: Active, but activation deferred  
- Effective_start_date: employee's probation_end_date (auto-computed)  
- Employee sees: "Benefits activate on [date]" (in app)  
- Wallet locked until activation date

---

**4. Policy Changed by Host After Assignment**

**Scenario:** Org Admin assigned Policy A to 100 employees. Host then edits Policy A (changes benefit amounts).

**Flow:**
- Change applies only to new assignments going forward  
- Existing 100 employees: unaffected (immutable assignments)  
- No retroactive recalculation  
- Org Admin can: create new assignment with updated policy, manually refresh if needed

---

**5. Multiple Policies Assigned to Same Employee**

**Scenario:** Employee assigned both Fitness policy (RM 2000/yr) and Mental Health policy (RM 1000/yr)

**Flow:**
- System: creates two separate Benefit Assignments  
- Employee sees two benefit wallets (Fitness + Mental Health)  
- Each tracks separately, pools don't commingle  
- Purchases from each wallet independently

---

**6. Wallet Top-Up During Pending Transactions**

**Scenario:** Wallet has RM 1000, pending entitlements RM 5000 (multiple employees). Top-up received: +RM 3000.

**Flow:**
- Wallet: RM 1000 + 3000 = RM 4000  
- Pending: still RM 5000  
- Blocking rule check: RM 4000 < RM 5000 → still blocked  
- Some (not all) employees still can't transact until wallet exceeds RM 5000

---

**7. Payment Link Expires**

**Scenario:** Payment link sent to Finance, but they don't pay within 7 days

**Flow:**
- Link expires  
- Finance receives: "Link expired. Ask HR to send a new payment link."  
- Org Admin: can generate new link on demand

---

**8. Manual Pool Refresh with Prorated Calculation**

**Scenario:** Policy has utilization_mode = Prorated, prorate_unit = Weekly. Org Admin triggers manual refresh on a Wednesday.

**Flow:**
- System: recalculates prorated_factor  
- Days remaining in week: 5 (Wed–Sun)  
- Total days in week: 7  
- prorated_factor: 5/7 ≈ 0.714  
- New pool: full_amount × 0.714  
- Applied immediately to all selected employees

---

**9. Employee Deactivated, Then Re-added**

**Scenario:** Employee left, HR deactivated. Then they return, HR uploads same corporate email again.

**Flow:**
- System: previous assignment remains (immutable)  
- New upload: asks to overwrite or skip  
- Recommendation: create new employee record (different employee ID if available)  
- Both records coexist: old deactivated, new active

---

## Failure Exits

### Failure: CSV Parse Error

**User sees:** Validation report with row-by-row errors  
**Message:** "Row 5: Invalid email format. Row 8: Join date in future."

**Org Admin can:**
- Download error report
- Fix CSV locally
- Re-upload

---

### Failure: No Policies Assigned by Host

**User sees:** Policy Assignment wizard shows empty state  
**Message:** "No policies available. Contact your Welluber account manager."

**Org Admin can:**
- Contact Host Admin to assign policies
- Proceed with other tasks (wallet, existing employees)

---

### Failure: Wallet Insufficient for New Assignments

**User sees:** Warning during policy assignment  
**Message:** "Wallet balance (RM 1000) is less than total entitlements (RM 5000). Transactions will be blocked until wallet is funded."

**Org Admin can:**
- Fund wallet immediately
- Proceed with assignment (employees invited, but can't transact until funded)

---

### Failure: Payment Failed

**User sees:** "Payment failed. Please try again."

**Org Admin can:**
- Retry with same payment method
- Use different payment method
- Send payment link to Finance instead

---

## Handoff to Claude Code

**Screens needed:**
- Employee Management dashboard (list, filters, upload/add CTAs)
- CSV upload interface (template download, file picker, validation report)
- Employee confirmation screen (review list, tick/untick, send invites toggle)
- Policy Assignment wizard (3-step: select policy, select employees, review + confirm)
- Wallet Management (balance display, top-up options, payment gateway redirect, history)
- Manual Pool Refresh dialog (select scope, confirm amounts, show results)
- Utilization Dashboard (spending summary, per-employee view, filters, export)

**Key implementation notes:**
- CSV parsing: row-level validation, error report per invalid row, partial upload permitted
- Policy assignment: wizard-based, read-only policy contents, no manual amount entry (all derived)
- Prorated calculation: auto-computed based on join_date + activation_mode + refresh_cycle (shown in review step)
- Wallet blocking rule: wallet_balance >= employee_entitlement (enforced at checkout time)
- Manual pool refresh: does NOT reset cron schedule (next auto-refresh still occurs)
- Multi-policy: separate assignments per policy, independent wallets in app
- Employee deactivation: existing assignments immutable, future transactions blocked
- All operations logged to audit trail with timestamp + user email

