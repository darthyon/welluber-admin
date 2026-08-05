# Flow — Claims & Vouchers

**Files:** `app/(host)/claims/page.tsx` · `app/(org)/[orgSlug]/claims/page.tsx` ·
`app/(org)/[orgSlug]/vouchers/page.tsx` ·
`components/host/employees/employee-{claims,vouchers}-tab.tsx` ·
`components/shared/{vouchers-table,voucher-detail-sheet,organization-claims-table}.tsx` ·
`types/claims.ts`

**Status:** **read-only throughout.** There are no state transitions anywhere.

## Where Claims Appear

```mermaid
flowchart TD
    CLAIMS[("claims data")]
    CLAIMS --> H["Host /claims
    all orgs, full filter set"]
    CLAIMS --> O["Org /{slug}/claims
    own org only"]
    CLAIMS --> E["Employee detail → Claims tab
    filtered by employeeId"]
    CLAIMS --> U["UtilisationClaimsTable
    drill-down inside utilisation"]
    CLAIMS --> ENT["deriveUsage()
    → entitlement spend"]

    style ENT stroke-width:3px
```

The thick edge is the important one: claims are not just a report. They are the
**ledger entitlement spend is derived from**. Editing a claim amount changes what
the Entitlement tab shows — there is no separate spend figure to update.

## Claim Shape

```mermaid
classDiagram
    class Claim {
        id
        voucherCode
        transactionType: redemption|reimbursement|refund
        service, provider, location, date
        amount
        status: ClaimStatus
    }
    class EmployeeClaim {
        benefitGroup
        employeeId
        beneficiaryId
        benefitId
    }
    class FlatClaimRow {
        employeeId, employeeName
        empCode, branch
    }
    Claim <|-- EmployeeClaim
    Claim <|-- FlatClaimRow
```

`employeeId` + `beneficiaryId` + `benefitId` on `EmployeeClaim` are what make
per-employee filtering and derived spend possible. Before they existed, every
employee's Claims tab showed the same rows.

## Status — Defined vs Used

```mermaid
stateDiagram-v2
    [*] --> pre_auth: reserved
    pre_auth --> confirmed: settled
    pre_auth --> cancelled
    confirmed --> [*]
    cancelled --> [*]
    [*] --> pending_review
    [*] --> flagged
    note right of pending_review
        Defined in ClaimStatus but
        no UI produces or resolves them
    end note
```

`ClaimStatus` declares five values. Only three appear in fixtures. `pending_review`
and `flagged` have **no transition path** — nothing creates them and nothing
clears them.

For entitlement, `confirmed` and `pre-auth` **consume** budget; `cancelled`,
`pending_review`, `flagged` do not.

## Vouchers

```mermaid
flowchart LR
    VP["Voucher package"] --> GV["GeneratedVoucher
    code, employeeId, amount, status"]
    GV --> ST{"status"}
    ST --> A["active"]
    ST --> R["redeemed"]
    ST --> EX["expired"]
    ST --> CA["cancelled"]
    R --> VR["VoucherRedemption
    redeemedBy, redeemedByType"]
    VR --> CLM["appears as a claim"]
```

`redeemedByType: Employee | Dependent` mirrors the beneficiary split entitlement
uses. Voucher packages live under host `/voucher-packages/[id]/vouchers`.

## Gaps

- **No claim actions.** Row actions in `app/(host)/claims/page.tsx` are literally
  `onClick: () => {}`. Approve / reject / flag do not exist, so two of the five
  declared statuses are unreachable.
- **Read-only end to end.** No claim or voucher can be created, edited, or
  transitioned from the UI.
- **Two `VoucherRedemption` types.** One in `types/claims.ts`
  (`employeeId`, `employeeName`, `empCode`), another in
  `features/employees/types.ts` (`category`, `benefitType`, `redeemedByType`).
  The tabs import the latter. They should be reconciled.
- **Global vs per-employee claim sets are separate.** `MOCK_CLAIMS` (10 rows,
  `GlobalClaimRow`) and `MOCK_EMPLOYEE_CLAIMS` (31 rows, `EmployeeClaim`) are
  different datasets. Only the second drives entitlement, so host `/claims`
  totals and employee entitlement do not reconcile.
