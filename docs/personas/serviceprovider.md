# Persona: Service Provider — SP Portal

> **Portal:** `(serviceprovider)` route group — `/[spSlug]/dashboard`, etc.
> **Role:** SP admin/staff. Scoped to own provider's data only.
> **Source:** PRD §5.3 (SYS-SP-01 through SYS-SP-06)

---

## Capability Matrix

| Capability | Requirement ID | Epic | Flow | Route (planned) |
|---|---|---|---|---|
| Dashboard — voucher stats, daily claims, settlement status | — | — | — | `/[spSlug]/dashboard` |
| Branch management — CRUD, hours, facilities | SYS-SP-01 | EPIC 03 | Flow 03 | `/[spSlug]/branches` |
| Voucher catalog — create, publish, pause, end | SYS-SP-02 | EPIC 07 | Flow 07 | `/[spSlug]/vouchers` |
| Walk-in claim — member lookup, collision check, auto-deduct | SYS-SP-03 | EPIC 09 | Flow 10 | `/[spSlug]/claims` |
| Voucher redemption — code entry, validate, confirm | SYS-SP-04 | EPIC 10 | Flow 09 | `/[spSlug]/redemptions` |
| Settlement review — approve statement, view payouts | SYS-SP-05 | EPIC 11 | Flow 12 | `/[spSlug]/settlements` |
| Staff management — add/remove staff, assign roles | SYS-SP-06 | — | — | `/[spSlug]/team` |

---

## What SP CANNOT Do

- ❌ View or manage other SPs' data
- ❌ Edit commission rates (Host-configured)
- ❌ Edit tax profile (Host-managed; SP confirms only)
- ❌ Trigger settlement payouts (Host-triggered)
- ❌ View Org data or employee PII beyond member lookup
- ❌ Access policy management

---

## Sub-Roles

| Role | Capabilities |
|---|---|
| **SP Branch Manager** | Voucher creation, operating hours, branch claims view, staff management |
| **Sales Agent** | Market vouchers, own sales performance. No dedicated MVP flows. |
| **SP Staff** | Member lookup, voucher code entry, claim submission, daily transaction history |

---

## Phase 2 Development

SP portal is built **after** Host and Org portals. Architecture approach:
- Reuse shared components
- Walk-in claim (Flow 10) and Voucher redemption (Flow 09) are core flows — high interaction frequency, must be fast
- Voucher creation uses weighted service lines — complex form with real-time weight validation (sum to 1.0)
- Settlement: SP reviews + one-tap approves Host-generated statement

---

## Design Notes for Agents

- SP staff processes walk-in claims in **3 taps**: lookup → confirm → submit. Speed is critical.
- Member lookup priority: QR scan → Employee ID → Name search.
- Voucher creation: SP sets final_price + weights per service line. Not per-service pricing.
- Walk-in collision check: if active voucher exists for same Main Service, block walk-in and prompt SP.
- Co-pay on walk-in: SP collects directly from member. Platform only tracks covered portion.
- All prices are SST-inclusive (Gross). De-calculation happens in backend.
