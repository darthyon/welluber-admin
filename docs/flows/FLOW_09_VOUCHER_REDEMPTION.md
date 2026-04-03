# Flow 9 — SP: Voucher Redemption (Online-Purchased Voucher) — April 2026

**Who:** Member (present code), SP Staff (redeem in portal)  
**Platform:** Member App (shows code) + SP Portal (confirms redemption)  
**From:** Member arrives at SP with Active voucher  
**To:** Voucher marked Redeemed, commission calculated, ledger entry created  
**Entry condition:** Member purchased voucher online (Flow 8), received TOTP code, now at SP to redeem.  
**Failure exits:** Invalid code, voucher not Active, wrong SP, code expired (redemption period passed), network error.

---

## Happy Path

**PART A — MEMBER SIDE**

**1. Member:** Arrives at SP with Active voucher in wallet [PHYSICAL]

**2. Member:** Opens Welluber app [NAVIGATE]  
   — Navigates to: Wallet → Active Vouchers

**3. Member:** Finds voucher for today's service [NAVIGATE]  
   — Views: voucher name, service(s), SP name, TOTP code (refreshing)  
   — Code updates every 30 seconds  
   — CTA: "Show to SP"

**4a. OPTION A — Member shows code from app:**

**4a-1. Member:** Taps "Show to SP" [NAVIGATE]  
   — App goes full-screen  
   — Displays: large TOTP code, timer (30 sec countdown), SP name/instructions  
   — Code refreshes automatically  
   — No screenshot protection (allows SP to photograph/verify)

**4b. OPTION B — Member takes screenshot or manually reads code:**

**4b-1. Member:** Reads code aloud or shows screenshot to SP  
   — SP staff writes down code or photographs screen

**5. Member:** Shows code to SP (via live app display or screenshot)

---

**PART B — SP STAFF SIDE**

**6. SP Staff:** Opens SP Portal [NAVIGATE]  
   — Navigates to: Claims / Vouchers / Redemption (screen name TBD)  
   — CTA: "Enter Voucher Code"

**7. System:** Displays code entry form [NAVIGATE]  
   — Input field: "Voucher Code" (6-8 char TOTP or alphanumeric)  
   — CTA: "Redeem" or "Verify Code"

**8. SP Staff:** Enters code shown by member [NAVIGATE]  
   — Typed from screenshot, read aloud, or live app display

**9. System:** Validates code in real-time [VALIDATE] [API]

   **Check 1 — Code Format:**
   - Is code valid TOTP format?  
   - If not: error "Invalid code format"

   **Check 2 — Code Matches Voucher:**
   - Query: find active voucher with this code  
   - If not found: error "Code not found. Check for typos or ask member to refresh."

   **Check 3 — Voucher Is Active:**
   - Status must be "Active"  
   - If Pending: error "Payment not confirmed yet. Code not valid."  
   - If Expired: error "Voucher expired. Ask member to contact HR."  
   - If Cancelled: error "Voucher was cancelled."  
   - If Redeemed: error "Voucher already redeemed. Ask member to check app."

   **Check 4 — Code Not Expired:**
   - Is code still within voucher's redemption_period?  
   - Redemption period: (purchase_date + redemption_duration) or (redemption_exact_date)  
   - If expired: error "Code expired. Redemption period ended."

   **Check 5 — Correct SP:**
   - Voucher's branches include current SP's branch?  
   - If not: error "This voucher is not valid at this location."

**10. System:** All validations passed [PROCEED]

---

**PART C — REDEMPTION CONFIRMATION**

**11. System:** Shows member confirmation to SP [NAVIGATE]  
   — Summary:  
   — Member name  
   — Voucher name / service(s)  
   — SP name / branch  
   — Covered amount  
   — CTA: "Confirm Redemption" or "Cancel"

**12. SP Staff:** Reviews member name + service  
   — Confirms: "Yes, this is correct"

**13. SP Staff:** Taps "Confirm Redemption" [NAVIGATE]

**14. System:** Processes redemption [API] [PERSIST]  
   — Voucher status: Active → Presented (brief state, service being delivered)  
   — Voucher status: Presented → Redeemed (service confirmed complete)  
   — Commission calculation (weighted per service line):  
   ```
   Per service line:
     gross = final_price x weight
     commission = gross x service_category_commission_rate
     net_sp_payout = gross - commission
   Total commission = SUM(per-line commissions)
   Net SP payout = final_price - total_commission
   ```
   — Logs: "Voucher [ID] redeemed for member [ID] at SP [ID] on [timestamp]"  
   — Stores: transaction record with gross, commission, net, SST (if applicable)

**15. System:** Creates ledger entry [PERSIST]  
   — Entry type: Redeemed  
   — Amount: final_price (gross)  
   — Commission: calculated  
   — Net SP credit: added to SP's settlement ledger  
   — Status: settled (will be included in next settlement cycle)

**16. System:** Sends push notification to member [NOTIFY]  
   — "Voucher redeemed at [SP Name]"  
   — Timestamp: completion time

**17. SP Staff:** Sees confirmation [NAVIGATE]  
   — "Voucher redeemed successfully"  
   — Settlement reference number  
   — Timestamp

**18. System:** Returns SP to redemption entry screen [NAVIGATE]  
   — Ready for next voucher code entry

**19. EXIT:** Voucher redeemed, ledger entry created, member notified

---

## Edge Cases

**1. Code Entered Incorrectly (Typo)**

**Scenario:** SP staff types "A1B2C3" but correct code is "A1B2C4"

**Flow:**
- System: "Code not found. Check for typos or ask member to refresh code."  
- SP staff: can retry, ask member to show updated code (refreshes every 30 sec)

---

**2. Code Expired During Service Delivery**

**Scenario:** Member purchased voucher "valid for 15 days". Today is day 16.

**Flow:**
- SP staff enters code  
- System: "Code expired. Redemption period ended on [date]."  
- SP staff: informs member  
- Option: member contacts HR for extension (not SP's role)

---

**3. Member Shows Different Code (Double-Spend Attempt)**

**Scenario:** Member has two Active vouchers (Gym + Personal Training), shows Gym code for Personal Training service

**Flow:**
- SP staff enters Gym code  
- System validates: code belongs to Gym voucher  
- SP staff checks: member is asking for Personal Training  
- System: "Code is for Gym Access service, not Personal Training."  
- SP staff rejects redemption, asks member to show correct code

---

**4. Member Redeems Same Code Twice (Fraud Attempt)**

**Scenario:** Member shows TOTP code twice (code refreshes every 30s, SP staff doesn't notice first redemption)

**Flow:**
- First entry: code valid, voucher redeemed, ledger created  
- Voucher status: Active → Redeemed (immutable)  
- Second entry (code still displaying): system checks voucher status  
- System: "Voucher already redeemed. Ask member to check app."  
- Prevents duplicate ledger entries

---

**5. Member Present But Code Won't Scan (Network Error)**

**Scenario:** SP Portal offline or network latency, code validation request times out

**Flow:**
- SP staff enters code  
- System: tries to validate (API call)  
- Network timeout after 5 sec  
- Error: "Network error. Check connection or try again."  
- SP staff can: retry, ask member to return later, or note code manually for later batch processing (if offline mode supported)

---

**6. Voucher's SP Location Mismatch**

**Scenario:** Voucher scoped to "Finance Branch", but member tries to redeem at "Sales Branch"

**Flow:**
- SP staff at Sales Branch enters code  
- System: checks voucher's branch_list  
- System: "This voucher is not valid at this location. Valid at: Finance Branch."  
- SP staff informs member

---

**7. Member's Benefit Pool Already Exhausted (But Already Purchased)**

**Scenario:** Member purchased voucher (when pool was sufficient), but another transaction exhausted pool before redemption

**Flow:**
- Redemption succeeds (ledger entry already created at purchase time)  
- SP staff redeems code without issue  
- Member's balance (if re-checked) now shows exhausted  
- No impact on redemption (purchase-time validation was the checkpoint)

---

**8. Co-Payment Not Collected at Purchase (Online)**

**Scenario:** Voucher has co-payment, but member somehow purchased without paying it

**Flow:**
- Redemption: SP staff enters code, system validates and redeems  
- Commission: calculated on covered_amount (not co-payment)  
- Co-payment: wasn't collected (shouldn't happen, purchase flow enforces it)  
- If discovered: Host can audit and adjust ledger (post-redemption correction, rare)

---

**9. Multi-Service Voucher, Partial Redemption (v2 Feature)**

**Scenario:** Voucher includes "Gym (weight 0.6) + Personal Training (weight 0.4)". Member only uses Gym portion.

**Flow:**
- v1: No partial redemption (all-or-nothing)  
- Member redeems full voucher for full commission calculation  
- v2: Could support partial redemption (out of scope)

---

**10. Manual Code Entry vs QR Scan**

**Scenario:** PRD says v1 uses code entry (no QR scan). But member tries to show QR code anyway.

**Flow:**
- v1: SP staff manually types code shown in app (or from screenshot)  
- QR scan: deferred to v2  
- No QR camera in SP Portal for v1  
- SP staff: uses manual entry method

---

## Failure Exits

### Failure: Invalid Code

**User sees:** "Code not found. Check for typos or ask member to refresh."

**SP Staff can:**
- Ask member to refresh code in app
- Re-enter corrected code
- Note code and retry later

---

### Failure: Voucher Not Active

**User sees:** "Voucher not valid. Status: [Pending/Expired/Cancelled/Redeemed]"

**SP Staff can:**
- Inform member of status
- Suggest member check app or contact HR
- Document issue for support

---

### Failure: Voucher Expired

**User sees:** "Code expired. Redemption period ended on [date]."

**SP Staff can:**
- Inform member
- Suggest member contact HR for extension
- Document for audit

---

### Failure: Wrong SP Location

**User sees:** "This voucher is not valid at this location."

**SP Staff can:**
- Inform member they must visit correct branch
- Suggest member contact HR

---

### Failure: Network Error

**User sees:** "Network error. Check connection or try again."

**SP Staff can:**
- Retry when network restored
- Note code and batch process later (if offline mode exists)
- Contact Welluber support

---

## Handoff to Claude Code

**Screens needed:**
- Member app: Active voucher detail (full-screen display with large TOTP code, 30-sec countdown timer, "Show to SP" CTA)
- SP Portal: Code entry form (input field, "Redeem" button)
- SP Portal: Redemption confirmation (member name, voucher details, "Confirm Redemption" button)
- SP Portal: Success screen (confirmation message, settlement reference, return to entry)
- Error states (invalid code, voucher not active, code expired, wrong SP, network error)

**Key implementation notes:**
- TOTP code: time-based, 30-second refresh, valid for entire redemption period
- Code validation: 5-point check (format, exists, status, expiry, location)
- Voucher state transition: Active → Presented (brief) → Redeemed (immutable)
- Commission calculation: per-service-line weighted, stored on transaction record
- Ledger entry: created immediately on successful redemption
- Push notification: sent to member on redemption
- Duplicate prevention: voucher status immutable (second entry rejects)
- Network handling: timeout after 5 sec, allow retry
- Manual entry: no QR scan in v1 (deferred)
- Audit trail: every redemption attempt (success + failure) logged with timestamp + SP staff ID
- Settlement: ledger entries included in next settlement cycle (Flow 12)

