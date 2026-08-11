# Session Handoff

## State
- **PR #48** `members-detail-page` → base `playground` (6 commits). Members, administrators,
  and maps. Merges after #47.
- Both user modules had gaps behind working-looking UI: members had no detail route at all
  (actions were `console.log`, cards linked to routes that 404'd); administrator editing was
  stubbed the same way. Both now built.
- Members: detail route with **Member Details / App Activity / Settings** tabs, revoke and
  restore in the settings danger zone, `uuid` / `device` / seeded activity on `Member`.
- Administrators: **Administrator Details / Audit Log / Settings** tabs, inline detail
  editing, `mobile` field, Send Reset Link dialog, and an Access section with a module
  checkbox catalog (`features/users/module-catalog.ts`) mirroring the sidebar groups.
- Maps: Mapbox gone. `components/shared/location-map.tsx` renders 15 static CARTO Positron
  tiles in `public/map-tiles` — no key, no runtime request, works offline.
- Shared: `EntityAvatar` gained a `shape` prop; employee, member, and admin headers all use
  the square variant, so they can no longer drift. Breadcrumbs resolve member and admin
  names. Redundant back buttons removed.
- `tsc --noEmit` and `eslint` clean. **Unit and e2e have not been run on this branch.**

## Next
1. Run `pnpm test:unit` and `pnpm test:e2e` before merging. `Member` now *requires* `uuid`,
   which is the likeliest fixture breakage. None of the new work has coverage.
2. Decide whether members should link to employee records — `MEM-…` has no mapping to
   `EMP-…`, so claims, vouchers, and entitlements cannot surface on a member and the
   activity timeline stays seeded rather than real.
3. Module access is presentational only. If it should gate anything, that is unbuilt, and
   `MODULE_CATALOG` is hand-mirrored from `app-sidebar.tsx` — they drift silently.
4. `components/host/users/admin-view-dialog.tsx` is dead code, zero references.

## Blockers / decisions
- **Members is read-only by design.** No edit tab — workforce edits belong in Employees.
  Revoking does not write to the activity timeline; that feed is seeded, no store behind it.
- **Send Reset Link does not update the record** when you change the recipient address. The
  dialog says so. Change this only if the product wants the opposite.
- Mapbox token was deleted and the default refreshed. The dead string remains in history
  (`ba26ba5`, `09d9071`, +2); a scrub is cosmetic and would rewrite every SHA. `gitleaks`
  runs from `.githooks/pre-push` via `core.hooksPath` — it only scans unpushed commits.
- **Open product question**: for `individual` dependent wallets, `summary.allocated` counts
  only the employee ceiling while `summary.used` includes dependent spend. Ahmad reads
  5000/2490/2510 but his groups allocate 8600. Needs a decision, not a code fix.
- **Two dependent ID schemes**: `factories/dependent.ts` emits `DEP-20260115-0001`;
  entitlement fixtures use `DEP-0002-1`. Biggest remaining data gap.
- Don't rename "Benefit Policy". Never edit `components/ui/`. Claims/Vouchers tabs stay
  separate. Mock data: Retail/Tech/Logistics, flexi benefits, no healthcare.
