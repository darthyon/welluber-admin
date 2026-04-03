# Flow 12 — Host/SP: Settlement & Payout — April 2026

**Who:** Host Admin (triggers), SP Admin (approves)  
**Platform:** Host Portal (Host), SP Portal (SP)  
**From:** Settlement period reached or on-demand trigger  
**To:** SP paid, transaction ledger settled, tax documents archived  
**Entry condition:** Settlement cycle reached (monthly default) or Host triggers on-demand payout. All transactions in period available for settlement.  
**Failure exits:** Commission schema missing, SP tax profile incomplete, settlement already processed, payment failure.

---

## Happy Path

**PHASE 1: HOST AGGREGATION & CALCULATION**

**1. Host:** Initiates settlement [NAVIGATE]  
   — Navigates to Settlement Dashboard (SCR-SET-01)  
   — Options: "Monthly Settlement (Auto)", "On-Demand Payout", "View Pending"

**2. Host:** Triggers settlement (auto or manual) [NAVIGATE]  
   — If auto: system triggers at scheduled time (monthly, default)  
   — If manual: Host clicks "Trigger Settlement"

**3. System:** Aggregates ledger entries per SP [API]  
   — Query all transactions since last settlement:  
   — Redeemed vouchers (Scenario A: online + code entry)  
   — Redeemed vouchers (Scenario B: walk-in claims)  
   — Expired vouchers (ledger splits)  
   — Excludes: cancelled vouchers, pending vouchers, co-payments

**4. System:** Calculates net payout per SP [CALCULATE]  
   — For each SP, for each transaction:

   **Formula (Redeemed):**
   ```
   transaction_gross = final_price (SST-inclusive)
   total_commission = SUM(transaction_gross x weight x category_commission_rate) per service line
   net_sp_payout = transaction_gross - total_commission
   ```

   **Formula (Expired Voucher Split):**
   ```
   expired_gross = voucher final_price
   expired_split = {
     org_refund: expired_gross x %org,
     sp_ledger: expired_gross x %sp,
     welluber_commission: expired_gross x %welluber
   }
   net_sp_credit = expired_split.sp_ledger
   ```

   **SST Handling:**
   - If SP is_tax_registered = TRUE:  
     net_amount = transaction_gross / 1.08  
     sst_component = transaction_gross - net_amount  
   - If FALSE: net_amount = transaction_gross

**5. System:** Generates settlement statement per SP [GENERATE]  
   — Aggregated view:  
   — Period: [start_date to end_date]  
   — Total transactions: [count]  
   — Total gross: RM [X]  
   — Total commission deducted: RM [Y]  
   — Net SP payout: RM [Z]  
   — Itemized breakdown: per transaction (date, service, gross, commission, net)

**6. System:** Generates pre-filled tax document per SP [GENERATE]  
   — Document type: Payment Advice + Tax Invoice template (pre-filled)  
   — Pre-fills using SP's stored tax_reg_no (from tax profile)  
   — Contents:  
   — SP name + tax_reg_no  
   — Invoice period [start to end]  
   — Gross amount (SST-inclusive) per transaction  
   — SST component (if applicable)  
   — Net taxable amount  
   — Welluber commission deducted  
   — Payment advice: "Welluber will transfer RM [Z] to [SP bank account]"

**7. System:** Logs settlement record [PERSIST]  
   — Creates settlement record (status = pending_approval)  
   — Stores: period, sp_id, total_gross, total_commission, net_payout, tax_doc_id, created_date

**8. System:** Notifies SP Admin [NOTIFY]  
   — Email: "Your settlement statement is ready for review. Log in to SP Portal to approve."

---

**PHASE 2: SP APPROVAL**

**9. SP Admin:** Logs into SP Portal [NAVIGATE]  
   — Navigates to Settlement section  
   — Sees: "Settlement Statement — [Period] — Pending Your Review"  
   — CTA: "Review and Approve"

**10. SP Admin:** Reviews settlement statement [NAVIGATE]  
   — Views: itemized list of all transactions in period  
   — Per transaction: date, service, gross amount, commission, net  
   — Totals at top: total gross, total commission, net payout

**11. SP Admin:** Reviews auto-generated tax document [NAVIGATE]  
   — Sees: pre-filled Payment Advice + Tax Invoice  
   — Can: view, download, print  
   — Validation: checks against statement (should match)

**12. SP Admin:** Approves statement + tax doc [NAVIGATE]  
   — CTA: "Approve and Submit"  
   — Optional checkbox: "I confirm the above information is accurate"

**13. System:** Validates SP's tax profile [VALIDATE]  
   → If is_tax_registered = TRUE but tax_reg_no is missing: error "Tax registration number required to approve."  
   → If tax_doc fields mismatch statement: warning "Tax document doesn't match statement. Review before confirming."  
   → If all OK: proceed

**14. SP Admin:** Taps "Approve"

**15. System:** Records SP approval [PERSIST]  
   — Settlement status: pending_approval → sp_approved  
   — Stores: approval_timestamp, sp_admin_name, approval_comment (optional)  
   — Logs: "SP Admin [Name] approved settlement for [Period] on [timestamp]"

**16. System:** Notifies Host Admin [NOTIFY]  
   — Email: "Settlement statement approved by [SP Name]. Ready for payout."  
   — Shows in Host Dashboard: "[SP Name] — RM [Z] — Ready to Pay"

---

**PHASE 3: HOST PAYOUT TRIGGER**

**17. Host:** Reviews platform-wide settlement report (SCR-SET-02) [NAVIGATE]  
   — Sees: list of all SPs with sp_approved settlements  
   — Filters available: date range, status (pending, approved, paid), SP name  
   — Summary metrics: total GMV, total commissions, total payouts pending

**18. Host:** Decides payout action  
   → Option A: "Pay [SP Name]" (individual SP payout)  
   → Option B: "Pay All" (bulk payout to all approved SPs)  
   → Option C: "Schedule" (future-dated payout, e.g., next business day)

**19a. OPTION A — Individual SP Payout:**

**19a-1. Host:** Clicks SP → "Pay Now"

**19a-2. System:** Prepares payout [CALCULATE]  
   — Retrieves: SP bank account, net_payout amount, settlement_id

**19a-3. Host:** Confirms payment [NAVIGATE]  
   — Shows: SP name, net amount, bank account (last 4 digits), "Confirm Payment"

**19a-4. Host:** Taps "Confirm"

**19a-5. System:** Initiates payout [API] [EXTERNAL]  
   — Calls payment processor (e.g., Billplz, iPay88, direct bank transfer)  
   — Transfers: net_payout to SP bank account  
   — Reference: settlement_id + period  
   — Payout status: processing

**19a-6. System:** Polls payment processor [API] [ASYNC]  
   — Waits for confirmation (seconds to minutes)  
   — Result: SUCCESS or FAILED

**19a-7a. IF SUCCESS:**
   - Settlement status: sp_approved → paid  
   - Payout timestamp recorded  
   - Logs: "Payout RM [Z] to SP [Name] completed on [timestamp]"  
   - Host notified: "Payout successful"

**19a-7b. IF FAILED:**
   - Settlement status: sp_approved (unchanged)  
   - Error reason logged  
   - Host notified: "Payout failed. Bank details invalid or account frozen. Contact SP."  
   - Host can: retry, update bank account, contact SP support

---

**19b. OPTION B — Bulk Payout (All Approved SPs):**

**19b-1. Host:** Clicks "Pay All" [NAVIGATE]

**19b-2. System:** Shows summary [NAVIGATE]  
   — Count: [N] SPs ready to pay  
   — Total payout: RM [X]  
   — Confirmation: "Pay RM [X] to [N] SPs?"

**19b-3. Host:** Confirms

**19b-4. System:** Initiates payouts in batch [API] [ASYNC]  
   — Per SP: trigger individual payout (same as 19a-5)  
   — Track: success/failure per SP  
   — Generate batch report

**19b-5. System:** Logs batch payout [PERSIST]  
   — Batch ID, count, total amount, completion status  
   — Per-SP results (success/failure with reason)

**19b-6. System:** Notifies Host [NOTIFY]  
   — Email: "Batch payout complete: [N] succeeded, [M] failed"  
   — Dashboard shows: successful payouts in green, failures in red

---

**19c. OPTION C — Schedule Payout (Future-Dated):**

**19c-1. Host:** Clicks "Schedule Payout" [NAVIGATE]

**19c-2. System:** Shows scheduler [NAVIGATE]  
   — Date picker: select payout date (must be future)  
   — Time picker: HH:MM (optional, default 09:00 UTC)

**19c-3. Host:** Selects date/time, confirms

**19c-4. System:** Creates scheduled payout record [PERSIST]  
   — Status: scheduled  
   — Trigger time: stored  
   — Logs: "Payout scheduled for [date] [time]"

**19c-5. System:** Cron job runs at scheduled time [CRON]  
   — Executes: bulk payout to all sp_approved settlements  
   — Same as 19b-4 (batch payout)

**19c-6. System:** Notifies Host [NOTIFY]  
   — Email: "Scheduled payout completed. [Results]"

---

**PHASE 4: COMPLETION & RECONCILIATION**

**20. System:** Generates settlement record completion [PERSIST]  
   — All paid settlements marked as settled (status = paid)  
   — Payout details immutable in ledger  
   — 7-year retention per RMCD requirement

**21. Host:** Generates reconciliation report (SCR-SET-03) [NAVIGATE]  
   — View: platform-wide settlement summary  
   — Filters: date range, status (all), SP name  
   — Metrics: total GMV, commissions, payouts, refunds  
   — Export: CSV for accounting + audit

**22. System:** Archives tax documents [ARCHIVE]  
   — PDF stored in secure archive (7-year retention)  
   — Linked to: settlement record, SP account, period

**23. SP Admin:** Receives payout notification [NOTIFY]  
   — Email: "Payout received: RM [Z] to [bank account] on [date]"  
   — Receipt attached: settlement statement + tax document  
   — Can view in SP Portal settlement history

**24. EXIT:** Settlement complete, SP paid, ledger settled

---

## Edge Cases

**1. Commission Schema Missing for SP**

**Scenario:** Settlement run triggered, but SP has no commission schema configured

**Flow:**
- System: blocks settlement  
- Error: "Commission schema not configured for [SP Name]"  
- Host must: configure commission (Flow 3, Branch C) before settlement  
- Settlement queued, retries on next cycle

---

**2. Tax Profile Incomplete**

**Scenario:** SP is_tax_registered = TRUE, but tax_reg_no is missing

**Flow:**
- Settlement generated (system calculates SST de-calc)  
- SP approves statement  
- Host tries to trigger payout  
- System warns: "Tax registration number missing. Payout can proceed, but audit trail will flag incomplete tax profile."  
- Host can: confirm proceed, or contact SP to complete tax profile

---

**3. Multiple Settlements for Same Period (Re-run)**

**Scenario:** Settlement run for Jan 2026, paid. New transaction arrives that should've been in Jan. Host re-runs settlement for Jan.

**Flow:**
- System: checks if previous settlement already paid  
- If yes: warning "Settlement already paid. Re-running will create duplicate entries."  
- Option: create amendment settlement (Jan 2026 — Amendment) instead  
- System: tracks original + amendment separately, prevents double-payment

---

**4. SP Bank Account Changed**

**Scenario:** SP updates bank account mid-settlement (after approval but before payout)

**Flow:**
- Host initiates payout with old bank account  
- Payout fails: "Account not found"  
- Host: manually update SP bank account in SP profile  
- Retry payout with new account  
- System logs: change timestamp, old + new account (audit trail)

---

**5. Concurrent Approvals (SP Admin + Host)**

**Scenario:** SP Admin approves settlement, simultaneously Host tries to trigger payout

**Flow:**
- Concurrent transaction check: last-write-wins  
- If SP approval completes first: settlement marked sp_approved  
- If Host payout initiation completes first: waits for sp_approval before proceeding  
- System: serializes access (no race condition)

---

**6. Partial Settlement (Some SPs Approved, Some Pending)**

**Scenario:** 5 SPs have pending settlements; 3 approve, 2 still reviewing

**Flow:**
- Host triggers "Pay All"  
- System: only pays the 3 sp_approved settlements  
- Excludes: 2 still pending_approval  
- Batch report: "Paid 3 SPs (RM [X] total), 2 pending approval"

---

**7. Settlement Period Overlaps (Timezone Edge Case)**

**Scenario:** Monthly settlement runs at UTC midnight, but some SPs operate in UTC+8

**Flow:**
- Settlement period: strict UTC boundaries (e.g., Jan 1 00:00 UTC — Jan 31 23:59 UTC)  
- Transactions stamped in UTC at creation time  
- SP timezone offset: applied only for UI display, not settlement boundaries  
- System: no ambiguity in period definition

---

**8. Co-Payment Tracking (Walk-in)**

**Scenario:** Walk-in claim collected co-payment, but it wasn't routed through Welluber

**Flow:**
- Settlement shows: covered_amount only (co-payment excluded)  
- Commission: calculated on covered_amount (excluding co-pay)  
- SP settlement: receives payout on covered_amount minus commission  
- Co-payment: already in SP's pocket (not reconciled in Welluber system)  
- Audit trail: notes co-payment collected offline

---

## Failure Exits

### Failure: Commission Schema Missing

**User sees:** Error during settlement aggregation  
**Message:** "Commission schema not configured for [SP Name]. Settlement cannot proceed."

**Host can:**
- Configure commission schema (Flow 3)
- Retry settlement on next cycle

---

### Failure: Tax Profile Incomplete

**User sees:** Warning during SP approval  
**Message:** "Tax registration number missing. Confirm to proceed anyway."

**Host can:**
- Contact SP to complete tax profile
- Approve payout anyway (flagged in audit trail)

---

### Failure: Payout Failed (Bank Error)

**User sees:** "Payout to [SP Name] failed. Bank account invalid or unavailable."

**Host can:**
- Update SP bank account details
- Retry payout
- Contact SP support to verify account

---

### Failure: Settlement Already Paid

**User sees:** "Settlement for [Period] already paid. Create amendment settlement instead?"

**Host can:**
- Confirm create amendment (for adjustments)
- Cancel if accidental re-run

---

## Handoff to Claude Code

**Screens needed:**
- Settlement Dashboard (SCR-SET-01): summary metrics, trigger buttons (auto/manual/on-demand)
- Settlement Statement (SCR-SET-02): itemized transactions, totals, filters, "Approve" CTA (SP Portal only)
- Tax Document Viewer: auto-generated Payment Advice + Tax Invoice, preview/download
- Platform Ledger (SCR-SET-03): all SPs, status, amounts, filters, export CSV
- Payout Confirmation: bank account, amount, "Confirm" button
- Batch Payout Status: table showing per-SP success/failure, completion percentage
- Settlement History: past settlements, status, audit trail per settlement

**Key implementation notes:**
- Commission calculation per-SP, per-service-category, weighted across service lines
- SST de-calculation stored immutably at transaction creation (not recalculated at settlement)
- Settlement status flow: pending_aggregation → sp_approved → paid (immutable)
- Payout integration: async, webhook-based confirmation from payment processor
- Tax documents: pre-filled using stored SP tax_reg_no, SP one-tap approve (no manual entry)
- Audit trail: every status change, approval, payout attempt logged with timestamp + actor
- Co-payments: excluded from settlement (collected offline by SP)
- Batch payouts: per-SP error tracking, don't fail entire batch on one SP failure
- 7-year retention: tax documents, ledger entries, settlement records archived
- Reconciliation reports: CSV export for accounting + audit teams

