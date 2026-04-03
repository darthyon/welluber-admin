# Flow 10 — SP: Walk-in Claim (Scenario B) — April 2026

**Who:** SP Staff (front desk / receptionist)  
**Platform:** SP Portal (Web)  
**From:** SP claims dashboard or walk-in intake screen  
**To:** Claim logged, deductions applied, co-pay collected (if applicable), confirmation shown  
**Entry condition:** Member arrives at SP without pre-purchased voucher. SP staff initiates claim on behalf.  
**Failure exits:** Member not found, benefit not activated, benefit pool exhausted, org wallet insufficient, duplicate active voucher exists.

---

## Happy Path

**1. SP Staff:** Opens Member Lookup screen in SP Portal [NAVIGATE]  
   — CTA: "Create Walk-in Claim"  
   — Shows lookup interface with priority options

**2. System:** Displays member lookup form [NAVIGATE]  
   — Three-layer priority (tap to select preferred method):  
   — Layer 1 (fastest): QR scan (member opens digital ID card in Welluber app → SP scans with phone/tablet camera)  
   — Layer 2 (fallback): Employee ID (member provides verbally or on paper → SP enters numeric/alphanumeric)  
   — Layer 3 (last resort): Name search (member gives name, SP searches and disambiguates)

**3a. LAYER 1 — QR Scan (Priority):**

**3a-1. SP Staff:** Taps "Scan QR" [NAVIGATE]  
   — Camera opens in SP Portal  
   — Prompts member: "Open Welluber app → Profile → Digital ID → show QR code"

**3a-2. Member:** Opens Welluber app → navigates to digital ID card → shows QR code to SP

**3a-3. SP Staff:** Points camera at QR code

**3a-4. System:** Reads QR code [VALIDATE] [API]  
   — Decodes: member_id, employee_id, organization, corporate_email  
   — Returns unambiguous identity (no collision check needed)  
   — Proceed to step 4

---

**3b. LAYER 2 — Employee ID (Fallback):**

**3b-1. SP Staff:** Taps "Enter Employee ID" [NAVIGATE]  
   — Text input field  
   — Member provides ID verbally or on paper

**3b-2. SP Staff:** Enters Employee ID

**3b-3. System:** Searches employee list [API]  
   — Filters: active employees only (start_date ≤ today ≤ termination_date)  
   — Returns: single match (if unique) or disambiguation list (if multiple matches)

**3b-4a. IF Single Match:**
   - System returns: employee name, org, branch  
   - Proceed to step 4

**3b-4b. IF Multiple Matches (Name Collision):**
   - System: show disambiguation list with names + org branches  
   - SP Staff: selects correct employee (e.g., "John Smith - Finance Branch" vs "John Smith - Sales Branch")  
   - Proceed to step 4

**3b-4c. IF No Match:**
   - Show error: MEMBER_NOT_FOUND  
   - "No active employee with that ID. Try QR scan or name search."  
   - SP Staff can retry

---

**3c. LAYER 3 — Name Search (Last Resort):**

**3c-1. SP Staff:** Taps "Search by Name" [NAVIGATE]  
   — Text input field  
   — Member provides name (first, last, or both)

**3c-2. SP Staff:** Enters name (partial match OK)

**3c-3. System:** Searches employee list by name [API]  
   — Returns: all matching active employees (may be 1–many)

**3c-4a. IF Single Match:**
   - Show: employee name, org, branch  
   - Proceed to step 4

**3c-4b. IF Multiple Matches:**
   - System: show disambiguation list  
   - SP Staff: asks member to confirm (name? date of birth? employee ID?)  
   - SP Staff: selects from list  
   - Proceed to step 4

**3c-4c. IF No Match:**
   - Show error: MEMBER_NOT_FOUND  
   - "No active employee with that name. Try QR scan or ID."  
   - SP Staff can retry

---

**4. System:** Member identity confirmed (from layer 1, 2, or 3)  
   — Retrieves: member_id, employee_id, organization, corporate_identity status

**5. System:** Collision check (critical) [API] [VALIDATE]  
   — Query: does this member have an Active voucher for the same Main Service that SP is about to claim?  
   — Why: prevent double-claiming (employee buys online voucher, then walks in for duplicate claim)

**IF Active Voucher Exists for Same Service:**
   - Return error: ACTIVE_VOUCHER_EXISTS  
   - Show to SP: "Member has an active voucher for this service. Ask them to present it instead."  
   - Block walk-in claim  
   - Exit flow

**IF No Active Voucher:**
   - Proceed to step 6

---

**6. SP Staff:** Selects service [NAVIGATE]  
   — Sees list of services that SP offers (from SP's voucher catalog)  
   — Taps service name (e.g., "Gym Access — 1-Month Pass")

**7. System:** Pre-transaction validation (three checks) [VALIDATE] [API]

   **Check 1 — Benefit Activation:**
   - activation_mode check (same as online purchase)  
   - IF not active: return BENEFIT_NOT_ACTIVATED  
   - Show to SP: "Member's benefits haven't started yet."  
   - Exit

   **Check 2 — Benefit Pool:**
   - Does member have remaining balance for this service?  
   - IF exhausted: return BENEFIT_POOL_EXHAUSTED  
   - Show to SP: "Member has no remaining balance for this service."  
   - Exit

   **Check 3 — Org Wallet:**
   - Org wallet balance >= member policy entitlement?  
   - IF insufficient: return ORG_WALLET_INSUFFICIENT  
   - Show to SP: "Insufficient company funds for this claim."  
   - Exit

**8. System:** All validations passed → pre-fill claim summary [API]

**9. SP Staff:** Reviews claim summary [NAVIGATE]  
   — Shows:  
   — Member name  
   — Service selected  
   — Covered amount (from benefit_amount or policy)  
   — Co-payment amount (if applicable)  
   — Total charge to member  
   — CTA: "Submit Claim" or "Cancel"

**10. SP Staff:** Taps "Submit Claim"  
   — No member app approval required (this is the key difference from online purchase)

**11. System:** Auto-deducts from org wallet + member benefit pool [API] [PERSIST]  
   — Deduct: covered_amount from member's benefit pool  
   — Deduct: covered_amount from org wallet balance  
   — Status: claim created, logged to ledger  
   — If SP is_tax_registered: de-calculate SST (store immutably)  
   — Logs: "Walk-in claim submitted for member [ID], service [ID], covered RM [X]"

**12a. IF Co-Payment Required:**

**12a-1. System:** Shows co-payment prompt [NAVIGATE]  
   — Message: "Collect RM [X] from member (cash or card)"  
   — SP takes payment directly (not through Welluber)  
   — System does NOT process co-payment; SP handles it

**12a-2. SP Staff:** Collects co-payment from member  
   — Via: cash, card, e-wallet (SP's own payment method, not Welluber)

**12a-3. SP Staff:** Confirms payment received [NAVIGATE]  
   — Taps "Payment Received" or "Skip" (if member unable to pay)

**12a-4. System:** Logs co-payment status [PERSIST]  
   — co_payment_collected = true or false  
   — Amount collected (if tracked)

---

**12b. IF No Co-Payment:**

**12b-1. System:** Skips co-payment step [NAVIGATE]

---

**13. System:** Shows confirmation screen [NAVIGATE]  
   — "Claim submitted successfully"  
   — Member name, service, settlement reference number  
   — Covered amount, co-payment (if applicable)

**14. SP Staff:** Confirms with member  
   — "Your claim has been processed. Thank you for visiting [SP Name]!"

**15. System:** Member's Welluber app (if open) receives notification [NOTIFY]  
   — "You used your benefits at [SP Name] for [Service]"  
   — Wallet balance updated on next app open/refresh

**16. EXIT:** Walk-in claim complete, deductions applied, ledger entry created

---

## Edge Cases

**1. Member Has Multiple Active Vouchers, One for Same Service**

**Scenario:** Member has:
- Voucher A (Gym): Active
- Voucher B (Personal Training): Active

SP staff tries to submit walk-in claim for Gym

**Flow:**
- Collision check finds: Voucher A (Gym, Active)
- Error: ACTIVE_VOUCHER_EXISTS  
- "Member has an active voucher for this service."  
- SP blocks walk-in claim for Gym  
- SP can offer: "Do you want Personal Training instead?" (if available)

---

**2. Disambiguation: Multiple "John Smith" Employees**

**Scenario:** SP searches by name, finds 3 matches:
- John Smith (Finance Branch)
- John Smith (Sales Branch)
- Jon Smith (HR Branch)

**Flow:**
- System shows disambiguation list  
- SP asks member: "Which branch?"  
- Member says: "Finance"  
- SP taps: "John Smith — Finance Branch"  
- Proceed to service selection

---

**3. Co-Payment Exceeds Covered Amount**

**Scenario:** Voucher price RM 500, benefit_amount RM 300, co-payment = RM 200

**Flow:**
- System shows co-payment prompt: "Collect RM 200 from member"  
- SP collects RM 200 (member pays)  
- System deducts RM 300 from benefit pool + org wallet (covered)  
- Co-payment tracked (not routed through Welluber)  
- Settlement: SP gets RM 300 (covered), keeps RM 200 co-payment (no Welluber commission on co-pay)

---

**4. Member Arrives After Benefit Pool Refresh Cycle**

**Scenario:** Member's annual gym benefit (RM 2000) refreshed today

**Flow:**
- Collision check: no recent Active voucher  
- Pool validation: member has full RM 2000 (fresh refresh)  
- Claim submitted: new balance = RM 2000 - [claim amount]  
- Proceeds normally

---

**5. Member on Probation, Activation Not Yet Triggered**

**Scenario:** activation_mode = "After Probation Ends", probation ends tomorrow

**Flow:**
- SP staff submits walk-in claim  
- System: BENEFIT_NOT_ACTIVATED error  
- Show to SP: "Member's benefits activate tomorrow. Please ask them to return then."  
- SP can note: calendar reminder for member

---

**6. Org Wallet Funded, But Multiple Concurrent Claims Deplete It**

**Scenario:**
- Org wallet: RM 5,000  
- Member 1 benefit entitlement: RM 3,000  
- Member 2 benefit entitlement: RM 3,000  
- Member 1 walks in, claim processing, but Member 2's online purchase completes first → wallet now RM 2,000  
- Member 1 claim finishes → insufficient wallet balance

**Flow:**
- Member 1 pre-validation passes (RM 5,000 >= RM 3,000)  
- Member 2 online purchase deducts RM 3,000 → wallet now RM 2,000  
- Member 1 final deduction: wallet check fails (RM 2,000 < RM 3,000)  
- Error: ORG_WALLET_INSUFFICIENT  
- Claim rolled back, balance released

---

**7. SP Not Tax-Registered, But Claim Touches Taxonomy Service with SST**

**Scenario:** SP is_tax_registered = FALSE. Member claims gym service (typically under SST).

**Flow:**
- System: de-calculation skipped (SP not registered)  
- Covered amount used as-is (no SST breakdown)  
- Ledger entry created with is_tax_registered flag = FALSE at time of transaction  
- Audit trail: no SST component recorded

---

**8. Member Requests Receipt / Proof**

**Scenario:** Member asks SP for written proof of claim

**Flow:**
- System: generates receipt on SP staff's screen (optional print/email)  
- Receipt shows: member name, service, covered amount, co-payment, reference number, date/time  
- SP: can print or email to member  
- Member: receives confirmation in Welluber app (within hours)

---

## Failure Exits

### Failure: Member Not Found

**User sees:** MEMBER_NOT_FOUND  
**Message:** "No active employee with that ID/name. Try QR scan or contact HR."

**SP Staff can:**
- Retry with different ID/name
- Request member to provide QR code
- Contact HR to verify enrollment
- Contact Welluber support

---

### Failure: Benefit Not Activated

**User sees:** BENEFIT_NOT_ACTIVATED  
**Message:** "Member's benefits haven't started yet."

**SP Staff can:**
- Ask member to return on activation date
- Suggest member contact HR

---

### Failure: Benefit Pool Exhausted

**User sees:** BENEFIT_POOL_EXHAUSTED  
**Message:** "Member has no remaining balance for this service."

**SP Staff can:**
- Suggest member contact HR for policy adjustment
- Offer alternative service (if another service has balance)

---

### Failure: Org Wallet Insufficient

**User sees:** ORG_WALLET_INSUFFICIENT  
**Message:** "Insufficient company funds for this claim."

**SP Staff can:**
- Inform member: "Company wallet is depleted. Contact HR to fund it."
- Contact Welluber support if urgent

---

### Failure: Active Voucher Exists (Collision)

**User sees:** ACTIVE_VOUCHER_EXISTS  
**Message:** "Member has an active voucher for this service. Ask them to present it."

**SP Staff can:**
- Ask member to show their active voucher in the Welluber app
- Ask member to pay co-payment only (if applicable)

---

## Handoff to Claude Code

**Screens needed:**
- Member Lookup interface (QR scan, Employee ID input, Name search)
- Disambiguation screen (multiple matches, show names + branches, select)
- Service selection dropdown (list of SP's services)
- Claim summary screen (member name, service, covered amount, co-payment, "Submit"/"Cancel")
- Co-payment prompt (message with amount, "Payment Received" / "Skip")
- Confirmation screen (success message, reference number, settlement info)
- Error states (MEMBER_NOT_FOUND, BENEFIT_NOT_ACTIVATED, BENEFIT_POOL_EXHAUSTED, ORG_WALLET_INSUFFICIENT, ACTIVE_VOUCHER_EXISTS)

**Key implementation notes:**
- Three-layer member lookup (QR → Employee ID → Name, priority order)
- Collision check mandatory (prevents double-claiming)
- No member app involvement (SP drives entire UX)
- Co-payment collected by SP directly (not routed through Welluber)
- Pre-validation before service selection (catch errors early)
- Concurrent deduction handling (wallet re-checked at final deduction)
- All state transitions logged to audit trail + settlement ledger
- Push notification to member app (on claim completion)
- Receipt generation (optional, for SP to print/email)

