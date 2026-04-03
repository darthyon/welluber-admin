# Product Requirements Document — WellUber Admin

> **Status:** Active
> **Version:** 2.2
> **Last Updated:** 2026-04-03
> **Owner:** Welluber Sdn Bhd
> **Source:** `docs/welluber_prd.pdf`
> **Classification:** Internal Use Only

---

## 1. What WellUber Is

WellUber is a **B2B2C corporate wellness benefit marketplace** that connects organizations, their employees, and wellness service providers on a single transactional platform.

| Actor | Role | Platform | Mental Model |
|---|---|---|---|
| **Host Admin** | Platform super-admin (WellUber team) | Web Portal `/admin` | I control the platform |
| **Org Admin (HR)** | Organization HR/admin | Web Portal `/org` | I manage my employees' benefits |
| **Service Provider** | Vendor/provider admin | Web Portal `/sp` | I process a customer, I get paid |
| **Member (Employee)** | End user — browse, purchase, redeem | React Native App | My benefits wallet + vouchers |

### What It Is Not

- Not an HRIS. No payroll, leave, or direct HR system integration in v1. Employee data enters via CSV upload only.
- Not a wallet for service providers. SPs have zero pre-funded balance. Their account is a pure settlement ledger.
- Not a multi-currency platform. MYR only for MVP.
- Not a hardware provisioning platform.

---

## 2. Account Model

Core principle: **A Welluber account is a permanent personal identity.** Corporate identities are additive — they unlock employer-funded benefits but do not own the account.

```
Welluber Account (personal, permanent)
  |-- Corporate Identity A  <- Employee @ Company X — benefit wallet active
  |-- Corporate Identity B  <- Employee @ Company Y — benefit wallet active
  |-- Corporate Identity C  <- Deactivated — benefits expired, history kept
```

| Concept | Description | Behaviour |
|---|---|---|
| Welluber Account | Root identity. Personal email, Google, or Apple SSO. | Permanent. Never deleted when identities are removed. |
| Corporate Identity | Employment record linked via magic link to corporate email. | Additive. One Welluber account can hold multiple identities. |
| Deactivation | HR deactivates when employee leaves. | Benefits expire immediately (default). History stays on account. |
| Pre-link State | Member has account but no corporate identity yet. | Marketplace browsable. Wallet and checkout gated until verified. |
| Dependent Account | Family member linked under an employee account. | Pool behavior governed by Policy. |

> **Design Note:** Two-inbox model (personal email creates account, corporate email verifies employment) is security-critical. UI must clearly distinguish Welluber account from corporate identity throughout onboarding.

---

## 3. Service Taxonomy

Three-level hierarchy managed by Host Admin. Commission rates are configured at the service category level by Host Admin per SP.

| Category | Main Service | Default Sub-services |
|---|---|---|
| Fitness & Exercise | Gym Access | Daily Pass, Monthly Membership, Annual Membership |
| | Personal Training | 1-on-1 Sessions, Small Group Training |
| | Fitness Classes | Yoga, Pilates, Zumba, HIIT, Spin Classes |
| Massage & Bodywork | Traditional / Relaxation | Swedish, Balinese, Aromatherapy |
| | Therapeutic Massage | Deep Tissue, Sports Recovery, Reflexology |
| Spa & Aesthetics | Face & Skin Care | Facial, Anti-Aging, Acne Treatment |
| | Body Treatments | Body Scrub, Body Wrap, Hydrotherapy |
| | Cosmetic Procedures | Botox, Fillers, Laser Treatments |
| Mindfulness & Mental | Therapy & Counseling | Individual Therapy, Group Counseling, Life Coaching |
| | Meditation & Relaxation | Guided Meditation, Sound Bath, Breathing Exercises |
| Medical & Holistic | Chiropractic & Osteo | Spinal Adjustment, Posture Correction |
| | Physiotherapy | Injury Rehabilitation, Post-Surgery Recovery |
| | Nutrition & Diet | Nutritional Counseling, Meal Prep, Diet Planning |

> **Custom sub-services:** SPs can add free-text sub-service labels per voucher service line (e.g. 'Peak Hours Unlimited' under Gym Access). These are member-facing display labels only. They do not enter the global taxonomy. Host promotes taxonomy entries separately.

---

## 4. Data Model

### 4.1 Organization

**Org Account:** ID, Name, Logo, Registration No., Industry/Sub-industry, Org Type (SME|Enterprise|NGO), Financial Year Start Date, Subscription (Plan/Billing/Status).

**Org Branch:** ID, Name, Type (HQ|Branch Office), Address (full + lat/lon), Timezone, PIC List, Branch Wallet (FK).

**Employee:** ID, Join Date (mandatory — used for prorate), Employee Code, Corporate Email (magic link verification), Probation End Date, Employment Type (Full-time|Part-time|Contract|Internship), Start & Termination Dates.

**Dependent:** Child of Employee. Relationship types: spouse, child, mother, father, brother, sister, mother-in-law, father-in-law.

### 4.2 Benefit Configuration

**Policy** — Created and owned by Host Admin. HR cannot create policies. Fields: code (auto), name, created_by (Host Admin FK), cloned_from, assigned_orgs, eligible_roles/employee_types, benefit_pool_type, utilization_mode (Fixed|Prorated), refresh_cycle, refresh_start_reference, activation_mode (After Join Date|After Probation Ends|Custom Date KIV), status (draft|active).

> **Portal surface difference:** Host sees: create / edit / clone / assign policy to orgs. HR sees: list of policies assigned to their org + employee assignment wizard. HR cannot edit policy contents.

**Benefit Pool Type Matrix:**

| Employee Pool | Dependent Pool | Description |
|---|---|---|
| Individual | Individual | Each employee has own pool; each dependent has own separate pool |
| Individual | Shared | Each employee has own pool; all dependents share one combined pool |
| Shared | — | Employee + all dependents share a single combined pool |

**Utilization Mode + Refresh Cycle Matrix:**

| Mode | Prorate Unit | Valid Refresh Cycles |
|---|---|---|
| Fixed | — | Daily / Weekly / Monthly / Quarterly / Yearly |
| Prorated | Daily | Weekly / Monthly / Quarterly / Yearly |
| Prorated | Weekly | Monthly / Quarterly / Yearly |
| Prorated | Monthly | Quarterly / Yearly |
| Prorated | Quarterly | Yearly |

> **UI Note:** Compound field — Host UI must enforce valid combinations. Fixed mode hides proration unit.

**Benefit Group:** group_id, policy_id (FK), name, group_distribution_type (Shared Amount | Individual Benefit Amount), maximum_usage_per_cycle.

**Benefit (Allowlist Entry):** benefit_id, group_id (FK), service_id (FK → Taxonomy Main Service), benefit_amount/unit_value, co_payment_required, co_payment_value. If a service is not listed as a Benefit, it **cannot** be claimed.

**Benefit Assignment:** assignment_id, employee_id (FK), policy_id (FK), effective_start_date, effective_end_date, calculated_benefit_pool, prorated_factor, last_refresh_date.

> **Architecture Note:** Benefit Assignment is the most load-bearing entity. Prorate + refresh cycle + pool type must be unambiguous before EPIC 05 design starts.

### 4.3 Service Providers

**SP Account:** ID, Name, Registration No., Service Categories (multi-select from Taxonomy), Description/Website, Is Active, PIC Details, T&C, is_tax_registered, tax_reg_no, tax_rate (default 0.08), Commission Schema (rate table by service category).

> **Malaysia SST Context:** Wellness centres, health centres, and massage parlours are under SST Group C at 8% (March 2024). Registration is mandatory above RM 500,000 taxable turnover.

**SP Branch:** ID, Name, Services (multi-select from SP categories), Address + Lat/Lon, Operating Hours (per-day + holiday override), Facilities, Rating (Phase 2), Is Active.

**SP Voucher:** code (auto PAC{SPID}0001), name, description, included_services (itemized: main_service_id + custom_sub_service_label + duration + weight), status (Draft|Published|Activated|Paused|Ended), activation_period, currency (MYR v1), initial_price, final_price (gross/SST-inclusive), redemption_period, branches.

> **Weight model:** SP sets weights not prices per line (e.g. 0.6/0.4). Commission formula: `final_price × weight × main_service_category_commission_rate` per line. Weights validated to sum to 1.0.

### 4.4 Commission Schema

Configured per SP, per service category by Host Admin. Fields: sp_id (FK), service_category (FK → Taxonomy Category), commission_rate (0.10–0.30), expired_commission_rate (0.10–0.30), effective_from.

**Commission Calculation:** `total_commission = SUM(final_price × weight × category_commission_rate)` per service line. Net SP payout: `final_price - total_commission`.

> **KIV — Commission Basis:** Not yet confirmed whether commission is calculated on Gross Amount (SST-inclusive) or Net Amount (ex-SST). Working assumption: Gross.

### 4.5 Finance & Settlement

**Org Branch Wallet:** Model (Cash Balance | Credit Limit), Scope (per branch), Top-up via Payment Gateway, Blocking Rule (`wallet balance < employee policy entitlement → purchase blocked`).

**Voucher States:** Pending → Active → Presented → Redeemed | Expired | Cancelled.

**Tax Model:** SST de-calculation applied per SP flag. 7-year retention per RMCD requirement. Gross = Net + SST. De-calculation formula: `sst_amount = gross_amount × (tax_rate / (1 + tax_rate))`.

> **KIV — Taxable Person:** Pending auditor review. Critical before any tax document is built.

---

## 5. Functional Requirements

### 5.1 Host Portal

| ID | Requirement |
|---|---|
| SYS-HST-01 | Manage global 3-level service taxonomy |
| SYS-HST-02 | Create, edit, clone, and deactivate Policies |
| SYS-HST-03 | Assign policies to one or more orgs |
| SYS-HST-04 | Configure commission schemas per SP — rate table by service category |
| SYS-HST-05 | Approve, suspend, and reactivate Org and SP tenant accounts |
| SYS-HST-06 | Manage SP tax profile: is_tax_registered, tax_reg_no, tax_rate per SP |
| SYS-HST-07 | Aggregate platform-wide financials — GMV, commissions, outstanding payouts |
| SYS-HST-08 | Generate SP settlement reports; trigger settlement payouts |
| SYS-HST-09 | Configure expired voucher payout splits (% Org / % SP / % Welluber; sum=100%) |
| SYS-HST-10 | Configure global cancellation window (default 3 hrs) and voucher redemption period (default 15 days) |
| SYS-HST-11 | Platform tax compliance dashboard |
| SYS-HST-12 | Access any org or SP portal view in read or edit mode (god-mode override) |

### 5.2 Organization Portal

| ID | Requirement |
|---|---|
| SYS-ORG-01 | Configure corporate profile, branches, org structure, and PICs |
| SYS-ORG-02 | Bulk upload and manage employee profiles via CSV/Excel with row-level validation |
| SYS-ORG-03 | 3-step policy assignment wizard |
| SYS-ORG-04 | View utilization dashboard — spend, balance, benefit group breakdown |
| SYS-ORG-05 | Branch wallet management — top-up, view balance, pending deductions |
| SYS-ORG-06 | Employee offboarding with automatic benefit expiry |

### 5.3 Service Provider Portal

| ID | Requirement |
|---|---|
| SYS-SP-01 | Branch management — CRUD, operating hours, facilities |
| SYS-SP-02 | Voucher catalog — create, publish, pause, end vouchers |
| SYS-SP-03 | Walk-in claim — member lookup (QR/ID/name), collision check, auto-deduct |
| SYS-SP-04 | Voucher redemption — code entry, validate, confirm delivery |
| SYS-SP-05 | Settlement review — approve statement, view payouts |
| SYS-SP-06 | Staff management — add/remove staff, assign roles |

---

## 6. Role Permissions Matrix

| Actor | Capabilities |
|---|---|
| **Host Super Admin** | Full platform access. All CRUD. Settlement trigger. God-mode override into any portal. |
| **Org Admin** | Own-org CRUD: corp profile, branches, PICs, employee management, policy assignment, wallet. No policy creation. |
| **HR Finance** | Wallet top-up, utilization reports, monthly tax summaries. No employee management. |
| **Manager** | Read-only utilization view for their team. |
| **SP Branch Manager** | Voucher creation, operating hours, branch claims view, staff management. |
| **SP Staff** | Member lookup, voucher code entry, claim submission, daily transaction history. |
| **Member (Employee/Dependent)** | Marketplace, vouchers, co-payment, benefit balance, transaction receipts. |

---

## 7. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Multi-Tenancy | Strict data isolation across all 4 tenant types |
| NFR-02 | Security | PDPA compliant; PII + payment data encrypted at rest + in transit (TLS 1.2+) |
| NFR-03 | Performance | Voucher code validation + confirmation < 3 seconds under normal load |
| NFR-04 | Availability | 99.9% uptime SLA |
| NFR-05 | Scalability | Horizontally scalable; peak after-work wellness hours |
| NFR-06 | Mobile | Magic link opens React Native app via universal link — never browser redirect |
| NFR-07 | Tax Audit | All SST de-calculation inputs stored immutably per transaction. 7-year retention per RMCD. |

---

## 8. Epics Summary

| Epic | Area | Description | Primary Flows |
|---|---|---|---|
| EPIC 01 | Host | Platform Configuration — taxonomy, global config, expired voucher policy | Flow 00 |
| EPIC 02 | Host | Org Onboarding — registration, approval, policy assignment, subscription | Flow 02 |
| EPIC 03 | Host | SP Onboarding — registration, approval, commission schema, tax profile | Flow 03 |
| EPIC 04 | Host | Policy Management — create, configure, clone, assign to orgs | Flow 00 |
| EPIC 05 | Member | Account Activation & Corporate Identity Linking — magic link, two-inbox | Flow 05 |
| EPIC 06 | Org | HR Enrollment Wizard — profile setup, CSV upload, 3-step policy assignment, wallet | Flow 06 |
| EPIC 07 | SP | Voucher Catalog — weighted service lines, activation + redemption period | Flow 07 |
| EPIC 08 | Member | Online Voucher Purchase — validation chain, co-pay routing, voucher state machine | Flow 08 |
| EPIC 09 | SP | Walk-in Member Lookup + Claim — layered ID, collision check, no handshake | Flow 10 |
| EPIC 10 | SP | Voucher Redemption — code entry, state transitions, ledger entry | Flow 09 |
| EPIC 11 | Org + Host | Settlement & Invoicing — weighted commission, payout trigger, tax documents | Flow 12 |
| EPIC 12 | Core + Finance | Tax & Compliance Engine — SST de-calculation, immutable audit trail | Section 5 |
| EPIC 13 | Core | Policy Engine — pool type, utilization mode, refresh cycle, proration | Flow 06 |

---

## 9. Open Decisions

### 9.1 Confirmed

| Decision | Resolution |
|---|---|
| Magic link token expiry | 60 minutes |
| Member lookup priority | QR scan → Employee ID → Name search |
| Settlement cycle | Monthly (assumed) |
| Walk-in collision | Block walk-in; prompt SP to ask member to present existing voucher |
| Corporate deactivation → vouchers | Expire immediately; grace window post-MVP |
| Voucher redemption method (v1) | Voucher code entry by SP — not QR scan |
| SP wallet | None — pure settlement ledger |
| Wallet blocking rule | `wallet < entitlement → blocked` |
| Commission model | Per SP, per service category — rate table. Weighted across multi-service voucher lines. |
| Tax display | All member-facing prices SST-inclusive (Gross) |
| Policy ownership | Host Admin creates, edits, clones, assigns. HR cannot create or edit. |
| Benefit as allowlist | Option A confirmed. Each service must be explicitly listed. Default deny. |
| Portal access model | Host has full access. Org and SP portals are scoped-down views. |

### 9.2 KIV — Must Resolve Before Design

| Open Question | Blocks | Note |
|---|---|---|
| Commission on Gross or Net (ex-SST)? | Settlement math | Working assumption: Gross. Auditor must confirm. |
| Who is the taxable person — Welluber or SP? | Section 5 tax model | Pending auditor review. |
| SP Tax Invoice: auto-generate or SP-upload? | SP portal design | Recommendation: auto-generate. Pending auditor. |
| Wallet model — single or Main + Add-on? | Finance data model | Current: one wallet per branch. Do not assume multi-wallet. |
| activation_mode: Custom Date | Policy engine spec | Remove option or define validation rules first. |
| Public member account type | Member app nav | Exclude from MVP or define as browse-only. |
| Google Maps SDK provider | SP branch setup, marketplace | Vendor + cost decision. |
| Payment Gateway provider | Checkout, wallet top-up flows | e.g. Billplz, iPay88, Stripe, FPX |

### 9.3 Out of Scope (MVP)

- Hardware provisioning
- HRIS direct API integration (CSV only for v1)
- Multi-currency support
- SP pre-funded wallets
- Dependent self-registration (employee-managed only)
- Walk-in receipt generation for member
- QR scan for voucher redemption (v2)
- SP voucher pending-approval by Host
- Grace window for vouchers on corporate identity deactivation

---

## 10. MVP Build Sequence

1. **Setup (Host Admin):** Flow 00 (Taxonomy, Policy, Commission) + Flow 02 (Org) + Flow 03 (SP)
2. **Member Onboarding:** Flow 05 (Account activation)
3. **Core Transactions:** Flow 08 (Purchase) → Flow 09 (Redemption) | Flow 10 (Walk-in)
4. **Settlement:** Flow 12 (Payout)
5. **Org Admin Workflows:** Flow 06 (Employee mgmt, wallet top-up)
6. **SP Workflows:** Flow 07 (Voucher creation, lifecycle)
7. **Phase 2:** Flow 13 (Pool refresh), Flow 14 (Reporting), Flow 15 (Offboarding), Flow 16 (Dependents)

---

## 11. Cross-References

| Document | Path | Description |
|---|---|---|
| Flows Summary | `docs/flows/FLOWS_SUMMARY.md` | Master index of all flows with status |
| Screen Inventory | `docs/flows/SCREEN_INVENTORY_HOST_PORTAL.md` | Host portal screen-by-screen spec |
| Flow 00 | `docs/flows/FLOW_00_HOST_ADMIN_CONFIGURATION.md` | Taxonomy + Policy + Commission + Cron |
| Flow 01 | `docs/flows/FLOW_01_HOST_ADMIN_ACCOUNT_MANAGEMENT.md` | Host team account management |
| Flow 02 | `docs/flows/FLOW_02_ORG_SETUP.md` | Organization onboarding |
| Flow 03 | `docs/flows/FLOW_03_SP_SETUP.md` | Service Provider setup |
| Flow 05 | `docs/flows/FLOW_05_MEMBER_ACTIVATION.md` | Member account activation |
| Flow 06 | `docs/flows/FLOW_06_EMPLOYEE_MANAGEMENT.md` | HR employee + benefit management |
| Flow 07 | `docs/flows/FLOW_07_SP_VOUCHER_CREATION.md` | SP voucher creation + lifecycle |
| Flow 08 | `docs/flows/FLOW_08_ONLINE_PURCHASE.md` | Member online voucher purchase |
| Flow 09 | `docs/flows/FLOW_09_VOUCHER_REDEMPTION.md` | SP voucher redemption |
| Flow 10 | `docs/flows/FLOW_10_WALK_IN_CLAIM.md` | SP walk-in claim |
| Flow 12 | `docs/flows/FLOW_12_SETTLEMENT_PAYOUT.md` | Settlement & payout |
| Mermaid Diagrams | `docs/flows/MERMAID_WORKFLOW_*.md` | Visual workflow diagrams |
| Host Persona | `docs/personas/host.md` | Host Admin capability matrix |
| Org Persona | `docs/personas/org.md` | Org Admin capability matrix |
| SP Persona | `docs/personas/serviceprovider.md` | Service Provider capability matrix |
| Design System | `docs/design.md` | UI tokens, layout, component patterns |
| ADRs | `docs/decisions/adr-*.md` | Architecture decisions |
