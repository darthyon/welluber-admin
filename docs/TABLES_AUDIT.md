# Tables Audit — WellUber Admin Console

Audit of all data tables against the `OrganizationsDataTable` gold standard.
Completed: 2026-05-26.

---

## Gold Standard Patterns

| Pattern | Rule |
|---------|------|
| Primary cell text | `text-body font-medium text-foreground` |
| Secondary / ID text | `text-label font-mono text-subtle tracking-tight` |
| Status badges | `<StatusBadge>` with semantic variants (emerald/amber/rose/zinc) |
| Non-status tags | `<Badge>` component — never inline `<span>` |
| Entity avatar | `<EntityAvatar>` where applicable (brands, members) |
| Action column | `<ActionPopover>` — header must be `""` (empty, no label) |
| Color tokens | Semantic only: `text-foreground`, `text-subtle`, `text-faint` — no hardcoded colors |
| Date formatting | `formatDate()` from `lib/utils.ts` — `en-MY` locale, `dd MMM yyyy` |
| Cell wrapping | All variable-length text: `whitespace-nowrap` or `truncate max-w-[Xpx]` |
| Inline icons | `size={14}` in table cell body text |
| Numeric columns | `align: "right"` + `headerClassName: "text-right"` + `tabular-nums` |
| Table setup | `freezeFirst` + `freezeLast` on all tables with actions column |

---

## Score Card

| Page / Component | Score | Status |
|-----------------|-------|--------|
| `organizations-data-table.tsx` | 5/5 | Gold standard |
| `app/(host)/claims/page.tsx` | 5/5 | Fixed |
| `app/(host)/policies/page.tsx` | 5/5 | Fixed |
| `components/host/brands/brand-data-table.tsx` | 5/5 | Fixed |
| `components/host/voucher-packages/voucher-packages-table.tsx` | 5/5 | Fixed |
| `app/(host)/users/administrators/page.tsx` | 5/5 | Fixed |
| `app/(host)/users/members/page.tsx` | 5/5 | Fixed |
| `components/host/employees/employee-directory-table.tsx` | 5/5 | Fixed |
| `components/host/employees/employee-claims-tab.tsx` | 5/5 | Fixed |
| `components/host/employees/employee-vouchers-tab.tsx` | 5/5 | Fixed |
| `app/(host)/accounts/page.tsx` | 5/5 | Fixed (nested table refactored) |
| `components/host/service-providers/sp-data-table.tsx` | 5/5 | Fixed |
| `components/host/service-providers/sp-vouchers-tab.tsx` | 5/5 | Fixed |
| `components/host/service-providers/sp-branches-tab.tsx` | 5/5 | Fixed |
| `components/shared/utilisation-claims-table.tsx` | 5/5 | Fixed |
| `app/(org)/[orgSlug]/employees/page.tsx` | 5/5 | Fixed |
| `app/(org)/[orgSlug]/branches/page.tsx` | 5/5 | Fixed |
| `app/(org)/[orgSlug]/policies/page.tsx` | 5/5 | Fixed |

---

## Issues Fixed

### Wave 1 — Typography token drift

**Primary name weight** (`font-semibold` → `font-medium`):
- `app/(host)/policies/page.tsx` — policy name
- `app/(host)/users/administrators/page.tsx` — admin name
- `app/(host)/users/members/page.tsx` — member name
- `app/(host)/accounts/page.tsx` — org name (outer row) and nested account name
- `components/host/brands/brand-data-table.tsx` — brand name
- `components/host/employees/employee-vouchers-tab.tsx` — voucher name
- `components/host/organizations/assigned-policy-list.tsx` — policy name, employee count
- `app/(host)/policies/new/review/page.tsx` — employee name
- `app/(host)/policies/[id]/edit/review/page.tsx` — employee name
- `components/host/policies/version-wizard.tsx` — employee name

**ID/code color** (`text-faint` / `text-muted-foreground` → `text-subtle`):
- `app/(host)/policies/page.tsx` — policy code
- `app/(host)/users/administrators/page.tsx` — email, joined, last active
- `app/(host)/users/members/page.tsx` — email, org name
- `app/(host)/accounts/page.tsx` — wallet ID
- `components/host/employees/employee-directory-table.tsx` — ID/code, email
- `components/host/employees/employee-vouchers-tab.tsx` — voucher code, secondary text
- `components/host/employees/employee-claims-tab.tsx` — date text
- `components/host/voucher-packages/voucher-packages-table.tsx` — voucher code
- `components/host/organizations/assigned-policy-list.tsx` — policy code, last updated
- `components/host/organizations/policy-detail-sheet.tsx` — policy code
- `app/(host)/policies/new/review/page.tsx` + `edit/review/page.tsx` — empCode
- `components/host/policies/version-wizard.tsx` — empCode (×2)
- `app/(org)/[orgSlug]/employees/page.tsx` — empCode, dependent relationship
- `app/(org)/[orgSlug]/branches/page.tsx` — location
- `app/(org)/[orgSlug]/policies/page.tsx` — policy code, last updated

### Wave 2 — Component & structural fixes

- **Members** — inline Type `<span>` → `<Badge variant="secondary">`; added ActionPopover column
- **Voucher Packages** — Branch inline spans → `<Badge variant="outline">`; "Booking Required" → `<Badge variant="outline">`
- **Accounts (amber pending)** — hardcoded `border-amber-500` spans → `<StatusBadge variant="amber">`
- **UtilisationClaimsTable** — `STATUS_STYLE` inline classes → `<StatusBadge>`; header tokens fixed; icon sizes 11 → 14
- **Policies + Administrators** — `header: "Actions"` → `header: ""`
- **Assigned Policy List** — `header: "Actions"` → `header: ""`
- **Organizations data table** — added `align: "right"` to 4 count columns
- **Policies page** — added `sortable: true` to Policy Name column
- **Employee claims/vouchers tabs** — icon sizes `size={11}` → `size={14}`
- **Brands data table** — removed "ID:" prefix label; added `font-mono tracking-tight` to ID

### Wave 3 — Wrapping & freeze

- **Claims** — `whitespace-nowrap` on Service, Voucher, Employee, ID cells; icon sizes
- **Org employees** — `whitespace-nowrap` on names; "Joined" → "Joined Date"; added `freezeLast`
- **Org branches** — `whitespace-nowrap` on name/location; `align: "right"` on numeric cols; added `freezeLast`
- **Org policies** — `whitespace-nowrap` on name/code/date; added `freezeLast`
- **SP branches tab** — `whitespace-nowrap` on branch name/location

### Wave 4 — Date formatting standardisation

All `en-GB` `toLocaleDateString()` calls replaced with `formatDate()` from `lib/utils.ts`:
- `components/host/service-providers/sp-data-table.tsx`
- `components/host/service-providers/sp-vouchers-tab.tsx`
- `components/host/service-providers/sp-voucher-detail-view.tsx` (×3)
- `components/host/voucher-packages/voucher-packages-table.tsx` (×2)
- `components/host/brands/brand-detail-view.tsx`
- `app/(host)/policies/page.tsx` — Last Updated column
- `app/(host)/organizations/[id]/page.tsx` — new policy `lastUpdated` field
- `app/(host)/accounts/[id]/page.tsx` — transaction date, wallet creation/activity dates
- `app/(host)/service-providers/[id]/page.tsx` — "On Platform Since"
- `app/(host)/voucher-packages/[id]/vouchers/page.tsx` — generatedAt, redeemedAt

`formatDate()` utility in `lib/utils.ts`:
```ts
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })
}
```

Pre-formatted date strings in mock data ("12 Mar 2026") are rendered as-is — no `formatDate()` needed.

### Wave 5 — Accounts nested table refactor

`renderExpanded` in `app/(host)/accounts/page.tsx` was a custom 12-column CSS grid with:
- Manual header row using `grid-cols-12 gap-4`
- Hardcoded font tokens (`font-semibold text-faint` on headers)

Replaced with `<SharedDataTable ghost>` using standard `Column<Account>[]` definitions. Result:
- Consistent freeze/sort/pagination behavior
- Standard typography tokens
- Properly aligned numeric columns
- Actions column header now `""`

---

## Scope Not Covered

- **Admin detail page** — `/users/administrators/[id]` should be a page (not modal). Post-invite avatar upload. Tracked separately.
- **Dashboard TopList** — custom component, not a table.
- **Audit Log timeline** — not a table.
- **Services card grid** — not a table.
