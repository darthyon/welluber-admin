# WellUber Admin — Agent Instructions

> Read this file **first** before making any changes to this codebase.
> This is the single source of truth for design system constraints, shared components, and coding standards.

---

## 1. Stack & Architecture

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui (radix-luma style)
- **Icons:** Phosphor Icons (`@phosphor-icons/react`)
- **Font:** Geist Variable (via `next/font/google`), Geist Mono for technical values
- **Package Manager:** pnpm
- **Theme:** Light-mode default, full dark mode support via `next-themes` (class strategy)

---

## 2. Design System — Non-Negotiable Rules

These constraints are **enforced** by `pnpm lint:design`. Breaking them fails CI.

### 2.1 Typography
- **Max weight: 600 (`font-semibold`).** Never use `font-bold` (700). This applies to headings, card titles, table headers, badges, dialog titles — without exception.
- Use the token scale exclusively:
  - `text-micro` (10px) — badges, timestamps only
  - `text-label` (12px) — labels, captions, table headers
  - `text-body` (14px) — body, nav, inputs, table cells
  - `text-lead` (16px) — section titles, card headers
  - `text-heading` (20px) — page titles, modal titles
  - `text-title` (24px) — major page headers
  - `text-display` (32px) — KPIs, hero values
- `tracking-tight` on page titles only.
- **Title Case** for all headers and labels: "Employee Directory", not "Employee directory".
- `uppercase` restricted to two contexts only:
  1. Sidebar section labels (`SidebarGroupLabel`)
  2. Technical ID badges — monospaced with `uppercase tracking-widest font-mono`

### 2.2 Color Tokens — Never Hardcode
Use CSS custom properties from `globals.css` exclusively.

| Token | Light | Dark |
|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.12 0.01 260)` |
| `--foreground` | `oklch(0.147 0.004 49.25)` | `oklch(0.985 0.001 106.423)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.16 0.012 260)` |
| `--primary` | `oklch(0.457 0.215 277.023)` | `oklch(0.56 0.208 277.117)` |
| `--primary-foreground` | `oklch(0.97 0.018 272.314)` | `oklch(0.97 0.018 272.314)` |
| `--muted` | `oklch(0.97 0.001 106.424)` | `oklch(0.18 0.01 240)` |
| `--muted-foreground` | `oklch(0.54 0.013 58.071)` | `oklch(0.65 0.015 240)` |
| `--accent` | `oklch(0.97 0.001 106.424)` | `oklch(0.20 0.02 276)` |
| `--border` | `oklch(0.923 0.003 48.717)` | `oklch(1 0 0 / 12%)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--ring` | `oklch(0.457 0.215 277.023)` | `oklch(0.56 0.208 277.117)` |

> **Brand color:** `#4338CA` = `oklch(0.457 0.215 277.023)`. Use exact values.

### 2.3 Banned Patterns (lint:design will fail)
- `font-bold`
- `text-white`, `bg-white` (except brand SVGs)
- `border-zinc-*`, `bg-zinc-*`, `text-zinc-*`
- `border-slate-*`, `bg-slate-*`, `text-slate-*`
- `bg-red-500`, `text-red-500`, `bg-red-600`, `text-red-600`
- `bg-indigo-*`, `text-indigo-*` (for structural UI)
- `bg-muted0`, `text-muted0`
- Hardcoded `shadow-[...rgba(...)]`
- Arbitrary `text-[...px]` font sizes (allowed in `components/ui/` only)
- Inline semantic status colors (`bg-emerald-500/10 text-emerald-600`) — use `StatusBadge` or `PulseStatus`

### 2.4 Component Patterns
- **Buttons:** `rounded-4xl` for pill shape. Variants: `default` (CTAs), `ghost` (secondary), `outline` (filters/danger), `destructive`.
- **Cards:** `bg-card border border-border rounded-lg`
- **Inputs:** `bg-muted/50 border border-border rounded-lg focus:ring-1 focus:ring-ring`
- **Nav items:** `text-[13px] rounded-md px-3 py-1.5`
- **Badges:** `text-xs font-medium px-2 py-0.5 rounded-full`

### 2.5 Semantic Colors
Status colors use Tailwind utilities with `dark:` variants. Never use them for structural UI.

| Semantic | Pattern | Usage |
|---|---|---|
| Success/Active | `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20` | Active, approved, positive |
| Warning/Pending | `bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20` | Pending, attention |
| Danger/Error | `bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20` | Errors, rejected, destructive |
| Neutral | `bg-muted/10 text-muted-foreground dark:text-faint` | Inactive, archived |
| Brand | `bg-primary/10 text-primary border-primary/20` | Selected, active filters, links |

---

## 3. Shared Components — Use These, Don't Reinvent

| Component | Path | Purpose |
|---|---|---|
| `StatusBadge` | `components/shared/status-badge.tsx` | Static status pills (emerald/amber/rose/primary/zinc) |
| `PulseStatus` | `components/shared/pulse-status.tsx` | Animated status with ping dot (active/pending/suspended/draft) |
| `Spinner` | `components/shared/spinner.tsx` | Loading spinner (primary/white/destructive variants) |
| `SuccessModal` | `components/shared/success-modal.tsx` | Quiet success confirmation pattern |
| `PhoneInput` | `components/shared/phone-input.tsx` | International phone input with country select |
| `LocationPicker` | `components/shared/location-picker.tsx` | Address + lat/lon picker |
| `FloatingAnchorNav` | `components/shared/floating-anchor-nav.tsx` | Sidebar jump-links for long forms |
| `TwoColumnDetailLayout` | `components/shared/two-column-detail-layout.tsx` | 2/3 + 1/3 detail page layout |
| `DataTable` | `components/shared/data-table.tsx` | Shared table with sorting/filtering |
| `EmptyState` | `components/shared/empty-state.tsx` | Consistent empty state illustrations |
| `ThemeToggle` | `components/shared/theme-toggle.tsx` | Light/dark toggle |
| `AppSidebar` | `components/shared/app-sidebar.tsx` | 240px frosted glass sidebar |
| `TopBar` | `components/shared/top-bar.tsx` | h-14 frosted glass top bar |

> **Rule:** Before creating a new component, check if a shared one already exists. Before hardcoding a spinner, use `<Spinner>`. Before inline status colors, use `<StatusBadge>`.

---

## 4. File Organization

- Route pages: `app/(host)/`, `app/(org)/`, `app/(serviceprovider)/` — keep thin
- Business logic: `features/[domain]/`
- Shared UI: `components/shared/`
- Persona-specific UI: `components/[persona]/`
- shadcn primitives: `components/ui/` — **do not modify**

---

## 5. Constraints (NEVER Do)

- ❌ Never commit secrets, API keys, or credentials
- ❌ Never modify files in `components/ui/` — managed by shadcn CLI
- ❌ Never use `<a>` tags — use Next.js `<Link>`
- ❌ Never use `useEffect` for data fetching — use Server Components or React Query
- ❌ Never hardcode color values — always use CSS variables
- ❌ Never use `px` units for spacing — use Tailwind spacing scale
- ❌ Never create files outside of `app/`, `components/`, `features/`, `lib/`, `hooks/`, `types/`
- ❌ Never use `console.log` in production code
- ❌ **Test cases and mock data must never use healthcare/clinical orgs as example companies, and must never reference inpatient, outpatient, or clinical services as benefits.** All benefit examples must be flexi-benefit (gym, fitness, wellness, nutrition, mental health lifestyle, optical, dental lifestyle). Org examples should use industries like Retail, Technology, Logistics, Finance, Education, or Manufacturing.

---

## 6. Verification Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm lint:design  # Design system guardrails
pnpm typecheck    # TypeScript strict check
pnpm format       # Prettier formatting
```

Run **all** of these before submitting changes.

---

## 7. Pre-Submit Checklist

Before every PR or agent session output, verify:

1. [ ] **Typography:** No `font-bold` anywhere. Max weight 600.
2. [ ] **Tokens:** No hardcoded hex/Tailwind colors (`text-white`, `bg-white`, `zinc-*`, `slate-*`, `red-500`).
3. [ ] **Radius:** Interactive triggers (buttons, badges, toggles) use `rounded-4xl`.
4. [ ] **Casing:** All headers and labels in Title Case.
5. [ ] **Density:** Body text is `text-sm` (14px) / `text-body`.
6. [ ] **Components:** Status colors use `<StatusBadge>` or `<PulseStatus>`. Spinners use `<Spinner>`.
7. [ ] **Dark mode:** No `text-white` or `bg-white` that would break dark mode.

---

## 8. Design Philosophy

**Precision Infrastructure** — inspired by Linear and Vercel.

- Every pixel intentional. No decoration without information purpose.
- Whitespace is structural — generous between sections, tight within groups.
- Active states are subtle (`bg-accent`). Reserve brand color for CTAs only.
- Borders define surfaces, not shadows.
- Left-aligned asymmetry. Avoid centering everything.

---

## 9. Knowledge Graph

A live knowledge graph of this codebase lives in `graphify-out/`.

**Before analyzing structure, imports, dependencies, or component relationships — query the graph first.**
It is faster and more accurate than reading files cold.

### Quick reference
- `graphify-out/GRAPH_REPORT.md` — god nodes, community map, surprising connections
- `graphify-out/graph.json` — raw graph data (nodes, edges, communities)

### God nodes (highest connectivity — touch carefully)

| Node | Edges | Location |
|------|-------|----------|
| `cn()` | 300 | `lib/utils.ts` |
| `Button` | 89 | `components/ui/button.tsx` |
| `OrganizationDetailContent` | 47 | `app/(host)/organizations/[id]/page.tsx` |
| `StatusBadge` | 41 | `components/shared/status-badge.tsx` |
| `ActionPopover` | 33 | `components/shared/action-popover.tsx` |
| `BenefitPolicyWizard` | 23 | `components/host/policies/benefit-policy-wizard.tsx` |

### How to query
```bash
graphify query "how does BenefitPolicyWizard relate to org context?"
graphify query "what components consume StatusBadge?"
graphify path "EmployeeForm" "BenefitPolicy"
graphify explain "OrganizationDetailContent"
```

### Key findings
- `OrganizationDetailContent` is a god component — branch, employee, policy, accounts, vouchers, manual topup, and audit log all wire through it. Candidate for splitting.
- `ClaimStatus` is shared between claims and voucher redemptions — changes ripple both domains.
- `POLICY_SERVICE_CATALOG` derives from `MASTER_SERVICE_TAXONOMY` (provider domain). Policy coverage options are downstream of SP taxonomy — not a separate config.
- `BenefitPolicyWizard` is entered from two paths: standalone `/policies/new` and org-scoped `/organizations/[id]/policies/new`. Draft state persists via `usePolicyDraft`.

### Keeping it current
After adding or significantly modifying files, run:
```bash
/graphify --update   # incremental re-extraction, skips unchanged files
```

---

*Last updated: 2026-05-18*
*Primary source: `docs/design.md` (reconciled with `app/globals.css`)*
