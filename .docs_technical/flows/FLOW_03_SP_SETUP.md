# Flow 3 — Service Provider Setup

**Actors:** Host Admin, SP Admin (invited)
**Platform:** Host Portal (`/service-providers/new`), SP Portal (activation)
**Precondition:** Brand exists (Flow 0), taxonomy configured

---

## Overview

Host Admin registers a wellness service provider, configures their tax profile and commission schedule, adds at least one branch, and invites the SP admin. Commission rates are set per Tier 2 service with volume-tiered pricing. The SP admin activates via magic link and can then create vouchers and manage their team.

---

## Diagram

```mermaid
flowchart TD
    A([Host Admin]) --> B[/service-providers/new]
    B --> C[Basic Info\nname, registration, brand, services]
    C --> D[Select Tier 2 Services\nmainServices array]
    D --> E[Business Details\nbusiness type, TIN, bank info]
    E --> F[Tax Profile\nisTaxRegistered, taxRate]
    F --> G[Commission Schema\nper mainService with tiered rates]
    G --> H[First Branch\naddress, operating hours, contacts]
    H --> I[Review & Create SP]
    I --> J[SP created\nstatus: pending]

    J --> K[Host Admin invites SP Admin\nname + email]
    K --> L[Magic link sent\n60-min expiry]

    L --> M{SP Admin receives}
    M -->|Activates| N[SP Admin account: active\nSP status: active]
    M -->|Expired| O[Host Admin resends]

    N --> P[SP Admin can:\ncreate vouchers, manage branches, view claims]

    G --> G1[Service A: tiers]
    G1 --> G2["Tier 1: 0-100 redemptions @ 10%"]
    G2 --> G3["Tier 2: 101-500 @ 8%"]
    G3 --> G4["Tier 3: 500+ @ 6%"]
```

---

## Steps

### SP Profile Creation

1. **[Host Admin] Basic Info**
   - SP name, registration number
   - Select brand (FK → Brand)
   - Logo URL

2. **[Host Admin] Select Services**
   - Choose Tier 2 services from taxonomy (`mainServices[]`)
   - Tier 1 categories derived automatically from selection

3. **[Host Admin] Business Details**
   - Business type: `sdn_bhd | sole_prop | partnership_llp`
   - TIN number, address
   - Bank info (name, account number, account name)

4. **[Host Admin] Tax Profile**
   - `isTaxRegistered: boolean`
   - If registered: `taxRegNo` and `taxRate` (e.g., 0.08 = 8% SST)
   - Tax profile stored immutably on transactions at the time of creation

5. **[Host Admin] Commission Schema**
   - For each selected `mainService`, define commission tiers
   - Each tier: `limit` (redemption count threshold) + `rate` (0.0–1.0)
   - Example: 0–100 redemptions @ 10%, 101–500 @ 8%, 500+ @ 6%
   - Commission stored immutably on each redemption transaction

6. **[Host Admin] First Branch**
   - Branch name, full address (lat/lon optional)
   - Operating hours (per day: open time, close time, is closed)
   - Contacts: PIC (branch_manager, staff, reception) with public/private flag

7. **[Host Admin] Review and Create**
   - SP created with `status: pending`

8. **[Host Admin] Invite SP Admin**
   - Name + email
   - `SpAdmin` created with `status: pending_activation`
   - Magic link sent (60-min expiry)

### Activation

9. **[SP Admin] Click magic link**
   - Universal link routing
   - Account activated, SP `status` → `active`

---

## Commission Calculation

Commission is calculated at redemption time using the weighted formula:

```
Commission = SUM(finalPrice × weight_i × categoryRate_i)
```

Where:
- `weight_i` = proportion of the voucher's `finalPrice` allocated to service line `i` (based on `ServiceLine` configuration)
- `categoryRate_i` = commission rate for the service's Tier 1 category at the current redemption volume tier

Commission is immutable after transaction creation — the rate at that moment is locked to the transaction record.

---

## Business Rules

- SP must belong to exactly one brand
- Commission schema required for each selected `mainService`
- Tax profile is mandatory — even if not registered (`isTaxRegistered: false`, `taxRate: 0`)
- SST applies only when `isTaxRegistered: true` and `taxRate > 0`
- At least one branch required before SP can create vouchers
- SP admin can manage only branches in their `branchIds` scope

---

## Error States

| Error | Handling |
|-------|---------|
| Brand not found | Validation error — must select existing brand |
| Commission tier gaps | Validation — tiers must cover 0 to ∞ with no gaps |
| Tax rate > 1.0 | Validation error — must be decimal (0.08 not 8) |
| Magic link expired | Host Admin resends invite |
| SP Admin already has account | Warn host; still send invite to link to this SP |

---

## Data Written

| Entity | Action |
|--------|--------|
| ServiceProvider | Created with `status: pending` |
| SpBranch | First branch created |
| CommissionSchemaRow | One per mainService |
| CommissionTier | Multiple per CommissionSchemaRow |
| SpAdmin | Created with `status: pending_activation` |
| AuditLogEntry | Written for SP creation and admin invite |
