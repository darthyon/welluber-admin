# Flow 8 — Member: Online Voucher Purchase (Scenario A) — April 2026

**Who:** Member (Employee)  
**Platform:** Member App (React Native)  
**From:** Marketplace detail screen  
**To:** Active voucher issued, TOTP code in wallet, redemption countdown started  
**Entry condition:** Member has active corporate identity, benefit wallet unlocked, browsing marketplace.  
**Failure exits:** Benefit not activated, benefit pool exhausted, org wallet insufficient, payment failed, duplicate voucher exists.

---

## Happy Path

**1. Member:** Browses marketplace [NAVIGATE]  
   — Sees vouchers filtered by category / location / price  
   — All prices shown as Gross (SST-inclusive)

**2. Member:** Selects a voucher  
   — Taps voucher card → detail screen  
   — Shows: Final price (Gross), included services, redemption period, co-pay amount (if applicable), SP name & location

**3. Member:** Taps "Purchase" [NAVIGATE]  
   — Initiates checkout flow

**4. System:** Pre-transaction validation (three checks, all must pass) [VALIDATE] [API]

   **Check 1 — Benefit Activation:**
   - Queries: is member's benefit assignment active per activation_mode?  
   - activation_mode = "After Join Date": check if today >= join_date  
   - activation_mode = "After Probation Ends": check if today >= probation_end_date  
   - activation_mode = "Custom Date" (KIV): check if today >= custom_date

   **IF Not Active:**
   - Return error code: BENEFIT_NOT_ACTIVATED  
   - Show to member: "Your benefits haven't started yet. Check with HR."  
   - Exit checkout

   **Check 2 — Benefit Pool:**
   - Queries: does member have remaining balance for this service?  
   - Looks up: service_id → benefit_group → benefit_amount  
   - Checks: current_balance >= covered_amount (voucher_price - co_payment)

   **IF Exhausted:**
   - Return error code: BENEFIT_POOL_EXHAUSTED  
   - Show to member: "No remaining balance for this service."  
   - Exit checkout

   **Check 3 — Org Wallet:**
   - Queries: organization's branch wallet balance  
   - Checks: wallet_balance >= member_policy_entitlement (not just this voucher, but employee's full policy)  
   - Blocking rule: wallet must be >= entitlement, even if only using part of it

   **IF Insufficient:**
   - Return error code: ORG_WALLET_INSUFFICIENT  
   - Show to member: "Insufficient company funds. Contact HR."  
   - Exit checkout

**5. System:** All validations passed → proceed to step 6

**6. System:** Creates Pending voucher & reserves balance [API] [PERSIST]  
   — Voucher created with status = Pending  
   — Reserve: deduct from member's benefit pool + org wallet (tentative hold, not final)  
   — 3-hour cancellation window starts (cron timer)  
   — Logs action: "Created Pending voucher [ID] for member [ID], service [ID]"

**7. Member:** Proceeds to payment screen [NAVIGATE]  
   — Shows: Final price, co-payment amount (if applicable), payment method  
   — CTA: "Pay Now" (if co-payment required) or "Confirm" (if no co-payment)

**8. IF Co-payment Required:**
   - System: Show co-payment amount  
   - Member: Taps "Pay via Welluber Gateway"  
   - Redirects to Welluber Payment Gateway (external partner: Billplz, iPay88, Stripe, etc.)

**9. Member:** Completes payment [EXTERNAL]  
   — Enters payment method (card / e-wallet / FPX / etc.)  
   — Authenticates (3D Secure if required)  
   — Completes transaction

**10. Payment Gateway:** Returns result to Welluber  
   — Webhook callback or polling  
   — Status: SUCCESS or FAILED  
   — Transaction ID, timestamp

**11a. IF Payment SUCCESS:**

**11a-1. System:** Confirms voucher and deducts final amounts [API] [PERSIST]  
   — Voucher status: Pending → Active  
   — Final deductions (confirmed):  
   — Deduct covered_amount from member's benefit pool  
   — Deduct covered_amount from org wallet balance  
   — Log: "Payment confirmed for voucher [ID], covered_amount RM [X]"

**11a-2. System:** IF SP is_tax_registered = TRUE:  
   — De-calculates SST from Gross  
   — net_amount = final_price / 1.08  
   — sst_component = final_price - net_amount  
   — Stores both immutably on transaction record (audit trail)  
   — Used for HR tax invoicing + settlement

**11a-3. System:** Generates voucher code (TOTP) [GENERATE]  
   — Time-based One-Time Password  
   — Refreshes every 30 seconds  
   — Valid for voucher's redemption_period  
   — Shown to member in app

**11a-4. System:** Routes to Active voucher screen [NAVIGATE]  
   — Displays: TOTP code (refreshing), SP name, service, redemption period countdown, CTA: "Show to SP"

**11a-5. Member:** Sees Active voucher with TOTP code  
   — Can copy code, take screenshot, or show code directly from app to SP  
   — Countdown timer shows time until expiry  
   — CTA: "Show to SP" (opens full-screen code display)

**11a-6. System:** Sends push notification [NOTIFY]  
   — "Your voucher is ready! Show the code to [SP Name]."

**11a-7. EXIT:** Purchase complete, voucher active

---

**11b. IF Payment FAILED:**

**11b-1. System:** Rolls back Pending voucher [API] [PERSIST]  
   — Voucher status: Pending → Cancelled  
   — Reserved balance released  
   — Logs action: "Payment failed for voucher [ID], rolled back"

**11b-2. System:** Shows error to member [NAVIGATE]  
   — Error message: "Payment failed. Please try again or contact support."  
   — CTA: "Retry Payment" or "Cancel"

**11b-3. Member:** Taps "Retry Payment"  
   — Redirects back to payment gateway (step 9)  
   — Same voucher ID (retry same transaction)

**11b-4. Member:** Taps "Cancel"  
   — Voucher cancelled  
   — Balance fully released  
   — Returns to marketplace

---

## IF No Co-Payment Required:

**Steps 8–9 skipped. Instead:**

**8-Alt. System:** Creates Active voucher directly (no payment gate) [API] [PERSIST]  
   — Voucher status: Pending → Active immediately  
   — Deduct covered_amount from member's benefit pool + org wallet (confirmed)  
   — SST de-calc if applicable  
   — Generate TOTP code

**9-Alt. System:** Routes to Active voucher screen [NAVIGATE]  
   — **Exit:** Purchase complete

---

## Voucher State Machine

```
Pending (unpaid)
  ↓
  [Payment Gateway result]
  ├→ Payment Success: Pending → Active (deductions confirmed)
  └→ Payment Failed: Pending → Cancelled (deductions rolled back)

Active
  ↓
  [Redemption Paths]
  ├→ Member presents code to SP → SP scans code in SP Portal
  │  ├→ SP confirms → Active → Presented → Redeemed
  │  │  (commission calculated, ledger entry created)
  │  └→ SP cancels or error → remains Active
  │
  └→ [3-hour cancellation window expired (Pending only)]
     If still Pending: Pending → Cancelled (3-hour cron)

Active
  ↓
  [Redemption period expires (cron runs)]
  └→ Active → Expired
     (payout split triggered: % Org refund + % SP ledger + % Welluber)

Any state → [Manual member cancellation, if allowed]
  └→ → Cancelled (with or without refund, TBD in policy)
```

---

## Edge Cases

**1. Benefit Activation Pending (Probation Period)**

**Scenario:** Employee assigned policy with activation_mode = "After Probation Ends", probation ends in 3 days

**Flow:**
- Member tries to purchase: BENEFIT_NOT_ACTIVATED error  
- Show: "Your benefits activate on [date]"  
- Offer: Calendar reminder or notification when date arrives

---

**2. Duplicate Voucher Check**

**Scenario:** Member has an Active voucher for the same service (collision check needed for walk-in, but also prevent online dupes)

**Flow:**
- System checks: does member already have Active voucher for this service?  
- **Note:** PRD mentions collision check for walk-in only, but may apply to online too  
- If yes: warning "You already have an active voucher for this service. Present it to the SP instead."  
- Member can: confirm they want both, or cancel

---

**3. Co-Payment Exceeds Benefit Amount**

**Scenario:** Voucher price RM 500, benefit_amount RM 300, co-payment required = RM 200

**Flow:**
- System calculates: co_payment = voucher_price - benefit_amount = RM 200  
- Covered by benefit: RM 300  
- Member pays: RM 200  
- Display to member: "Company covers RM 300, you pay RM 200"

---

**4. Co-Payment Zero (Full Benefit Coverage)**

**Scenario:** Voucher price RM 200, benefit_amount RM 200

**Flow:**
- System calculates: co_payment = 0  
- Member sees: "Fully covered by your company"  
- Payment step skipped  
- Voucher created Active immediately

---

**5. Multiple Benefit Groups, Service in One Group Only**

**Scenario:** Member has:
- Group A (Fitness): RM 2000, services: Gym, Fitness Classes
- Group B (Mental Health): RM 1000, services: Therapy

**Member purchases:** Gym voucher for RM 500

**Flow:**
- System identifies: Gym belongs to Group A  
- Deducts from Group A only: remaining = RM 1500  
- Group B unaffected: still RM 1000  
- Display shows both groups with updated balances

---

**6. Voucher Expires During Purchase Flow**

**Scenario:** Member sees voucher, starts checkout, but during payment (10 min later), voucher activation_period ends

**Flow:**
- System checks: is voucher still Activated (in its activation_period)?  
- If not: show error "This voucher is no longer available. Try another."  
- Refund co-payment if already paid  
- Release reserved balance

---

**7. Org Wallet Depleted During Multi-Step Checkout**

**Scenario:** Member validates (org wallet has RM 5000), proceeds to payment, but concurrent claim from another employee depletes wallet to RM 2000. Member's benefit entitlement is RM 3000.

**Flow:**
- Member completes payment  
- System re-checks org wallet balance at final deduction  
- Wallet insufficient: error "Company wallet depleted. Contact HR."  
- Roll back: voucher cancelled, co-payment refunded

---

**8. Member Has Multiple Corporate Identities**

**Scenario:** Member employed at Company X and Company Y simultaneously

**Flow:**
- Member switches corporate identity in app  
- Each identity shows separate benefit wallet  
- Purchase always uses currently-selected identity  
- Deductions apply to that identity's org only

---

## Failure Exits

### Failure: Benefit Not Activated

**User sees:** BENEFIT_NOT_ACTIVATED  
**Message:** "Your benefits haven't started yet. Check with HR."

**User can:**
- Contact HR to confirm activation date
- Set a reminder in calendar

---

### Failure: Benefit Pool Exhausted

**User sees:** BENEFIT_POOL_EXHAUSTED  
**Message:** "No remaining balance for this service."

**User can:**
- View other services with remaining balance
- Contact HR for policy refresh or adjustment
- Wait for next refresh cycle

---

### Failure: Org Wallet Insufficient

**User sees:** ORG_WALLET_INSUFFICIENT  
**Message:** "Insufficient company funds. Contact HR to top up the wallet."

**User can:**
- Contact HR to request wallet funding
- Wait for HR to fund wallet
- Try purchasing a different (lower-priced) voucher

---

### Failure: Payment Failed

**User sees:** "Payment failed. Please try again."

**User can:**
- Retry with same payment method
- Use different payment method
- Contact payment support if issue persists
- Cancel and try later

---

## Handoff to Claude Code

**Screens needed:**
- Voucher detail screen (price, services, redemption period, co-pay, SP info, "Purchase" CTA)
- Checkout screen (final price, co-payment breakdown, "Pay Now" CTA)
- Payment gateway redirect (external, but ensure return handling)
- Active voucher screen (TOTP code display, refreshing every 30s, countdown timer, "Show to SP" full-screen mode)
- Error states (BENEFIT_NOT_ACTIVATED, BENEFIT_POOL_EXHAUSTED, ORG_WALLET_INSUFFICIENT, PAYMENT_FAILED)

**Key implementation notes:**
- Three-point pre-transaction validation (activation + pool + wallet)
- Pending voucher holds balance for 3 hours (cron cancels if unpaid)
- TOTP code generation (time-based, 30-second refresh)
- SST de-calculation stored immutably on transaction record
- Payment gateway integration (webhook or polling for result)
- Rollback on payment failure (voucher cancelled, balance released)
- All state transitions logged to audit trail
- Push notifications on voucher activation
- Concurrent access control (wallet balance re-checked at final deduction)

