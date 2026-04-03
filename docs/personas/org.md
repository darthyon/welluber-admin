# Persona: Org Admin (HR) — Organization Portal

> **Portal:** `(org)` route group — `/[orgSlug]/dashboard`, etc.
> **Role:** Organization HR admin. Scoped to own org's data only.
> **Source:** PRD §5.2 (SYS-ORG-01 through SYS-ORG-06)

---

## Capability Matrix

| Capability | Requirement ID | Epic | Flow | Route (planned) |
|---|---|---|---|---|
| Dashboard — org wallet, utilization, active employees | — | — | Flow 06 | `/[orgSlug]/dashboard` |
| Corporate profile + branches + PICs | SYS-ORG-01 | EPIC 02 | Flow 02 | `/[orgSlug]/profile` |
| Employee bulk upload (CSV/Excel) | SYS-ORG-02 | EPIC 06 | Flow 06 | `/[orgSlug]/employees` |
| Policy assignment wizard (3-step stepper) | SYS-ORG-03 | EPIC 06 | Flow 06 | `/[orgSlug]/policies` |
| Utilization dashboard — spend, balance, benefit groups | SYS-ORG-04 | EPIC 06 | Flow 06 | `/[orgSlug]/utilization` |
| Branch wallet — top-up, balance, pending deductions | SYS-ORG-05 | EPIC 06 | Flow 06 | `/[orgSlug]/wallet` |
| Employee offboarding | SYS-ORG-06 | — | Flow 15 (deferred) | `/[orgSlug]/employees/[id]` |

---

## What Org Admin CANNOT Do

These are Host-only capabilities that are explicitly **not available** in the Org portal:

- ❌ Create, edit, or configure policies (Host-owned)
- ❌ Manage service taxonomy
- ❌ Configure commission schemas
- ❌ Trigger settlement payouts
- ❌ Access other organizations' data
- ❌ Manage SP accounts or tax profiles

---

## Sub-Roles

| Role | Capabilities |
|---|---|
| **Org Admin** | Full org-scoped CRUD — employees, policies, wallet, profile |
| **HR Finance** | Wallet top-up, utilization reports, monthly tax summaries. No employee mgmt. |
| **Manager** | Read-only utilization view for their team only. |

---

## Phase 2 Development

Org portal is built **after** Host portal is complete. Architecture approach:
- Reuse shared components (sidebar, top-bar, data tables, forms)
- Restrict data via middleware (session user's `orgSlug` scopes all queries)
- Policy assignment UI shares the same policy data model but uses a different wizard from Host's create/edit flow

---

## Design Notes for Agents

- Org Admin sees a **scoped-down view** of the platform — same data model, fewer controls.
- Policy assignment is a 3-step wizard: Select policy → Select employees → Confirm.
- Employee upload: CSV with row-level validation. Errors shown inline per row.
- Wallet: per-branch. Cash Balance (pre-funded) or Credit Limit (post-paid).
- Use benefit pool + utilization data for dashboard widgets.
