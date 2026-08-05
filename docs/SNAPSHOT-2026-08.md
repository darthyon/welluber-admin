# WellUber Admin — System Snapshot, August 2026

**Taken:** 5 Aug 2026 · **Scope:** whole console, not just entitlements ·
**Depth:** survey, not deep analysis — enough to plan from.

A point-in-time picture of what works, what is thin, and what to do next.

> **This is a snapshot, not a living document.** It describes the codebase on
> 5 Aug 2026 and will drift. Do not edit it to match later changes — take a new
> snapshot (`SNAPSHOT-YYYY-MM.md`) and leave this one as the record of what was
> true then.
>
> Living references instead: entitlement rules in
> `ENTITLEMENT_PAGE_STRUCTURE_SPEC.md` and `ENTITLEMENT_POOLS_USECASES.md`,
> table conventions in `TABLES_AUDIT.md`, design system in `design.md` and
> `AGENTS.md`, current session state in `HANDOFF.md`.

---

## 1. What This Is

A prototype admin console on mock data. Two working portals share one codebase,
with a third scaffolded but empty:

| Portal | Route group | Audience | Routes |
|---|---|---|---|
| **Host** | `app/(host)` | WellUber staff — manage all orgs | ~42 |
| **Org** | `app/(org)/[orgSlug]` | Employer admins — manage their own org | ~13 |
| **Service Provider** | `app/(serviceprovider)` | Clinics, gyms, providers | **0 — layout only** |
| **Auth** | `app/(auth)` | Login per role | 3 |

Stack: Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind v4 +
shadcn/ui, Phosphor icons, pnpm. Auth is real (Supabase); **all business data is
mock.**

---

## 2. What Is Already Working

**Design system is genuinely enforced.** `pnpm lint:design` runs 17 rules over
`app`, `components`, `features` and currently reports zero violations. Typography
scale, colour tokens, and the max-weight-600 rule are checked, not just written
down. This is the strongest part of the codebase.

**Mock data has a real architecture.** `lib/mock-data/` is factories + seed +
registry + stores, not scattered arrays:
- `seed.ts` runs `seedAll()` once and exports `MOCK_*` arrays
- `registry.ts` gives ID→entity lookup for 13 entity types
- `store.ts` wraps 11 entities in subscribable stores, so create/edit/delete work
  in-session and reset on refresh

**Entitlement domain is consolidated** (see §6). One identity source, one
calculation, one component, spend derived from claims.

**Routing and navigation are coherent.** `lib/navigation.ts` centralises routes;
both portals use shared layout primitives (`DetailSection`, `DetailField`,
`SharedDataTable`, `DataFilterBar`, `StatusBadge`).

**Policy wizard is the deepest flow.** ~10 hooks under `hooks/use-policy-*` and
`use-benefit-policy-wizard*` cover creation, editing, versioning, and templates —
the most complete journey in the product.

---

## 3. Mock Data — What Exists

| Entity | Count | Store? | Registry? | Notes |
|---|---|---|---|---|
| Organizations | 10 | ✅ | ✅ | 3 hand-crafted + 4 generated + 3 "new" |
| Employees | 50 | ✅ | ✅ | 12 curated, 38 filler |
| Dependents | 10 | ❌ | ✅ | see §5.1 — ID scheme conflict |
| Brands | 10 | ✅ | ✅ | |
| Service Providers | 10 | ✅ | ✅ | largest factory (591 lines) |
| Policies | 10 | ✅ | ✅ | + groups/benefits nested |
| Claims | 10 global / 31 per-employee | ✅ | ❌ | per-employee set drives entitlement |
| Vouchers | 10 generated / 5 redemptions | ✅ | ✅ | |
| Accounts | 10 | ✅ | ✅ | org/branch cash + credit |
| Members / Admins | 10 / 10 | ✅ | ✅ | |
| Audit Logs | 10 | ✅ | ✅ | |
| Entitlements | 8 flat rows | ❌ | ❌ | **no store, no registry — cannot be edited** |
| Topup History | 10 | ❌ | ✅ | |

**Employee identity is now single-source.** `lib/mock-data/employee-identity.ts`
owns id / name / email / empCode / org / branch. Seven datasets resolve through
it, guarded by `tests/unit/mock-identity.test.ts`.

**Still holding their own data**, outside `lib/mock-data/`:
- `components/host/employees/employee-entitlements-mock.ts` (~700 lines) — the
  entitlement fixtures. Deliberate: it is the richest, most correct dataset we
  have and covers all four pool kinds. Should eventually move under
  `lib/mock-data/`.
- `components/host/organizations/tabs/*-mock-data.ts` (branches, policies,
  settings, employees) — org detail sub-tabs.
- Assorted inline arrays in ~20 page/component files.

---

## 4. UI & UX

### 4.1 How the UI Is Structured

Four layers, and the separation is mostly honoured:

```
app/(host|org|serviceprovider|auth)/   route pages — thin, mostly composition
  └─ components/[host|org|sp]/         persona-specific UI
       └─ components/shared/           cross-persona building blocks (70 files)
            └─ components/ui/          shadcn primitives — never edited
```

Page anatomy is consistent across both portals:

| Level | Pattern | Built from |
|---|---|---|
| List page | filter bar → table or card grid → pagination | `DataFilterBar`, `SharedDataTable`, `ViewToggle` |
| Detail page | header → sectioned body → optional tabs | `EntityHeader`, `DetailSection`, `DetailField` |
| Create/edit | multi-step wizard or long form with jump-links | `FormStepWizard`, `FloatingAnchorNav` |
| Confirmation | modal, then quiet success | `ConfirmationModal`, `SuccessModal` |

### 4.2 The Shared Component Library

**70 components in `components/shared/`** — genuinely the strongest asset here.
It goes well beyond primitives: `ExpandableDataTable`, `SearchableMultiSelect`,
`SectionedSearchSelect`, `LocationPicker` (+ map panel), `DateTimePickerField`,
`AdvancedFilterSheet`, `NotificationCenter`, `BentoGrid`, `SuccessCelebration`.

Notable for entitlement work: `StackedPoolBar` and the new `EntitlementPools`.

**Coverage of the UX safety net is uneven:**

| Concern | State |
|---|---|
| Empty states | `EmptyState` used in **33** files — good |
| Loading | `Spinner` in only **9** files; **no route-level `loading.tsx` anywhere** |
| Errors | root `error.tsx` + `not-found.tsx` exist; `ErrorBoundary` used in **2** files |

So a slow or failing screen usually shows nothing rather than a skeleton or a
recoverable error — the least-developed part of the UI.

### 4.3 Design System

Enforced by `pnpm lint:design` (17 rules, currently zero violations), which is
why the UI is visually consistent despite its size:

- **Type scale is closed** — `text-micro` (10) / `label` (12) / `body` (14) /
  `lead` (16) / `heading` (20) / `title` (24) / `display` (32). No ad-hoc sizes.
- **Max font weight 600.** `font-bold` is banned outright.
- **Colour tokens only** — no hardcoded hex. (The org portal's inverted
  `#0d9488`/`#8b5cf6` entitlement bar was the last raw-hex holdout; now removed.)
- **Title Case** for headers and labels; `uppercase` restricted to sidebar group
  labels and mono ID badges.
- Table conventions are separately audited in `TABLES_AUDIT.md`.

### 4.4 UI/UX Gaps

- **No loading states at route level.** Zero `loading.tsx` files across ~58
  routes. Navigation between heavy pages shows a frozen previous screen.
- **Error boundaries are nearly absent** — 2 usages. One throwing component takes
  out the page.
- **The Service Provider portal is an empty shell.** `app/(serviceprovider)/` has
  a layout and no pages; `components/sp/` contains only `.gitkeep`. A third
  persona is scaffolded in navigation and file structure but does not exist.
- **`framer-motion` is still used in ~10 card/wizard components.** The
  `mode="wait"` variant is a known hang in this app (documented in
  `prototype-audit-results.md`; fixed in 8 files by switching to CSS
  `animate-in`). The remaining usages are a latent repeat of that bug.
- **Two tab idioms coexist** — `SegmentedTabs` and `VerticalTabs`, plus
  `use-tab-persistence` for URL-synced tabs. No stated rule for which to use when.
- **Org portal detail depth is shallower than host.** Several org routes are
  single views where the host equivalent has tabs and drill-down, so the same
  entity feels different depending on who is logged in.
- **Mobile is unverified.** `use-mobile` exists and layouts use responsive
  classes, but no responsive checks are in the test suite and no breakpoint
  review has been recorded.

---

## 5. Gaps

Ordered by how much damage they cause, not by effort. UI/UX gaps are in §4.4.

### 5.1 Data integrity

- **Two dependent ID schemes that do not reconcile.** `factories/dependent.ts`
  emits `DEP-20260115-0001`; `employee-entitlements-mock.ts` uses `DEP-0002-1`
  (employee-scoped). Nothing joins them, so the Dependents list and the
  entitlement beneficiary rows describe different people with the same
  relationships. **This is the single most confusing remaining gap.**
- **Entitlements are read-only by construction.** Alone among entities they have
  no store and no registry entry, so there is no edit path and no ID lookup.
- **`entitlements-sub-tab.tsx` bypasses the resolver**, reading `MOCK_ENTITLEMENTS`
  directly. Its allocated/used therefore do not reconcile with the employee detail
  views. Left deliberately — it is a cross-employee roster and the resolver is
  per-employee — but it needs a batch path.
- **A Member and an Employee are both "Jenny Wilson"** (`factories/user.ts` vs
  employee 0002). Different entities, so not identity drift, but it reads as a bug.

### 5.2 Flows

- **Mutations are shallow and uneven.** Only ~9 files call store `add`/`update`/
  `remove`. Most "edit" screens render forms that do not persist, so a create
  flow often ends without the row appearing in its list.
- **Dependents are read-only.** Employee detail *does* have a Dependents tab
  (`employee-detail.tsx`), but it only lists `employee.dependents` with an empty
  state — no add, edit, or remove. They are central to entitlement (half the pool
  kinds exist for them) yet cannot be managed anywhere in the product.
- **Claims are display-only.** No approve / reject / flag transitions, though
  `ClaimStatus` defines `pending_review` and `flagged`.
- **Org portal is much thinner than host** — 13 routes vs 42, and several are
  single-view pages with no detail level.

### 5.3 Testing

- **Two unit test files total.** Both cover entitlement/identity. Nothing covers
  the policy wizard, the largest and most intricate flow in the product.
- **5 e2e specs, last known state 12/14 on one of them; the other 4 predate the
  auth bypass and likely fail in `beforeEach`.**
- **Neither suite has been run since the entitlement consolidation.** This is the
  most immediate risk in the repo.

### 5.4 Consistency

- Some pages read `MOCK_*` arrays directly while others use `hooks/data-hooks.ts`
  stores, so one screen can show stale data after another mutates.
- `hooks/use-org-utilisation.ts` and `use-org-workforce.ts` both take an `orgId`
  and `void` it, returning global data regardless of org.
- `LocationPicker` shows an error message for `line` only; the other four fields
  get a red border with no text. Acme's `"Wilayah Persekutuan"` is not in its
  state list and renders blank.

---

## 6. Entitlement — Recently Consolidated

Recorded because it is the template for the rest of the cleanup.

**Was:** 5 employee datasets with conflicting names · 3 independent calculations ·
3 renderers · hand-typed spend that contradicted the claim ledger · a fallback
that showed one employee's policy for any unknown ID.

**Now:** one identity module · one calculation
(`entitlement-pool-display.ts`) · one component
(`components/shared/entitlement-pools.tsx`, shared by both portals) · spend
derived from claims · 12 documented combinations collapsed to **4 pool kinds**.

~1,300 lines net removed. `employee-entitlements-tab.tsx` went 1,346 → 52.

**The transferable lesson:** the display bugs were never in the display. They came
from multiple sources of truth for the same fact. Fix the data shape and the UI
gets small on its own.

---

## 7. Plan

### Now — de-risk what just changed
1. Run `pnpm test:unit` and `pnpm test:e2e`; fix or delete the stale e2e specs.
2. Commit the entitlement consolidation.

### Next — finish the data model
3. **Unify dependent IDs.** Pick one scheme, make `employee-entitlements-mock.ts`
   and `factories/dependent.ts` agree, extend `mock-identity.test.ts` to guard
   dependents the way it now guards employees.
4. Give entitlements a store + registry entry so they behave like every other
   entity.
5. Move `employee-entitlements-mock.ts` under `lib/mock-data/`.
6. Give `entitlements-sub-tab.tsx` a batch resolver path.

### Then — close the flow gaps
7. Build the Dependents management journey (tab + add/edit/remove).
8. Make edit/create flows actually persist to stores, one entity at a time.
9. Add claim status transitions.
10. Decide which portal reads what: pick stores *or* direct `MOCK_*` per screen,
    not both.

### UI/UX — cheap wins first
11. Add route-level `loading.tsx` to the heavy list and detail routes. Highest
    perceived-quality gain per line of code in the whole plan.
12. Wrap each route group's layout in `ErrorBoundary` so one bad component cannot
    blank a page.
13. Replace the remaining `framer-motion` card/wizard usages with CSS
    `animate-in`, closing out the `mode="wait"` hang class for good.
14. Write down when to use `SegmentedTabs` vs `VerticalTabs`, and put it in
    `AGENTS.md` §3.
15. Do one responsive pass and record the breakpoint decisions.

### Ongoing
16. Unit tests for the policy wizard before it is refactored.
17. Fix `LocationPicker` error text and the missing state.

### Not doing
- Real backend / Supabase tables for business data. Auth is real; everything else
  stays mock until the product direction is settled.
- Building out the Service Provider portal. It is scaffolding, not a half-built
  feature — decide whether the persona is in scope before writing any of it.
- Renaming "Benefit Policy" (standing rule).
- Editing `components/ui/` (shadcn-managed).

---

## 8. Rules Worth Not Relearning

- Mock data uses **Retail / Tech / Logistics** orgs and flexi benefits (gym,
  wellness, nutrition) — no clinical domains.
- Org **names** come from the `Organization` entity; nothing else may declare one.
- `benefitPoolType: "Shared"` + an explicit `dependentsPoolType` is an **invalid**
  product state. Fixtures and docs for it were deleted; do not re-add.
- Claims/Vouchers stay separate tabs by design.
- `pnpm dev` and `pnpm test:e2e` cannot run together (both want `.next/dev/lock`).
