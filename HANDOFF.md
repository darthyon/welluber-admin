# Session Handoff

## State
- **Entitlement + employee identity consolidation complete (5 phases).** Plan:
  `~/.claude/plans/as-known-in-handoff-synthetic-dewdrop.md`.
  - **Identity**: `lib/mock-data/employee-identity.ts` is the single source for who an
    employee is. `seed.ts` + all 5 factories resolve names through it, so
    `EMP-20260115-0001` is Robert Fox in every dataset. Guarded by
    `tests/unit/mock-identity.test.ts`.
  - **Spend is derived, never typed**: `lib/entitlement/derive-usage.ts` folds
    `MOCK_EMPLOYEE_CLAIMS` into `BeneficiaryUsage`. `confirmed` + `pre-auth` consume;
    `cancelled` does not. Claim totals now equal entitlement `used` for all 6 employees.
  - **One calculation**: `features/employees/entitlement-pool-display.ts`, reached via
    the new `features/employees/entitlement-resolver.ts`.
  - **One component**: `components/shared/entitlement-pools.tsx`, used by both the host
    tab and the org portal — they can no longer disagree.
  - Both `void employeeId` bugs fixed; Claims/Vouchers tabs filter per employee.
- Net ~1300 lines removed. `employee-entitlements-tab.tsx` 1346 → 52.
  `factories/entitlement.ts` 228 → 56 (`getEmployeeEntitlements` deleted, no callers).
- Address model consolidated (`4599222`) + `Organization.address` migration: shared
  `Address` type in `types/address.ts` adopted across orgs, branches, service providers,
  employees.
- `pnpm typecheck`, `pnpm lint:design`, `pnpm build` all clean.
- **Docs reorganised.** `docs/SNAPSHOT-2026-08.md` (system state), `docs/flows/`
  (7 module flows + index, 24 mermaid diagrams, written from the code). Deleted
  `prototype-audit.md` / `run-prototype-audit.md`. Fixed 20 dead cross-reference
  links in `prd.md` §11 and stale typography in `design.md`.

## Next
- **Run `pnpm test:unit` and `pnpm test:e2e` — neither was run this session.** Unit
  expectations changed in Phase 3 (the first `describe` in
  `entitlement-pool-display.test.ts` asserted against a fixture set that no longer
  exists and was rewritten one-test-per-pool-kind).
- E2E: `tests/e2e/address-model-verification.spec.ts`, 14 tests, last full run 12/14
  green and not re-run since the wizard fix. ADDRESS-08-01 should pass now; 08-02 /
  08-03 have never run (serial mode blocks them). The other 4 specs predate the auth
  bypass and likely still fail in `beforeEach`.
- `entitlements-sub-tab.tsx` (org Entitlements table) still reads `MOCK_ENTITLEMENTS`
  rather than the resolver. Left alone deliberately: it is a cross-employee roster, so
  a per-employee resolver would mean N calls per render. Its allocated/used therefore
  do not yet reconcile with the detail views.
- **Open design question**: for `individual` dependent wallets, `summary.allocated`
  counts only the employee ceiling while `summary.used` includes dependent spend.
  Ahmad reads 5000/2490/2510 — which matches the spec wireframe exactly — but his
  groups allocate 8600 once each dependent's own wallet is counted. Decide whether the
  summary should add dependent allocations.
- `LocationPicker` renders an error message for `line` only — city/postalCode/state/
  country get a red border and no text. **Unfixed.**
- Acme's `"Wilayah Persekutuan"` is not in `LocationPicker`'s state list, so it renders
  blank if loaded into that form. **Unreconciled.**
- `factories/user.ts` has a **Member** named "Jenny Wilson", colliding with employee
  0002. Different entity, so not identity drift, but confusing in the UI.

## Blockers / decisions
- Canonical identity = `seed.ts` `MOCK_EMPLOYEES`; org **names** come from the
  `Organization` entity, so `"ACME Corporation"` → `"Acme Corporation Sdn Bhd"` and
  `"Global Health Ltd"` → `"Global Tech Solutions"` (also removes a healthcare name).
- 12 documented combos collapse to **4 pool kinds** (`employee` / `individual` /
  `combined` / `shared`). Docs rewritten; the 12 survive as an appendix.
- UC6–UC8 **deleted, not remapped**: `benefitPoolType: "Shared"` plus an explicit
  `dependentsPoolType` is an invalid product state. Do not re-add.
- Ceiling precedence intentionally differs by scope — group cap wins per group,
  `policy.dependentCapAmount` wins across groups. Documented in spec §2.1.
- `getEmployeeEntitlement` returns `null` for no policy; the `?? policyA` fallback that
  silently rendered Robert Fox for unknown ids is gone. Callers render empty states.
- Bugs fixed in passing: filler employees pointed at orgs 0008–0010 that are never
  created; `benefitPoolType: "Shared"` fell through to `individual` (Jason 4000 → 2000);
  combined pools ignored `totalCapAmount` (Michael 1600 → 800); voucher `v3` was a
  dependent of an employee who has none.
- Address migration chosen over "just populate `address`" to kill the dual source of
  truth — the compiler immediately found the org wizard writing both shapes.
- Do NOT rename "Benefit Policy" (standing rule). `components/ui/` is shadcn-managed,
  never edit. Claims/Vouchers tabs stay separate by design.
- Mock data: no healthcare domains — Retail/Tech/Logistics, flexi benefits.
- Demo logins: `scripts/create-demo-accounts.ts`.
- Test setup: `proxy.ts` (Next 16's renamed middleware) guards every route — Playwright's
  `webServer` blanks the Supabase env vars to take the no-credentials bypass. `pnpm dev`
  and `pnpm test:e2e` cannot run together (both want `.next/dev/lock`). Every test fails
  its first attempt on a cold Turbopack compile and passes on retry, hence `timeout: 120s`.
