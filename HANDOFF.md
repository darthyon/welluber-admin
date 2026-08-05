# Session Handoff

## State
- Branch `playground`, 2 new commits, **unpushed**: `b22fc73` entitlement consolidation
  (24 files, −529 net), `e97a4f5` docs (19 files).
- Entitlement is done: one identity source (`lib/mock-data/employee-identity.ts`), spend
  derived from claims (`lib/entitlement/derive-usage.ts`), one calculation
  (`features/employees/entitlement-pool-display.ts`) reached via `entitlement-resolver.ts`,
  one component (`components/shared/entitlement-pools.tsx`) shared by host + org portal.
  `employee-entitlements-tab.tsx` 1346 → 52 lines.
- Docs: `docs/SNAPSHOT-2026-08.md` (system state, gaps, plan) and `docs/flows/`
  (7 module flows + index, 24 mermaid). `pnpm typecheck` / `lint:design` / `build` clean.

## Next
1. **BLOCKED — rotate the Mapbox token before any push.** `gitleaks` found it hardcoded
   in 5 places in history (`ba26ba5` 2026-04-03, `09d9071` 2026-04-05, +3). Current tree
   is clean (all four call sites use `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`); history is
   not. Revoke at account.mapbox.com, reissue URL-restricted. Then decide whether to
   scrub history (`git filter-repo`) or leave it — dead token is acceptable.
2. **Restore the gitleaks pre-push hook.** Added in `2ba6f97`, now gone — no `.husky`, no
   `.git/hooks`, nothing in `package.json`. Binary is installed. This is why the leak
   surfaced only on a manual check.
3. **Run `pnpm test:unit` and `pnpm test:e2e` — neither ran this session.** Unit
   expectations changed: the first `describe` in `entitlement-pool-display.test.ts`
   asserted against a fixture set that no longer existed and was rewritten per pool kind.
4. PR target agreed: **whole `playground` branch** (25 commits, 192 files) → `main`.

## Blockers / decisions
- **Open product question**: for `individual` dependent wallets, `summary.allocated`
  counts only the employee ceiling while `summary.used` includes dependent spend. Ahmad
  reads 5000/2490/2510 (matches the spec wireframe) but his groups allocate 8600. Needs a
  decision, not a code fix.
- **Two dependent ID schemes, unreconciled**: `factories/dependent.ts` emits
  `DEP-20260115-0001`; entitlement fixtures use `DEP-0002-1`. Biggest remaining data gap.
- 12 pool combos collapse to **4 kinds**; `benefitPoolType:"Shared"` + explicit
  `dependentsPoolType` is invalid — UC6–UC8 deleted, do not re-add.
- Canonical employee identity = `seed.ts` `MOCK_EMPLOYEES`; org names come from the
  `Organization` entity. Guarded by `tests/unit/mock-identity.test.ts`.
- Still open: `LocationPicker` error text (only `line` shows a message); Acme's
  `"Wilayah Persekutuan"` missing from its state list; `entitlements-sub-tab.tsx` bypasses
  the resolver; employee create + account top-up validate but never persist.
- Don't rename "Benefit Policy". Never edit `components/ui/`. Claims/Vouchers tabs stay
  separate. Mock data: Retail/Tech/Logistics, flexi benefits, no healthcare.
