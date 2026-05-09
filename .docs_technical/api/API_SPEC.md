# API Specification

> **Status:** Draft — inferred from server actions and entity types. Not yet implemented.
> **Auth:** All endpoints require a valid Firebase ID token in `Authorization: Bearer {token}`
> **Base URL:** `https://api.welluber.com/v1` (production) | `http://localhost:3001/v1` (local)
> **Content-Type:** `application/json`
> **Currency:** All monetary values in MYR (Malaysian Ringgit)

---

## Authentication

```
Authorization: Bearer {firebase-id-token}
X-Tenant-Id: {tenantId}   ← optional; derived from token claims if omitted
```

Token claims (see [MULTI_TENANCY.md](../architecture/MULTI_TENANCY.md)):
- `role`: determines access scope
- `entityId`: the org or SP this admin manages
- `permissions[]`: fine-grained permission list

---

## Response Envelope

All responses follow:

```typescript
// Success
{ success: true, data: T, meta?: { total, page, pageSize } }

// Error
{ success: false, error: { code: string, message: string, details?: any } }
```

---

## Organizations

### `GET /organizations`
List organizations.

**Permissions:** `org:read`

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | `OrganizationStatus` | Filter by status |
| `search` | `string` | Name/registration search |
| `needsAction` | `string` | Filter by triage flag |
| `page` | `number` | Default: 1 |
| `pageSize` | `number` | Default: 20 |

**Response:** `{ data: Organization[], meta: PaginationMeta }`

---

### `POST /organizations`
Create a new organization.

**Permissions:** `org:write` (host only)

**Body:**
```typescript
{
  name: string
  legalIdentity: string
  registrationNumber: string
  industry: string
  type: "sme" | "enterprise" | "ngo"
  financialYearStart: ISODate
  subscription: { plan: "standard" | "premium" | "enterprise" }
  tinNumber: string
  bankName: string
  bankAccountNumber: string
  bankAccountName: string
  hqBranch: {
    name: string
    address: Address
    timezone: string
    pics: PIC[]
  }
}
```

**Response:** `{ data: Organization & { hqBranch: OrganizationBranch } }`

---

### `GET /organizations/{orgId}`
Get organization by ID.

**Permissions:** `org:read` (scoped to `entityId` for org admins)

**Response:** `{ data: Organization }`

---

### `PATCH /organizations/{orgId}`
Update organization fields.

**Permissions:** `org:write`

**Body:** Partial `Organization` fields

---

### `DELETE /organizations/{orgId}`
Deactivate organization (sets `status: deactivated`). Irreversible without host override.

**Permissions:** `org:delete` (host only)

---

### `POST /organizations/{orgId}/admins`
Invite an org admin (sends magic link).

**Permissions:** `org:write`

**Body:** `{ name: string, email: string }`

---

### `GET /organizations/{orgId}/branches`
List branches for an org.

**Response:** `{ data: OrganizationBranch[] }`

---

### `POST /organizations/{orgId}/branches`
Create a new branch.

**Body:** `OrganizationBranch` fields (without `id`, `orgId`)

---

---

## Employees

### `GET /employees`
List employees. Scoped to `entityId` for org admins.

**Query params:** `orgId`, `branchId`, `status`, `search`, `employmentType`, `page`, `pageSize`

---

### `POST /employees`
Create employee (manual add).

**Permissions:** `employee:write`

**Body:** `Employee` fields (without `id`)

---

### `POST /employees/bulk`
Bulk create employees from CSV data.

**Body:** `{ employees: CreateEmployeeInput[], orgId: string }`

**Response:** `{ data: { created: number, failed: number, errors: RowError[] } }`

---

### `GET /employees/{empId}`
Get employee by ID.

---

### `PATCH /employees/{empId}`
Update employee fields.

---

### `POST /employees/{empId}/deactivate`
Offboard employee. Immediately stops benefit access.

---

### `GET /employees/{empId}/eligibility`
Check which policies an employee qualifies for.

**Query params:** `serviceId` — check eligibility for a specific service

---

---

## Benefit Policies

### `GET /policies`
List policies. Host sees all; org admins see policies for their org.

**Query params:** `orgId`, `status`, `search`

---

### `POST /policies`
Create policy (draft).

**Permissions:** `policy:write`

**Body:** `BenefitPolicy` fields + `groups: BenefitGroup[]` + `benefits: Benefit[][]`

---

### `GET /policies/{policyId}`
Get policy with groups and benefits.

---

### `PATCH /policies/{policyId}`
Update policy (allowed on `draft`; restricted fields on `active`).

---

### `POST /policies/{policyId}/activate`
Activate policy. Requires `organizationId` set.

---

### `POST /policies/{policyId}/deactivate`
Deactivate active policy.

---

### `POST /policies/{policyId}/versions`
Create a policy version (targeted variant).

**Body:** `{ targetEmployeeIds: string[], overrides: Partial<BenefitPolicy & { groups, benefits }> }`

---

### `POST /policies/{policyId}/clone`
Clone a policy into a new draft.

---

---

## Service Providers

### `GET /service-providers`
List SPs.

**Query params:** `brandId`, `status`, `service`, `search`

---

### `POST /service-providers`
Create SP (pending).

**Body:** Full SP profile including `taxProfile`, `commissionSchema`, first `branch`

---

### `GET /service-providers/{spId}`
Get SP with branches, vouchers, admins.

---

### `PATCH /service-providers/{spId}`
Update SP profile.

---

### `POST /service-providers/{spId}/admins`
Invite SP admin.

**Body:** `{ name: string, email: string, branchIds?: string[] }`

---

### `GET /service-providers/{spId}/branches`
List SP branches.

---

### `POST /service-providers/{spId}/branches`
Create SP branch.

---

### `GET /service-providers/{spId}/vouchers`
List SP vouchers.

---

### `POST /service-providers/{spId}/vouchers`
Create voucher (draft).

---

### `PATCH /service-providers/{spId}/vouchers/{voucherId}`
Update voucher.

---

### `POST /service-providers/{spId}/vouchers/{voucherId}/publish`
Publish voucher.

---

### `POST /service-providers/{spId}/vouchers/{voucherId}/activate`
Manually activate voucher.

---

### `POST /service-providers/{spId}/vouchers/{voucherId}/pause`
Pause active voucher.

---

### `POST /service-providers/{spId}/vouchers/{voucherId}/end`
End voucher campaign.

---

---

## Purchases & Redemptions

### `POST /purchases/validate`
Three-point validation check before purchase.

**Body:** `{ voucherId: string, employeeId: string }`

**Response:** `{ valid: boolean, checks: { benefit: boolean, pool: boolean, wallet: boolean }, reason?: string }`

---

### `POST /purchases/confirm`
Confirm purchase after payment. Issues TOTP code.

**Body:** `{ voucherId: string, employeeId: string, paymentRef?: string, coPaymentRef?: string }`

**Response:** `{ data: { claimId: string, totpCode: string, expiresAt: ISODate } }`

---

### `POST /redemptions/validate`
Validate TOTP code at SP.

**Body:** `{ code: string, spBranchId: string }`

**Response:** `{ valid: boolean, member: MemberSummary, service: string, amount: number, coPaymentAmount: number }`

---

### `POST /redemptions/confirm`
Confirm voucher redemption at SP.

**Body:** `{ code: string, spBranchId: string }`

**Response:** `{ data: VoucherRedemption }`

---

### `POST /claims/walk-in`
Submit a walk-in claim from SP Portal.

**Body:** `{ memberId: string, serviceId: string, branchId: string, amount: number, notes?: string }`

**Response:** `{ data: Claim }`

---

---

## Accounts & Finance

### `GET /accounts`
List org wallet accounts. Scoped to org for org admins.

---

### `POST /accounts`
Create account for org branch.

**Body:** `{ orgId: string, branchId: string, type: "new" | "existing", creditLimit: number }`

---

### `GET /accounts/{accountId}`
Get account with transaction history.

---

### `PATCH /accounts/{accountId}/credit-limit`
Update credit limit.

**Body:** `{ creditLimit: number }`

---

### `POST /accounts/{accountId}/topup`
Submit top-up request (HR initiates).

**Body:** `TopupTransaction` fields

---

### `POST /accounts/{accountId}/topup/{topupId}/approve`
Approve top-up (Host Admin).

---

### `POST /accounts/{accountId}/topup/{topupId}/reject`
Reject top-up.

**Body:** `{ reason: string }`

---

---

## Settlement

### `POST /settlements/aggregate`
Trigger settlement aggregation for an SP.

**Body:** `{ spId: string, periodStart: ISODate, periodEnd: ISODate }`

**Permissions:** `settlement:trigger` (host only)

---

### `POST /settlements/{id}/send-to-sp`
Send settlement statement to SP for review.

---

### `POST /settlements/{id}/approve`
SP approves settlement.

**Permissions:** `settlement:approve` (sp_admin only)

---

### `POST /settlements/{id}/trigger-payout`
Host triggers bank payout.

**Permissions:** `settlement:trigger` (host only)

---

---

## Auth

### `POST /auth/invite`
Send magic link invitation.

**Body:** `{ email: string, name: string, role: UserRole, entityId?: string }`

---

### `POST /identity/link`
Link corporate identity to personal account.

**Body:** `{ token: string }` (from magic link)

---

### `GET /members/lookup`
Look up members for walk-in claim.

**Query params:** `query` (empCode, name, or QR data), `spId`

**Permissions:** `claim:process` (sp_staff)

---

---

## Service Taxonomy

### `GET /taxonomy`
Get full three-tier taxonomy.

---

### `POST /taxonomy/categories`
Create Tier 1 category.

**Permissions:** `platform:config` (host only)

---

### `POST /taxonomy/services`
Create Tier 2 main service.

**Body:** `{ categoryId: string, name: string }`

---

### `POST /taxonomy/sub-services`
Create Tier 3 sub-service.

**Body:** `{ mainServiceId: string, name: string, description?: string }`

---

---

## Audit Log

### `GET /audit-log`
List audit log entries. Immutable.

**Query params:** `entityType`, `entityId`, `type`, `actorEmail`, `from`, `to`, `page`, `pageSize`

**Permissions:** `audit:read`

---

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `auth/invalid-token` | 401 | Firebase token invalid or expired |
| `auth/insufficient-permissions` | 403 | Token lacks required permission |
| `auth/tenant-mismatch` | 403 | Token tenant doesn't match resource |
| `validation/invalid-input` | 400 | Request body validation failed |
| `not-found/{entity}` | 404 | Entity not found |
| `conflict/duplicate` | 409 | Unique constraint violation |
| `purchase/benefit-inactive` | 422 | Check 1 failed — benefit not active |
| `purchase/insufficient-pool` | 422 | Check 2 failed — pool balance low |
| `purchase/wallet-blocked` | 422 | Check 3 failed — org wallet insufficient |
| `redemption/code-invalid` | 422 | TOTP code not found |
| `redemption/code-expired` | 422 | TOTP window expired |
| `redemption/already-redeemed` | 422 | Voucher already used |
| `redemption/branch-mismatch` | 422 | Branch not in voucher scope |
| `server/internal` | 500 | Unexpected server error |
