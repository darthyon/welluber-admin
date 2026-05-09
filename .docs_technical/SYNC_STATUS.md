# Sync Status

> Track what's documented vs. new additions from the designer's repo.

**Last synced:** 2026-05-09
**Synced from branch:** `main` (commit `4dfc730`)

---

## How to Sync

Before starting new documentation work:

```bash
# See what the designer has merged recently
git log --oneline -20

# Find new or changed files in key areas
git diff main -- app/ types/ features/ components/

# Then compare against the tables below and mark any undocumented items
```

---

## Pages

| Route | File | Documented | Last Checked |
|-------|------|------------|-------------|
| `/` | `app/page.tsx` | ✅ | 2026-05-09 |
| `/dashboard` | `app/(host)/dashboard/page.tsx` | ✅ | 2026-05-09 |
| `/accounts` | `app/(host)/accounts/page.tsx` | ✅ | 2026-05-09 |
| `/accounts/[id]` | `app/(host)/accounts/[id]/page.tsx` | ✅ | 2026-05-09 |
| `/audit-log` | `app/(host)/audit-log/page.tsx` | ✅ | 2026-05-09 |
| `/brands` | `app/(host)/brands/page.tsx` | ✅ | 2026-05-09 |
| `/brands/new` | `app/(host)/brands/new/page.tsx` | ✅ | 2026-05-09 |
| `/brands/[id]` | `app/(host)/brands/[id]/page.tsx` | ✅ | 2026-05-09 |
| `/brands/[id]/edit` | `app/(host)/brands/[id]/edit/page.tsx` | ✅ | 2026-05-09 |
| `/claims` | `app/(host)/claims/page.tsx` | ✅ | 2026-05-09 |
| `/employees` | `app/(host)/employees/page.tsx` | ✅ | 2026-05-09 |
| `/employees/new` | `app/(host)/employees/new/page.tsx` | ✅ | 2026-05-09 |
| `/employees/[id]` | `app/(host)/employees/[id]/page.tsx` | ✅ | 2026-05-09 |
| `/employees/[id]/edit` | `app/(host)/employees/[id]/edit/page.tsx` | ✅ | 2026-05-09 |
| `/organizations` | `app/(host)/organizations/page.tsx` | ✅ | 2026-05-09 |
| `/organizations/new` | `app/(host)/organizations/new/page.tsx` | ✅ | 2026-05-09 |
| `/organizations/[id]` | `app/(host)/organizations/[id]/page.tsx` | ✅ | 2026-05-09 |
| `/organizations/[id]/edit` | `app/(host)/organizations/[id]/edit/page.tsx` | ✅ | 2026-05-09 |
| `/organizations/[id]/branches/new` | `app/(host)/organizations/[id]/branches/new/page.tsx` | ✅ | 2026-05-09 |
| `/organizations/[id]/branches/[branchId]/edit` | `app/(host)/organizations/[id]/branches/[branchId]/edit/page.tsx` | ✅ | 2026-05-09 |
| `/organizations/[id]/policies/new` | `app/(host)/organizations/[id]/policies/new/page.tsx` | ✅ | 2026-05-09 |
| `/policies` | `app/(host)/policies/page.tsx` | ✅ | 2026-05-09 |
| `/policies/new` | `app/(host)/policies/new/page.tsx` | ✅ | 2026-05-09 |
| `/policies/new/review` | `app/(host)/policies/new/review/page.tsx` | ✅ | 2026-05-09 |
| `/policies/[id]/edit` | `app/(host)/policies/[id]/edit/page.tsx` | ✅ | 2026-05-09 |
| `/policies/[id]/edit/review` | `app/(host)/policies/[id]/edit/review/page.tsx` | ✅ | 2026-05-09 |
| `/policies/[id]/versions/new` | `app/(host)/policies/[id]/versions/new/page.tsx` | ✅ | 2026-05-09 |
| `/service-providers` | `app/(host)/service-providers/page.tsx` | ✅ | 2026-05-09 |
| `/service-providers/new` | `app/(host)/service-providers/new/page.tsx` | ✅ | 2026-05-09 |
| `/service-providers/[id]` | `app/(host)/service-providers/[id]/page.tsx` | ✅ | 2026-05-09 |
| `/service-providers/[id]/edit` | `app/(host)/service-providers/[id]/edit/page.tsx` | ✅ | 2026-05-09 |
| `/services` | `app/(host)/services/page.tsx` | ✅ | 2026-05-09 |
| `/settings` | `app/(host)/settings/page.tsx` | ✅ | 2026-05-09 |
| `/transactions` | `app/(host)/transactions/page.tsx` | ✅ | 2026-05-09 |
| `/users` | `app/(host)/users/page.tsx` | ✅ | 2026-05-09 |
| `/users/members` | `app/(host)/users/members/page.tsx` | ✅ | 2026-05-09 |
| `/users/administrators` | `app/(host)/users/administrators/page.tsx` | ✅ | 2026-05-09 |
| `/voucher-packages` | `app/(host)/voucher-packages/page.tsx` | ✅ | 2026-05-09 |
| `/voucher-packages/[id]/vouchers` | `app/(host)/voucher-packages/[id]/vouchers/page.tsx` | ✅ | 2026-05-09 |

---

## Core Entities

| Entity | Source File | Documented in ERD | Last Checked |
|--------|-------------|-------------------|-------------|
| Organization | `types/organization.ts` | ✅ | 2026-05-09 |
| BenefitPolicy | `types/policy.ts` | ✅ | 2026-05-09 |
| BenefitGroup | `types/policy.ts` | ✅ | 2026-05-09 |
| Benefit | `types/policy.ts` | ✅ | 2026-05-09 |
| Brand | `types/brand.ts` | ✅ | 2026-05-09 |
| ServiceProvider | `types/provider.ts` | ✅ | 2026-05-09 |
| SpBranch | `types/provider.ts` | ✅ | 2026-05-09 |
| SpVoucher | `types/provider.ts` | ✅ | 2026-05-09 |
| Claim | `types/claims.ts` | ✅ | 2026-05-09 |
| Account | `features/accounts/types.ts` | ✅ | 2026-05-09 |
| Employee | `features/employees/types.ts` | ✅ | 2026-05-09 |
| GeneratedVoucher | `features/voucher-packages/types.ts` | ✅ | 2026-05-09 |

---

## Components

| Area | Documented | Last Checked |
|------|------------|-------------|
| `components/shared/` (52 components) | ✅ | 2026-05-09 |
| `components/host/dashboard/` | ✅ | 2026-05-09 |
| `components/host/organizations/` | ✅ | 2026-05-09 |
| `components/host/policies/` | ✅ | 2026-05-09 |
| `components/host/providers/` | ✅ | 2026-05-09 |
| `components/ui/` (shadcn primitives) | ✅ listed | 2026-05-09 |

---

## What's New (Not Yet Documented)

_Nothing pending as of 2026-05-09. Update this section after each designer merge._

---

## Sync Log

| Date | Synced To | Changes Found | Action Taken |
|------|-----------|--------------|--------------|
| 2026-05-09 | `main` @ `4dfc730` | Initial documentation — all existing pages, entities, flows | Created `.docs_technical/` hub |
