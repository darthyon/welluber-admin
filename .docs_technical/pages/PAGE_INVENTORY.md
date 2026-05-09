# Page Inventory

> All routes in the `welluber-admin` designer repo. Use this as the screen spec for building production portals.
> Source: `app/(host)/`, `app/(org)/`, `app/(serviceprovider)/`

---

## Host Portal Pages

All routes under `app/(host)/` — accessible to Host Admin only.

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/` | `app/page.tsx` | Root redirect | Redirects to `/dashboard` |
| `/dashboard` | `app/(host)/dashboard/page.tsx` | System analytics | KPI bento grid, activity charts, top orgs/SPs, date range filter |
| `/organizations` | `app/(host)/organizations/page.tsx` | Org directory | List/grid toggle, search, status filter, triage filter (needs action) |
| `/organizations/new` | `app/(host)/organizations/new/page.tsx` | Create organization | Multi-step form: basic → branch → subscription → bank → review |
| `/organizations/[id]` | `app/(host)/organizations/[id]/page.tsx` | Org detail | Overview, branches tab, employees tab, policies tab, accounts tab |
| `/organizations/[id]/edit` | `app/(host)/organizations/[id]/edit/page.tsx` | Edit org | Update basic info, contacts, bank details |
| `/organizations/[id]/branches/new` | `...branches/new/page.tsx` | Add branch | Branch form: address, operating hours, PICs |
| `/organizations/[id]/branches/[branchId]/edit` | `...edit/page.tsx` | Edit branch | Update branch details |
| `/organizations/[id]/policies/new` | `...policies/new/page.tsx` | Assign policy to org | Quick assign from existing policies or create new |
| `/policies` | `app/(host)/policies/page.tsx` | Policy directory | List with status filter, org filter, search; tabs: All, Draft, Active, Deactivated |
| `/policies/new` | `app/(host)/policies/new/page.tsx` | Policy builder | Template selector or blank; multi-section form with autosave |
| `/policies/new/review` | `app/(host)/policies/new/review/page.tsx` | Review new policy | Full policy preview before activation |
| `/policies/[id]/edit` | `app/(host)/policies/[id]/edit/page.tsx` | Edit policy | Same builder as new; version history in sidebar |
| `/policies/[id]/edit/review` | `app/(host)/policies/[id]/edit/review/page.tsx` | Review edited policy | Diff view or full preview before saving |
| `/policies/[id]/versions/new` | `...versions/new/page.tsx` | Create policy version | Select target employees, configure version overrides |
| `/service-providers` | `app/(host)/service-providers/page.tsx` | SP directory | List/grid, brand filter, service filter, status filter |
| `/service-providers/new` | `app/(host)/service-providers/new/page.tsx` | Onboard SP | Multi-step: basic → services → business → tax → commission → branch → review |
| `/service-providers/[id]` | `app/(host)/service-providers/[id]/page.tsx` | SP detail | Profile, branches tab, vouchers tab, admins tab, commission tab |
| `/service-providers/[id]/edit` | `app/(host)/service-providers/[id]/edit/page.tsx` | Edit SP | Update profile, commission, tax profile |
| `/brands` | `app/(host)/brands/page.tsx` | Brand directory | List/grid, status filter, SP count |
| `/brands/new` | `app/(host)/brands/new/page.tsx` | Create brand | Name, logo, Tier 1 service categories |
| `/brands/[id]` | `app/(host)/brands/[id]/page.tsx` | Brand detail | Brand info, assigned SPs list |
| `/brands/[id]/edit` | `app/(host)/brands/[id]/edit/page.tsx` | Edit brand | Update name, logo, categories |
| `/services` | `app/(host)/services/page.tsx` | Service taxonomy | Tier 1/2/3 hierarchy browser; add/edit taxonomy entries |
| `/employees` | `app/(host)/employees/page.tsx` | Employee directory | Global employee list across all orgs; search, filter by org/branch/status |
| `/employees/new` | `app/(host)/employees/new/page.tsx` | Add employee | Manual add form |
| `/employees/[id]` | `app/(host)/employees/[id]/page.tsx` | Employee detail | Profile, benefit entitlements, claims history, dependents |
| `/employees/[id]/edit` | `app/(host)/employees/[id]/edit/page.tsx` | Edit employee | Update employment details, tier, department |
| `/claims` | `app/(host)/claims/page.tsx` | Claims directory | All redemptions/claims across platform; filter by org, SP, date, status |
| `/accounts` | `app/(host)/accounts/page.tsx` | Account management | All org wallets; balance summary, pending top-ups, alerts |
| `/accounts/[id]` | `app/(host)/accounts/[id]/page.tsx` | Account detail | Balance history, transactions, top-up requests |
| `/transactions` | `app/(host)/transactions/page.tsx` | Transaction ledger | All platform transactions; type filter, date filter |
| `/voucher-packages` | `app/(host)/voucher-packages/page.tsx` | Voucher packages | Generated voucher batches; status filter |
| `/voucher-packages/[id]/vouchers` | `...vouchers/page.tsx` | Voucher list | Individual codes in a package; status, redemption dates |
| `/users` | `app/(host)/users/page.tsx` | User management | Tab: Members / Administrators |
| `/users/members` | `app/(host)/users/members/page.tsx` | Member list | All member accounts; org filter, status filter |
| `/users/administrators` | `app/(host)/users/administrators/page.tsx` | Admin list | All admin users; role filter, entity filter |
| `/audit-log` | `app/(host)/audit-log/page.tsx` | Audit trail | Immutable activity log; actor/type/entity filter |
| `/settings` | `app/(host)/settings/page.tsx` | Platform settings | Settlement cycle, expired voucher split, cron config |

---

## Org Portal Pages (Stub)

Routes under `app/(org)/` — for the Org Admin / HR portal. Currently stubs in the designer repo.

| Route | Purpose | Build Priority |
|-------|---------|---------------|
| `/org/dashboard` | Utilization overview, wallet balance, pending actions | High |
| `/org/employees` | Employee directory (org-scoped) | High |
| `/org/employees/[id]` | Employee detail + benefit assignment | High |
| `/org/employees/upload` | CSV bulk upload | High |
| `/org/policies` | View assigned policies | Medium |
| `/org/wallet` | Wallet balance, top-up request form | High |
| `/org/claims` | Claims for this org's employees | Medium |
| `/org/settings` | Org profile, branch management | Medium |

---

## SP Portal Pages (Stub)

Routes under `app/(serviceprovider)/` — for the SP Admin / Staff portal.

| Route | Purpose | Build Priority |
|-------|---------|---------------|
| `/sp/dashboard` | Revenue overview, recent redemptions, pending actions | High |
| `/sp/vouchers` | Voucher management (create, edit, lifecycle) | High |
| `/sp/vouchers/new` | Create voucher | High |
| `/sp/vouchers/[id]` | Voucher detail + analytics | Medium |
| `/sp/redemptions` | Redemption code entry (walk-in) | High |
| `/sp/claims` | Claims history for this SP | Medium |
| `/sp/branches` | Branch management | High |
| `/sp/team` | SP admin/staff management | Medium |
| `/sp/settlement` | Settlement statements + approval | High |
| `/sp/settings` | SP profile, bank details, tax profile | Medium |

---

## Page Layout Patterns

All pages in the Host Portal use one of two layout patterns:

### List Pages
- `DataFilterBar` at top (search + filters)
- View toggle (list/grid) where applicable
- `DataTable` or card grid
- Pagination or infinite scroll
- Empty state when no data

### Detail Pages
- `TwoColumnDetailLayout` — main content (2/3) + sidebar (1/3)
- `FloatingAnchorNav` for long forms with multiple sections
- `EntityHeader` at top (name, status badge, key actions)
- Tab navigation for multi-section details

### Form Pages (Create/Edit)
- Multi-step forms with progress indicator for complex entities
- Single-page forms for simple entities
- Review step before final submission
- Autosave for policy builder
