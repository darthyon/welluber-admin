# Employee Tabs Redesign

## Problem
The employee surfaces are inconsistent and over-nested. The global employee detail
(`/employees/[id]`) uses a "Jump to Section" anchor nav over 7 long-scroll sections;
the org module's Employees tab uses a vertical sub-nav; and there are three separate
detail implementations, one of them dead code. This redesign collapses the detail into
horizontal tabs, converts the org sub-nav to a horizontal segmented control, and unifies
on one shared detail component.

## Non-goals
- Does not change the global Employees **list** page (`/employees`) — filters, view toggle, table/cards stay.
- Does not change the org-level L1 tab bar (Org Details · Branches · Employees · Policies · Claims · Vouchers · Settings).
- Does not redesign the org-portal employee route (`/(org)/[orgSlug]/employees/[employeeId]`) — that is a separate tenant-facing surface, out of scope here.
- Does not add new data, API wiring, or backend behavior — mock data only, matching current state.
- Does not change Add/Edit employee flows (`/employees/new`, `/employees/[id]/edit`).
- Does not alter the bulk-upload wizard.

## Users
WellUber host admins managing employees across organisations. Two entry points:
the **global** directory (all orgs) and the **org module** Employees tab (one org).
Both currently funnel into the same detail page — the org Directory row-click already
routes to global `/employees/[id]` (see `directory-sub-tab.tsx:124`).

## User stories
- As a host admin, I can view an employee's details in horizontal tabs (Profile · Benefits · Claims · Vouchers · Dependents) instead of scrolling a long page with a jump nav.
- As a host admin, I can switch between org employee views (Directory · Dependents · Entitlements) via a horizontal segmented control that reads as a view-switcher, not a second nav bar.
- As a host admin, I never see the same Claims data in two places within the org module.

## Behaviour

### A. Per-employee detail — `/employees/[id]` (System 1)
- Remove `FloatingAnchorNav`. Remove the `ANCHOR_ITEMS` long-scroll layout.
- Render a horizontal **segmented tab** control with 4 tabs:

  | Tab | Sections inside |
  |-----|-----------------|
  | **Profile** | "Personal Details" + "Employment Details" (section headers within the one tab) |
  | **Benefits** | Benefit Policy Assignment + Entitlements |
  | **Claims** | `EmployeeClaimsTab` |
  | **Vouchers** | `EmployeeVouchersTab` |
  | **Dependents** | Dependent list |

- Default active tab: **Profile**. Active tab persists in URL query (`?tab=`) using the existing `useQueryState` / `use-tab-persistence` pattern.
- Page header (avatar, name, status, designation, Edit button, action popover) stays above the tab control, unchanged in content.
- Extract one shared `EmployeeDetail` component consumed by the global route. Delete dead `components/host/organizations/employee-detail-view.tsx`.

### B. Org Employees tab sub-nav — inside `/organizations/[id]` (System 2)
- Convert `VerticalTabs` sub-nav to a horizontal **segmented pill** control (visually distinct from the L1 underline tabs).
- Sub-tabs stay 4: **Directory · Dependents · Entitlements · Claims**.
- The Employees→Claims sub-tab is **kept** — it is NOT a duplicate of the L1 Claims tab. Both read `useOrgUtilisation`, but render different lenses:
  - L1 Claims = `OrganizationClaimsTable` → flat `FlatClaimRow` transaction log, with search/status/txn filters (finance/audit view).
  - Employees→Claims = `UtilisationClaimsTable` → per-employee utilisation rollup (Employee · Branch · Allocated · Claims Usage, expandable). People-centric, pairs with Entitlements.
- Keep query-state persistence (`?subTab=`), default `directory`.
- Bulk-upload wizard takeover behavior unchanged.

### C. Visual hierarchy
- L1 org tabs = underline (unchanged).
- L2 employee views = segmented pill.
- Detail (separate route) = its own segmented tabs; origin shown via the existing Back button / breadcrumb.
- Rule: never two same-shaped horizontal tab bars adjacent.

## Edge cases
- **Empty states:** each tab handles its own empty (no dependents → existing dashed "0 Dependents" card; no policies → "No benefit policies assigned"; no claims/vouchers → table empty state). No global empty state for the detail.
- **Deep link to a tab:** `?tab=benefits` opens directly on that tab; unknown value falls back to Profile.
- **Unknown sub-tab deep links:** any `?subTab=` value not in `EMPLOYEE_SUB_TABS` falls back to `directory` (no error).
- **Narrow viewport:** segmented controls must scroll/wrap horizontally, not overflow the container.
- **Dead component deletion:** confirm zero imports of `employee-detail-view.tsx` before removing (current grep: zero usages).

## Decisions (resolved)
- **Data shape:** base the unified type on `EmployeeDirectoryItem` (seed.ts) — it's typed, real seed, app-wide, and carries org linkage (orgId, organization, departmentId, tierId, lastActive) + utilisation. Extend it with the personal-detail fields currently only on the global inline `mockEmployee` (dateOfBirth, idType, idNumber, mobile, nationality, gender, residencyStatus, designation/role, employmentType detail, isProbation/probationMode/probationEndDate, dependents[]). One `Employee` type, no parallel interface.
- **Segmented control:** no generic primitive exists (`view-toggle` is hardcoded list/grid, `vertical-tabs` is vertical). Add `components/shared/segmented-tabs.tsx`, modeled on `view-toggle`'s pill styling (`inline-flex p-1 bg-muted rounded-lg`, active = `bg-background shadow-sm`). Use for both L2 sub-nav and L3 detail tabs.
- **Claims + Vouchers:** stay as two separate tabs (`EmployeeClaimsTab`, `EmployeeVouchersTab`) — not merged into an "Activity" tab.

## Open questions
- [ ] Confirm which personal-detail fields are canonical when extending `EmployeeDirectoryItem` (the inline mock has fields the seed lacks; pick the real set). — owner: Yon (at build time)

## Out of scope (deferred)
- Org-portal employee detail (`/(org)/[orgSlug]/...`) alignment to the same component.
- Entitlements relocating to the Benefit Policy tab instead of Employees.
- Any real API integration.
