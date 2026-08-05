# WellUber Admin — Entitlement Pools: Use Cases, UX Audit & Full Page Wireframes

This document is the **single source of truth** for all entitlement pool combinations in WellUber Admin.
It covers every **valid** pool combination and documents wireframes for each, grounded in real mock data.
The five cases resolve to **four pool kinds** — see §1A. Invalid combinations are listed in §3 and must not be re-added.

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

## 1A. Five Use Cases, Four Pool Kinds

The use cases below describe **policy shapes**. The UI does not branch on them —
it branches on the **pool kind** each shape resolves to, of which there are four.
`buildEntitlementGroupPoolDisplay()` in
`features/employees/entitlement-pool-display.ts` performs that resolution, and it
is the only place in the codebase that does.

| Pool kind | Meaning | Dependent quota cell | Reached by |
|---|---|---|---|
| `employee` | No dependents on the group | *(no dependent rows)* | UC1, UC-P |
| `individual` | Each dependent has their own wallet | per-person amount | UC2 |
| `combined` | Employee + dependents share one pot | `Combined Pool`, sub-rows `—` | UC3, UC5 |
| `shared` | Dependents share a pot, separate from the employee | `Combined Pool`, sub-rows `—` | UC4 |

Two things follow, and they are why this document is shorter than it used to be:

1. **UC3 and UC5 render identically.** Different policy shapes
   (`dependentsPoolType: "SharedWithEmployee"` vs `benefitPoolType: "Shared"`),
   same pool kind, so one layout serves both. Do not write a second layout.
2. **Every case is one stacked bar plus one beneficiary table.** Only the
   *Allocated Quota* cell varies. If you find yourself adding a case-specific
   component, you are re-introducing the drift this consolidation removed.

---

## 2. Complete Use Case Matrix (5 Valid Cases)

> [!IMPORTANT]
> **Authoritative UX & Display Standards**:
> 1. **3-Tier Page Hierarchy**: Assigned Policy Header → Allocation Summary → Benefit Group Wallets.
> 2. **Canonical Pool Term**: Shared family allocations display as **`Combined Pool`** in the Allocated Quota column.
> 3. **Org-Wide Shared Pool Banner**: When `benefitPoolType: "Shared"` (UC5), an org pool banner may sit above the Allocation Summary. Not currently implemented — `<EntitlementPools>` renders the summary card only.
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
 WELLUBER ADMIN  |  Acme Corporation Sdn Bhd (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Robert Fox  (EMP-20260115-0001)  |  Team Lead  |  Tech          [ Edit Employee ]
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

> The matrix assigns UC2 to Jenny Wilson; Ahmad is wireframed here instead because
> his six dependents exercise the same pool kind (`individual`) under load — he is
> the case that stresses the per-dependent colour ramp and the overflow band.
*Live: `/employees/EMP-20260115-0006?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC2 Key**: `dependentsPoolType: "Individual"` — each dependent has their own independent quota. No "Combined Pool" label. No dashes. Every row shows a real RM amount.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation Sdn Bhd (ORG-20260115-0001)
-----------------------------------------------------------------------------------------------------------------
  Ahmad Faizal  (EMP-20260115-0006)  |  Operations Manager  |  Operations          [ Edit Employee ]
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
 WELLUBER ADMIN  |  Acme Corporation Sdn Bhd (ORG-20260115-0001)
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
 WELLUBER ADMIN  |  Acme Corporation Sdn Bhd (ORG-20260115-0001)
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

### UC5: Shared Family Pot — Employee + Dependents Share One Pool

**Employee:** Jason Teh (`EMP-20260115-0005`) · Policy `POL-20260115-0012` · `benefitPoolType: "Shared"`

Pool kind: **`combined`**. Employee and dependents draw on one ceiling, so every
dependent sub-row shows `—` in Allocated Quota and Balance Left. Wireframe is
identical to UC3 — same pool kind, reached by a different policy shape. That is
the point of collapsing to four kinds: one layout serves both.

```
 ALLOCATION SUMMARY
 Total Allocated: RM 2,000.00     Total Used: RM 650.00     Total Balance Left: RM 1,350.00
 [ Purple: Employee (RM 550) ][ Teal: Dependents (RM 100) ][ Gray: Balance (RM 1,350) ]

 Beneficiary                 Allocated Quota   Spent        Balance Left
 Employee                    RM 2,000.00       RM 550.00    RM 1,350.00
 Dependents                  Combined Pool     RM 100.00    Shared
   Mei Teh (Spouse)          —                 RM  50.00    —
   Ryan Teh (Child)          —                 RM  50.00    —
```

---

> [!WARNING]
> **UC6, UC7 and UC8 were removed — they documented invalid product states.**
>
> They described `benefitPoolType: "Shared"` combined with an explicit
> `dependentsPoolType`. That combination is not supported: when the employee
> pool is shared, dependents are already in it, so a separate dependent pool
> type is meaningless. `components/host/employees/employee-entitlements-mock.ts`
> records the matching fixtures (`policyG`/`policyH`/`policyI`, `EMP-0007`–`0009`)
> as deliberately deleted for the same reason.
>
> They are not "not yet built" — do not re-add branches for them.

---


### UC-P: Prorated Individual — No Dependents
**Marvin McKinney** · `EMP-20260115-0004` · Contract Staff Essentials 2026
*Live: `/employees/EMP-20260115-0004?from=ORG-20260115-0001&tab=benefits`*

> [!NOTE]
> **UC-P Key**: `utilisationMode: "Prorated"` — balance is not a fixed lump sum. It accrues monthly based on employment tenure. Show a prorated notice below Allocation Summary.

```
=================================================================================================================
 WELLUBER ADMIN  |  Acme Corporation Sdn Bhd (ORG-20260115-0001)
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
