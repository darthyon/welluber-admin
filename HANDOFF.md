# Session Handoff

## State
- Full prototype audit completed and saved to `docs/prototype-audit-results.md` (runtime click-through of all 3 personas + static component/token audit).
- All four P0s fixed and runtime-verified:
  1. `AnimatePresence mode="wait"` swaps hang app-wide (framer-motion exits never complete here). Replaced with CSS `animate-in` keyed divs in 8 files: `policy-detail-view`, `benefit-policy-wizard`, `version-wizard`, `employee-card`, and view toggles on organisations / service-providers / users/members / users/administrators pages.
  2. `/policies/[id]/edit` now hydrates from `MOCK_POLICIES` + `MOCK_POLICY_DATA_MAP` when no sessionStorage draft.
  3. `/services` hang was stale dev-server compile state, not code — no change.
  4. Mobile nav: `SidebarTrigger` added to `TopBar` (`md:hidden`), covers both portals.
- `pnpm typecheck` + `pnpm lint:design` clean; changed files prettier-formatted.

- P1 "org create lands on empty page" fixed: created org + dedicated HQ account now registered in `orgStore`/`accountStore` + `Registry` maps; detail and list pages read from `useOrganizations()`. Org ids now `ORG-NEW-YYYYMMDD-XXXX`. "Link to existing wallet" removed from org creation — HQ account is always new (schema, step-2 UI, and page state simplified). Note: created orgs live in the in-memory mock store — they survive client-side navigation but reset on full page reload (same convention as the service-taxonomy store).

## Next
- Remaining P1s from the audit report: remove/stub `/invoices` + `/settlements` sidebar links; consolidate parallel mock datasets (root cause of most data contradictions); fix SP coming-soon ↔ login loop; role/slug guards; claim detail sheet.
- Check remaining `AnimatePresence` (no `mode="wait"`) sites for hung exit animations — e.g. post-create modal in `benefit-policy-wizard` may linger on close.

## Blockers / decisions
- Do NOT rename "Benefit Policy" terminology (standing rule).
- `components/ui/` is shadcn-managed, never edit — mobile drawer's missing `DialogTitle` dev warning is accepted for now.
- Demo logins: `scripts/create-demo-accounts.ts`. Claims/Vouchers tabs stay separate by design.
