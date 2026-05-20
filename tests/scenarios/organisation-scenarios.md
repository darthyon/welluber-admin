# Organisation Creation — Scenario Test Cases

Covers the **2-step Create Organisation wizard** and **new org onboarding state**.

Key invariant: a freshly created organisation has ALL onboarding steps incomplete except "Organisation Details" (auto-completed on creation). Any mock data representing a new org MUST reflect this.

---

## Onboarding Checklist — New Org Expected State

| Checklist Step | Key | Completion Logic | New Org State |
|----------------|-----|-----------------|---------------|
| Organisation Details | `details` | Always true after creation | ✓ Complete |
| Tier Configs | `tiers` | `tierConfigs.length > 0` | ✗ Incomplete |
| Employees | `employees` | `employeeCount > 0` | ✗ Incomplete |
| Policies Assigned | `policies` | `policies.length > 0` | ✗ Incomplete |
| Activated | `activated` | Manual action only | ✗ Incomplete |

A new org must have: `status: "inactive"`, `employeeCount: 0`, `tierConfigs: []`, `policies: []`.  
The checklist is only visible when `status === "inactive"` — it disappears once the org is activated.

---

## CREATE — Step 1: Organisation Details

### ORG-ADD-01 · Happy path: complete Step 1 → advance to Step 2

**Actor:** Host admin  
**Precondition:** On `/organizations/new`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter company name "Maju Retail Sdn Bhd" | Field accepts input |
| 2 | Select Industry: Retail | Dropdown selects |
| 3 | Set Financial Year Start: March 2026 | Date picker accepts, stored as ISO date |
| 4 | Enter Registration Number: 202301012345 | Accepted |
| 5 | Enter TIN: C12345678090 | Accepted |
| 6 | Select Org Type: Sdn. Bhd. | Document hint updates to "SSM Section 14 & 17" |
| 7 | Upload compliance document | File attached, shown in doc list |
| 8 | Fill business address: 12 Jalan Ampang, KL, Selangor, Malaysia, 50450 | LocationData populated |
| 9 | Fill bank details: Maybank / 5142000123456 / Maju Retail Sdn Bhd | Accepted |
| 10 | Click "Next" | Step 1 validates, Step 2 (HQ Branch) loads |

**Valid** ✓

---

### ORG-ADD-02 · Financial year start = March → affects policy refresh reference

**Actor:** Host admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set financialYearStart = March (e.g. Maju Retail uses March FY) | Stored as 2026-03-01 |
| 2 | Complete wizard | Org created with correct FY start |
| 3 | Create a flexi benefit policy for this org with refreshStartReference = "financial_year" | Refresh aligns to March, not January |

**Valid** ✓ — FY start must flow through to policy config

---

### ORG-ADD-03 · Org type drives document label

**Actor:** Host admin

| Org Type Selected | Expected Document Hint |
|-------------------|------------------------|
| Sole Proprietorship | Form D / MyCoID |
| Partnership | Form A / Partnership Deed |
| Sdn. Bhd. | SSM Section 14 & 17 |
| LLP | LLP Registration Certificate |
| Bhd. | Prospectus & SSM Cert |
| CLBG | Memorandum & Articles |

**Valid** ✓ — each type maps to correct compliance doc label

---

### ORG-ADD-04 `[INVALID]` · Step 1 — blank company name

| Step | Action | Expected |
|------|--------|----------|
| 1 | Leave name blank, fill all other fields | No error shown yet |
| 2 | Click "Next" | Error "Company name is required" under name field, cannot advance |

**Invalid** ✗

---

### ORG-ADD-05 `[INVALID]` · Step 1 — malformed TIN

| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter TIN: "NOTATIN" | Field accepts characters |
| 2 | Click "Next" | Error "Invalid TIN format", cannot advance |

**Invalid** ✗

---

### ORG-ADD-06 `[INVALID]` · Step 1 — missing bank account details

| Step | Action | Expected |
|------|--------|----------|
| 1 | Fill all fields except bank account section | Payment Details section empty |
| 2 | Click "Next" | Error on bankName, accountNumber, accountName fields — all required |

**Invalid** ✗

---

## CREATE — Step 2: HQ Branch Configuration

### ORG-ADD-07 · Happy path: new account → org created inactive

**Actor:** Host admin  
**Precondition:** Step 1 complete

| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter branch name "Kuala Lumpur HQ" | Accepted |
| 2 | Fill location with lat/lon from address picker | LocationData populated with coordinates |
| 3 | Select "New Account" | Account name + credit limit fields appear, currency locked to MYR |
| 4 | Enter account name "KS Main Account", credit limit RM 50,000 | Accepted |
| 5 | Click "Create Organisation" | Org created with status "inactive", HQ branch created |
| 6 | Redirected to org detail page | Onboarding checklist visible (status = inactive) |
| 7 | Check checklist | Details ✓, Tiers ✗, Employees ✗, Policies ✗, Activated ✗ |

**Valid** ✓ — this is the canonical new org state

---

### ORG-ADD-08 · Use existing account

**Actor:** Host admin  
**Precondition:** MOCK_ACCOUNTS has at least 1 entry

| Step | Action | Expected |
|------|--------|----------|
| 1 | Select "Existing Account" radio | Dropdown appears showing available accounts; credit limit field hidden |
| 2 | Select account from dropdown | Account ID captured |
| 3 | Submit | Org created, branch linked to existing account |

**Valid** ✓

---

### ORG-ADD-09 `[INVALID]` · New account with credit limit = 0

| Step | Action | Expected |
|------|--------|----------|
| 1 | Select "New Account", set credit limit = 0 | Field accepts 0 |
| 2 | Click "Create Organisation" | Error "Credit limit must be greater than 0" |

**Invalid** ✗

---

### ORG-ADD-10 `[INVALID]` · Branch name empty

| Step | Action | Expected |
|------|--------|----------|
| 1 | Leave branch name blank, fill all other Step 2 fields | No error yet |
| 2 | Click "Create Organisation" | Error "Branch name is required" |

**Invalid** ✗

---

## NEW ORG — Onboarding Checklist Scenarios

### ORG-ONBOARD-01 · New org checklist: all incomplete except Details

**Actor:** Host admin  
**Precondition:** Org just created via wizard (employeeCount: 0, tierConfigs: [], policies: [])

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to org detail page | Onboarding checklist visible (org is inactive) |
| 2 | Inspect each checklist item | Details ✓, Tiers ✗, Employees ✗, Policies ✗, Activated ✗ |
| 3 | "needsAction" pills | Shows ["Missing PIC", "No Employees", "No Policy"] |

**Valid** ✓ — 4 of 5 steps incomplete is correct for a brand-new org

---

### ORG-ONBOARD-02 · Tier Configs step completes after first tier added

**Precondition:** Org has no tiers

| Step | Action | Expected |
|------|--------|----------|
| 1 | Checklist: Tiers shows ✗ | tierConfigs.length = 0 |
| 2 | Navigate to Employees → Tiers sub-tab, add tier "Band A" | Tier saved, tierConfigs.length = 1 |
| 3 | Return to org detail | Checklist: Tiers now ✓ |

**Valid** ✓

---

### ORG-ONBOARD-03 · Employees step completes after first employee added

**Precondition:** Org has no employees

| Step | Action | Expected |
|------|--------|----------|
| 1 | Checklist: Employees shows ✗ | employeeCount = 0 |
| 2 | Add one employee | employeeCount = 1 |
| 3 | Return to org detail | Checklist: Employees now ✓ |

**Valid** ✓

---

### ORG-ONBOARD-04 · Policies step completes after first policy assigned

**Precondition:** Org has no policies

| Step | Action | Expected |
|------|--------|----------|
| 1 | Checklist: Policies shows ✗ | policies.length = 0 |
| 2 | Assign a policy to this org | policies.length = 1 |
| 3 | Return to org detail | Checklist: Policies now ✓ |

**Valid** ✓

---

### ORG-ONBOARD-05 · Activated step never auto-completes

**Precondition:** All other steps complete

| Step | Action | Expected |
|------|--------|----------|
| 1 | Tiers ✓, Employees ✓, Policies ✓ | Three of four manual steps done |
| 2 | Checklist: Activated | Still shows ✗ — must be manually triggered |
| 3 | Activate org via Settings tab | Status changes to "active" |
| 4 | Checklist disappears | Checklist only shows when status = "inactive" |

**Valid** ✓

---

### ORG-ONBOARD-06 `[INVALID DATA]` · Existing mock org showing random completed steps

**Precondition:** Mock seed contains an org with `status: "inactive"` but `employeeCount: 120`, `tierConfigs: [{...}]`

| Observation | Expected | Actual |
|-------------|----------|--------|
| Checklist: Employees | ✗ (new org, no employees) | ✓ (120 employees — impossible for truly new org) |
| Checklist: Tiers | ✗ | ✓ (pre-existing tiers) |

**Invalid Data** ✗ — mock data that marks an org "inactive" but has existing employees/tiers misrepresents the onboarding flow. New orgs in `status: "inactive"` must start with zero of everything.

---

## Believable New Org Fixtures

Three named fixtures representing realistic newly-onboarded organisations. All have `status: "inactive"` and the correct blank-slate state.

### Fixture A — Maju Retail Sdn Bhd

```typescript
{
  name: "Maju Retail Sdn Bhd",
  registrationNumber: "202401089231",
  industry: "Retail",
  type: "sdn_bhd",
  financialYearStart: "2026-01-01",
  tinNumber: "C20240108923",
  state: "Selangor",
  country: "Malaysia",
  status: "inactive",
  subscription: { plan: "standard", status: "inactive", startDate: "2026-04-01" },
  employeeCount: 0,
  utilizationRate: 0,
  totalAccountBalance: 0,
  accountLimit: 50000,
  creditLimit: 50000,
  tierConfigs: [],
  departmentConfigs: [],
  policies: [],
  branches: ["Shah Alam HQ"],
  needsAction: ["Missing PIC", "No Employees", "No Policy"],
  claimsCount: 0,
}
```

**Checklist:** Details ✓ · Tiers ✗ · Employees ✗ · Policies ✗ · Activated ✗

---

### Fixture B — Borneo Logistics Partners

```typescript
{
  name: "Borneo Logistics Partners",
  registrationNumber: "202501045678",
  industry: "Logistics",
  type: "partnership",
  financialYearStart: "2026-04-01",  // FY starts April
  tinNumber: "D20250104567",
  state: "Sabah",
  country: "Malaysia",
  status: "inactive",
  subscription: { plan: "standard", status: "inactive", startDate: "2026-05-01" },
  employeeCount: 0,
  utilizationRate: 0,
  totalAccountBalance: 0,
  accountLimit: 30000,
  creditLimit: 30000,
  tierConfigs: [],
  departmentConfigs: [],
  policies: [],
  branches: ["Kota Kinabalu HQ"],
  needsAction: ["Missing PIC", "No Employees", "No Policy"],
  claimsCount: 0,
}
```

**Checklist:** Details ✓ · Tiers ✗ · Employees ✗ · Policies ✗ · Activated ✗  
**Note:** April FY start — policy refresh reference "financial_year" will cycle from April.

---

### Fixture C — TechVenture MY Sdn Bhd

```typescript
{
  name: "TechVenture MY Sdn Bhd",
  registrationNumber: "202601001122",
  industry: "Technology",
  type: "sdn_bhd",
  financialYearStart: "2026-01-01",
  tinNumber: "C20260100112",
  state: "Kuala Lumpur",
  country: "Malaysia",
  status: "inactive",
  subscription: { plan: "premium", status: "inactive", startDate: "2026-05-15" },
  employeeCount: 0,
  utilizationRate: 0,
  totalAccountBalance: 0,
  accountLimit: 100000,
  creditLimit: 100000,
  tierConfigs: [],
  departmentConfigs: [],
  policies: [],
  branches: ["KLCC HQ"],
  needsAction: ["Missing PIC", "No Employees", "No Policy"],
  claimsCount: 0,
}
```

**Checklist:** Details ✓ · Tiers ✗ · Employees ✗ · Policies ✗ · Activated ✗  
**Note:** Premium plan — higher account limit reflects enterprise-tier expectation.
