# Typography & Color Scorecard

> **Status:** Superseded by `AGENTS.md` (2026-04-30). Many items below have been resolved. This document is retained for historical reference only.

**Date:** 2026-04-11  
**Scope:** Full codebase audit — font tokens, color tokens, WCAG contrast, dark mode  
**Method:** Automated token extraction + WCAG 2.1 contrast math + component-by-pattern grep

---

## Summary Scores

| Category                   | Score   | Details                                           |
| -------------------------- | ------- | ------------------------------------------------- |
| **WCAG Contrast**          | 🔴 3/10 | 6 pairings fail AA; opacity variants catastrophic |
| **Dark Mode Correctness**  | 🔴 4/10 | 45+ hardcoded light-only values remain            |
| **Typography Consistency** | 🟡 6/10 | Token scale defined but 7 files bypass it         |
| **Token Discipline**       | 🟡 5/10 | 3 broken tokens, 15+ files using hardcoded colors |

---

## Critical — Blocks Users / Fails Accessibility

### C1. `text-muted-foreground` opacity variants fail WCAG on white backgrounds

Opacity-modified muted foreground is **invisible-level contrast** on `bg-background`:

| Class                      | Contrast on white | WCAG AA (4.5:1) | Files affected                                                                      |
| -------------------------- | ----------------- | --------------- | ----------------------------------------------------------------------------------- |
| `text-muted-foreground/20` | **1.19:1**        | ❌              | `sp-voucher-form.tsx`                                                               |
| `text-muted-foreground/30` | **1.31:1**        | ❌              | `employee-form.tsx` (11 instances), activity-timeline.tsx                           |
| `text-muted-foreground/40` | **1.46:1**        | ❌              | `sp-voucher-form.tsx` (12 instances), employee-form.tsx, searchable-multiselect.tsx |
| `text-muted-foreground/50` | **1.66:1**        | ❌              | `dashboard/page.tsx`, employee-card.tsx, bento-grid.tsx                             |
| `text-muted-foreground/60` | **1.91:1**        | ❌              | `organizations/[id]/page.tsx`, wallets pages, document-upload.tsx                   |

**Fix:** Replace all opacity variants below /70 with `/70` minimum. The base token is already borderline (4.81:1). Below 70% opacity the effective contrast plummets. Use the design doc's prescribed `text-muted-foreground/60` for placeholder text **only** (which exempts placeholders from WCAG AA), but actual readable text must be `/70` or higher.

---

### C2. `text-primary` on dark sidebar background — 2.52:1 contrast

`app-sidebar.tsx:178,200,232` — `text-primary` (oklch 0.457) on the sidebar dark glass (oklch 0.12).  
Contrast: **2.52:1** — fails even WCAG AA large text (3:1).

**Fix:** Use `text-sidebar-foreground` or `text-sidebar-primary-foreground` inside the sidebar. The sidebar already defines `--sidebar-primary-foreground` at oklch(0.962) which yields 17.6:1.

---

### C3. Dark mode `text-primary-foreground` on `bg-primary` — 4.09:1

Dark mode primary button: `oklch(0.962)` on `oklch(0.585)`.  
Contrast: **4.09:1** — fails WCAG AA normal text minimum (4.5:1).

**Fix:** Lighten dark mode `--primary-foreground` or darken `--primary`. Either push primary L to ~0.55 or push primary-foreground L to ~0.97. A target of 4.5:1 minimum needs the ratio to clear.

---

### C4. Dark mode `text-primary` on `bg-background` — 4.43:1

Dark mode primary text on background: `oklch(0.585)` on `oklch(0.12)`.  
Contrast: **4.43:1** — misses AA by 0.07.

**Fix:** Bump dark mode `--primary` L value from 0.585 to 0.595 (or adjust chroma). Either renders 4.5:1.

---

### C5. `muted-foreground` on `muted` background — 4.41:1 (borderline fail)

Light mode `text-muted-foreground` (oklch 0.553) on `bg-muted` (oklch 0.97).  
Contrast: **4.41:1** — misses AA by 0.09.

**Fix:** Either darken `--muted-foreground` slightly (L → 0.54) or lighten `--muted` (L → 0.975).

---

### C6. Broken token `muted0` — renders as transparent

`status-badge.tsx:19,27`, `activity-timeline.tsx:42`, `edit/page.tsx:258`, `benefit-policy-wizard.tsx:97`  
`bg-muted0`, `text-muted0` → undefined CSS variable, renders as `transparent` or no effect.

**Fix:** Replace with `bg-muted` or define `--muted0` token in `globals.css`.

---

## Major — Degrades Experience / Inconsistent / Breaks Dark Mode

### M1. `text-white` on 15 primary buttons instead of `text-primary-foreground`

15 files use `bg-primary text-white` for primary buttons. `text-white` doesn't respond to theme changes. Dark mode primary button should render `text-primary-foreground` (which is near-white but theme-aware).

**Files:** `sp-voucher-form.tsx`, `employee-form.tsx`, `services/page.tsx`, `choice-card.tsx`, `data-filter-bar.tsx`, `advanced-filter-sheet.tsx`, `activity-timeline.tsx`, `category-detail-sheet.tsx`, `benefit-policy-card.tsx`, `benefit-policy-wizard.tsx` (5 instances), `link-policy-modal.tsx`, `branch-form.tsx`, `bulk-upload-wizard.tsx`

---

### M2. `bg-white` on 12 files — breaks dark mode

Hardcoded `bg-white` stays white in dark mode, creating jarring bright patches.

**Fix:** Replace with `bg-background` or `bg-card`.

**Key files:** `wallets/page.tsx`, `wallets/[id]/page.tsx`, `organizations/[id]/page.tsx`, `policies/page.tsx`, `services/page.tsx`, `error.tsx`, `document-upload-section.tsx`, `choice-card.tsx`, `data-table.tsx`, `benefit-policy-wizard.tsx` (5 instances), `policy-detail-sheet.tsx`, `bulk-upload-wizard.tsx`

---

### M3. `border-zinc-*` / `border-slate-*` on 15 files — invisible in dark mode

`border-zinc-200` and `border-zinc-100` are light-mode-only values. In dark mode they render as near-white lines on a dark background.

**Fix:** Replace with `border-border` or `border-border/60`.

**Worst offender:** `benefit-policy-wizard.tsx` (14 instances of `border-zinc-*`)

---

### M4. Inconsistent semantic color usage — hardcoded Tailwind classes bypass status components

`status-badge.tsx` and `pulse-status.tsx` correctly map status → color. But 30+ files hardcode the same colors inline (`bg-emerald-500/10 text-emerald-600`, etc.) without dark variants, creating:

- Inconsistent dark mode appearance (some badges have `dark:` variants, most don't)
- Double maintenance (color changes need updating both components AND inline usages)

**Fix:** Migrate all inline status colors to use `<StatusBadge>` or `<PulseStatus>` components.

---

### M5. Font size token bypass — arbitrary pixel values across 7 files

The design system defines a token scale (`text-micro` through `text-3xl`) but files use arbitrary values:

| Value           | Should be                 | Files                                     |
| --------------- | ------------------------- | ----------------------------------------- |
| `text-[8px]`    | No token (below minimum)  | `organization-card.tsx:132`               |
| `text-[11px]`   | `text-caption` (11px)     | `settlement-status.tsx`, `bento-grid.tsx` |
| `text-[12px]`   | `text-label` (12px)       | `settlement-status.tsx`, `bento-grid.tsx` |
| `text-[13px]`   | `text-nav` (13px)         | `settlement-status.tsx`, `bento-grid.tsx` |
| `text-[13.5px]` | `text-nav` or `text-body` | `activity-timeline.tsx:85`                |
| `text-[16px]`   | `text-section` (16px)     | `phone-input.tsx`, `empty-state.tsx`      |
| `text-[20px]`   | `text-heading` (20px)     | `settlement-status.tsx`, `bento-grid.tsx` |
| `text-[24px]`   | `text-2xl` (24px)         | `settlement-status.tsx`                   |

**Fix:** Replace arbitrary values with the nearest token class. Remove `text-[8px]` entirely — 8px is unreadable.

---

### M6. Logout button uses hardcoded `red-500` instead of `destructive` token

`app-sidebar.tsx:245-249` — `bg-red-500/5`, `text-red-500/60`, `text-red-500/70`  
Contrast of `text-red-500/60` on sidebar dark bg: **~1.7:1** — fails WCAG.

**Fix:** Use `bg-destructive/5 text-destructive` with appropriate opacity. The `--destructive` token already exists.

---

## Minor — Polish / Refinement

### m1. `text-micro` (10px) used for labels — below WCAG recommended minimum

The design doc specifies `text-micro` at 10px. WCAG doesn't set a minimum font size, but 10px is below the recommended 12px for readability, and is used for important labels (stat labels, badge counts, form field descriptions).

**Files:** `dashboard/page.tsx`, `sp-voucher-form.tsx`, `employee-form.tsx`, `bento-grid.tsx`, `data-filter-bar.tsx`, `searchable-multi-select.tsx`, `organization-card.tsx`

**Fix:** Consider raising `--text-micro` to 11px (matching `--text-caption`) or reserving 10px exclusively for decorative/non-essential content.

---

### m2. Double font-size class conflict

`wallets/page.tsx:37` — `text-xl ... text-[20px]` both present. The arbitrary value overrides the utility class.

**Fix:** Remove one — use `text-heading` (20px) token instead.

---

### m3. `font-bold` (700) usage violates design doc

Design doc: "Never use `font-bold` (700). Max weight is 600 (`font-semibold`)."

Grep for `font-bold` needed to verify compliance. The `bento-grid.tsx:144` uses `text-[24px] font-semibold` which is correct. But some components may still use `font-bold`.

---

### m4. Hardcoded rgba shadows instead of token-based

4 files use `shadow-[...]` with hardcoded rgba values:

- `success-celebration.tsx` — custom emerald shadow
- `branch-form.tsx` — custom emerald shadow
- `employee-card.tsx` — custom emerald shadow via `--emerald-rgb`
- `data-table.tsx` — custom `rgba(0,0,0,0.05)` shadow

**Fix:** Use `shadow-primary/20` or create shadow tokens in globals.css.

---

### m5. Spinner pattern duplicated across 14 files

The pattern `border-white/30 border-t-white rounded-full animate-spin` appears in 14+ button loading states with no shared component.

**Fix:** Extract a `<Spinner>` component.

---

## Contrast Reference Table

Computed WCAG 2.1 contrast ratios for all defined token pairings:

### Light Mode

| Pairing                                | Ratio   | AA (4.5:1) | AAA (7:1) |
| -------------------------------------- | ------- | ---------- | --------- |
| `--foreground` on `--background`       | 19.75:1 | ✅         | ✅        |
| `--muted-foreground` on `--background` | 4.81:1  | ✅         | ❌        |
| `--muted-foreground` on `--muted`      | 4.41:1  | ❌         | ❌        |
| `--primary` on `--background`          | 8.07:1  | ✅         | ✅        |
| `--primary-foreground` on `--primary`  | 7.22:1  | ✅         | ✅        |
| `--foreground` on `--muted`            | 18.11:1 | ✅         | ✅        |

### Dark Mode

| Pairing                                | Ratio   | AA (4.5:1) | AAA (7:1) |
| -------------------------------------- | ------- | ---------- | --------- |
| `--foreground` on `--background`       | 19.44:1 | ✅         | ✅        |
| `--muted-foreground` on `--background` | 7.86:1  | ✅         | ✅        |
| `--primary` on `--background`          | 4.43:1  | ❌         | ❌        |
| `--primary-foreground` on `--primary`  | 4.09:1  | ❌         | ❌        |
| `--foreground` on `--card`             | 18.59:1 | ✅         | ✅        |
| `--muted-foreground` on `--card`       | 7.51:1  | ✅         | ✅        |

### Sidebar (both modes share dark bg)

| Pairing                                   | Ratio   | AA (4.5:1) |
| ----------------------------------------- | ------- | ---------- |
| `--sidebar-foreground` on `--sidebar`     | 19.44:1 | ✅         |
| `--sidebar-foreground/20` on `--sidebar`  | 4.69:1  | ✅         |
| `text-primary` (light) on `--sidebar`     | 2.52:1  | ❌         |
| `text-muted-foreground/30` on `--sidebar` | 1.97:1  | ❌         |

---

## Priority Fix Order

| #   | Issue                                                                                           | Impact                                                     | Effort                     |
| --- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------- |
| 1   | **Raise `text-muted-foreground` opacity floor to /70** for readable text                        | Critical — affects 50+ instances across 8 files            | Medium (find-replace)      |
| 2   | **Fix dark mode `--primary` and `--primary-foreground` contrast** — bump L values by ~0.01 each | Critical — fixes AA fail on every dark mode primary button | Low (edit globals.css)     |
| 3   | **Fix `muted-foreground` on `muted` bg** — darken token from L=0.553 to L=0.54                  | Critical — borderline AA fail                              | Low (edit globals.css)     |
| 4   | **Replace `text-primary` with `text-sidebar-foreground` or `text-sidebar-primary` in sidebar**  | Critical — 2.52:1 on dark bg                               | Low (edit app-sidebar.tsx) |
| 5   | **Fix `bg-muted0` → `bg-muted`** in status-badge, activity-timeline, etc.                       | Critical — broken rendering                                | Low (4 files)              |
| 6   | **Replace `text-white` → `text-primary-foreground`** on 15 files                                | Major — dark mode breakage                                 | Medium (15 files)          |
| 7   | **Replace `bg-white` → `bg-background` / `bg-card`** on 12 files                                | Major — dark mode breakage                                 | Medium (12 files)          |
| 8   | **Replace `border-zinc-*` → `border-border`** on 15 files                                       | Major — dark mode breakage                                 | Medium (15 files)          |
| 9   | **Migrate inline status colors to StatusBadge/PulseStatus components**                          | Major — consistency                                        | High (30+ files)           |
| 10  | **Replace arbitrary font sizes with token classes**                                             | Major — design system discipline                           | Low (7 files)              |
| 11  | **Fix logout button: `red-500` → `destructive` token**                                          | Major — sidebar accessibility                              | Low (1 file)               |

---

## What's Working Well

- The token system architecture is solid — CSS custom properties in `globals.css` with proper light/dark mode switching
- Sidebar glass morphism with `--sidebar` tokens creates a premium feel
- The typography scale (`--text-micro` → `--text-3xl`) is well-defined and mostly followed
- Core component pairings (`text-foreground` on `bg-card`, `text-primary-foreground` on `bg-primary`) have excellent contrast in light mode
- `status-badge.tsx` and `pulse-status.tsx` are the right abstraction — just underutilized
