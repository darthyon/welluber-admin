# Sidebar Navigation — Welluber Host Admin Portal
**Status:** Ready for Claude Code  
**Date:** April 1, 2026  
**Audience:** Frontend implementation

---

## Navigation Structure

The Host Admin Portal sidebar is organized into four sections by operational priority and consequence weight.

### Section 1: Operations (High frequency, high consequence)

Daily/weekly workflows. Direct revenue and onboarding impact. Always visible.

| Menu Item | Entry Screen | Primary Actions | Notes |
|---|---|---|---|
| Dashboard | SCR-DASH-01 | View platform KPIs, transaction feed, settlement status | Always first item. Entry point on login. |
| Organizations | SCR-ORG-01 | Browse orgs, approve pending, manage accounts, view wallets | Contextual wallet management available via tab. |
| Service Providers | SCR-SP-01 | Browse SPs, approve pending, configure commission | Commission schema editor accessible from SP detail. |
| Settlement & Payouts | SCR-SET-01 | Trigger payouts, view settlement cycle, ledger history | Monthly/ad-hoc high-consequence operation. |
| Wallets | SCR-WALLET-01 | Create wallets, assign to org/branch, fund, view balances | Global wallet management. Create/assign without org context. |

### Section 2: Setup & Config (Low frequency, configuration-focused)

Configuration and policy setup. Accessed quarterly/annually or at launch. Grouped by domain.

| Menu Item | Entry Screen | Primary Actions | Notes |
|---|---|---|---|
| Benefit Policies | SCR-CFG-HST-01 | Create policies, clone, assign to orgs, deactivate | Setup workflow. Multi-step form. Define benefit pools, utilization, refresh cycles. |
| Manage Services | SCR-CFG-01 | Add/edit service categories, main services, sub-services | Service taxonomy tree. Deactivation only (no hard deletes). Affects benefit creation downstream. |
| Manage Brands | SCR-BRAND-01 | Create brands, assign SP accounts, manage brand-SP hierarchy | Brands organize service providers (franchises). Brands set service category scope. SPs can operate within or extend scope. No duplication of SP detail screens. |
| Platform Configuration | SCR-CFG-02 + SCR-CFG-03 + SCR-CFG-05 + SCR-CFG-06 | Set global defaults: cron, voucher window, tax rates, email templates | Rarely touched after launch. One-time global policy. |

### Section 3: Reporting & Analysis (Operational insight, past-focused)

Retrospective data access. Claims history, aggregate trends, compliance exports.

| Menu Item | Entry Screen | Primary Actions | Notes |
|---|---|---|---|
| Claims (by Admin/Member) | SCR-REPORTING-01 | Filter/view claims ledger by admin type or member type, export | Data visibility / operational support. |
| Reports | SCR-REPORTING-02 | View aggregated utilization, trends, compliance-ready exports | Analytics, not real-time. Batch/canned views. |

### Section 4: Admin (Meta/auth)

Team and system management. Infrequent for typical Host Admin.

| Menu Item | Entry Screen | Primary Actions | Notes |
|---|---|---|---|
| Team & Permissions | SCR-AUTH-03 | Invite team members, assign roles, manage access, deactivate | Super Admin only. Roles: Super Admin / Approver / Viewer. |
| Audit Log | SCR-AUTH-04 | Search action history, filter by user/date/action, export CSV | Compliance + troubleshooting. 90-day retention minimum. |

---

## Entry Points & Context

### Global Entry Points (Sidebar navigation)

- **Dashboard** → login redirect, always available
- **Organizations, Service Providers, Settlement & Payouts, Wallets** → click from sidebar, load global list view
- **Benefit Policies, Manage Services, Manage Brands, Platform Configuration** → click from sidebar, load config view
- **Claims (by Admin/Member), Reports** → click from sidebar, load data view
- **Team & Permissions, Audit Log** → click from sidebar, load admin view

### Contextual Entry Points (Within page flows)

| Parent Screen | Child/Tab | Entry Point | Purpose |
|---|---|---|---|
| SCR-ORG-01 (Org List) | Wallets tab | Click org row → Wallets tab | View wallets assigned to this org. Fund, create branch wallet. |
| SCR-ORG-04 (Org Detail) | (implied) Wallets sub-tab | Org Detail → Wallets section | Org-scoped wallet management. Sidebar Wallets is global equivalent. |
| SCR-SP-05 (SP Detail) | Commission tab | Click SP row → Commission tab | Assign/edit per-SP commission rates. |

---

## Screen Inventory by Navigation Section

### Dashboard

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-DASH-01 | Platform Overview | View real-time KPIs | Active orgs, active SPs, total tx value, revenue earned this month. Empty state on day 1. |
| SCR-DASH-02 | Transactions Feed | Monitor platform transactions | 24h real-time feed, status badges, filter by type. |
| SCR-DASH-03 | Settlement Status | View settlement cycle | Pending payouts, completed (last 90 days), failed with retry option. |

### Organizations

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-ORG-01 | Organization List | Browse all orgs | Filter/sort by status, industry, branch count, creation date. Search by name or reg no. |
| SCR-ORG-02 | Organization Registration | Register new org | Company details, registration no., industry, org type, FY start date. |
| SCR-ORG-03 | Organization Approval | Approve/reject pending org | Pre-approval checks: company validity, PIC verification, payment method. |
| SCR-ORG-04 | Organization Detail | View org profile + tabs | Tabs: Profile, Branches, Policies, Employees, Wallet, Subscription. Breadcrumb for back nav. |
| SCR-ORG-05 | Branch Wallet Management | Manage branch wallets (Org context) | Per-branch: balance, model (Cash/Credit), top-up history, pending deductions. |
| SCR-ORG-06 | Org Suspension | Deactivate org | Confirm dialog, immediate benefit expiry. Email sent to PIC. |

### Service Providers

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-SP-01 | Service Provider List | Browse all SPs | Filter/sort by status, category, commission rate, payout history. Search by name or reg no. |
| SCR-SP-02 | Service Provider Registration | Register new SP | Company, service categories (multi-select), PIC, tax registration. |
| SCR-SP-03 | Service Provider Approval | Approve/reject pending SP | Pre-approval checks. On approve, assign commission schema (SCR-SP-04). |
| SCR-SP-04 | Commission Schema Editor | Configure per-SP commission | Rate table by service category. Separate rates: Redeemed vs Expired. |
| SCR-SP-05 | Service Provider Detail | View SP profile + tabs | Tabs: Profile, Branches, Packages, Commission, Settlement history. |
| SCR-SP-06 | SP Branch Listing | View all SP branches | Per-branch: location, operating hours, facilities, active package count. |
| SCR-SP-07 | SP Package Approval Queue | Review pending packages | Approve/reject with optional feedback. (TBD if enabled in MVP.) |
| SCR-SP-08 | SP Suspension | Suspend/deactivate SP | Confirm dialog, future transactions blocked. Existing active vouchers unaffected. |

### Settlement & Payouts

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-SET-01 | Settlement Dashboard | View settlement cycle status | Pending payouts, completed, failed (last 90 days). Next cycle date. |
| SCR-SET-02 | Settlement Ledger | View all settlement transactions | Ledger view: org, SP, amount, commission split, status. Filterable, exportable. |
| SCR-SET-03 | SP Payout Trigger | Trigger payout to SP | Requires 2FA confirmation. Shows impact preview. |
| SCR-SET-04 | Settlement Statement | View detailed settlement doc | Per SP or org: period, covered claims, net payout, tax withholding. |

### Wallets

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-WALLET-01 | Wallet Management | Browse all wallets, create, assign, fund | Global view. List all wallets (paginated), filterable by org/status/balance. Create modal: pick org/branch. Assign modal: pick target org/branch. Fund modal: amount + payment gateway. |

### Setup & Config → Benefit Policies

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-CFG-HST-01 | Benefit Policy Management | Create, edit, clone, assign policies | Multi-step form: basics, benefit pool config, eligibility, activation settings. Clone existing. Assign wizard. Deactivate (grandfathering). |

### Setup & Config → Manage Services

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-CFG-01 | Service Taxonomy | Add/edit/deactivate categories and services | Tree view or flat list with hierarchy. Add category form. Add main service form. Deactivate with in-use warning. |

### Setup & Config → Manage Brands

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-BRAND-01 | Brand Management | Create brands, assign SP accounts, manage hierarchy | List all brands. Click brand → detail view with SP accounts mini-table. "Assign Service Provider" button links/unlinks SPs to brand. Edit, deactivate, remove brand (danger zone). Service categories set at brand level; SPs can operate within or extend. |

### Setup & Config → Platform Configuration

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-CFG-02 | Global Cron Settings | Set voucher cancellation window, validity period, settlement cycle | Numeric + unit (hours, days). Validation: sane ranges. No retroactive changes. |
| SCR-CFG-03 | Expired Voucher Split | Configure global split (org refund %, SP ledger %, Welluber commission %) | Three sliders or input fields. Must sum to 100%. Preview impact. |
| SCR-CFG-05 | Tax Rates | Set tax rate per country | Country dropdown, rate (%) editable. Malaysia 8% locked in MVP. |
| SCR-CFG-06 | Email Templates | Edit email copy, preview, test send | Recipient, subject, body (WYSIWYG). Variable injection ({{org_name}}, {{payout_date}}). Test send button. Version history. |

### Reporting & Analysis → Claims (by Admin/Member)

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-REPORTING-01 | Claims Ledger (by type) | Filter claims by admin type or member type | Ledger: date, member, admin, claim amount, org, service, status. Filter dropdowns. Search. Export CSV. |

### Reporting & Analysis → Reports

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-REPORTING-02 | Reports & Analytics | View canned reports and trends | Utilization (spending by org, by service), trends (week-over-week), compliance exports. Canned + exploratory. |

### Admin → Team & Permissions

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-AUTH-03 | Host Team Management | Invite team members, assign roles, manage permissions, deactivate | Team list: name, email, role, status, last activity, actions. Invite form: email + role select. Role matrix (informational). Deactivate revokes sessions immediately. |

### Admin → Audit Log

| ID | Screen Name | User Action | Notes |
|---|---|---|---|
| SCR-AUTH-04 | Activity Audit Log | Search action history, filter, export | Columns: timestamp, user, action, affected entity, status, IP. Filters: date range, user, action type, status. Search by entity name. Export CSV. 90-day retention. |

---

## Navigation Implementation Notes

### Sidebar Structure (HTML/CSS)

- **Width:** ~250px (persistent left sidebar, collapsible on mobile to drawer)
- **Sections:** Four labeled section headers (Operations, Setup & Config, Reporting & Analysis, Admin)
- **Menu items:** All items displayed flat under each section header (no expand/collapse toggles)
- **Active state:** Left border accent + background highlight on current item
- **Icons:** Optional per item (use icons from design system if available; defaults to no icons for MVP)
- **Spacing:** Visual divider between sections (margin-top, subtle border, or whitespace)
- **User menu:** Top of sidebar or top-right bar (user initials circle, "Host Admin" label, dropdown for account settings + logout)

### Role-Based Visibility (Phase 1)

- **Super Admin:** All sections visible. Full access to Operations, Setup & Config, Reporting & Analysis, Admin.
- **Approver:** Operations (all items), Reporting & Analysis (read-only), Admin (Audit Log read-only, no Team Management)
- **Viewer:** Dashboard only, Reporting & Analysis (read-only), Audit Log (read-only)

(Full role-based row-level filtering deferred to Phase 2.)

### Mobile Behavior

- Sidebar collapses to drawer (hamburger menu)
- Same section structure, stacked vertically
- Drawer overlays main content
- Breadcrumb or back button for nested navigation

---

## Screen Dependencies & Handoff Notes for Claude Code

### Critical Screens (MVP)

1. **SCR-DASH-01 (Platform Overview)** — Entry point. Load real-time KPIs, tx feed, settlement status. Empty state handling.
2. **SCR-ORG-01 (Org List)** — Core workflow. Paginated table, filters, search, "Add Organization" CTA.
3. **SCR-SP-01 (SP List)** — Core workflow. Paginated table, filters, search, "Add Service Provider" CTA.
4. **SCR-SET-01 (Settlement Dashboard)** — Visibility + action point. Show cycle status, "Trigger Payout" button (2FA required).
5. **SCR-WALLET-01 (Wallet Management)** — New global screen. List all wallets, create modal, assign modal, fund modal.
6. **SCR-AUTH-03 (Team Management)** — Admin setup. Team list, invite form, role assignment.

### Supporting Screens (MVP)

- **SCR-ORG-02, SCR-ORG-03** — Org onboarding workflow
- **SCR-SP-02, SCR-SP-03, SCR-SP-04** — SP onboarding workflow
- **SCR-SET-02, SCR-SET-03** — Settlement ledger and payout trigger
- **SCR-CFG-01, SCR-CFG-02, SCR-CFG-03, SCR-CFG-05, SCR-CFG-06** — Configuration forms
- **SCR-REPORTING-01** — Claims ledger with filters
- **SCR-AUTH-04** — Audit log

### Deferred Screens (Phase 2)

- **SCR-SP-07** — Package approval queue (TBD if enabled in MVP)
- **SCR-CFG-HST-02** — Benefit Groups (client-specific, may not be in MVP)
- **SCR-REPORTING-02** — Advanced analytics and trends

---

## Navigation Routing (Pseudo-code)

```
Sidebar click → Route
├─ Dashboard → /dashboard
├─ Organizations → /organizations
├─ Service Providers → /service-providers
├─ Settlement & Payouts → /settlement
├─ Wallets → /wallets
├─ Benefit Policies → /config/benefit-policies
├─ Manage Services → /config/services
├─ Manage Brands → /config/brands
├─ Platform Configuration → /config/platform
├─ Claims (by Admin/Member) → /reporting/claims
├─ Reports → /reporting/analytics
├─ Team & Permissions → /admin/team
└─ Audit Log → /admin/audit
```

---

## Design System Integration

- **Color scheme:** Use sidebar section headers with `--color-background-tertiary` + `--color-text-tertiary` (uppercase, smaller font)
- **Active item:** `--color-background-info` + `--color-text-info` + left border `--color-border-info`
- **Hover state:** `--color-background-secondary`
- **Font:** Sans-serif, 13px body, 11px section headers (uppercase)
- **Icons (optional):** 16x16, muted gray unless active (then info color)
- **Transitions:** 0.15s all for hover/active state changes

---

## Glossary

- **Entry Point:** Sidebar menu item or contextual link that navigates to a screen
- **Global:** Accessible from sidebar; shows platform-wide data
- **Contextual:** Accessible from within a parent screen (e.g., Org Detail); scoped to that entity
- **Tier:** Priority grouping (Operations, Setup & Config, Reporting & Analysis, Admin)