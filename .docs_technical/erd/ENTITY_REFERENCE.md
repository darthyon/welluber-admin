# Entity Reference

> Per-entity field tables with types, required status, and descriptions.
> Source: `types/`, `features/*/types.ts` in `welluber-admin`.

---

## Table of Contents

- [Org Domain](#org-domain)
- [Policy Domain](#policy-domain)
- [Service Provider Domain](#service-provider-domain)
- [Finance Domain](#finance-domain)
- [Claim Domain](#claim-domain)
- [User & Auth Domain](#user--auth-domain)
- [Service Taxonomy](#service-taxonomy)
- [Status Enums](#status-enums)
- [Key Relationships](#key-relationships)

---

## Org Domain

### Organization
Source: `features/organizations/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier |
| `name` | `string` | ✅ | Company display name |
| `legalIdentity` | `string` | ✅ | Legal company name (for contracts/invoices) |
| `registrationNumber` | `string` | ✅ | SSM or equivalent company registration number |
| `industry` | `string` | ✅ | Primary industry category |
| `subIndustry` | `string` | — | More specific sub-industry |
| `type` | `"sme" \| "enterprise" \| "ngo"` | ✅ | Organization size/type |
| `financialYearStart` | `ISODate` | ✅ | Used to calculate FY-based policy refresh cycles |
| `subscription.plan` | `"standard" \| "premium" \| "enterprise"` | ✅ | WellUber subscription tier |
| `subscription.status` | `OrganizationStatus` | ✅ | Current subscription status |
| `subscription.startDate` | `ISODate` | ✅ | Subscription start |
| `subscription.endDate` | `ISODate` | — | Subscription end (null = ongoing) |
| `status` | `OrganizationStatus` | ✅ | Platform-level org status |
| `tinNumber` | `string` | ✅ | Malaysian Tax Identification Number |
| `bankName` | `string` | ✅ | For settlement payouts |
| `bankAccountNumber` | `string` | ✅ | For settlement payouts |
| `bankAccountName` | `string` | ✅ | For settlement payouts |
| `employeeCount` | `number` | ✅ | Total registered employees |
| `utilizationRate` | `number` | ✅ | % of benefit allocation used (0-100) |
| `totalAccountBalance` | `number` | ✅ | Total wallet balance (RM) across all accounts |
| `accountLimit` | `number` | ✅ | Max balance ceiling |
| `creditLimit` | `number` | ✅ | Host-granted overdraft limit |
| `picId` | `string \| null` | — | Person in Charge (admin user ID) |
| `logo` | `string` | — | Logo URL |
| `needsAction` | `string[]` | — | Triage flags (e.g., "missing PIC", "no policies") |
| `tierConfigs` | `OrgTierConfig[]` | — | Employee tier definitions (e.g., Junior, Senior) |
| `departmentConfigs` | `OrgDepartmentConfig[]` | — | Department definitions |
| `createdAt` | `ISODate` | ✅ | |
| `updatedAt` | `ISODate` | ✅ | |

### OrganizationBranch
Source: `features/organizations/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `orgId` | `string` | ✅ | FK → Organization |
| `name` | `string` | ✅ | Branch name |
| `type` | `"hq" \| "branch"` | ✅ | HQ = main office; branch = satellite |
| `address.line` | `string` | ✅ | Street address |
| `address.city` | `string` | ✅ | |
| `address.state` | `string` | ✅ | |
| `address.country` | `string` | ✅ | |
| `address.postalCode` | `string` | ✅ | |
| `address.lat` | `number` | — | |
| `address.lon` | `number` | — | |
| `timezone` | `string` | ✅ | IANA timezone string |
| `active` | `boolean` | ✅ | |
| `pics` | `{name, email, contactNo}[]` | — | Branch PICs |

### Employee
Source: `features/employees/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `orgId` | `string` | ✅ | FK → Organization |
| `branchId` | `string` | ✅ | FK → OrganizationBranch |
| `name` | `string` | ✅ | |
| `email` | `string` | ✅ | Corporate email (used for identity linking) |
| `empCode` | `string` | ✅ | Unique per org — used for walk-in lookup |
| `departmentId` | `string` | — | FK → OrgDepartmentConfig |
| `tierId` | `string` | — | FK → OrgTierConfig (for policy eligibility) |
| `dateOfBirth` | `ISODate` | ✅ | Required for age-based eligibility |
| `gender` | `"male" \| "female" \| "other"` | — | |
| `mobileNumber` | `string` | — | |
| `joinDate` | `ISODate` | ✅ | Used for prorated benefit calculation |
| `probationEndDate` | `ISODate` | — | Required if `activationMode = after_probation` |
| `employmentType` | `"full_time" \| "part_time" \| "contract" \| "internship"` | ✅ | Used for policy eligibility filtering |
| `status` | `"active" \| "inactive"` | ✅ | |
| `isProbation` | `boolean` | ✅ | Derived from probationEndDate vs today |

### Dependent
Source: `features/employees/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `employeeId` | `string` | ✅ | FK → Employee |
| `name` | `string` | ✅ | |
| `relationship` | `DependentRelationship` | ✅ | |
| `status` | `"active" \| "inactive"` | ✅ | |
| `joinDate` | `string` | ✅ | |

---

## Policy Domain

### BenefitPolicy
Source: `types/policy.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `organizationId` | `string` | ✅ | FK → Organization — policy is org-specific |
| `code` | `string` | — | Short identifier (e.g., "POL-2024-A") |
| `name` | `string` | ✅ | Display name |
| `description` | `string` | — | |
| `status` | `PolicyStatus` | ✅ | `draft \| active \| deactivated` |
| `eligibleEmploymentTypes` | `string[]` | ✅ | Which employee types qualify |
| `coversDependents` | `boolean` | ✅ | Whether dependents can use this policy |
| `benefitPoolType` | `"Individual" \| "Shared"` | ✅ | Individual = per-employee pool; Shared = shared across group |
| `dependentsPoolType` | `"Individual" \| "Shared" \| "SharedWithEmployee"` | — | Only when `coversDependents = true` |
| `utilisationMode` | `"Fixed" \| "Prorated"` | ✅ | Fixed = full amount from day 1; Prorated = calculated from join date |
| `prorateUnit` | `"Daily" \| "Weekly" \| "Monthly" \| "Quarterly"` | — | Required when `utilisationMode = Prorated` |
| `refreshCycle` | `RefreshCycle` | ✅ | How often the pool resets |
| `refreshStartReference` | `"fy_start" \| "join_date" \| "custom_date"` | ✅ | When the refresh cycle starts |
| `activationMode` | `"after_join" \| "after_probation" \| "custom_date"` | ✅ | When benefits become active for new employees |
| `totalCapAmount` | `number` | — | Employee spending ceiling (RM). Null = uncapped |
| `dependentsCapAmount` | `number` | — | Dependent spending ceiling (RM) |
| `eligibility.minAge` | `number` | — | |
| `eligibility.maxAge` | `number` | — | |
| `eligibility.gender` | `"male" \| "female" \| "all"` | — | |
| `eligibility.tierIds` | `string[]` | — | Restrict to specific tiers |
| `eligibility.departmentIds` | `string[]` | — | Restrict to specific departments |
| `parentPolicyId` | `string` | — | Present = this is a version of another policy |
| `targetEmployeeIds` | `string[]` | — | Pinned employees for this version |
| `templateId` | `string` | — | PolicyTemplate used to seed this policy |
| `clonedFrom` | `string` | — | Source policy ID if cloned |

### BenefitGroup
Source: `types/policy.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `policyId` | `string` | ✅ | FK → BenefitPolicy |
| `name` | `string` | ✅ | e.g., "Health", "Fitness", "Wellness" |
| `description` | `string` | — | |
| `distributionType` | `"SharedAmount" \| "IndividualBenefitAmount"` | ✅ | How the group budget is distributed across benefits |
| `maxUsagePerCycle` | `number` | — | Max redemptions per refresh cycle |

### Benefit
Source: `types/policy.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `groupId` | `string` | ✅ | FK → BenefitGroup |
| `serviceId` | `MainServiceId` | ✅ | FK → MainService (Tier 2 taxonomy ID) |
| `amount` | `number` | ✅ | Total RM allocation for this service |
| `employeeAmount` | `number` | — | Employee portion when split (only if `coversDependents`) |
| `dependantAmount` | `number` | — | Dependent portion when split |
| `coPayment.required` | `boolean` | ✅ | |
| `coPayment.type` | `"Percentage" \| "Fixed"` | — | Required if `coPayment.required = true` |
| `coPayment.value` | `number` | — | % or RM amount employee pays |

---

## Service Provider Domain

### Brand
Source: `types/brand.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `name` | `string` | ✅ | Brand name (e.g., "Celebrity Fitness") |
| `logo` | `string` | — | |
| `status` | `"active" \| "inactive" \| "removed"` | ✅ | |
| `serviceCategories` | `string[]` | ✅ | Tier 1 categories this brand operates in |
| `assignedSpCount` | `number` | ✅ | Number of SPs under this brand |
| `createdAt` | `ISODate` | ✅ | |
| `updatedAt` | `ISODate` | ✅ | |

### ServiceProvider
Source: `types/provider.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `brandId` | `string` | ✅ | FK → Brand |
| `name` | `string` | ✅ | SP display name |
| `registrationNo` | `string` | ✅ | Company registration number |
| `logo` | `string` | — | |
| `status` | `ServiceProviderStatus` | ✅ | |
| `mainServices` | `string[]` | ✅ | Selected Tier 2 services this SP offers |
| `serviceCategories` | `string[]` | ✅ | Derived Tier 1 categories |
| `taxProfile.isTaxRegistered` | `boolean` | ✅ | Determines if SST applies |
| `taxProfile.taxRegNo` | `string` | — | Required if tax registered |
| `taxProfile.taxRate` | `number` | ✅ | e.g., 0.08 = 8% SST |
| `businessType` | `"sdn_bhd" \| "sole_prop" \| "partnership_llp"` | — | |
| `tinNumber` | `string` | — | Tax Identification Number |
| `bankInfo` | `{bankName, accountNumber, accountName}` | — | For settlement payouts |
| `createdAt` | `ISODate` | ✅ | |
| `updatedAt` | `ISODate` | ✅ | |

### SpVoucher
Source: `types/provider.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `spId` | `string` | ✅ | FK → ServiceProvider |
| `code` | `string` | ✅ | Auto-generated: `PAC{SPID}NNNN` |
| `name` | `string` | ✅ | |
| `description` | `string` | ✅ | |
| `status` | `SpVoucherStatus` | ✅ | `draft \| published \| activated \| paused \| ended` |
| `bookingRequired` | `boolean` | ✅ | If true, member must book before using |
| `serviceLines` | `ServiceLine[]` | ✅ | Services covered and their sub-services |
| `activationPeriod.startDate` | `ISODate` | ✅ | When voucher becomes purchasable |
| `activationPeriod.endDate` | `ISODate` | — | Null = no end date |
| `currency` | `string` | ✅ | "MYR" (only supported currency in v1) |
| `initialPrice` | `number` | ✅ | Base price before any discount |
| `finalPrice` | `number` | ✅ | Gross price (SST-inclusive if applicable) |
| `validationDuration` | `{unit, value}` | — | How long the voucher is valid after activation |
| `redemptionPeriod.mode` | `"exact_date" \| "after_purchase"` | ✅ | |
| `membershipStartDay` | `"none" \| "1st" \| "15th"` | ✅ | For membership-style vouchers |
| `branchScope` | `"all" \| "specific"` | ✅ | |
| `branchIds` | `string[]` | — | Required if `branchScope = specific` |

---

## Finance Domain

### Account
Source: `features/accounts/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `orgId` | `string` | ✅ | FK → Organization |
| `branchId` | `string` | ✅ | FK → OrganizationBranch |
| `orgName` | `string` | ✅ | Denormalized for query efficiency |
| `branchName` | `string` | ✅ | Denormalized for query efficiency |
| `type` | `"new" \| "existing"` | ✅ | Whether account was opened on WellUber or migrated |
| `balance` | `number` | ✅ | Current wallet balance (RM) |
| `pendingDeductions` | `number` | ✅ | Pre-authorized amounts not yet settled |
| `status` | `"active" \| "suspended" \| "closed"` | ✅ | |

### AccountTransaction
Source: `features/accounts/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `accountId` | `string` | ✅ | FK → Account |
| `type` | `TransactionType` | ✅ | `topup \| deduction \| pre-auth \| cancelled \| reversal \| settlement` |
| `amount` | `number` | ✅ | RM value |
| `balanceBefore` | `number` | ✅ | Immutable — balance before this transaction |
| `balanceAfter` | `number` | ✅ | Immutable — balance after this transaction |
| `referenceId` | `string` | — | External payment reference |
| `voucherName` | `string` | — | For deduction types (denormalized) |
| `claimId` | `string` | — | FK → Claim |
| `description` | `string` | ✅ | Human-readable description |
| `performedBy` | `string` | ✅ | User email who triggered this |
| `createdAt` | `ISODate` | ✅ | Immutable — 7-year retention required |

### TopupTransaction
Source: `features/manual-topup/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `orgId` | `string` | ✅ | FK → Organization |
| `branchId` | `string` | ✅ | FK → OrganizationBranch |
| `accountId` | `string` | ✅ | FK → Account |
| `amount` | `number` | ✅ | RM amount |
| `method` | `"bank_transfer" \| "cheque" \| "cash" \| "credit_card"` | ✅ | |
| `paidDate` | `ISODate` | ✅ | Date payment was made |
| `status` | `"pending" \| "completed" \| "failed" \| "rejected"` | ✅ | |
| `remarks` | `string` | — | HR notes |
| `attachmentUrl` | `string` | — | Payment proof document |
| `referenceNo` | `string` | — | Bank transaction reference |

---

## Claim Domain

### Claim
Source: `types/claims.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `employeeId` | `string` | ✅ | FK → Employee |
| `voucherCode` | `string` | ✅ | |
| `voucherName` | `string` | — | Denormalized |
| `transactionType` | `"redemption" \| "reimbursement" \| "refund"` | ✅ | |
| `service` | `string` | ✅ | Service name |
| `provider` | `string` | ✅ | SP name |
| `location` | `string` | ✅ | Branch name/address |
| `date` | `string` | ✅ | Service date |
| `amount` | `number` | ✅ | RM amount |
| `status` | `"pre-auth" \| "confirmed" \| "cancelled"` | ✅ | |

### GeneratedVoucher
Source: `features/voucher-packages/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `voucherPackageId` | `string` | ✅ | FK → SpVoucher package |
| `employeeId` | `string` | ✅ | FK → Employee — who this was issued to |
| `code` | `string` | ✅ | Redemption code |
| `amount` | `number` | ✅ | RM value |
| `status` | `"active" \| "redeemed" \| "expired" \| "cancelled"` | ✅ | |
| `generatedAt` | `ISODate` | ✅ | |
| `redeemedAt` | `ISODate` | — | Null until redeemed |
| `expiresAt` | `ISODate` | — | Null if no expiry |

---

## User & Auth Domain

### Member
Source: `features/users/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Firebase UID |
| `name` | `string` | ✅ | |
| `email` | `string` | ✅ | Personal email (used for Welluber account) |
| `type` | `"Employee" \| "Dependent"` | ✅ | |
| `organizationId` | `string` | ✅ | FK → Organization (via corporate identity) |
| `branchId` | `string` | — | FK → OrganizationBranch |
| `status` | `"Active" \| "Inactive" \| "Pending"` | ✅ | |
| `joinedDate` | `string` | ✅ | |
| `lastActive` | `string` | ✅ | |

### Administrator
Source: `features/users/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `name` | `string` | ✅ | |
| `email` | `string` | ✅ | |
| `role` | `"HostAdmin" \| "OrgAdmin" \| "SPAdmin"` | ✅ | |
| `entityId` | `string` | — | orgId or spId — null for HostAdmin |
| `entityType` | `"Organization" \| "ServiceProvider" \| "Platform"` | — | |
| `status` | `"Active" \| "Inactive"` | ✅ | |
| `joinedDate` | `string` | ✅ | |
| `lastLogin` | `string` | ✅ | |

### AuditLogEntry
Source: `features/audit-log/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | |
| `title` | `string` | ✅ | Short action description |
| `type` | `AuditLogType` | ✅ | `Create \| Update \| Delete \| Approval \| Rejection \| SettingChange \| Login \| Payout` |
| `desc` | `string` | ✅ | Full description |
| `timestamp` | `string` | ✅ | UTC timestamp — 7-year retention |
| `updatedBy.name` | `string` | ✅ | |
| `updatedBy.email` | `string` | ✅ | |
| `entity.id` | `string` | — | The entity that was acted on |
| `entity.type` | `string` | — | `Organization \| ServiceProvider \| Brand \| Policy \| System` |

---

## Service Taxonomy

Three-tier hierarchy managed by Host Admin.

| Tier | Entity | Description |
|------|--------|-------------|
| Tier 1 | `ServiceCategory` | Broad wellness categories (e.g., "Fitness & Exercise") |
| Tier 2 | `MainService` | Specific service types (e.g., "Gym Access", "Personal Training") |
| Tier 3 | `SubService` | Delivery formats (e.g., "Daily Pass", "Monthly Membership") |

Tier 2 (`MainService.id`) is the canonical reference used in `Benefit.serviceId` and `CommissionSchemaRow.mainService`. It is the linking point between what policies allow and what SPs deliver.

---

## Status Enums

| Entity | Status Values |
|--------|--------------|
| Organization | `active \| inactive \| draft \| deactivated \| suspended` |
| BenefitPolicy | `draft \| active \| deactivated` |
| ServiceProvider | `active \| suspended \| pending \| removed` |
| SpVoucher | `draft \| published \| activated \| paused \| ended` |
| Account | `active \| suspended \| closed` |
| Claim | `pre-auth \| confirmed \| cancelled` |
| TopupTransaction | `pending \| completed \| failed \| rejected` |
| AccountTransaction type | `topup \| deduction \| pre-auth \| cancelled \| reversal \| settlement` |
| Employee | `active \| inactive` |
| Dependent | `active \| inactive` |
| OrganizationAdmin | `active \| pending_activation \| suspended` |
| SpAdmin | `active \| pending_activation` |
| Member | `Active \| Inactive \| Pending` |
| Administrator | `Active \| Inactive` |
| GeneratedVoucher | `active \| redeemed \| expired \| cancelled` |
| Brand | `active \| inactive \| removed` |

---

## Key Relationships

| From | To | Via | Cardinality |
|------|-----|-----|-------------|
| Organization | OrganizationBranch | `orgId` | 1:N |
| Organization | Employee | `orgId` | 1:N |
| Organization | BenefitPolicy | `organizationId` | 1:N |
| Organization | Account | `orgId` | 1:N |
| OrganizationBranch | Employee | `branchId` | 1:N |
| OrganizationBranch | Account | `branchId` | 1:N |
| Employee | Dependent | `employeeId` | 1:N |
| Employee | Claim | `employeeId` | 1:N |
| BenefitPolicy | BenefitGroup | `policyId` | 1:N |
| BenefitGroup | Benefit | `groupId` | 1:N |
| Benefit | MainService | `serviceId` | N:1 |
| BenefitPolicy | BenefitPolicy | `parentPolicyId` | self-ref (versions) |
| Brand | ServiceProvider | `brandId` | 1:N |
| ServiceProvider | SpBranch | `spId` | 1:N |
| ServiceProvider | SpVoucher | `spId` | 1:N |
| ServiceProvider | CommissionSchemaRow | `spId` | 1:N |
| SpVoucher | ServiceLine | `spVoucherId` | 1:N |
| Account | AccountTransaction | `accountId` | 1:N |
| Account | TopupTransaction | `accountId` | 1:N |
| Claim | AccountTransaction | `claimId` | 1:1 |
| ServiceCategory | MainService | `categoryId` | 1:N |
| MainService | SubService | `mainServiceId` | 1:N |
