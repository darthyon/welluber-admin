# User Flow Registry

All flows documented in `.docs_technical/flows/`. Each flow follows a standard structure: overview, Mermaid diagram, numbered steps, business rules, error states, and data written/read.

---

## Setup Flows (Host Admin Only)

| Flow | File | Actors | Status |
|------|------|--------|--------|
| 0 — Platform Configuration | [FLOW_00_PLATFORM_CONFIG.md](FLOW_00_PLATFORM_CONFIG.md) | Host Admin | ✅ |
| 1 — Account Management | [FLOW_01_ACCOUNT_MANAGEMENT.md](FLOW_01_ACCOUNT_MANAGEMENT.md) | Host Admin, Org Admin | ✅ |
| 2 — Organization Setup | [FLOW_02_ORG_SETUP.md](FLOW_02_ORG_SETUP.md) | Host Admin → Org Admin | ✅ |
| 3 — Service Provider Setup | [FLOW_03_SP_SETUP.md](FLOW_03_SP_SETUP.md) | Host Admin → SP Admin | ✅ |
| 4 — Policy Management | [FLOW_04_POLICY_MANAGEMENT.md](FLOW_04_POLICY_MANAGEMENT.md) | Host Admin | ✅ |

## Core Transaction Flows

| Flow | File | Actors | Status |
|------|------|--------|--------|
| 5 — Member Activation | [FLOW_05_MEMBER_ACTIVATION.md](FLOW_05_MEMBER_ACTIVATION.md) | Member, Org Admin | ✅ |
| 6 — Employee Management | [FLOW_06_EMPLOYEE_MANAGEMENT.md](FLOW_06_EMPLOYEE_MANAGEMENT.md) | Org Admin | ✅ |
| 7 — SP Voucher Creation | [FLOW_07_SP_VOUCHER.md](FLOW_07_SP_VOUCHER.md) | SP Admin | ✅ |
| 8 — Online Purchase | [FLOW_08_ONLINE_PURCHASE.md](FLOW_08_ONLINE_PURCHASE.md) | Member | ✅ |
| 9 — Voucher Redemption | [FLOW_09_VOUCHER_REDEMPTION.md](FLOW_09_VOUCHER_REDEMPTION.md) | Member, SP Staff | ✅ |
| 10 — Walk-in Claim | [FLOW_10_WALK_IN_CLAIM.md](FLOW_10_WALK_IN_CLAIM.md) | SP Staff, Member | ✅ |

## Settlement & Finance

| Flow | File | Actors | Status |
|------|------|--------|--------|
| 12 — Settlement & Payout | [FLOW_12_SETTLEMENT_PAYOUT.md](FLOW_12_SETTLEMENT_PAYOUT.md) | Host Admin, SP Admin | ✅ |

---

## Actor Summary

| Actor | Platform | Flows Involved |
|-------|----------|----------------|
| **Host Admin** | Host Portal | 0, 1, 2, 3, 4, 12 |
| **Org Admin / HR** | Org Portal | 2 (activation), 6 |
| **SP Admin** | SP Portal | 3 (activation), 7, 12 (approval) |
| **SP Staff** | SP Portal | 9, 10 |
| **Member** | Member App | 5, 8, 9 |

---

## Key Design Decisions (v1)

| Decision | Detail |
|----------|--------|
| No approval workflows | Host creates orgs/SPs directly (no pending/review states for setup) |
| Two-inbox security | Personal email creates account; corporate email verifies employment (magic link) |
| Three-point validation | Voucher purchase requires: benefit active + pool balance ok + org wallet ok |
| Immutable ledger | SST, commission rates, tax profiles stored at transaction creation time |
| Weighted commission | Per-SP, per-service, weighted across multi-service vouchers |
| Co-payment routing | Online → Welluber gateway; Walk-in → SP collects directly |
| Magic links | 60-min expiry, single-use, universal link routing |
| TOTP codes | 30-second refresh, valid for entire redemption period |
| Settlement phases | `pending_aggregation → sp_approved → paid` (immutable) |
| 7-year retention | Tax docs, ledger entries, settlement records (RMCD compliance) |
| MYR only | No multi-currency in v1 |

---

## Missing / Deferred Flows

| Flow | Reason |
|------|--------|
| 11 — HR Wallet Top-Up | Covered within Flow 1 and Flow 6 |
| 13 — Pool Refresh (Automated) | Backend cron job; covered within Flow 6 description |
| 14 — Utilization Dashboard | Org Portal feature — not yet built in designer repo |
| 15 — Employee Offboarding | Simple deactivate operation — covered within Flow 6 |
| 16 — Dependent Linking | Deferred to v2 |
