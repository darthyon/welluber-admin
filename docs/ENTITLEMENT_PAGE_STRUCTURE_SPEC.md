# WellUber Admin — Standardized Employee Entitlements Page Structure Spec

This document serves as the **authoritative structural specification** for the **Employee Entitlements View** (`app/(org)/[orgSlug]/employees/[employeeId]/page.tsx` and Host Employee View).

It enforces a **person-first structural hierarchy** and a **scalable 2-tone progress bar** that applies consistently across all pool combinations.
Those combinations collapse to **four pool kinds** (§2), all rendered by one component: `components/shared/entitlement-pools.tsx`.

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
>    * 🟣 **Primary Purple** (`bg-primary`): **Employee Spend & Shared Elements**.
>    * 🟢 **Teal** (`bg-teal-500`): **Dependents Combined Spend**.
>    * Colour works on two tiers: **hue** separates employee from dependent;
>      **shade within teal** separates individual dependents (`DEPENDENT_FILL_CLASSES`),
>      collapsing past four into one "N other dependents" band. Tokens only — the org
>      portal previously hardcoded `#0d9488` on the employee segment and `#8b5cf6` on
>      dependents, i.e. the hues inverted against this rule.
> 4. **No Redundant Badges**: Do not render duplicate pill badges next to beneficiary labels. The Allocated Quota column directly conveys the pool structure.

---

## 2. Four Pool Kinds — The Only Thing The UI Branches On

The 12 combinations this document used to enumerate are **policy shapes**, not
layouts. Every one of them renders the same two elements — a stacked bar and a
beneficiary table — and differs only in the *Allocated Quota* cell. The code
resolves each shape to one of **four pool kinds**, in
`buildEntitlementGroupPoolDisplay()`
(`features/employees/entitlement-pool-display.ts`), which is the only place in the
codebase that makes this decision.

| Pool kind | When | Employee quota cell | Dependent quota cell | Dependent balance |
|---|---|---|---|---|
| `employee` | Group has no dependent rows | RM amount | *(no rows)* | — |
| `individual` | `dependentsPoolType: "Individual"` | RM amount | per-person RM amount | per-person RM amount |
| `combined` | `dependentsPoolType: "SharedWithEmployee"` **or** `benefitPoolType: "Shared"` | RM amount | `Combined Pool`, sub-rows `—` | `Shared`, sub-rows `—` |
| `shared` | `dependentsPoolType: "Shared"` | RM amount | `Combined Pool`, sub-rows `—` | `Shared`, sub-rows `—` |

> [!IMPORTANT]
> **One component renders all four.** `components/shared/entitlement-pools.tsx`
> is used by both the host console and the org portal. Before consolidation there
> were three separate implementations of this view and three separate
> calculations, so the same employee showed different numbers depending on which
> console you opened. Do not add a fifth kind or a case-specific component
> without changing the resolver first.

### 2.1 Ceiling Precedence

Two different rules apply at two different scopes. This is deliberate, not a bug:

| Scope | Function | Order |
|---|---|---|
| One group's dependent pool | `sharedAllocated()` | `group.dependentGroupCap` → `policy.dependentCapAmount` → sum of benefit allocations |
| All groups (allocation summary) | `getSharedDependentPoolCeiling()` | `policy.dependentCapAmount` → sum of group caps → fallback |

At group scope the group's own cap is the more specific rule, so it wins. At
policy scope `dependentCapAmount` **is** the total dependent ceiling, so it wins
over summing per-group caps — summing them over-reports whenever several groups
draw on one policy-wide pot.

A single group can never report an allocation above `policy.totalCapAmount`
(`capToPolicyCeiling()`). Without that clamp a combined pool reported the sum of
its benefits (e.g. RM 1,600) while the summary reported the cap (RM 800) — on the
same screen.

---

## 2A. Appendix — The Original 12 Combinations

Retained for traceability. Each maps to one of the four kinds above; none needs
its own layout.

| Combo | Scenario | Pool kind |
|---|---|---|
| **C-01** | Individual Solo Wallet | `employee` |
| **C-02** | Sub-Capped Solo Wallet | `employee` |
| **C-03** | Separate Emp & Dep Wallets | `individual` |
| **C-04** | Role-Differentiated Rates | `individual` |
| **C-05** | Solo + Family Shared Pot | `combined` |
| **C-06** | Sub-Capped Family Shared Pot | `combined` |
| **C-07** | Policy Shared Pool (uncapped) | `combined` |
| **C-08** | Policy Shared Pool + Per-Emp Cap | `combined` |
| **C-09** | Policy Shared Dependent Pool | `shared` |
| **C-10** | Policy Shared Pool + Family Pot | `combined` |
| **C-11** | Hybrid: Solo + Shared Dep Pool | `shared` |
| **C-12** | Multi-Group Flexi Master | mixed — one kind per group |

> [!WARNING]
> Combinations pairing `benefitPoolType: "Shared"` with an explicit
> `dependentsPoolType` are **invalid product states** and are not represented
> above. When the employee pool is shared, dependents are already in it. The
> matching fixtures (`policyG`/`policyH`/`policyI`) and the corresponding UC6–UC8
> wireframes were deleted for this reason — do not re-add them.

---


## 3. Detailed Wireframe: Employee Details Page (`/employees/[id]?tab=benefits`)

```
=================================================================================================================
 WELLUBER ADMIN  │  Acme Corporation Sdn Bhd (ORG-20260115-0001)                                       [Host Admin] 👤 
-----------------------------------------------------------------------------------------------------------------
  👤 Ahmad Faizal  (EMP-20260115-0006)  │  Operations Manager  │  Operations                     [ Edit Employee ]
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
