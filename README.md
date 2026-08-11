# WellUber Admin Console

Corporate wellness administration platform. Host, organisation, and service-provider personas managing benefit policies, employee entitlements, claims, vouchers, and provider services — all from a single interface.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui (radix-luma style)
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Font**: Geist Variable + Geist Mono
- **Package Manager**: pnpm
- **Theme**: Light-mode default, full dark mode via `next-themes`

## Design System

**Precision Infrastructure** — inspired by Linear and Vercel. Every pixel intentional, whitespace is structural, borders define surfaces.

- **Primary Source of Truth**: [`AGENTS.md`](AGENTS.md) — read this before touching any code
- **Design Detail**: [`docs/design.md`](docs/design.md)
- **Typography**: Max weight 600 (`font-semibold`). Never `font-bold`. Token scale: `text-micro` through `text-display`
- **Color**: OKLCH-based CSS custom properties. Brand: `#4338CA` (`oklch(0.457 0.215 277.023)`)
- **Radius**: Pill-shaped interactive triggers (`rounded-4xl`), card surfaces (`rounded-lg`)
- **Lint Guardrails**: `pnpm lint:design` enforces 17 rules — zero violations policy

## Project Structure

```
app/
  (host)/           — Host persona routes (policies, organisations, service providers, claims)
  (org)/            — Organisation admin routes (employees, branches)
  (serviceprovider)/ — Service provider routes (packages, bookings)

components/
  shared/           — Cross-domain UI (StatusBadge, DataTable, EmptyState, AppSidebar, TopBar)
  host/             — Host-specific components
  org/              — Organisation-specific components

features/
  [domain]/         — Business logic, types, hooks per domain (policies, employees, providers)

lib/
  mock-data/        — Seed data, factories, stores, registries
  policy/           — Policy validation, glossary

hooks/              — Shared React hooks

types/              — Core domain types (policies, employees, claims)
```

## Key Domains

| Domain | Description |
|---|---|
| **Policies** | Benefit policy authoring with groups, amounts, co-payments, eligibility filters, versioning |
| **Organisations** | Multi-tenant org management with tiers, departments, branches |
| **Employees** | Employee directory, assignments, entitlements, utilisation tracking |
| **Service Providers** | Provider onboarding, service taxonomy (70+ services), package authoring |
| **Claims** | Claim submission, approval workflows, reimbursement tracking |
| **Vouchers** | Voucher generation, redemption, top-up management |
| **Accounts** | Wallet balances, transaction history, audit logging |

## Unified Service Taxonomy

All 70+ wellness services share a single canonical catalog in `features/providers/service-taxonomy.ts`:

- **Short meaningful IDs**: `FX-GYM`, `MH-THR`, `MB-REL`, `NT-NUT`
- **Flat policy catalog**: `POLICY_SERVICE_CATALOG` for benefit group authoring
- **Sub-services hidden in policy UI** — only visible in service provider package creation

## Verification

Run the fast global checks for every change:

```bash
pnpm lint         # ESLint check
pnpm lint:design  # Design system guardrails
pnpm typecheck    # TypeScript strict check
```

### Impact-Based Testing

Run behavioral tests based on the code and user flow changed. Do not run
unrelated unit or end-to-end suites for every edit.

```bash
# Target the unit file that covers the changed logic.
pnpm test:unit tests/unit/entitlement-pool-display.test.ts

# Target the E2E flow affected by the change.
pnpm test:e2e tests/e2e/benefit-policy.spec.ts
```

- Unit tests cover deterministic business logic and data transformations.
- E2E tests cover the affected user journey, validation, navigation, and
  error states in a real browser.
- Changes to shared components expand testing to every consumer. For example,
  changes to `FormActionBar` or `FormStepIndicator` require coverage across
  the organization, employee, policy, provider, voucher, brand, category, and
  branch flows.
- Run the complete suite at merge and release checkpoints:

```bash
pnpm build
pnpm test:unit
pnpm test:e2e
```

An unrelated failing suite should be reported separately from the targeted
verification for the current change; it should not be silently skipped or
made less strict.

## Pre-Submit Checklist

1. No `font-bold` anywhere. Max weight 600.
2. No hardcoded hex/Tailwind colors (`text-white`, `bg-white`, `zinc-*`, `slate-*`, `red-500`).
3. Interactive triggers use `rounded-4xl`.
4. All headers and labels in Title Case.
5. Status colors use `<StatusBadge>` or `<PulseStatus>`. Spinners use `<Spinner>`.
6. Dark mode safe — no `text-white` or `bg-white` that would break dark mode.

## Shared Components

Before creating a new component, check if one already exists:

| Component | Purpose |
|---|---|
| `StatusBadge` | Static status pills (emerald/amber/rose/primary/zinc) |
| `PulseStatus` | Animated status with ping dot |
| `Spinner` | Loading spinner (primary/white/destructive) |
| `SuccessModal` | Quiet success confirmation pattern |
| `DataTable` | Shared table with sorting/filtering |
| `EmptyState` | Consistent empty state illustrations |
| `PhoneInput` | International phone input with country select |
| `LocationPicker` | Address + lat/lon picker |
| `ThemeToggle` | Light/dark toggle |
| `AppSidebar` | 240px frosted glass sidebar |
| `TopBar` | h-14 frosted glass top bar |

## Adding shadcn Components

```bash
npx shadcn@latest add [component]
```

> Never modify files in `components/ui/` — managed by shadcn CLI.

## Constraints

- ❌ Never commit secrets, API keys, or credentials
- ❌ Never use `<a>` tags — use Next.js `<Link>`
- ❌ Never use `useEffect` for data fetching — use Server Components or React Query
- ❌ Never hardcode color values — always use CSS variables
- ❌ Never use `px` units for spacing — use Tailwind spacing scale
- ❌ Never use `console.log` in production code
- ❌ Never create files outside of `app/`, `components/`, `features/`, `lib/`, `hooks/`, `types/`
