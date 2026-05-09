# WellUber — Technical Documentation Hub

> **Audience:** Engineers building the production frontend and backend repos.
> **This repo:** `welluber-admin` is a designer benchmark — a fully-functional UI reference built with AI tools. Do not ship it as production. Use it as the design source of truth.
> **Goal:** Everything you need to know to start a new frontend and backend from scratch lives here.

---

## How to Read This Hub

```
1. Architecture → understand the system shape
2. ERD          → understand the data model
3. Flows        → understand what each user does and why
4. Pages        → know every screen that needs to be built
5. Components   → reuse the design system patterns
6. API          → draft the backend interface
```

---

## Table of Contents

### Architecture
| Document | Description | Status |
|----------|-------------|--------|
| [architecture/OVERVIEW.md](architecture/OVERVIEW.md) | System map: portals, member app, backend | ✅ |
| [architecture/MULTI_TENANCY.md](architecture/MULTI_TENANCY.md) | Firebase multi-tenant auth, token structure, role claims | ✅ |
| [architecture/MONOREPO.md](architecture/MONOREPO.md) | Planned monorepo structure, package boundaries, Firestore paths | ✅ |

### Data Model
| Document | Description | Status |
|----------|-------------|--------|
| [erd/ERD.md](erd/ERD.md) | Full entity relationship diagram (Mermaid erDiagram) | ✅ |
| [erd/ENTITY_REFERENCE.md](erd/ENTITY_REFERENCE.md) | Per-entity field tables with types and descriptions | ✅ |

### User Flows
| Document | Description | Status |
|----------|-------------|--------|
| [flows/INDEX.md](flows/INDEX.md) | Flow registry: all flows, actors, status | ✅ |
| [flows/FLOW_00_PLATFORM_CONFIG.md](flows/FLOW_00_PLATFORM_CONFIG.md) | Taxonomy, service catalog, platform settings | ✅ |
| [flows/FLOW_01_ACCOUNT_MANAGEMENT.md](flows/FLOW_01_ACCOUNT_MANAGEMENT.md) | HR wallet top-up, credit limits, account model | ✅ |
| [flows/FLOW_02_ORG_SETUP.md](flows/FLOW_02_ORG_SETUP.md) | Org onboarding: host creates org + branch + admin invite | ✅ |
| [flows/FLOW_03_SP_SETUP.md](flows/FLOW_03_SP_SETUP.md) | SP onboarding: registration, commission, tax, branch | ✅ |
| [flows/FLOW_04_POLICY_MANAGEMENT.md](flows/FLOW_04_POLICY_MANAGEMENT.md) | Policy lifecycle: create → groups → benefits → assign | ✅ |
| [flows/FLOW_05_MEMBER_ACTIVATION.md](flows/FLOW_05_MEMBER_ACTIVATION.md) | Two-inbox auth: personal account + corporate identity link | ✅ |
| [flows/FLOW_06_EMPLOYEE_MANAGEMENT.md](flows/FLOW_06_EMPLOYEE_MANAGEMENT.md) | CSV upload, policy assignment, eligibility, offboarding | ✅ |
| [flows/FLOW_07_SP_VOUCHER.md](flows/FLOW_07_SP_VOUCHER.md) | Voucher creation, service lines, lifecycle states | ✅ |
| [flows/FLOW_08_ONLINE_PURCHASE.md](flows/FLOW_08_ONLINE_PURCHASE.md) | Three-point validation, payment gateway, TOTP issuance | ✅ |
| [flows/FLOW_09_VOUCHER_REDEMPTION.md](flows/FLOW_09_VOUCHER_REDEMPTION.md) | Code entry, SP confirmation, commission calculation | ✅ |
| [flows/FLOW_10_WALK_IN_CLAIM.md](flows/FLOW_10_WALK_IN_CLAIM.md) | Member lookup (QR/ID), collision check, wallet deduct | ✅ |
| [flows/FLOW_12_SETTLEMENT_PAYOUT.md](flows/FLOW_12_SETTLEMENT_PAYOUT.md) | Aggregation, SP approval, payout trigger, ledger | ✅ |

### UI Reference
| Document | Description | Status |
|----------|-------------|--------|
| [pages/PAGE_INVENTORY.md](pages/PAGE_INVENTORY.md) | All routes: path, persona, purpose, key components | ✅ |
| [components/COMPONENT_INVENTORY.md](components/COMPONENT_INVENTORY.md) | All UI components: path, props, usage | ✅ |

### API
| Document | Description | Status |
|----------|-------------|--------|
| [api/API_SPEC.md](api/API_SPEC.md) | REST endpoint spec (draft, inferred from server actions) | 🚧 |

### Maintenance
| Document | Description | Status |
|----------|-------------|--------|
| [SYNC_STATUS.md](SYNC_STATUS.md) | Tracks what's documented vs. new designer additions | ✅ |

---

## Key Context

- **Currency:** MYR only (MVP)
- **Auth:** Firebase multi-tenant (planned) — currently stub session in `lib/session.ts`
- **Database:** Firestore (planned) — currently mock data in `lib/mock-data/`
- **Member App:** React Native — separate repo, not in this codebase
- **Portals:** Host, Org, SP — currently all in one Next.js app, will split in monorepo

---

## Sync Note

This is a **living document hub**. The designer continues to add screens and features to `welluber-admin`. Before starting new documentation work, always check [SYNC_STATUS.md](SYNC_STATUS.md) to see what's changed since the last sync.
