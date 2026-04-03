# Flow — Host Admin: SP & Org Account Management — April 2026

**Who:** Host Admin (Welluber HQ)  
**From:** SCR-DASH-01 (Platform Overview) or SCR-ORG-01 / SCR-SP-01 (list screens)  
**To:** SCR-ORG-04 (Org approved, active) OR SCR-SP-05 (SP approved, commission configured, active)  
**Entry condition:** New registration pending approval (status = Pending). Host has Super Admin role.  
**Failure exits:** Registration rejected, pre-approval checks failed, data validation errors, commission config invalid.

---

## Overview

Flow 8 has **two parallel workflows**:
1. **Org Approval & Activation** (steps 1–11)
2. **SP Approval + Commission Config** (steps 12–22)

Both share the same structure: Review → Pre-checks → Approve/Reject → Config (if needed) → Activate. This document traces both in sequence for completeness.

---

## Workflow A: Organization Approval & Activation

### Happy Path

**1. Host:** Navigates to SCR-ORG-01 (Organization List) [NAVIGATE]  
   — Sees list of all organizations: name, status (Active/Pending/Suspended), branch count, wallet.

**2. System:** Displays organizations filtered/sorted [API]  
   — Default sort: creation date descending (newest first).

**3. Host:** Clicks on pending organization row  
   → If org status = Pending: navigate to SCR-ORG-03 (Org Approval) [NAVIGATE]  
   → If org status = Active: navigate to SCR-ORG-04 (Org Detail) instead

**4. System:** Loads organization details on SCR-ORG-03 [API]  
   — Shows: Org name, registration no., industry, financial year start, PIC details, submission date.

**5. Host:** Reviews organization data — verifies basic info is complete

**6. System:** Displays pre-approval checks (non-blocking, informational) [API]  
   — Checks: Registration validity (SSM lookup TBD), PIC contact verified, Payment method on file.
   — **Note:** These are NOT hard blocks in v1. If any check fails → Status "Requires Manual Review" (flag for escalation). Host can override and approve anyway.

**7. Host:** Reviews pre-checks  
   → If all checks pass: proceed to step 8 (Approve)  
   → If checks failed: decides to approve anyway (override) OR reject (Branch A: Rejection)  
   → If data is incomplete: redirect to contact org via email + resubmit

**8. Host:** Clicks "Approve Organization" button [AUTH — confirm Host is Super Admin]

**9. System:** Displays confirmation dialog [NAVIGATE]  
   — Shows: "Activate [Org Name]? They will receive portal access email immediately. Cannot be undone."  
   — Actions: Confirm (button) | Cancel (button)

**10. Host:** Clicks Confirm [AUTH — may require 2FA confirmation for critical actions, TBD]

**11. System:** Approves organization [API] [PERSIST]  
   — Updates org status: Pending → Active  
   — Generates portal login credentials (email + temporary password)  
   — Sends activation email to org's primary PIC: "Welcome to Welluber. Your account is active. [Portal URL] [Temp password] Please change your password on first login."  
   — Logs action to SCR-AUTH-04 (Audit Log): "User [Host email] approved org [Org ID] on [timestamp]"

**12. System:** Navigates Host to SCR-ORG-04 (Org Detail View) [NAVIGATE]  
   — Shows: Status badge (green, "Active"), profile tabs, wallet balance (if branch wallet exists), next actions.

---

### Branch A: Organization Rejection

From step 7 (if Host rejects):

**1. System:** Displays rejection reason dialog [NAVIGATE]  
   — Text input: "Reason for rejection (optional)"  
   — Actions: Reject (button, red) | Cancel (button)

**2. Host:** Enters reason (optional) + clicks Reject [VALIDATE — ensure no blank form submitted]

**3. System:** Rejects organization [API] [PERSIST]  
   — Updates org status: Pending → Rejected  
   — Sends rejection email to org's primary PIC: "Your Welluber organization application was not approved. Reason: [reason]. Please contact support@welluber for assistance."  
   — Logs action to audit log.

**4. System:** Navigates Host back to SCR-ORG-01 (Org List) [NAVIGATE]  
   — Org now shows status "Rejected" (red badge)  
   — **Exit:** Rejection complete.

---

## Workflow B: Service Provider Approval + Commission Configuration

### Happy Path

**1. Host:** Navigates to SCR-SP-01 (Service Provider List) [NAVIGATE]  
   — Sees list of all SPs: name, status, branch count, commission rate (TBD — not yet set), payouts YTD.

**2. System:** Displays service providers [API]  
   — Default sort: creation date descending.

**3. Host:** Clicks on pending SP row  
   → If SP status = Pending: navigate to SCR-SP-03 (SP Approval) [NAVIGATE]  
   → If SP status = Active: navigate to SCR-SP-05 (SP Detail) instead

**4. System:** Loads SP details on SCR-SP-03 [API]  
   — Shows: SP name, registration no., service categories (multi-select, already chosen by SP), PIC details, tax status, submission date.

**5. Host:** Reviews SP data — verifies categories, PIC contact, tax registration status

**6. System:** Displays pre-approval checks [API]  
   — Checks: Company registration validity, Banking details on file (required for payout), Commission rates agreed with commercial team.
   — **Note:** Banking details missing = ERROR (blocks approval). Host cannot override. Shows message: "Banking details required. SP must update their account first." CTA: "View SP banking settings" (link to SP's admin portal or manual email to SP).

**7. Host:** Reviews pre-checks  
   → If banking details missing: **Branch B (Approval Blocked — Banking Details)**  
   → If checks pass (or only cosmetic failures): proceed to step 8 (Commission Config)

**8. System:** Displays commission schema editor on SCR-SP-04 [NAVIGATE]  
   — Table: Service Category (from taxonomy) | Commission Rate (Redeemed) | Commission Rate (Expired)  
   — All rows empty initially (Host must fill in)  
   — Only service categories that the SP selected during registration are shown

**9. Host:** Enters commission rates for each category [VALIDATE — must be 10%–30% per rate]  
   — Example: Fitness 15%, Mental Health 20%, Massage 12%  
   — Redeemed vs Expired: Host can set different rates or lock both to same

**10. System:** Validates commission rates [VALIDATE]  
   → If any rate < 10% OR > 30%: show inline error "Rates must be between 10% and 30%"  
   → If rates valid: proceed to step 11

**11. Host:** Clicks "Save Commission Schema" [PERSIST]  
   — Commission rates saved to SP account

**12. System:** Updates commission schema [API] [PERSIST]  
   — Commission rates now apply to all future transactions for this SP  
   — Logs action: "User [Host email] configured commission for SP [SP ID]: [rate breakdown]"

**13. Host:** Clicks "Approve Service Provider" button (main SCR-SP-03 action)

**14. System:** Displays approval confirmation dialog [NAVIGATE]  
   — Shows: "Activate [SP Name]? They will receive portal access and can begin uploading packages."  
   — Actions: Confirm | Cancel

**15. Host:** Clicks Confirm

**16. System:** Approves SP [API] [PERSIST]  
   — Updates SP status: Pending → Active  
   — Generates portal login credentials  
   — Sends activation email: "Welcome to Welluber. Your account is active. [Portal URL]"  
   — Logs action to audit log

**17. System:** Navigates Host to SCR-SP-05 (SP Detail View) [NAVIGATE]  
   — Shows: Status badge (green, "Active"), commission rates (summary), settlement history empty, next actions.

---

### Branch B: Approval Blocked — Banking Details Missing

From step 7 (if banking details check fails):

**1. System:** Shows error banner on SCR-SP-03 [NAVIGATE]  
   — Message: "Cannot approve SP. Banking details are required for settlement payouts. Please ask the SP to complete their banking information first."  
   — Actions: Email SP button | Retry check button | Cancel

**2. Host:** Clicks "Email SP" [API]  
   — Pre-filled email template sent to SP: "We're reviewing your application. To proceed, please provide your banking details for settlement. [Link to SP banking settings]"

**3. Host:** Waits for SP to update banking details (asynchronous)  
   — Recommend: Host checks back in 24h or SP sends confirmation email when done

**4. Host:** Returns to SCR-SP-01, clicks on same SP again → navigates back to SCR-SP-03

**5. System:** Re-runs pre-approval checks [API]  
   — If banking details now present: proceed to step 8 (Commission Config)  
   — If still missing: show same error, loop back to step 2

---

### Branch C: SP Rejection

From step 7 (if Host rejects before commission config):

**1. System:** Displays rejection dialog [NAVIGATE]

**2. Host:** Enters rejection reason (optional) + clicks Reject

**3. System:** Rejects SP [API] [PERSIST]  
   — Status: Pending → Rejected  
   — Sends rejection email with reason  
   — Logs action

**4. System:** Navigates Host to SCR-SP-01 [NAVIGATE]  
   — SP shows status "Rejected" (red)  
   — **Exit:** Rejection complete.

---

## Failure Exits

### Failure: Data Validation Error (Org or SP)

**User sees:** Error message on SCR-ORG-03 or SCR-SP-03: "Missing required field: [field name]" or "Invalid registration number"

**User can:**
- Contact the org/SP via email (pre-filled CTA) asking them to resubmit with corrected data
- Request escalation to Welluber support team if data cannot be corrected

### Failure: Commission Rates Invalid (SP only)

**User sees:** Inline error on SCR-SP-04: "Commission rate must be between 10% and 30%"

**User can:**
- Correct the rate and save again
- Contact SP to confirm acceptable rate range
- Reject the SP and ask them to resubmit (Branch C)

### Failure: Banking Details Missing (SP only)

**User sees:** Error banner on SCR-SP-03 (Branch B applies)

**User can:**
- Email SP to provide banking details
- Reject SP application
- Escalate to support if SP is unresponsive

### Failure: Org/SP Already Approved

**User sees:** SCR-ORG-03 or SCR-SP-03 shows status "Active" instead of "Pending"

**User can:**
- Navigate to SCR-ORG-04 or SCR-SP-05 (detail view) to view/edit existing record
- No re-approval needed

---

## Edge Cases

**1. Organization with Multiple Branches**
   - Org can register multiple branches during setup (HQ + branch offices)
   - All branches inherit the same approval status when org is approved
   - Each branch gets its own wallet (SCR-ORG-05)

**2. Service Provider with Multiple Service Categories**
   - SP selected multiple categories during registration (e.g. Fitness + Massage)
   - Commission config (SCR-SP-04) shows a row for EACH category
   - Host must configure rates for all selected categories before approval
   - If Host tries to approve without filling all rows: **[VALIDATE]** error message: "Please configure commission for all selected service categories"

**3. Pre-approval Check Timeout**
   - If pre-check API (SSM lookup, etc.) takes >5s: show spinner + "Verifying..."
   - If timeout after 30s: show error + "Retry" button
   - If retry fails: flag as "Manual Review" (Host can approve anyway or reject)

**4. Host Session Expires During Flow**
   - Mid-flow, Host's session expires (e.g. idle >30 min)
   - On next action: redirect to SCR-AUTH-01 (Login) with message "Session expired. Please log in again."
   - After login: redirect back to SCR-ORG-03 or SCR-SP-03 (same org/SP being reviewed) with state preserved

**5. Concurrent Approvals (Two Hosts approve same org/SP)**
   - Host A clicks Approve, Host B clicks Approve simultaneously
   - Database constraint (org.status = Pending before update): First approval succeeds, second fails
   - Second Host sees error: "This organization has already been approved" + redirect to SCR-ORG-04 showing status "Active"

**6. Commission Rate Change After Approval**
   - Host can re-open SCR-SP-04 to edit commission rates AFTER SP is already active
   - Changes apply only to NEW transactions going forward
   - **No retroactive changes to past transactions**
   - Audit log records: "Commission rates changed from [old] to [new] on [date]"

**7. Tax Registration Status Mismatch**
   - SP claims is_tax_registered = TRUE but no tax_reg_no
   - Validation during registration (SP's app) should catch this
   - If data reaches Host approval: show warning on SCR-SP-03 "Tax registration incomplete. SP claimed registered but no tax ID provided. Approve anyway?" [allow override]

---

## Handoff to Claude Code

**SCR-IDs referenced:**
- SCR-DASH-01 (Platform Overview — entry point)
- SCR-ORG-01 (Organization List)
- SCR-ORG-03 (Organization Approval)
- SCR-ORG-04 (Organization Detail View — exit)
- SCR-SP-01 (Service Provider List)
- SCR-SP-03 (Service Provider Approval)
- SCR-SP-04 (Commission Schema Editor)
- SCR-SP-05 (Service Provider Detail — exit)
- SCR-AUTH-01 (Login — for session expiry redirect)
- SCR-AUTH-04 (Audit Log — backend logs approvals)

**Screens that need new components:**
- SCR-ORG-03 (Org Approval) — confirmation dialog, pre-check display, rejection form
- SCR-SP-03 (SP Approval) — confirmation dialog, pre-check display, rejection form, banking error state
- SCR-SP-04 (Commission Schema Editor) — rate input table, validation, save action

**Screens that need edits to existing components:**
- SCR-ORG-01 (Org List) — ensure row click routes to SCR-ORG-03 if status=Pending, SCR-ORG-04 if Active
- SCR-SP-01 (SP List) — ensure row click routes to SCR-SP-03 if status=Pending, SCR-SP-05 if Active
- SCR-ORG-04 (Org Detail) — add tabs for Wallet, branches, policies; link to wallet balance display
- SCR-SP-05 (SP Detail) — add tabs for commission summary, branches, packages, settlement history

**Implementation sequence:**
1. Build list screens (SCR-ORG-01, SCR-SP-01) with status badges + routing logic
2. Build approval screens (SCR-ORG-03, SCR-SP-03) with pre-check display + rejection forms
3. Build commission schema editor (SCR-SP-04) with rate table + validation
4. Build detail views (SCR-ORG-04, SCR-SP-05) with tabs + summary info
5. Integrate API calls for approval actions [API] [PERSIST] [AUTH]
6. Test failure paths (banking details missing, rate validation errors, session expiry)

**Key implementation notes:**
- All approval actions should log to audit trail (SCR-AUTH-04)
- Email templates (SCR-CFG-06) should be used for approval/rejection/activation emails
- Commission rates must be validated: 10% ≤ rate ≤ 30%
- Commission config applies only to NEW transactions, not retroactive
- Pre-approval checks are non-blocking (informational) except banking details (which is blocking for SPs)
- Host approval workflow requires Super Admin role [AUTH]
- Optional 2FA confirmation for critical actions (approval, rejection) — TBD with product
