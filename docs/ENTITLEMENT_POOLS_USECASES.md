# WellUber Admin — Entitlement Pools: Use Cases, UX Audit & Full Page Wireframes

This document is the **single source of truth** for all entitlement pool combinations in WellUber Admin.
It covers the full **2×4 matrix** of pool types and documents wireframes for every case grounded in real mock data.

---

## 1. Ground Truth Schema Principles (`types/policy.ts`)

1. **Allocations are Per Benefit Group**: Quotas are on **Benefit Groups**, not on the policy as a whole.
2. **Two independent pool axes** combine to produce all cases:
   - `benefitPoolType`: `"Individual"` or `"Shared"` — controls the **employee** pool.
   - `dependentsPoolType`: `"Individual"`, `"SharedWithEmployee"`, or `"Shared"` — controls **dependents** (absent = no dep coverage).
3. **Distribution Types**:
   - `IndividualBenefitAmount`: Fixed amount per beneficiary for that group.
   - `SharedAmount`: A shared pot drawn down collectively.

---

## 2. Complete Use Case Matrix (8 Base Cases)

> [!IMPORTANT]
> **Authoritative UX & Display Standards**:
> 1. **3-Tier Page Hierarchy**: Assigned Policy Header → Allocation Summary → Benefit Group Wallets.
> 2. **Canonical Pool Term**: Shared family allocations display as **`Combined Pool`** in the Allocated Quota column.
> 3. **Org-Wide Shared Pool Banner**: When `benefitPoolType: "Shared"`, show an org pool banner above Allocation Summary: `🏢 Org Pool: RM 10,000 total | RM 7,250 remaining`.
> 4. **Shared Dependent Dash Rule**: When deps share a Combined Pool, Allocated Quota and Balance Left cells for individual dep sub-rows render as **`—`**.
> 5. **2-Tone Progress Bar**: 🟣 Primary Purple = Employee Spend · 🟢 Teal = All Deps Combined · ⚪ Gray = Balance Left.

### 2A. The 2x4 Matrix (Grounded in Mock Data)

| Case | `benefitPoolType` | `dependentsPoolType` | Real Employee (Mock) | EMP ID |
|---|---|---|---|---|
| **C1** | `Individual` | *(none — emp only)* | Robert Fox | `EMP-20260115-0001` |
| **C2** | `Individual` | `Individual` | Jenny Wilson | `EMP-20260115-0002` |
| **C3** | `Individual` | `SharedWithEmployee` | Michael Tan | `EMP-20260115-0003` |
| **C4** | `Individual` | `Shared` | Marvin McKinney | `EMP-20260115-0004` |
| **C5** | `Shared` | *(entire family shares)* | Jason Teh | `EMP-20260115-0005` |

**Extended QA Cases:**
* **Ahmad Faizal** (`EMP-20260115-0006`): `Individual` + `Individual` with split allocations and capping behavior checks.

### 2B. Expanded Use Case Table

| UC | Case | Use Case Name | Key Mechanism | Real Employee |
|---|---|---|---|---|
| **UC1** | C1 | Individual Employee Pool (No Deps) | `Individual` emp wallet, emp-only policy | **Robert Fox** |
| **UC2** | C2 | Individual Pool + Individual Dep Wallets | Each dep gets their own dedicated wallet | **Jenny Wilson** |
| **UC3** | C3 | Individual Pool + Combined Family Pool | Deps share Combined Pool with employee's policy | **Michael Tan** |
| **UC4** | C4 | Individual Pool + Shared Dep Pool | Deps share their own pool; emp has own wallet | **Marvin McKinney** |
| **UC5** | C5 | Shared Family Pot | Entire family shares one pot | **Jason Teh** |

---

## 3. Full Employee Details Page Wireframes (`/employees/[id]?tab=benefits`)

---

### UC1: Individual Employee Pool — No Dependents
**Robert Fox** · `EMP-20260115-0001` · Employee Essentials 2026
*Live: `/employees/EMP-20260115-0001?from=ORG-20260115-0001&tab=benefits`*

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Robert Fox  (EMP-20260115-0001)  |  Operations Manager  |  Operations          [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Employee Essentials 2026 (BEN-ESS-26)  Active · V1.0 · Fixed · Yearly · Employee
                                                                     [ View Policy Details ]
 ALLOCATION SUMMARY
 Total Allocated: RM 1,500.00     Total Used: RM 300.00     Total Balance Left: RM 1,200.00
 [ Primary Purple: Employee (RM 300) ][ Gray: Balance Left (RM 1,200) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 1,500.00          RM 300.00    RM 1,200.00

 BENEFIT GROUP WALLETS
 General Wellness (Employee · Individual Amount · Taxable)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 1,500.00          RM 300.00    RM 1,200.00
=================================================================================================================
```

---

### UC2: Individual Pool + Individual Dependent Wallets
**Ahmad Faizal** · `EMP-20260115-0006` · Executive Benefits Programme 2026
*Live: `/employees/EMP-20260115-0006?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC2 Key**: `dependentsPoolType: "Individual"` — each dependent has their own independent quota. No "Combined Pool" label. No dashes. Every row shows a real RM amount.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Ahmad Faizal  (EMP-20260115-0006)  |  Lead Architect  |  Engineering          [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Executive Benefits Programme 2026 (BEN-EXEC-26)
         Active · V1.0 · Fixed · Yearly · Employee + Dependents  [ View Policy Details ]

 ALLOCATION SUMMARY
 Total Allocated: RM 5,000.00     Total Used: RM 1,940.00     Total Balance Left: RM 3,060.00
 [ Primary Purple: Employee (RM 1,220) ][ Teal: Dependents Combined (RM 720) ][ Gray: Balance (RM 3,060) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent          Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 5,000.00          RM 1,220.00    RM 3,780.00
 Dependents
    Nadia Faizal (Spouse)       RM 1,000.00          RM   500.00    RM   500.00
    Aisyah Faizal (Child)       RM 1,000.00          RM     0.00    RM 1,000.00
    Faris Faizal (Child)        RM 1,000.00          RM   180.00    RM   820.00
    Hana Faizal (Child)         RM 1,000.00          RM    90.00    RM   910.00
    Iman Faizal (Child)         RM 1,000.00          RM     0.00    RM 1,000.00
    Juna Faizal (Child)         RM 1,000.00          RM   350.00    RM   650.00

 BENEFIT GROUP WALLETS
 Comprehensive Health (Both · Individual Amount · Not Taxable)
 Beneficiary Name              Allocated Quota      Spent          Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 1,500.00          RM   600.00    RM   900.00
    Nadia Faizal (Spouse)       RM 1,000.00          RM   300.00    RM   700.00
    Aisyah Faizal (Child)       RM 1,000.00          RM     0.00    RM 1,000.00
    Faris Faizal (Child)        RM 1,000.00          RM   180.00    RM   820.00
    Hana Faizal (Child)         RM 1,000.00          RM    90.00    RM   910.00
    Iman Faizal (Child)         RM 1,000.00          RM     0.00    RM 1,000.00
    Juna Faizal (Child)         RM 1,000.00          RM   350.00    RM   650.00
 ─────────────────────────────────────────────────────────────────────────────
 Wellness Extras (Both · Individual Amount · Not Taxable · 20% Co-pay) [UC2+UC6: Split Amounts]
 Beneficiary Name              Allocated Quota      Spent          Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee (Gym)                RM   800.00          RM   300.00    RM   500.00
    Nadia Faizal (Gym)          RM   400.00          RM     0.00    RM   400.00
    Aisyah Faizal (Gym)         RM   400.00          RM   100.00    RM   300.00
=================================================================================================================
```

---

### UC3: Individual Pool + Combined Family Pool (SharedWithEmployee)
**Jenny Wilson** · `EMP-20260115-0002` · Acme Family Wellness 2026
*Live: `/employees/EMP-20260115-0002?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC3 Key**: `dependentsPoolType: "SharedWithEmployee"` — Dependents row shows **Combined Pool** + **Shared** (primary purple). Sub-rows show **—** for Allocated Quota and Balance Left.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Jenny Wilson  (EMP-20260115-0002)  |  Senior Software Engineer  |  Engineering  [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Acme Family Wellness 2026 (BEN-FAM-26)
         Active · V1.0 · Fixed · Yearly · Employee + Dependents  [ View Policy Details ]

 ALLOCATION SUMMARY
 Total Allocated: RM 3,000.00     Total Used: RM 450.00     Total Balance Left: RM 2,550.00
 [ Primary Purple: Employee (RM 420) ][ Teal: Deps Combined (RM 30) ][ Gray: Balance (RM 2,550) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 3,000.00          RM 420.00    RM 2,580.00
 Dependents                    Combined Pool        RM  30.00    Shared
    Daniel Wilson (Spouse)      —                    RM  20.00    —
    Emma Wilson (Child)         —                    RM  10.00    —

 BENEFIT GROUP WALLETS
 Physical Wellbeing (Both · Individual Amount · Not Taxable)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM   350.00          RM 220.00    RM  130.00
 Dependents                    Combined Pool        RM  30.00    Shared
    Daniel Wilson (Spouse)      —                    RM  20.00    —
    Emma Wilson (Child)         —                    RM  10.00    —
 ─────────────────────────────────────────────────────────────────────────────
 Mental Fitness (Employee · Individual Amount · Not Taxable · 10% Co-pay)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM   600.00          RM 200.00    RM  400.00
=================================================================================================================
```

---

### UC4: Individual Pool + Shared Dependent Pool
**Michael Scott** · `EMP-20260115-0003` · Acme Nutrition Plan FY2026
*Live: `/employees/EMP-20260115-0003?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC4 Key**: `dependentsPoolType: "Shared"` — deps share their own pool separately from the employee's individual wallet. Employee has own RM 800. Dep row shows Combined Pool / Shared with dashes per sub-row. Distinct from UC3 (which shares one pot across emp+deps).

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Michael Scott  (EMP-20260115-0003)  |  Account Manager  |  Commercial          [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Acme Nutrition Plan FY2026 (BEN-NUT-03)
         Active · V1.2 · Fixed · Quarterly · Employee + Dependents  [ View Policy Details ]

 ALLOCATION SUMMARY
 Total Allocated: RM 1,400.00     Total Used: RM 750.00     Total Balance Left: RM 650.00
 [ Primary Purple: Employee (RM 500) ][ Teal: Deps Combined (RM 250) ][ Gray: Balance (RM 650) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM   800.00          RM 500.00    RM  300.00
 Dependents                    Combined Pool        RM 250.00    Shared
    Siti Rahmah (Spouse)        —                    RM 150.00    —
    Adam Faizal (Child)         —                    RM 100.00    —

 BENEFIT GROUP WALLETS
 Nutrition & Recovery (Both · Shared Amount · Not Taxable · RM 20 Co-pay for Employee)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM   800.00          RM 500.00    RM  300.00
 Dependents                    Combined Pool        RM 250.00    Shared
    Siti Rahmah (Spouse)        —                    RM 150.00    —
    Adam Faizal (Child)         —                    RM 100.00    —
=================================================================================================================
```

---

### UC5: Org Shared Pool — No Dependents
**Sarah Lim** · `EMP-20260115-0005` · Acme Health Screening Programme 2026
*Live: `/employees/EMP-20260115-0005?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC5 Key**: `benefitPoolType: "Shared"` — the **org owns a central budget pool** (RM 10,000). Sarah is drawing down RM 1,500 against that pool. Show an **Org Pool Banner** above Allocation Summary so the admin sees the macro context. Sarah's personal view shows only her draw-down, not the full pool.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Sarah Lim  (EMP-20260115-0005)  |  HR Executive  |  Human Resources             [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Acme Health Screening Programme 2026 (BEN-SCR-26)
         Active · V1.0 · Fixed · Yearly · Employee  [ View Policy Details ]

 ORG POOL BANNER
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ 🏢 Org Shared Pool · Health Screening · RM 10,000 total · RM 7,250 remaining  │
 │ Sarah's draw-down counts against this shared org budget.                        │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ALLOCATION SUMMARY  (Sarah's draw-down cap)
 Total Allocated: RM 1,500.00     Total Used: RM 500.00     Total Balance Left: RM 1,000.00
 [ Primary Purple: Employee (RM 500) ][ Gray: Balance Left (RM 1,000) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 1,500.00          RM 500.00    RM 1,000.00

 BENEFIT GROUP WALLETS
 Health Screening (Employee · Shared Amount · Not Taxable)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 1,500.00          RM 500.00    RM 1,000.00
=================================================================================================================
```

---

### UC6: Org Shared Pool + Individual Dependent Wallets
**David Park** · `EMP-20260115-0007` · Acme Central Dental Programme 2026
*Live: `/employees/EMP-20260115-0007?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC6 Key**: `benefitPoolType: "Shared"` + `dependentsPoolType: "Individual"` — org has a central dental budget (RM 20,000). David draws RM 500 from it; each of his dependents also gets their own dedicated quota drawn from the same org pool. No Combined Pool label — each dep shows their own RM amount.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  David Park  (EMP-20260115-0007)  |  Finance Manager  |  Finance                 [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Acme Central Dental Programme 2026 (BEN-DEN-26)
         Active · V1.0 · Fixed · Yearly · Employee + Dependents  [ View Policy Details ]

 ORG POOL BANNER
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ 🏢 Org Shared Pool · Dental Care · RM 20,000 total · RM 14,500 remaining           │
 │ David and dependents' allocations all draw against this shared org budget.           │
 └──────────────────────────────────────────────────────────────────────────────────────┘

 ALLOCATION SUMMARY  (David's draw-down + his dependents' individual quotas)
 Total Allocated: RM 500.00 (Emp) + RM 300.00 × 2 (Deps)
 Total Used: RM 350.00    Total Balance Left: RM 450.00
 [ Primary Purple: Employee (RM 200) ][ Teal: Dependents Combined (RM 150) ][ Gray: Balance (RM 450) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM   500.00          RM 200.00    RM  300.00
 Dependents
    Priya Park (Spouse)         RM   300.00          RM   0.00    RM  300.00
    Leo Park (Child)            RM   300.00          RM 150.00    RM  150.00

 BENEFIT GROUP WALLETS
 Dental Care (Both · Individual Amount · Not Taxable)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM   500.00          RM 200.00    RM  300.00
    Priya Park (Spouse)         RM   300.00          RM   0.00    RM  300.00
    Leo Park (Child)            RM   300.00          RM 150.00    RM  150.00
=================================================================================================================
```

---

### UC7: Org Shared Pool + Combined Family Pool (SharedWithEmployee)
**Nurul Huda** · `EMP-20260115-0008` · Acme Mental Health Fund 2026
*Live: `/employees/EMP-20260115-0008?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC7 Key**: `benefitPoolType: "Shared"` + `dependentsPoolType: "SharedWithEmployee"` — org owns a central MH budget (RM 15,000). Nurul's family draws against a RM 2,000 ceiling from that pool, and family shares one Combined Pool for therapy. Dep sub-rows show **—** for Allocated Quota and Balance Left.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Nurul Huda  (EMP-20260115-0008)  |  Talent Acquisition Lead  |  HR               [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Acme Mental Health Fund 2026 (BEN-MH-26)
         Active · V1.0 · Fixed · Yearly · Employee + Dependents  [ View Policy Details ]

 ORG POOL BANNER
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ 🏢 Org Shared Pool · Mental Health & Therapy · RM 15,000 total · RM 9,800 remaining│
 │ Nurul's family draws against a RM 2,000 ceiling from this shared org budget.         │
 └──────────────────────────────────────────────────────────────────────────────────────┘

 ALLOCATION SUMMARY  (Family ceiling: RM 2,000 from org pool)
 Total Allocated: RM 2,000.00    Total Used: RM 700.00    Total Balance Left: RM 1,300.00
 [ Primary Purple: Employee (RM 400) ][ Teal: Deps Combined (RM 300) ][ Gray: Balance (RM 1,300) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 2,000.00          RM  400.00   RM 1,600.00
 Dependents                    Combined Pool        RM  300.00   Shared
    Hafiz Rahman (Spouse)       —                    RM  200.00   —
    Zahra Rahman (Child)        —                    RM  100.00   —

 BENEFIT GROUP WALLETS
 Mental Health & Therapy (Both · Shared Amount · Not Taxable)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM 2,000.00          RM  400.00   RM 1,600.00
 Dependents                    Combined Pool        RM  300.00   Shared
    Hafiz Rahman (Spouse)       —                    RM  200.00   —
    Zahra Rahman (Child)        —                    RM  100.00   —
=================================================================================================================
```

---

### UC8: Org Shared Pool + Shared Dependent Pool
**James Wong** · `EMP-20260115-0009` · Acme Central Optical Fund 2026
*Live: `/employees/EMP-20260115-0009?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC8 Key**: `benefitPoolType: "Shared"` + `dependentsPoolType: "Shared"` — org owns a central optical budget (RM 12,000). James draws RM 600 from it for himself. His dependents share a **separate** Combined Pool (ceiling RM 1,000) also from the org budget. Two layers of sharing: emp draw-down + dep sub-pool.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  James Wong  (EMP-20260115-0009)  |  Operations Analyst  |  Operations            [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Acme Central Optical Fund 2026 (BEN-OPT-26)
         Active · V1.0 · Fixed · Yearly · Employee + Dependents  [ View Policy Details ]

 ORG POOL BANNER
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ 🏢 Org Shared Pool · Optical Care · RM 12,000 total · RM 8,750 remaining           │
 │ James: RM 600 cap · Dependents: RM 1,000 shared cap — both from this org budget.    │
 └──────────────────────────────────────────────────────────────────────────────────────┘

 ALLOCATION SUMMARY
 Total Allocated: RM 1,600.00    Total Used: RM 500.00    Total Balance Left: RM 1,050.00
 [ Primary Purple: Employee (RM 250) ][ Teal: Deps Combined (RM 250) ][ Gray: Balance (RM 1,050) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM   600.00          RM 250.00    RM  350.00
 Dependents                    Combined Pool        RM 250.00    Shared
    Mei Wong (Spouse)           —                    RM 150.00    —
    Kai Wong (Child)            —                    RM 100.00    —

 BENEFIT GROUP WALLETS
 Optical Care (Both · Shared Amount · Not Taxable)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM   600.00          RM 250.00    RM  350.00
 Dependents                    Combined Pool        RM 250.00    Shared
    Mei Wong (Spouse)           —                    RM 150.00    —
    Kai Wong (Child)            —                    RM 100.00    —
=================================================================================================================
```

---

### UC-P: Prorated Individual — No Dependents
**Marvin McKinney** · `EMP-20260115-0004` · Contract Staff Essentials 2026
*Live: `/employees/EMP-20260115-0004?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC-P Key**: `utilisationMode: "Prorated"` — balance is not a fixed lump sum. It accrues monthly based on employment tenure. Show a prorated notice below Allocation Summary.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Marvin McKinney  (EMP-20260115-0004)  |  Sales Lead  |  Commercial              [ Edit Employee ]
=================================================================================================================
 [ Profile ] [ Entitlement* ] [ Claims ] [ Vouchers ] [ Dependents ]

 ASSIGNED BENEFIT POLICY
 Policy: Contract Staff Essentials 2026 (BEN-CON-26)
         Active · V1.0 · Prorated Monthly · Yearly · Employee  [ View Policy Details ]

 ALLOCATION SUMMARY
 Total Allocated: RM 100.00     Total Used: RM 40.00     Total Balance Left: RM 60.00
 ⚡ Prorated Monthly — Balance accrues proportionally based on tenure.
 [ Primary Purple: Employee (RM 40) ][ Gray: Balance Left (RM 60) ]

 BREAKDOWN
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee                      RM  100.00           RM  40.00    RM   60.00

 BENEFIT GROUP WALLETS
 Basic Medical (Employee · Individual Amount · Not Taxable · Prorated)
 Beneficiary Name              Allocated Quota      Spent        Balance Left
 ─────────────────────────────────────────────────────────────────────────────
 Employee (GP Visit — MD-GPV)  RM   60.00           RM  40.00    RM   20.00
 Employee (Prescription — RX)  RM   40.00           RM   0.00    RM   40.00
=================================================================================================================
```

---

## 4. Summary: Active Employees → UC Mapping

| Employee | EMP ID | Policy | UC | Key Differentiator |
|---|---|---|---|---|
| Robert Fox | EMP-20260115-0001 | Employee Essentials 2026 | **UC1** | `Individual` emp, no deps |
| Jenny Wilson | EMP-20260115-0002 | Acme Family Wellness 2026 | **UC2** | `Individual` emp + `Individual` dep wallets |
| Michael Tan | EMP-20260115-0003 | Acme Nutrition Plan FY2026 | **UC3** | `Individual` emp + `SharedWithEmployee` deps → Combined Pool |
| Marvin McKinney | EMP-20260115-0004 | Contract Staff Essentials 2026 | **UC4** | `Individual` emp + `Shared` dep pool |
| Jason Teh | EMP-20260115-0005 | Health Screening Programme 2026 | **UC5** | `Shared` family pot (entire family shares) |
| Ahmad Faizal | EMP-20260115-0006 | Executive Benefits Programme 2026 | **Extended** | `Individual` emp + `Individual` dep wallets + split amounts |
