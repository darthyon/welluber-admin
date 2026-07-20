# WellUber Admin Console — Prototype Audit Results

> **Update (2026-07-20, same session):** the four P0s were fixed and runtime-verified after this audit was written.
> 1. Policy detail tabs — root cause was `AnimatePresence mode="wait"`: framer-motion exit callbacks never complete in this app, so every keyed swap froze on its first child. The same defect was found and fixed in **8 files**: policy detail view, benefit-policy wizard steps, version wizard steps, employee-card policy carousel, and the Cards/List view toggles on organisations, service-providers, members, and administrators pages (all swapped to CSS `animate-in` keyed divs; verified: all 5 policy tabs, version-wizard step 1→2, org Cards↔List).
> 2. Policy edit now hydrates from `MOCK_POLICIES` + `MOCK_POLICY_DATA_MAP` when no sessionStorage draft exists (verified prefilled).
> 3. `/services` — **reclassified**: not an app bug. It rendered correctly after the dev server recompiled; the permanent hang was stale dev-server compile state (known gotcha: clear `.next` when this recurs). No code change.
> 4. Mobile navigation — `SidebarTrigger` added to `TopBar` (`md:hidden`); drawer verified at 375px, both portals share the TopBar. Note: the mobile drawer surfaces a Radix dev warning (`DialogContent` needs `DialogTitle`) coming from `components/ui/sidebar.tsx`, which is shadcn-managed and off-limits — accepted as a dev-only warning.
> Remaining framer usage (`AnimatePresence` without `mode="wait"`, e.g. the post-create modal in benefit-policy-wizard) may still have hung *exit* animations (content lingers on close) — untested, tracked as Needs runtime verification.

**Date:** 2026-07-20
**Method:** Full runtime click-through (dev server, all three personas via demo accounts) + static code audit.
**Scope:** UI/UX, flows, navigation, routing, interaction completeness, product logic in the UI, responsive, accessibility fundamentals, shared-component & token usage. No files were modified.
**Verification baseline:** `pnpm lint:design` → 0 violations. `pnpm typecheck` → clean. All issues below live beneath the linter's radar.

---

## A. Executive Summary

**Overall coherence.** The prototype is visually polished and structurally ambitious — three personas, ~40 routes, a real design system with tokens, a policy wizard, and tab-persisted detail views. Desktop screen-level craft is strong. What breaks the product illusion is not styling but **consistency of data and completeness of interactions**: the same entity (Acme, its employees, its policies, its admins) has three to five contradictory representations depending on which screen renders it, two core modules are broken at runtime (Policy detail tabs, Services), and several flows end in dead ends or blank forms.

**Most serious UX risks**
1. Policy detail tabs never switch content — the entire Versions / Benefit Groups / Assigned Employees / Audit Log surface of the flagship module is unreachable (Confirmed, runtime).
2. Edit Benefit Policy opens a completely blank form for an existing policy — reads as data loss (Confirmed, runtime + root cause in code).
3. Services module never loads — permanent "Loading service taxonomy..." (Confirmed, runtime).
4. Mobile has no navigation at all — no sidebar trigger renders below the desktop breakpoint (Confirmed, runtime).

**Most serious routing risks**
1. Two sidebar links (`/invoices`, `/settlements`) 404 — routes don't exist (Confirmed).
2. Service Provider persona is a navigation trap: `/coming-soon` → "Back to login" → middleware bounces back to `/coming-soon` (Confirmed, runtime).
3. Role and slug are decorative: an org admin can open the full host portal, and **any** org slug (`/global-tech-solutions/...`) renders Acme's data (Confirmed, runtime).

**Most serious component-consistency risks**
1. Parallel mock datasets (at least three sources for "Acme employees") are the root cause of most product-logic contradictions.
2. `AppSidebar` and `OrgSidebar` are ~230-line near-duplicates; two ~250-line claims tables coexist in `components/shared/`.
3. Raw `<input>` styling is re-declared in 14+ files (three separate local `inputCls` helpers) instead of using `components/ui/input`.

**Strongest areas.** Auth role-mismatch handling; org-detail and employee-detail tab persistence via query params (`?tab=`); the Add Benefit Policy wizard (draft autosave, org-scoped targeting preview); EmptyState/StatusBadge/PulseStatus adoption where used; design-token discipline (the guardrail script genuinely passes); the org-portal dashboard's information design.

**Ten highest-impact fixes** — see section H; summary:
1. Fix policy detail tab switching (P0)
2. Hydrate the policy edit form from the selected policy (P0)
3. Fix `/services` infinite loading (P0)
4. Add a mobile nav trigger (P0)
5. Remove or build `/invoices` and `/settlements` sidebar links (P1)
6. Consolidate mock data into one registry so counts/statuses/names agree (P1)
7. Break the SP coming-soon ↔ login loop (P1)
8. Scope org-portal data by slug + add role guards (P1)
9. Give claims rows a detail view in both portals (P1)
10. Normalize status labels, spelling (Organisation/Organization), and date formats (P2)

---

## B. Product and Route Map

**Roles:** `host` (WellUber Admin), `org` (Organisation Admin, slug-scoped portal), `serviceprovider` (stub → `/coming-soon`).

**Auth:** `/login` (redirect → `/login/host`), `/login/[role]` (`host` | `organisation` | `serviceprovider`), `/signout?to=` (GET route). `proxy.ts` gates on Supabase cookie only — **auth, not authorization**: no role/slug checks past login.

**Host portal `app/(host)/`** — sidebar (`components/shared/app-sidebar.tsx`):
- Operations: Dashboard `/dashboard`; Organisations → `/organizations` (+ `[id]`, `[id]/edit`, `new`, `[id]/branches/new`, `[id]/branches/[branchId]/edit`, `[id]/policies/new`), Benefit Policies `/policies` (+ `[id]/edit`, `[id]/edit/review`, `[id]/groups/edit`, `[id]/versions/new`, `new`, `new/review`), Claims `/claims`, Employees `/employees` (+ `[id]`, `[id]/edit`, `new`)
- Service Providers: `/service-providers` (+ `[id]`, `[id]/edit`, `new`), `/voucher-packages` (+ `[id]/vouchers`)
- Setup & Config: `/services` (+ `new`, `[category]`, `[category]/edit`), `/brands` (+ `[id]`, `[id]/edit`, `new`)
- User Management: `/users/members`, `/users/administrators` (+ `[id]`)
- Finance & Reporting: `/claims` (duplicate entry), **`/invoices` (no route — 404)**, **`/settlements` (no route — 404)**, `/accounts`, `/reports` (stub)
- Top bar only: `/audit-log`. **Orphans (no nav link):** `/transactions` (stub), `/settings` (stub), `/users` (stub index).

**Org portal `app/(org)/[orgSlug]/`** — sidebar (`components/org/org-sidebar.tsx`): dashboard, employees (+ `[employeeId]`, `new`), branches (+ `[branchId]`), policies (+ `[policyId]`), claims, vouchers, reports (stub), activity, settings.

**Service Provider portal:** `app/(serviceprovider)/layout.tsx` exists with **zero pages** — dead scaffolding. `lib/navigation.ts` `routes.sp.*` and `routes.org.transactions` point to routes that don't exist; `routes.host.providers` says `/providers` but the real route is `/service-providers` (stale constants; only `routes.org.*` is actually imported).

**Cross-module dependencies (working):** Voucher-package creation hands off to SP detail (`/service-providers/[id]?voucherView=add&tab=vouchers`); policy edit back-links honour `?source=org&orgId=`; org-detail tabs deep-link via `?tab=`.

---

## C. Flow Inventory

| Flow | Role | Entry point | Main steps | Completion point | Missing steps or states | Status |
|---|---|---|---|---|---|---|
| Sign in (role-scoped) | all | `/login/[role]` | email+password → role check → redirect | portal dashboard | SSO button dead; ToS/Privacy `href="#"` | Complete |
| Switch portal | host | sidebar persona menu | `/signout?to=/login/...` | other login page | No reverse path in org sidebar (must sign out manually) | Partially represented |
| SP login | sp | `/login/serviceprovider` | login → `/coming-soon` | coming-soon stub | "Back to login" loops back to `/coming-soon` | Broken (exit loop) |
| Create organisation | host | `/organizations` → Add | 2-step wizard → Confirm & Create | `/organizations/org_XXXXXX` | Detail page renders raw mock id as title, empty tiers/tabs — no real landing state | Broken (hollow completion) |
| Edit organisation | host | org detail → Edit Organisation | form page | back to detail | Not deeply verified | Needs runtime verification |
| View org detail (7 tabs) | host | org list row | tabs via `?tab=` | — | Branches/Employees/Policies/Claims counts all contradict each other; Claims/Vouchers tabs include another org's rows | Inconsistent |
| Add branch | host | org detail Branches tab | custom slide-in sheet | — | Sheet is permanently mounted & keyboard-tabbable while hidden | Partially represented |
| Create benefit policy | host | `/policies` → Add | wizard → review → create | review page | "FALLBACK" debug text flashes on load; otherwise coherent (draft autosave works) | Complete (with debris) |
| View policy detail | host | `/policies` row → overlay (`?policyId&mode=view&wizard=open`) | 5 tabs | — | **Tab content never changes — 4 of 5 tabs unreachable** | Broken |
| Edit policy | host | detail → Edit Policy → `/policies/[id]/edit` | form → review | review | **Form loads blank; hydrates only from sessionStorage draft, never from the policy** | Broken |
| Policy versions / groups edit | host | detail Versions tab | `/policies/[id]/versions/new`, `[id]/groups/edit` | — | Entry tab broken, so flows are unreachable from UI | Unreachable |
| Clone / deactivate / delete policy | host | row action menu | confirm dialog → local state | toast | OK per code; row menu works | Complete |
| View claims | host | `/claims` | filter table | — | Rows are dead — no detail view, no actions | Partially represented |
| View claims | org | `/[slug]/claims` | filter table | — | Same: rows dead; "13 claims across 2 employees" header contradicts 3 distinct employees listed | Partially represented |
| Manage accounts | host | `/accounts` | expandable org rows, update balance, top-up history | — | Works at list level; deep modals not fully walked | Needs runtime verification |
| Manage services taxonomy | host | `/services` | — | — | **Index never loads** (children `/services/new` fine) | Broken |
| Manage brands | host | `/brands` | list → detail/edit/new | — | List OK; forms use local `inputCls` not shared Input | Complete (list level) |
| Members / Administrators | host | `/users/members`, `/users/administrators` | list → admin detail | admin detail | Members dataset unrelated to Employees module data | Inconsistent |
| Voucher packages | host | `/voucher-packages` → Add | SP picker modal → SP detail wizard (3 steps) | SP detail | Catalog (2 packages) doesn't contain any voucher names used in claims data | Inconsistent |
| Employee lifecycle | host | `/employees` → detail (5 tabs) → edit | tabs work | — | Detail data contradicts list data (dept/joined date) | Inconsistent |
| Employee lifecycle | org | `/[slug]/employees` → detail | single-page profile | — | 20% vs 48% utilisation on the same page; detail pattern differs from host (5 tabs vs 1 page) | Inconsistent |
| Bulk upload employees | both | Employees → Bulk Upload | wizard | — | Not walked | Needs runtime verification |
| Org dashboard | org | login redirect | KPI + charts | — | Claims RM 6k vs utilisation RM 116.7k on one screen; employee counts contradict directory | Inconsistent |
| Reports | both | sidebar | stub | — | Intentional "Coming Soon" | Complete as stub |
| Audit log | host | top-bar icon | timeline + filters | — | ISO datetime format unlike rest of app; each entry shows timestamp twice | Complete |
| Account settings | both | persona dropdown | — | — | Menu item has no handler; `/settings` stub exists but is never linked | Missing |

---

## D. Screen Inventory (condensed to screens with findings)

| Screen | Route | Purpose | Entry points | Primary action | Issues |
|---|---|---|---|---|---|
| Host dashboard | `/dashboard` | platform KPIs | login, sidebar | Trigger Payout (untested) | Settlement "Next Cycle May 01, 2026" is in the past; top-SP claim counts (1–2) implausible vs 128k members; "Top service categories" not Title Case; initials differ from list pages (AC vs AB) |
| Organisations list | `/organizations` | B2B client roster | sidebar | Add Organisation | Counts contradict detail tabs; avatar initials include "Sdn Bhd" suffix ("AB" for Acme); metric cells rendered as `<button>`s |
| Org detail | `/organizations/[id]` | 7-tab record | list row | Edit Organisation | Unknown id renders id-as-title page (create flow lands here); hidden Add-Branch sheet always mounted & tabbable; per-tab data contradictions; Claims/Vouchers tabs leak `GHL-156` / "Global Health HQ" rows into Acme |
| New organisation | `/organizations/new` | 2-step create | Add Organisation | Confirm & Create | No Sub-industry field though detail shows one; required-field markers only in Address section; step 2 uses raw inputs, not shared `Input`; "organization" spelling inside copy |
| Policies list | `/policies` | global policy roster | sidebar | Add Benefit Policy | Filler rows ("Wellness Policy 6/7/8", "Enterprise Partner 1/2/3 Sdn Bhd"); "Acme Leadership Benefits Policy" is Draft here but Active in both org views; deactivated policy "Last Updated 05 Nov 2026" (future) |
| Policy detail overlay | `/policies?policyId=…&mode=view&wizard=open` | 5-tab policy record | row click | Edit Policy | **Tabs broken (content stuck on Overview)**; `wizard=open` param misleading for a read view; detail=overlay while edit=page (mixed pattern) |
| Policy edit | `/policies/[id]/edit` | edit wizard | detail/list | Review | **Blank form for existing policy** |
| Policy new | `/policies/new` | create wizard | list | Review | Literal "FALLBACK" Suspense text; floating action pill overlaps form fields |
| Services | `/services` | taxonomy grid | sidebar | Add Service Category | **Infinite loading** |
| Employees (host) | `/employees` | global directory | sidebar | Add Employee | "Organization" filter label (spelling); dept/joined-date values contradict org portal & org tab; employee joined 20 May 2026 with Last Active 09 Apr 2026 |
| Employee detail (host) | `/employees/[id]` | 5-tab record | list row | Edit Employee | "full-time" raw enum; entitlement usage RM 300 contradicts claims tab totals; assigned policy codes absent from policies module |
| Claims (host/org) | `/claims`, `/[slug]/claims` | ledger | sidebar ×2 | — | Dead rows; `Pending_review` raw enum; City duplicated in Title and City columns; lowercase mock ids (`c12`) as Claim IDs (host uses `CLM-2026-…`, org uses `c…` — two schemes) |
| Accounts | `/accounts` | org/branch accounts | sidebar | Create Account | Loads OK; entrance animation leaves table blank ~1s |
| Members | `/users/members` | app signups | sidebar | Export | Fourth, unrelated Acme employee dataset (`@company.com`, "Kuala Lumpur HQ" branch naming) |
| Administrators | `/users/administrators` | admin roster | sidebar | Invite Administrator | Acme admin list disagrees with org-detail Settings tab and org-portal Settings (3 different lists); stray "Upload after invite" copy on detail |
| Voucher packages | `/voucher-packages` | marketplace catalog | sidebar | Add Voucher Package | Only 2 packages; none of the voucher names used in claims exist here; "…any Zenith branch.Booking Required" copy run-on |
| Org dashboard | `/[slug]/dashboard` | org KPIs | login | Top Up | Internal contradictions (RM 6k vs RM 116.7k; 320 vs 11 employees); HQ balance RM 30k/45k vs host's RM 55k for same account |
| Org employee detail | `/[slug]/employees/[employeeId]` | profile | list row | — | 20% vs 48% utilisation on one page; single-page pattern vs host's 5 tabs |
| Coming soon | `/coming-soon` | SP stub | SP login | Back to login | Circular navigation trap |
| Transactions / Settings / Users index | `/transactions`, `/settings`, `/users` | stubs | direct URL only | — | Orphaned placeholder routes still exposed |

---

## E. Route and Interaction Audit

| Route or interaction | Entry point | Destination / outcome | Classification | Evidence |
|---|---|---|---|---|
| `/invoices` | sidebar Finance group | custom 404 | **Missing destination** | [app-sidebar.tsx:96](components/shared/app-sidebar.tsx:96); runtime 404 |
| `/settlements` | sidebar Finance group | custom 404 | **Missing destination** | [app-sidebar.tsx:97](components/shared/app-sidebar.tsx:97); no route file |
| Claims (twice in sidebar) | Operations + Finance groups | same `/claims` | Duplicate | app-sidebar.tsx:69, 95 |
| Policy detail tabs | policy overlay | no content change | **Broken** | runtime: underline moves, content stays Overview; [policy-detail-view.tsx:151](components/host/policies/policy-detail-view.tsx:151) `AnimatePresence mode="wait"` block |
| `/policies/[id]/edit` | Edit Policy button | blank form | **Broken** | [edit/page.tsx:30-36](app/(host)/policies/[id]/edit/page.tsx:30) reads only `sessionStorage` draft |
| `/services` | sidebar | eternal Suspense fallback | **Broken** | runtime 15s+, no console/server errors; [services/page.tsx:207-219](app/(host)/services/page.tsx:207) |
| `/services/new`, `/policies/new`, etc. | various | render fine | Working | runtime |
| Org create → `/organizations/org_XXXXXX` | Confirm & Create | id-as-title empty detail | **Wrong destination (state)** | [organizations/[id]/page.tsx:115-116](app/(host)/organizations/[id]/page.tsx:115) — no notFound/fallback |
| Host & org claims rows | row click | nothing | Dead end | runtime: no dialog, sheet, or navigation |
| Org vouchers rows | row click | nothing | Dead end | runtime |
| `/coming-soon` → Back to login | link | `/login/serviceprovider` → bounced back | **Broken (circular)** | [coming-soon/page.tsx:23](app/coming-soon/page.tsx:23) + proxy.ts:39-52; runtime confirmed |
| Org admin → `/dashboard` | direct URL | full host portal renders | **Permission mismatch** | runtime as `hr@acme` |
| `/global-tech-solutions/dashboard` | direct URL | Acme data under wrong slug | **Wrong destination (data)** | runtime |
| `/transactions`, `/settings`, `/users` | direct URL only | stubs | Placeholder, orphaned | runtime + no nav links |
| `/reports` (both portals) | sidebar | labeled Coming Soon | Placeholder (linked) | runtime |
| Account Settings menu item | persona dropdown (both sidebars) | nothing | Dead control | [app-sidebar.tsx:219](components/shared/app-sidebar.tsx:219), [org-sidebar.tsx:166](components/org/org-sidebar.tsx:166) — no onClick |
| Continue with SSO | login form | nothing | Dead control | [login-form.tsx:115](features/auth/login-form.tsx:115) |
| ToS / Privacy links | login footer | `href="#"` | Dead + `<a>` (banned) | [login/[role]/page.tsx:69-74](app/(auth)/login/[role]/page.tsx:69) |
| `routes.host.providers = "/providers"` | lib constant | stale (real: `/service-providers`) | Legacy drift | [navigation.ts:18](lib/navigation.ts:18) |
| `routes.sp.*`, `routes.org.transactions` | lib constants | nonexistent routes | Legacy drift | [navigation.ts:33-43](lib/navigation.ts:33) |
| `app/(serviceprovider)/layout.tsx` | — | layout with zero pages | Dead scaffolding | route listing |
| Voucher-package Add → SP picker → SP wizard | `/voucher-packages` | works | Working | runtime |
| `?tab=` persistence (org & employee detail) | tabs | works, deep-linkable | Working | runtime |
| Sign-out with `?to=` | persona menu | works | Working | runtime |

---

## F. Component Audit

| Pattern | Shared component | Used by | Duplicated / hardcoded in | UX impact | Recommended action |
|---|---|---|---|---|---|
| Portal sidebar shell (bg layers, header, avatar dropdown, groups) | none | — | [app-sidebar.tsx](components/shared/app-sidebar.tsx) + [org-sidebar.tsx](components/org/org-sidebar.tsx) (~230 lines each, near-identical) | Drift already visible (host has Switch Portal, org doesn't; both have dead Account Settings) | Merge into one `PortalSidebar` taking nav config + persona slot |
| Claims table | two "shared" ones | org portal claims + org-detail claims tab / employee claims + wizard | [organization-claims-table.tsx](components/shared/organization-claims-table.tsx) (259 ln) vs [utilisation-claims-table.tsx](components/shared/utilisation-claims-table.tsx) (243 ln) | Two column schemes, two id styles, duplicated status mapping | Merge or extract shared columns/status cell |
| Text input | `components/ui/input` | some forms | raw `<input className="h-10 w-full rounded-lg border …">` in 14+ files; 3 local `inputCls` helpers ([sp-branch-form.tsx:303](components/host/service-providers/sp-branch-form.tsx:303), [brand-form.tsx:69](components/host/brands/brand-form.tsx:69), [invite-org-admin-modal.tsx:61](components/org/invite-org-admin-modal.tsx:61)); also [new-organization-step-two.tsx](components/host/organizations/new-organization-step-two.tsx) | Focus/error styling will drift per form | Standardise on `ui/input` (+ error variant) |
| Slide-in sheet | `components/ui/sheet.tsx` (exists, animated) | some | Org-detail Add Branch uses a custom `fixed inset-y-0 right-0 z-[150]` div, permanently mounted, tabbable while hidden ([branch-sheet.tsx](components/host/organizations/branch-sheet.tsx)) | Keyboard users tab into an invisible form; no focus trap; no ESC | Replace with shared Sheet |
| Entity initials | `lib/session.ts computeInitials`, `entity-avatar` | — | IIFE duplicated 4× in sidebars/menus; list avatars include "Sdn Bhd" in initials ("AB" for Acme) while dashboard shows "AC" | Same org shows different monograms across screens | One `getInitials(name, {stripSuffixes})` util |
| Status pills | `StatusBadge` / `PulseStatus` | broadly adopted | raw enum strings leak: `Pending_review` (claims, both portals), `full-time` (employee detail) — label mapping missing, not colors | Reads as broken data | Central status→label map used by every table |
| Z-index layering | none | — | ad-hoc arbitrary values: `z-[200]`×29, `z-[100]`×9, `z-[300]`, `z-[1000]`, `z-[150]`, `z-[140]`… | Overlay stacking is fragile (cmd-K vs sheets vs modals) | Token scale (popover/sheet/modal/toast) |
| Scroll spacer | none | wizard pages | `h-[60vh]` / `h-[80vh]` spacer divs ×9 | Anchor-nav hack; dead scroll space at page bottom | Scroll-margin on anchors instead |
| Date formatting | `lib/utils` formatDate | some | local `toLocaleDateString` in 7+ files; formats seen: `06 Apr 2026`, `2026-04-06 15:45` (audit log), `Jan 2026` (brands), `09 Apr 2026, 17:15` | Inconsistent scanning | One date util with named variants |
| Mock data | `lib/mock-data/` registry | most modules | **parallel universes**: `MOCK_EMPLOYEE_ENTITIES` vs `MOCK_EMPLOYEES` in [seed.ts](lib/mock-data/seed.ts); local [tabs/employees/mock-data.ts](components/host/organizations/tabs/employees/mock-data.ts) (201 ln); org-portal analytics factories | Root cause of nearly every product-logic contradiction in section G6 | Single per-entity source; derive counts, never hand-write them |
| Tables | `DataTable` / `ExpandableDataTable` | broadly used | fine | — | Keep |
| Empty states | `EmptyState` | present on branches/contacts etc. | claims/vouchers zero-result states not verified | — | Spot-check after filters fix |

---

## G. Findings

### G1. Broken or incomplete user flows

#### [P0] Policy detail tabs never switch content
- **Location:** `/policies?policyId=…&mode=view&wizard=open` — [policy-detail-view.tssx:151-205](components/host/policies/policy-detail-view.tsx:151), header wiring [policy-detail-header.tsx:167-190](components/host/policies/policy-detail-header.tsx:167)
- **Affected role or flow:** Host; policy inspection, versioning, assignment review, audit
- **Current experience:** Clicking Benefit Groups / Versions / Assigned Employees / Audit Log moves the underline but the body stays on Overview forever (re-tested with 1.2s waits; no console errors).
- **Problem:** 4 of 5 tabs of the flagship module are unreachable; Versions flow (`/policies/[id]/versions/new`) has no working entry point.
- **Recommended experience:** Content follows the selected tab. Prime suspect is the `AnimatePresence mode="wait"` + `motion.div key={activeTab}` block swallowing the child swap (state wiring itself is correct in code); remove/replace the transition and retest.
- **Confidence:** Confirmed (runtime, twice).

#### [P0] Edit Benefit Policy opens a blank form
- **Location:** [app/(host)/policies/[id]/edit/page.tsx:30-36](app/(host)/policies/[id]/edit/page.tsx:30)
- **Affected role or flow:** Host; policy edit
- **Current experience:** "Edit Benefit Policy" for POL-20260115-0001 shows Policy Name 0/100 empty, Organisation "Select organisation...", nothing prefilled.
- **Problem:** `initialData` is read exclusively from `sessionStorage` (`policy-draft-edit-${id}`) — the actual policy is never loaded. First-time edit = empty create form; looks like the record was wiped.
- **Recommended experience:** Hydrate from the policy store/mocks when no draft exists; keep the draft as an overlay.
- **Confidence:** Confirmed (runtime + code).

#### [P0] Services module never loads
- **Location:** `/services` — [app/(host)/services/page.tsx:207-219](app/(host)/services/page.tsx:207)
- **Current experience:** "Loading service taxonomy..." forever (15s+, repeated visits, hard reload; server returns 200; no errors). `/services/new` renders fine.
- **Problem:** Entire taxonomy management area (categories, `[category]`, edit) is unreachable from the UI.
- **Recommended experience:** Diagnose why `ServicesContent` suspends (likely the `ICON_LIBRARY`/store import path); the Suspense fallback should never be terminal.
- **Confidence:** Confirmed (runtime).

#### [P1] Creating an organisation lands on an empty page titled with the mock id
- **Location:** wizard [organizations/new/page.tsx:93-118](app/(host)/organizations/new/page.tsx:93) → [organizations/[id]/page.tsx:115-116](app/(host)/organizations/[id]/page.tsx:115)
- **Current experience:** Confirm & Create → toast → `/organizations/org_483920` → header shows `org_483920`, empty tiers, empty tabs.
- **Problem:** The reward moment of a 2-step flow is a hollow screen; unknown ids silently render instead of 404 or a seeded record.
- **Recommended experience:** Insert the created org into the mock registry so its detail renders, or land on the list with a success highlight.
- **Confidence:** Confirmed (code + runtime pattern).

#### [P1] Claims are dead ends in both portals
- **Location:** `/claims` (host), `/[slug]/claims`, org-detail Claims tab
- **Current experience:** Rows don't navigate, open nothing, and have no action column.
- **Problem:** A claims "ledger" that cannot show a single claim; contrast: vouchers get a `voucher-detail-sheet` elsewhere. (Keeping Claims and Vouchers separate is intentional per project decision — the gap is claim *detail*, not the split.)
- **Recommended experience:** Claim detail sheet (status timeline, amount, voucher link, employee link) reused by host and org tables.
- **Confidence:** Confirmed (runtime).

#### [P1] Service Provider persona is a navigation trap
- **Location:** [coming-soon/page.tsx:23](app/coming-soon/page.tsx:23), [proxy.ts:39-52](proxy.ts:39)
- **Current experience:** SP signs in → `/coming-soon`. "Back to login" → `/login/serviceprovider` → middleware sees a session → redirects to `/coming-soon`. Loop; only manual `/signout` escapes.
- **Recommended experience:** Point the link at `/signout?to=/login/serviceprovider`.
- **Confidence:** Confirmed (runtime).

### G2. Routing and navigation problems

#### [P1] Sidebar links to two nonexistent routes
- **Location:** [app-sidebar.tsx:94-100](components/shared/app-sidebar.tsx:94) — `Invoices → /invoices`, `Settlements → /settlements`
- **Current experience:** Both 404. Audit-log mock even references settlements activity ("Triggered monthly payout"), so the promise is visible elsewhere.
- **Recommended experience:** Remove the links or add stub pages consistent with `/reports`' Coming Soon pattern.
- **Confidence:** Confirmed (runtime).

#### [P2] Claims appears twice in host sidebar; audit-log reachable only from an unlabeled top-bar icon
- **Location:** app-sidebar.tsx:69 + :95; top-bar icon button (no aria-label)
- **Problem:** Duplicate nav entry muddles the Operations/Finance split; Audit Log discoverability is poor and icon-only.
- **Confidence:** Confirmed.

#### [P2] Orphaned placeholder routes still exposed
- **Location:** `/transactions`, `/settings`, `/users` (all "coming soon" stubs, unlinked); `app/(serviceprovider)/layout.tsx`; stale `routes` constants ([navigation.ts:18,33-43](lib/navigation.ts:18))
- **Problem:** Legacy/placeholder surface that deep links can hit; constants advertise routes that don't exist (`/providers`, org transactions, sp portal).
- **Recommended:** Delete or gate; align `routes` with reality (it's imported by 7 org pages).
- **Confidence:** Confirmed.

#### [P2] Detail-view pattern is inconsistent per module
- **Location:** policies (overlay on list URL with `?wizard=open` for a read-only view) vs organisations/employees/SPs (dedicated routes) vs org-portal policies (dedicated route `pol_1`)
- **Problem:** Same concept ("view record") opens three different ways; `wizard=open&mode=view` in a shareable URL mislabels a viewer as a wizard.
- **Confidence:** Confirmed.

### G3. Missing screens and UX states

- **[P1] No mobile navigation** — see G8, root finding.
- **[P2] Unknown-id states missing:** org detail renders id-as-title (above); policy edit renders blank (above). Employee detail has `error.tsx`/`loading.tsx` (good pattern — only employees module has them).
- **[P2] Slow entrance animations read as missing data:** `/policies` and `/accounts` tables render header + empty rows for ~0.5–1s+ (fade-in stall observed repeatedly; one screenshot caught a fully blank 8-row table). Low-end machines will see blank tables long enough to distrust the screen. Evidence: runtime screenshots; `animate-in fade-in` + framer wrappers on table rows.
- **[P3] Zero-result and error states for filters** unverified across tables (not reachable in reasonable time) — Needs runtime verification.

### G4. Information architecture

- **[P2] "Members" vs "Employees" overlap without a bridge** — `/users/members` ("employees and dependents who signed up on the app") shows Acme people that don't exist in any Employees view, and no link connects a member to their employee record. Product decision required: is Members a distinct activation ledger? If so, data must at least agree on who works at Acme.
- **[P2] Employees module nests four sub-tabs inside the org-detail Employees tab** (Directory / Dependents / Entitlements / Claims) while Claims is *also* a top-level org tab — two claims surfaces one click apart with different datasets (see G6).
- **[P3] Audit Log shows each entry's timestamp twice** (header + body line) — noise.

### G5. Interaction and form issues

- **[P1] Hidden Add-Branch sheet is permanently mounted and tabbable** — 9 focusable controls reachable while invisible; custom `fixed … z-[150]` panel instead of `ui/sheet` (no focus trap/ESC/aria-modal). Location: org detail (all tabs). Confidence: Confirmed (DOM probe).
- **[P2] Dead controls presented as live:** Account Settings (both persona menus), Continue with SSO, ToS/Privacy `href="#"` (also violates repo `<a>` ban). Confidence: Confirmed (code + runtime).
- **[P2] Create/detail field parity (organisations):** detail shows Sub-industry; create wizard never collects it. Required markers (`*`) only in the Address section — Company Name is required (validation fires) but unmarked. Confidence: Confirmed.
- **[P2] Floating wizard action pill overlaps form fields** on `/policies/new` and org wizard step 2 (`fixed bottom-8` bar covers Organisation select at common viewport heights until you scroll). Confidence: Confirmed (screenshot).
- **[P3] Table metric cells rendered as `<button>`s** (organisations list: "450", "3") — screen readers announce meaningless buttons; if they're filters/links, label them; if not, make them cells. Confidence: Confirmed (accessibility tree).
- **[P3] Stray copy:** "Upload after invite" floating on admin detail ([users/administrators/[id]](app/(host)/users/administrators/[id]/page.tsx)); voucher description run-on "…any Zenith branch.Booking Required". Confidence: Confirmed.

### G6. Product logic inconsistencies (root cause: parallel mock datasets)

**Root cause.** At least four sources describe the same entities: `lib/mock-data/seed.ts` (`MOCK_EMPLOYEE_ENTITIES` *and* `MOCK_EMPLOYEES` *and* utilisation arrays), the local [components/host/organizations/tabs/employees/mock-data.ts](components/host/organizations/tabs/employees/mock-data.ts), and org-portal analytics factories. Every symptom below is this one defect wearing different clothes. Severity: **P1**, Confidence: Confirmed (runtime + code).

Representative contradictions (all observed at runtime):
1. **Acme headcount:** 450 (org list) · 1,240+450 (branches tab) · 5 rows (org-detail employees tab) · 11 (org portal directory) · 320 (org dashboard) · 1,240 on one policy's assignment.
2. **Policy status:** "Acme Leadership Benefits Policy FY2026" = Draft, updated 22 Mar (host list) vs Active, updated 02 Apr (org tab & org portal). Same policy, different benefit groups per portal ("General Wellness" vs "Gym & Fitness/Nutrition/Mental Health"); three id schemes (`POL-20260115-0001`, `pol_1`, `BEN-*` codes).
3. **Employees assigned policies that don't exist** in either policy list ("Employee Essentials 2026", "Executive Benefits Programme 2026"…).
4. **Cross-org leak:** Acme's Claims/Vouchers tabs include Dianne Russell (`GHL-156`, branch "Global Health HQ") — another organisation — directly under the header "across all employees in this organisation"; org claims header says "13 claims across 2 employees" while listing 3 people. Source: [seed.ts:396-401](lib/mock-data/seed.ts:396) rows not filtered by org.
5. **Time travel:** Michael Tan joined 20 May 2026, Last Active 09 Apr 2026; deactivated policy "Last Updated 05 Nov 2026" (future); dashboard "Next Cycle Date May 01, 2026" already past.
6. **Money disagrees with itself:** org dashboard Claims RM 6k vs utilisation RM 116.7k; HQ account RM 30k/45k (org) vs RM 55k (host branches tab); employee utilisation 20% and 48% on the same org-portal page; host entitlement RM 300 used vs that employee's confirmed claims RM 500+.
7. **Admin roster:** Acme admins are John Doe (org-detail Settings) vs Danish/Wei Lin/Lena (host Administrators) vs Yon/Amira/Khairul (org-portal Settings).
8. **Voucher catalog:** claims reference four voucher products; `/voucher-packages` contains two entirely different ones with 0 redemptions.

**Recommended:** one registry per entity (org, employee, policy, claim, voucher), all counts derived; delete the tab-local mock file.

#### [P1] Roles and slugs are not enforced anywhere in the UI
- **Current experience:** Org admin opens `/dashboard` and gets the full host portal (persona chip even relabels her "WellUber Admin"); `/global-tech-solutions/dashboard` renders Acme data under the wrong slug (layout never validates `orgSlug` and pages hardcode Acme).
- **Problem:** For an access-control product, the prototype demonstrates the absence of access control; demo risk is high (one wrong URL in a demo shows the wrong portal).
- **Recommended:** Client-side guard in `(host)`/`(org)` layouts using session role + validate slug against the mock registry (redirect or "no access" state).
- **Confidence:** Confirmed (runtime). Whether prototype-stage RBAC is in scope at all — Product decision required.

#### [P2] Mock data violates the repo's own domain rule
- AGENTS.md §5 bans healthcare orgs/clinical services in mock data, yet: "Pinnacle Medical Group" (org list + dashboard), "Global Health HQ" (seed), brand category "Medical & Allied Health", "Health Screening MD-SCR" benefit, "Mind & Soul Clinic"/"SpineCare KL" providers. Evidence: runtime + [seed.ts:400](lib/mock-data/seed.ts:400). Confidence: Confirmed.

### G7. Component and design-system inconsistencies
See table F. Headlines: duplicated sidebar shells; duplicated claims tables in `shared/`; 14+ files with raw input styling and three local `inputCls`; custom hidden sheet bypassing `ui/sheet`; 4+ copies of initials logic producing visibly different monograms; ad-hoc z-index values (29× `z-[200]`); `h-[60vh]` spacers; committed debug Suspense fallbacks ("FALLBACK") at [policies/new/page.tsx:288](app/(host)/policies/new/page.tsx:288) and [new/review/page.tsx:349](app/(host)/policies/new/review/page.tsx:349). All Confirmed.

### G8. Responsive issues

#### [P0] Mobile has no navigation
- **Location:** all portal pages at 375px; `TopBar`/`AppSidebar`
- **Current experience:** No hamburger/sidebar trigger renders; visible controls are notifications, theme toggle, and page content. Sidebar (and with it every module) is unreachable; global search also disappears.
- **Recommended experience:** Mobile trigger opening the sidebar as a drawer (shadcn sidebar supports `openMobile`).
- **Confidence:** Confirmed (runtime DOM probe: no visible sidebar-trigger button).

#### [P2] Mobile toolbar overflow
- Organisations at 375px: "Add Organisation" CTA clipped off-canvas; filter row (Status / Needs Action / Service Category) overflows without a scroll affordance. Tables collapse to the sticky name column with hidden columns and no per-row summary. Confidence: Confirmed (screenshot).

### G9. Accessibility issues

- **[P1] Hidden-but-tabbable sheet** (G5).
- **[P2] Icon-only buttons without accessible names:** top-bar audit-log/notification icons, sidebar collapse, table kebab menus — read as unlabeled buttons in the AX tree. Confirmed.
- **[P2] Tab bars are plain buttons** — no `role="tablist"/tab"`, no `aria-selected`; selected state is colour + underline only (org detail, policy detail, employee detail). Confirmed via AX tree (`[role="tab"]` count = 0).
- **[P3] Status conveyed by colour + word with raw enums** (`Pending_review`) undermines comprehension for everyone; fine once labels are mapped.
- **[P3] System dark-mode preference ignored** (`prefers-color-scheme: dark` renders light; manual toggle works and persists). Minor, arguably intentional light-default. Confirmed.

### G10. Visual and terminology inconsistencies

- **Organisation vs Organization:** nav/UI copy is British; routes (`/organizations`), host-employees filter label, administrators description, audit entry ("Organization Approved"), and step-2 copy ("parent organization level") are American. Confirmed, pervasive.
- **Date formats:** `06 Apr 2026` (tables) · `2026-04-06 15:45` (audit log, org activity) · `Jan 2026` (brands) · `09 Apr 2026, 17:15` (last-active). Confirmed.
- **Status labels:** `Pending_review` vs `Pre-auth` vs `Confirmed`; `Linked/Pending` (employees) vs `Active/Inactive` (members) for similar concepts. Confirmed.
- **Title Case violations:** "Top service categories", "Add tier", "COMPLIANCE DOCUMENTS" (uppercase outside the two allowed contexts). Confirmed.
- **Singular/plural drift:** "Benefit Policy" tab vs "Benefit Policies" nav (terminology itself is protected — only the pluralisation drifts); "Voucher Package" tab vs "Voucher Packages" page; "All Status" vs "All Statuses"; "Entitlement" vs "Entitlements".
- **Initials/monograms:** "AB"/"BB" (list, includes Sdn Bhd) vs "AC"/"BR" (dashboard). Confirmed.
- **Claim id styles:** `CLM-2026-0001` (host) vs `c12`/`c10b` (org views) vs `VCH-2026-*` vouchers. Confirmed.

### G11. Product decisions unresolved by the prototype

1. **Service Provider portal scope** — stub-only persona with dead layout + route constants: cut from demo or build a minimal shell?
2. **Role/slug enforcement in a prototype** — currently absent (G6); acceptable for demos or not?
3. **Members vs Employees** — one concept or two? Today they contradict.
4. **Edit-active-policy semantics** — direct edit and a separate "new version" flow both exist; when must an edit become a version?
5. **`/login` role picker** — silent redirect to host login; should a chooser exist (the visual panel varies nicely per role already)?
6. **Org-portal employee detail depth** — single page (org) vs 5 tabs (host): intentional simplification or drift?
7. **Claims detail scope** — omitted everywhere; decide the minimum credible claim record.
8. **Needs-Action filter** default "None" label on organisations — unclear what "None" means (no action needed? no filter?).

---

## H. Prioritised Improvement Plan

**P0 — prevents core flows from being understood or completed**
1. **Policy detail tab switching** — [policy-detail-view.tsx:151](components/host/policies/policy-detail-view.tsx:151). Remove/replace the `AnimatePresence mode="wait"` wrapper (or upgrade/repair the framer-motion usage); no dependency. Risk: none beyond losing a 0.18s fade. Validate: click all 5 tabs, plus `?tab=` deep link.
2. **Hydrate policy edit** — [edit/page.tsx:30](app/(host)/policies/[id]/edit/page.tsx:30): fall back to policy data from the mock registry when no sessionStorage draft. Depends on: none. Validate: open edit on POL-0001 fresh session → fields prefilled; draft still wins after Review-and-back.
3. **`/services` infinite Suspense** — [services/page.tsx:207](app/(host)/services/page.tsx:207): find the suspending import (store/ICON_LIBRARY) — child route `/services/new` works, so diff their imports. Validate: category grid renders; `[category]` + edit reachable.
4. **Mobile nav trigger** — TopBar: render `SidebarTrigger` below `lg`; sidebar opens as drawer. Validate at 375px: navigate between three modules.

**P1 — major navigation / flow / product-logic problems**
5. **Kill or stub `/invoices` + `/settlements`** ([app-sidebar.tsx:94-100](components/shared/app-sidebar.tsx:94)); also dedupe the second Claims entry. Validate: no sidebar link 404s.
6. **Single mock registry** — collapse `MOCK_EMPLOYEES`/`MOCK_EMPLOYEE_ENTITIES`/tab-local file; derive all counts; org-filter claims/voucher arrays (fixes the `GHL-156` leak); reconcile policy status/dates; align voucher catalog with claims; purge healthcare names per AGENTS.md §5. Biggest single believability win. Risk: touches many screens — do module-by-module with `check:policy` + manual sweep. Validate: Acme headcount identical on all six surfaces.
7. **SP loop** — coming-soon link → `/signout?to=/login/serviceprovider`. Validate: SP can reach other logins.
8. **Role + slug guards** — `(org)` layout validates slug against registry & session; `(host)` layout checks role; wrong → redirect to own portal. Product decision first (G11-2). Validate: org admin hitting `/dashboard` lands back on `/{slug}/dashboard`.
9. **Claim detail sheet** shared by host/org claims tables; include status timeline + voucher link. Depends on: 6 (ids must agree). Validate: every claims surface opens the same sheet.
10. **Org-create landing** — insert created org into registry (or return to list with highlight); add unknown-id state to org detail. Validate: create flow ends on a believable screen.

**P2 — significant confusion / inconsistency / duplication**
11. Status-label map (kills `Pending_review`, `full-time`); shared date util; pick one spelling (Organisation) for copy and labels. Validate: grep for `_` in rendered statuses.
12. Replace custom Add-Branch sheet with `ui/sheet` (fixes hidden-tabbable + focus trap). Validate: Tab order with sheet closed never enters it.
13. Merge sidebars into one configurable shell; wire Account Settings (or remove item); remove SSO button or mark "soon"; fix ToS/Privacy hrefs.
14. Merge the two claims tables; standardise inputs on `ui/input`; single initials util (strip Sdn Bhd/Bhd suffixes).
15. Delete "FALLBACK" debug fallbacks; replace with skeletons. Trim entrance animations on tables (blank-table window).
16. Align stubs: either link `/transactions`/`/settings`/`/users` with Coming Soon badges or delete routes; remove `(serviceprovider)` layout and stale `routes` constants.

**P3 — polish / a11y / maintainability**
17. aria-labels on icon-only buttons; tablist semantics on tab bars; stop rendering metric cells as buttons.
18. Z-index token scale; remove `h-[60vh]` spacers (scroll-margin).
19. Title Case sweep ("Top service categories", "Add tier", "COMPLIANCE DOCUMENTS"); singular/plural label sweep; audit-log duplicate timestamps.
20. Honour `prefers-color-scheme` (or document light-default as intended).

---

## Coverage checklist

**Runtime-visited:** login (all 3 roles), signout w/ `to=`, host: dashboard, organizations (list/detail all 7 tabs/new step 1+2 code), policies (list/detail overlay + all tab clicks/new/edit), employees (list/detail + entitlement tab), claims, accounts, transactions, reports, settings, services (+new), brands, users (+members/administrators/admin detail), voucher-packages (+add flow into SP wizard), service-providers detail, audit-log, /invoices, /coming-soon (loop test), not-found; org portal: dashboard, employees (list/detail), policies (list/detail), claims, vouchers, reports, settings, activity, cross-slug + cross-role probes; mobile (dashboard + organizations) and dark mode.
**Code-audited without runtime walk (patterns consistent with visited kin):** brands new/edit forms, employee new/edit, SP new/edit, branch new/edit pages, bulk-upload wizard, version wizard, groups/edit, voucher list page `[id]/vouchers`, manual top-up + update-balance modals, notification center, ⌘K search. These are the residual **Needs runtime verification** set; none is load-bearing for the findings above.

*Report generated by prototype audit per `docs/prototype-audit.md`. No repository files were modified other than this report.*
