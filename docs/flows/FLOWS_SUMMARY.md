# Welluber Core Flows — Complete Summary

**Generated:** April 2026 | **Status:** All core flows complete

---

## Flows by Category

### **SETUP FLOWS (Host Admin Only)**

| Flow | Title | Platform | Status |
|------|-------|----------|--------|
| 1 | Platform Configuration | Host Portal | ✅ Taxonomy + Cron + Expired Split |
| 2 | Organization Setup & Triage | Host Portal → Org Portal | ✅ **Tactical Dashboard** (Status, Needs Action, Service Category) |
| 3 | Service Provider Setup | Host Portal → SP Portal | ✅ SP account + commission + tax profile |
| 4 | Policy Management | Host Portal | ✅ Create/edit/clone/assign policies (merged with Flow 1) |

### **CORE TRANSACTION FLOWS (Runtime)**

| Flow | Title | Platform | Status |
|------|-------|----------|--------|
| 5 | Member Account Activation | Member App | ✅ Two-inbox security, corporate identity linking |
| 6 | Employee & Benefit Management | Org Portal | ✅ CSV upload, policy assignment, wallet top-up, pool refresh |
| 7 | SP Voucher Creation & Lifecycle | SP Portal | ✅ Weighted service lines, activation/redemption periods |
| 8 | Member Online Voucher Purchase | Member App | ✅ Three-point validation, payment routing, TOTP issuance |
| 9 | SP Voucher Redemption | Member App + SP Portal | ✅ Code entry, state transitions, commission calculation |
| 10 | SP Walk-in Claim | SP Portal | ✅ Member lookup (QR/ID/name), collision check, auto-deduct |

### **SETTLEMENT & FINANCE**

| Flow | Title | Platform | Status |
|------|-------|----------|--------|
| 11 | HR Wallet Top-Up | Org Portal | ⏳ Deferred (covered in Flow 6) |
| 12 | Settlement & Payout | Host Portal + SP Portal | ✅ Aggregation, calculation, SP approval, payout trigger |

### **OPERATIONAL FLOWS (Background/Periodic)**

| Flow | Title | Platform | Status |
|------|-------|----------|--------|
| 13 | Policy Engine: Pool Refresh | Org Portal (manual) + Backend (cron) | ⏳ Deferred (covered in Flow 6) |
| 14 | HR Utilization Dashboard (Triage) | Org Portal | ✅ **Workforce Health Dashboard** with Ring Charts |
| 15 | HR Employee Offboarding | Org Portal | ⏳ Deferred (simple deactivate operation) |
| 16 | Member Dependent Linking | Member App | ⏳ Deferred (v2 feature) |

---

## File Locations

**Flow files (in docs/flows/):**

```
FLOW_00_HOST_ADMIN_CONFIGURATION.md   (Flow 1 + 4: Taxonomy, Policy, Commission, Cron)
FLOW_02_ORG_SETUP.md                  (Flow 2: Organization onboarding, Host ↔ Org Admin)
FLOW_03_SP_SETUP.md                   (Flow 3: Service Provider account, commission, tax)
FLOW_05_MEMBER_ACTIVATION.md          (Flow 5: Account creation, corporate identity linking)
FLOW_06_EMPLOYEE_MANAGEMENT.md        (Flow 6: CSV upload, policy assignment, wallet, pool refresh)
FLOW_07_SP_VOUCHER_CREATION.md        (Flow 7: Voucher creation, service lines, lifecycle)
FLOW_08_ONLINE_PURCHASE.md            (Flow 8: Member checkout, validation, payment, TOTP)
FLOW_09_VOUCHER_REDEMPTION.md         (Flow 9: Code entry, SP redemption, commission calc)
FLOW_10_WALK_IN_CLAIM.md              (Flow 10: Member lookup, collision check, auto-deduct)
FLOW_12_SETTLEMENT_PAYOUT.md          (Flow 12: Settlement aggregation, SP approval, payout)
```

---

## Key Design Decisions (v1)

✅ **No approval workflows:** Host creates orgs/SPs directly (no pending/review states)  
✅ **Two-inbox security:** Personal email creates account, corporate email verifies employment  
✅ **Three-point validation:** Benefit activation + pool + org wallet (all must pass)  
✅ **Immutable ledger:** SST de-calculation, commission rates, tax profiles stored at transaction time  
✅ **Weighted commission:** Per-SP, per-service-category, weighted across multi-service vouchers  
✅ **Co-payment routing:** Online → Welluber gateway; Walk-in → SP collects directly  
✅ **Magic links:** 60-min expiry, universal link routing (app-direct, no browser)  
✅ **TOTP codes:** 30-second refresh, valid for redemption period  
✅ **Settlement phases:** Host aggregates → SP approves → Host triggers payout  
✅ **Async payouts:** External payment processor integration with webhook confirmation  
✅ **7-year retention:** Tax documents, ledger entries, settlement records (RMCD compliance)

---

## Actor Summary

| Actor | Platforms | Key Flows |
|-------|-----------|-----------|
| **Host Admin** | Host Portal | Flow 1–4, 12 (setup, config, settlement trigger) |
| **Org Admin** | Org Portal | Flow 2 (activation), 6 (employee mgmt, wallet) |
| **SP Admin** | SP Portal | Flow 3 (activation), 7 (voucher creation), 9 (redemption review), 12 (approve settlement) |
| **HR/Finance** | Org Portal | Flow 6 (CSV, policies, wallet top-up), Flow 14 (reporting) |
| **SP Staff** | SP Portal | Flow 10 (walk-in member lookup), Flow 9 (redemption code entry) |
| **Member** | Member App | Flow 5 (account activation), 8 (purchase), 9 (present code) |

---

## MVP Build Sequence (Recommended)

1. **Setup (Host Admin):** Flow 1 (Taxonomy, Policy, Commission) + Flow 2 (Org) + Flow 3 (SP)
2. **Member Onboarding:** Flow 5 (Account activation)
3. **Core Transactions:** Flow 8 (Purchase) → Flow 9 (Redemption) | Flow 10 (Walk-in)
4. **Settlement:** Flow 12 (Payout)
5. **Org Admin Workflows:** Flow 6 (Employee mgmt, wallet top-up)
6. **SP Workflows:** Flow 7 (Voucher creation, lifecycle)
7. **Phase 2 (Deferred):** Flow 13 (Pool refresh automation), Flow 14 (Reporting), Flow 15 (Offboarding), Flow 16 (Dependents)

---

## Open Questions (For Clarification)

| Question | Impact | Status |
|----------|--------|--------|
| Payment gateway provider (Billplz/iPay88/Stripe/FPX)? | Flow 6, 8 | TBD |
| SP T&C: self-serve or Host-reviewed? | Flow 3 | TBD |
| SP package approval: required or auto-publish? | Flow 7 | TBD (v1: auto-publish) |
| Per-SP expired voucher split override allowed? | Flow 1, 12 | TBD (v1: global only) |
| Host team roles: Super Admin / Approver / Viewer? | Flow 1–12 | Simplified to Super Admin only (v1) |
| Settlement cycle: weekly/monthly/on-demand? | Flow 12 | Monthly (default, on-demand supported) |
| Member account type: public browsing? | Flow 5 | TBD (v1: corporate ID required for checkout) |

---

## Technical Notes

**Magic Links:**
- 60-minute expiry (strict)
- Single-use (token invalidated after successful verification or expiry)
- Universal link routing (`welluber://verify-identity/[token]`)
- No browser fallback for binding (browser shows redirect message only)

**TOTP Codes:**
- 30-second refresh (standard authenticator format)
- Valid through entire redemption period
- No replay prevention (code re-entry blocked by voucher status, not code itself)

**SST De-calculation:**
- Calculated at transaction creation time (not at settlement)
- Stored immutably on transaction record (7-year retention)
- Applied uniformly if SP is_tax_registered = TRUE
- No per-service tax override (v1 simplification)

**Commission Calculation:**
- Formula: `SUM(final_price × weight × category_commission_rate)` per service line
- Applied to redeemed vouchers (ledger entry created immediately)
- Applied to expired vouchers (via split % per Host config)
- Immutable after transaction (audit trail tracks inputs at creation)

**Settlement Cycle:**
- Default: Monthly (automated at fixed time)
- On-Demand: Host can trigger anytime
- Scheduled: Host can schedule future payout
- Status flow: pending_aggregation → sp_approved → paid (immutable)

**Wallet Blocking Rule:**
- Member can't checkout if `org_wallet_balance < member_policy_entitlement`
- Checked at purchase validation time (Flow 8, Check 3)
- Prevents overspending beyond wallet capacity
- Employee entitlement = employee's assigned policy benefit amounts (summed)

---

## Audit Trail & Logging

All flows include immutable audit logs:
- **Who:** User email + role
- **What:** Specific action (create, edit, delete, approve, pay, redeem)
- **When:** Timestamp (UTC)
- **Why:** Transaction/settlement ID (linked back to original record)
- **Result:** Success / Failure + error details

7-year retention for:
- Tax documents (SST compliance)
- Settlement records
- Ledger entries (all transactions)
- Audit trail (access + changes)

---

**Status:** All 10 core flows documented, no Mermaid diagrams (text-based only, as requested).

