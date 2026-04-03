# Persona: Host Admin — Welluber HQ

> **Portal:** `(host)` route group — `/dashboard`, `/organizations`, `/providers`, etc.
> **Role:** Platform super-admin. Full system access ("God Mode").
> **Source:** PRD §5.1 (SYS-HST-01 through SYS-HST-12)

---

## Capability Matrix

| Capability | Requirement ID | Epic | Flow | Route |
|---|---|---|---|---|
| Dashboard — platform KPIs, tx feed, settlement status | — | — | — | `/dashboard` |
| Service Taxonomy CRUD (3-level) | SYS-HST-01 | EPIC 01 | Flow 00 | `/settings/taxonomy` |
| Policy Management (create/edit/clone/deactivate) | SYS-HST-02 | EPIC 04 | Flow 00 | `/policies` |
| Policy → Org assignment | SYS-HST-03 | EPIC 04 | Flow 00 | `/policies/[id]/assign` |
| Commission Schema per SP (rate table by category) | SYS-HST-04 | EPIC 03 | Flow 00, Flow 03 | `/providers/[id]/commission` |
| Org/SP tenant CRUD + approval | SYS-HST-05 | EPIC 02, 03 | Flow 02, Flow 03 | `/organizations`, `/providers` |
| SP tax profile management | SYS-HST-06 | EPIC 03 | Flow 03 | `/providers/[id]` |
| Platform financials — GMV, commissions, payouts | SYS-HST-07 | — | — | `/dashboard` |
| Settlement reports + payout trigger | SYS-HST-08 | EPIC 11 | Flow 12 | `/settlements` |
| Expired voucher payout split config | SYS-HST-09 | EPIC 01 | Flow 00 | `/settings/expired-voucher` |
| Global cron settings (cancellation window, etc.) | SYS-HST-10 | EPIC 01 | Flow 00 | `/settings/cron` |
| Tax compliance dashboard | SYS-HST-11 | EPIC 12 | — | `/settings/tax` |
| God-mode: read/edit any Org or SP portal | SYS-HST-12 | — | — | `/organizations/[id]`, `/providers/[id]` |

---

## Screens (from Screen Inventory)

See: [SCREEN_INVENTORY_HOST_PORTAL.md](flows/SCREEN_INVENTORY_HOST_PORTAL.md)

| Area | Screen IDs |
|---|---|
| Dashboard | SCR-DASH-01, SCR-DASH-02, SCR-DASH-03 |
| Organization Management | SCR-ORG-01 through SCR-ORG-06 |
| Service Provider Management | SCR-SP-01 through SCR-SP-08 |
| Settlement & Payouts | SCR-SET-01 through SCR-SET-04 |
| Platform Configuration | SCR-CFG-01 through SCR-CFG-06 |
| Admin Auth & Settings | SCR-AUTH-01 through SCR-AUTH-04 |

---

## Feature Scaffolding Order

The Host persona is built first because it is treated as the superset. Org and SP portals are scoped-down subsets.

1. **Dashboard** — platform overview (SCR-DASH-01–03)
2. **Organizations** — CRUD + onboarding wizard (Flow 02, SCR-ORG-01–06)
3. **Service Providers** — CRUD + commission + tax (Flow 03, SCR-SP-01–08)
4. **Policies** — create/clone/assign wizard (Flow 00, SYS-HST-02–03)
5. **Settings** — taxonomy, cron, expired voucher split, tax (Flow 00, SCR-CFG-01–06)
6. **Settlements** — ledger, payout trigger (Flow 12, SCR-SET-01–04)
7. **Auth & Team** — login, 2FA, team management (SCR-AUTH-01–04)

---

## Design Notes for Agents

- Host has access to **every feature** listed across all portals. When building Org or SP portals later, you are removing capabilities from the Host baseline, not adding new ones.
- Navigation: persistent sidebar (left, 256px) with sections: MANAGEMENT, BENEFITS, SYSTEM.
- All Host actions are audited. Every write operation logs: who, what, when, why.
- No approval workflows in v1 — Host creates directly. No pending states.
- Currency: `RM` with thousand separators. No cents for whole amounts.
- Timestamps: display in user's local timezone, store as UTC.
