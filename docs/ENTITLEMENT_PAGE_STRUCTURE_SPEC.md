# WellUber Admin — Standardized Employee Entitlements Page Structure Spec

This document serves as the **authoritative structural specification** for the **Employee Entitlements View** (`app/(org)/[orgSlug]/employees/[employeeId]/page.tsx` and Host Employee View).

It enforces a **person-first structural hierarchy** and **scalable 2-tone progress bar design** that applies consistently across **all 12 pool combinations**.

---

## 1. Page Hierarchy Architecture & 2-Tone Color Palette

Every employee detail view follows a strict 3-tier layout:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. ASSIGNED POLICY HEADER (Clickable link to Policy Details /policies/[id])                                │
│    Policy: Acme Executive Flexi Policy FY2026  [View Policy Details ↗]                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. ALLOCATION SUMMARY (Per Employee & Dependents)                                                          │
│    Total Allocated: RM 1,750.00     Total Used: RM 550.00     Total Balance Left: RM 1,200.00            │
│                                                                                                             │
│    2-TONE STACKED PROGRESS BAR (Scalable for 10+ Dependents):                                              │
│    [ Primary Purple: Employee (RM 350) ][ Teal: All Dependents Combined (RM 200) ][ Muted: Balance (RM 1,200) ] │
│    • 🟣 Primary Purple = Employee Spend  │  • 🟢 Teal = All Dependents Combined  │  • ⚪ Gray = Balance Left    │
│                                                                                                             │
│    BREAKDOWN ACCORDION TABLE (4-Column Layout):                                                             │
│    Beneficiary Name           Allocated Quota           Spent                   Balance Left                │
│    • Employee                 RM 1,000.00               RM 350.00               RM 650.00                   │
│    • Dependents               Combined Pool             RM 200.00               Shared                      │
│      └ Spouse (Siti Rahmah)   —                         RM 200.00               —                           │
│      └ Child (Tommy Fox)      —                         RM   0.00               —                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. BENEFIT GROUP WALLETS (Group-by-Group Limits & Pool Rules)                                              │
│    ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│    │ Physical Wellbeing       Beneficiary Table (4-Column Layout: Beneficiary, Quota, Spent, Balance Left) │ │
│    ├──────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│    │ Mental Fitness           Beneficiary Table (4-Column Layout: Beneficiary, Quota, Spent, Balance Left) │ │
│    └──────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Authoritative Entitlement Display Standards**:
> 1. **Canonical Pool Terminology (`Combined Pool`)**: Shared family allocations are canonically termed **`Combined Pool`** in the Allocated Quota column across all views.
> 2. **Shared Dependent Quota Column Rule**: When a dependent shares in a `Combined Pool`, their **Allocated Quota** cell MUST NOT show individual numbers (like RM 100). It MUST render as **`—`** (dash).
> 3. **Primary Color Palette (Primary Purple & Teal)**:
>    * 🟣 **Primary Purple** (`bg-primary` / `--primary`): **Employee Spend & Shared Elements**.
>    * 🟢 **Teal** (`bg-teal-500` / `--teal`): **Dependents Combined Spend**.
> 4. **No Redundant Badges**: Do not render duplicate pill badges next to beneficiary labels. The Allocated Quota column directly conveys the pool structure.

---

## 2. Validation Across All 12 Combinations

Let's validate whether this 3-tier structure gracefully handles all 12 matrix combinations:

| Combo ID | Combination Scenario | Tier 1: Assigned Policy Link | Tier 2: Allocation Summary (Employee & Dependents) | Tier 3: Benefit Group Wallets Breakdown | Does Structure Fit 100%? |
|---|---|---|---|---|---|
| **C-01** | **Individual Solo Wallet** | Links to Policy | Employee row only (`Emp: RM 500 allocated / RM 150 used / RM 350 balance`). Primary Purple bar only. | 1 Group card (*Gym: RM 500*). | ✅ **100% Fit** |
| **C-02** | **Sub-Capped Solo Wallet** | Links to Policy | Employee row only (`Emp: RM 1,000 allocated / RM 200 used`). | 1 Group card (*Massage Sub-cap: RM 200* with cap warning badge). | ✅ **100% Fit** |
| **C-03** | **Separate Emp & Dep Wallets** | Links to Policy | Separate person rows: `Emp: RM 500`, `Spouse: —`, `Child: —`. Primary Purple (Emp) + Teal (All Deps). | 2 Group cards (*Emp Dental*, *Child Dental*). | ✅ **100% Fit** |
| **C-04** | **Role-Differentiated Rates** | Links to Policy | Differentiated rows: `Emp (RM 500 rate)`, `Child (— override)`. Primary Purple + Teal bar. | Group cards displaying role rate tags. | ✅ **100% Fit** |
| **C-05** | **Solo + Family Shared Pot** | Links to Policy | Beneficiary summary aggregates person totals. Primary Purple (Emp) + Teal (All Deps). | Group 1 (*Solo Gym: RM 350*), Group 2 (*Family Therapy: Combined Pool*). | ✅ **100% Fit** |
| **C-06** | **Sub-Capped Family Shared Pot** | Links to Policy | Beneficiary summary shows combined family quota & spend. | Group card showing *Combined Pool* with Sub-cap alert. | ✅ **100% Fit** |
| **C-07** | **Policy Shared Pool** (Uncapped) | Links to Policy | Beneficiary summary shows employee's draw down against policy pool. | Group card showing *Combined Pool* (Policy budget: RM 3,000). | ✅ **100% Fit** |
| **C-08** | **Policy Shared Pool** (+ Per-Emp Cap) | Links to Policy | Beneficiary summary displays employee's cap (`Emp: RM 500 cap / RM 500 spent`). | Group card showing *Combined Pool* with per-emp cap badge. | ✅ **100% Fit** |
| **C-09** | **Policy Shared Dependent Pool** | Links to Policy | `Emp: RM 0` (no dep), `Child 1: —`, `Child 2: —`. Teal bar only. | Group card (*Combined Pool Pediatric*). | ✅ **100% Fit** |
| **C-10** | **Policy Shared Pool + Family Pot** | Links to Policy | Family rows showing spouse/child emergency draw downs. Primary Purple + Teal bar. | Group card (*Emergency Medical Combined Pool*). | ✅ **100% Fit** |
| **C-11** | **Hybrid** (Solo + Shared Dep Pool) | Links to Policy | `Emp: RM 500 (Gym)`, `Child: — (Combined Pool)`. Primary Purple + Teal bar. | 2 Group cards (*Solo Gym*, *Combined Pediatric*). | ✅ **100% Fit** |
| **C-12** | **Multi-Group Flexi Master** | Links to Policy | Complete family summary rows. Primary Purple + Teal bar. | Multiple group cards combining solo, Combined Pools, and sub-caps. | ✅ **100% Fit** |

---

## 3. Detailed Wireframe: Employee Details Page (`/employees/[id]?tab=benefits`)

```
=================================================================================================================
 WELLUBER ADMIN  │  Acme Corporation (ORG-20260115-0001)                                       [Host Admin] 👤 
-----------------------------------------------------------------------------------------------------------------
  👤 Ahmad Faizal  (EMP-20260115-0006)  │  Lead Architect  │  Engineering                     [ Edit Employee ]
=================================================================================================================

 [ Profile ] [ 🛡️ Entitlement* ] [ 💳 Claims ] [ 🎫 Vouchers ] [ 👥 Dependents ]

 📜 ASSIGNED BENEFIT POLICY
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Policy: Executive Benefits Programme 2026 (BEN-EXEC-26)   Active · V1.0 · Fixed · Yearly · Employee + Dependents
                                                                                  [ View Policy Details ↗ ]

 📊 ALLOCATION SUMMARY
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Total Allocated: RM 5,000.00          Total Used: RM 2,490.00         Total Balance Left: RM 2,510.00

 2-TONE FAMILY PROGRESS BAR:
 [ Primary Purple: Employee (RM 1,220) ][ Teal: Dependents Combined (RM 1,270) ][ Gray: Balance Left (RM 2,510) ]
 • 🟣 Primary Purple = Employee Spend  │  • 🟢 Teal = Dependents Combined Spend  │  • ⚪ Gray = Balance Left

 🔽 BREAKDOWN
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Beneficiary Name                       Allocated Quota      Spent            Balance Left
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 👤 Employee                            RM 5,000.00          RM 1,220.00      RM 3,780.00
 👥 Dependents                          Combined Pool        RM 1,270.00      Shared
    👤 Nadia Faizal (Spouse)            —                    RM  500.00       —
    👶 Aisyah Faizal (Child)            —                    RM  250.00       —
    👶 Tariq Faizal (Child)             —                    RM  250.00       —
    👶 Omar Faizal (Child)              —                    RM  270.00       —

 🛡️ BENEFIT GROUP WALLETS
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 🏋️ Comprehensive Health (Both · Individual Amount · Taxable)
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Beneficiary Name                       Allocated Quota      Spent            Balance Left
 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 👤 Employee                            RM 1,500.00          RM  600.00       RM  900.00
 👥 Dependents                          Combined Pool        RM 1,000.00      Shared
    👤 Nadia Faizal (Spouse)            —                    RM  500.00       —
    👶 Aisyah Faizal (Child)            —                    RM  250.00       —
    👶 Tariq Faizal (Child)             —                    RM  250.00       —
=================================================================================================================
```
