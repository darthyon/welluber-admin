# Session Handoff

## State
- Address model consolidated (`4599222`): shared `Address` type in `types/address.ts` (line/city/state/postalCode/country + flat lat/lon) adopted across orgs, branches, service providers, employees. Also employee tier roles.
- `Organization.address` migration now committed on top: type went `address?: Address` + legacy flat `state`/`country` → `address: Address` required; factory/seed populate it; readers updated (`settings/page.tsx`, `organization-card`, `organizations-data-table`); org wizard seeds an empty `address` in `defaultValues`. `pnpm typecheck` + `pnpm lint:design` both clean.
- E2E suite: `tests/e2e/address-model-verification.spec.ts`, 14 tests. Last full run **12/14 green** — not re-run since the wizard fix.
- Test setup notes: `proxy.ts` (Next 16's renamed middleware) guards every route — Playwright's `webServer` blanks the Supabase env vars to take the built-in no-credentials bypass. `pnpm dev` and `pnpm test:e2e` cannot run together (both want `.next/dev/lock`). Every test fails its first attempt on a cold Turbopack compile and passes on retry, hence `timeout: 120s`.
- Entitlement UI is done and shipped (`2590ee5`). Audit's sub-tab nesting P2 and label drift are both resolved — org `TABS` is flat, one Claims surface.

## Next
- Re-run `pnpm test:e2e`. ADDRESS-08-01 should pass now; 08-02 / 08-03 have never run (serial mode blocks them).
- **Mock data identity collision (real, unfixed)**: `EMP-20260115-0001` is Robert Fox in `seed.ts` (`MOCK_EMPLOYEE_UTILISATION`, `MOCK_EMPLOYEES`) but Ahmad Faizal in `factories/organization.ts` (`MOCK_ORG_UTILISATION`), `factories/claim.ts`, `factories/voucher.ts`. Same drift on 0002 / 0004 / 0005. Five parallel datasets, no shared employee identity.
- `employee-claims-tab.tsx` does `void employeeId` — every employee shows the same 12 claims (RM 3,370). `MOCK_EMPLOYEE_CLAIMS` has no `employeeId` to filter on. Contradicts Robert's RM 300 entitlement spend.
- `LocationPicker` renders an error message for `line` only — city/postalCode/state/country get a red border and no text. Unfixed.
- Acme's `"Wilayah Persekutuan"` is not in `LocationPicker`'s state list, so it renders blank if loaded into that form. Unreconciled.
- Other 4 e2e specs predate the auth bypass and likely still fail in `beforeEach`. Untouched.

## Blockers / decisions
- Address migration chosen over the smaller "just populate `address`" option to kill the dual source of truth — the compiler immediately found the org wizard writing both shapes.
- Mock-data consolidation deliberately deferred: it is a large job across seed + 3 factories + `employee-entitlements-mock.ts`. Phase it and get sign-off before editing.
- Do NOT rename "Benefit Policy" terminology (standing rule).
- `components/ui/` is shadcn-managed, never edit.
- Demo logins: `scripts/create-demo-accounts.ts`. Claims/Vouchers tabs stay separate by design.
- Mock data: no healthcare domains — Retail/Tech/Logistics, flexi benefits.
