# DESIGN.md — WellUber Admin

> **Status:** Active
> **Last Updated:** 2026-04-30
> **Design Source:** shadcn/ui Luma preset + custom refinements
> **Inspiration:** Linear, Vercel, Supabase, Midday
> **Format:** [VoltAgent DESIGN.md](https://github.com/VoltAgent/awesome-design-md)

---

## 0. Agent System Instructions

> [!IMPORTANT]
> When generating code for this project, you MUST adhere to the following constraints:
> - **STRICT NO BOLD POLICY**: Never use `font-bold` or `700`. Use `font-semibold` or `600` for all emphasis.
> - **TOKEN FIRST**: Use OKLCH tokens (`primary`, `border`, `muted`) exclusively.
> - **PILL SHAPE**: Use `rounded-4xl` for all buttons, badges, and switches.
> - **MODERN SaaS**: Favor `glass-card` and `premium-glow` for high-fidelity surfaces.
> - **SHARED COMPONENTS**: Before creating a new component, check if `StatusBadge`, `PulseStatus`, `Spinner`, `SuccessModal`, etc. already exist in `components/shared/`.

---

## 1. Visual Theme & Atmosphere

WellUber Admin is a **B2B SaaS admin console** for managing corporate wellness benefits. The design philosophy is **precision infrastructure** — the kind of UI that feels like Linear meets Vercel's dashboard: clean, information-dense, and quietly premium.

**Key Characteristics:**
- **Light-mode default** with full dark mode support (next-themes, class strategy)
- Geist Variable font — the Vercel/Linear typeface — with tight `tracking-tight` on headings
- Deep indigo (`oklch(0.457 0.24 277.023)`) as the sole brand accent — reserved for primary actions only
- Neutral, warm-stone border system (`oklch(0.923 0.003 48.717)`) that adds warmth without color
- Shadow-as-border philosophy: card depth via `border border-border`, no heavy box-shadows
- Compact density: `13px` body text in nav, `text-sm` (14px) in content, `text-xs` (12px) for labels
- **Pill-shaped Triggers**: Buttons, badges, and toggles use `rounded-4xl` for a modern, distinct feel
- 240px sidebar with frosted glass stability fix (`oklch(0.12 0.01 260 / 92%)`)

**Design Philosophy:**
- Every pixel should feel intentional. No decoration that doesn't serve information.
- Whitespace is structural — generous padding between sections, tight spacing within groups.
- Active states are subtle: `bg-accent` (not primary fill). Reserve brand color for CTAs only.
- Borders define surfaces, not shadows. Cards use `border border-border rounded-lg`.

---

## 2. Color Palette & Roles

### Light Mode (Default)

| Role | Token | Value | Usage |
|---|---|---|---|
| Background | `--background` | `oklch(1 0 0)` | Page canvas, main content area |
| Foreground | `--foreground` | `oklch(0.147 0.004 49.25)` | Primary text, headings |
| Card | `--card` | `oklch(1 0 0)` | Card surfaces, panels |
| Muted | `--muted` | `oklch(0.97 0.001 106.424)` | Subtle backgrounds, search input |
| Muted Foreground | `--muted-foreground` | `oklch(0.54 0.013 58.071)` | Secondary text, labels |
| Primary | `--primary` | `oklch(0.457 0.215 277.023)` | CTAs, brand accent — **use sparingly** |
| Primary Foreground | `--primary-foreground` | `oklch(0.97 0.018 272.314)` | Text on primary buttons |
| Accent | `--accent` | `oklch(0.97 0.001 106.424)` | Active nav item, hover states |
| Border | `--border` | `oklch(0.923 0.003 48.717)` | Warm stone dividers, card borders |
| Destructive | `--destructive` | `oklch(0.577 0.245 27.325)` | Errors, delete actions |
| Ring | `--ring` | `oklch(0.457 0.215 277.023)` | Focus rings |

### Dark Mode

| Role | Token | Value |
|---|---|---|
| Background | `--background` | `oklch(0.12 0.01 260)` |
| Foreground | `--foreground` | `oklch(0.985 0.001 106.423)` |
| Card | `--card` | `oklch(0.16 0.012 260)` |
| Muted | `--muted` | `oklch(0.18 0.01 240)` |
| Primary | `--primary` | `oklch(0.56 0.208 277.117)` |
| Primary Foreground | `--primary-foreground` | `oklch(0.97 0.018 272.314)` |
| Border | `--border` | `oklch(1 0 0 / 12%)` |

### Sidebar

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `oklch(0.12 0.01 260 / 80%)` | `oklch(0.12 0.01 260 / 92%)` |
| `--sidebar-foreground` | `oklch(0.985 0.001 106.423)` | `oklch(0.985 0.001 106.423)` |
| `--sidebar-primary` | `oklch(0.457 0.215 277.023)` | `oklch(0.56 0.208 277.117)` |
| `--sidebar-primary-foreground` | `oklch(0.97 0.018 272.314)` | `oklch(0.97 0.018 272.314)` |
| `--sidebar-border` | `oklch(0 0 0 / 8%)` | `oklch(1 0 0 / 15%)` |

---

## 3. Typography Rules

### Font Family
- **Primary:** Geist Variable (loaded via `next/font/google`)
- **Monospace:** Geist Mono Variable (for code, technical labels)
- CSS variable: `--font-sans`, `--font-mono`

### Hierarchy

| Role | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| **Page Title** | `1.125rem` (18px) | 600 (semibold) | `tracking-tight` | Page headings |
| **Subtitle** | `0.9375rem` (15px) | 600 (semibold) | normal | Form section headers, modal titles, sub-page headings |
| **Section Title** | `0.8125rem` (13px) | 600 (semibold) | normal | Card/panel headings |
| **Body** | `0.875rem` (14px) | 400 | normal | Standard content |
| **Nav Item** | `0.8125rem` (13px) | 500 (medium) | normal | Sidebar navigation links |
| **Label** | `0.75rem` (12px) | 500 (medium) | normal | Stat card labels, metadata |
| **Section Label** | `0.625rem` (10px) | 600 (semibold) | `tracking-[0.08em]` | Sidebar section titles, uppercase |
| **Caption** | `0.6875rem` (11px) | 400 | normal | Timestamps, footnotes |
| **Micro** | `0.5625rem` (9px) | 500 (medium) | normal | Keyboard shortcut hints only |

### Principles
- **Three weights only:** 400 (read), 500 (navigate/interact), 600 (announce/title). **Never use `font-bold` (700)**. If you find yourself reaching for 700, use 600 (`font-semibold`) instead — this applies to headings, card titles, table headers, badges, and dialog titles without exception.
- `tracking-tight` on page titles only. Body runs at normal tracking.
- **Title Case for headers and labels.** Write "Employee Directory", not "Employee directory". This applies to page titles, section titles, tab labels, and prominent headings. Button text and form field labels may follow platform conventions (Sentence case for brevity in long labels).
- **`uppercase` is restricted to two contexts only:**
  1. Sidebar section labels (`SidebarGroupLabel`) — structural hierarchy.
  2. Technical ID badges — monospaced entity identifiers (e.g., `ORG-20260115-0001`) using `uppercase tracking-widest font-mono`.
- Geist Mono for any code, technical IDs, or monetary values.

---

## 4. Component Stylings

### Buttons

**Variants and when to use each:**
- `default` (primary fill) — empty-state CTAs, primary form submit. `bg-primary text-primary-foreground rounded-4xl px-4 py-2 text-sm font-medium`
- `ghost` — toolbar actions, cancel, nav-adjacent, inline icon actions. `hover:bg-accent rounded-4xl px-4 py-2 text-sm font-medium`
- `outline` — filter controls, danger zone triggers, dashed add-item patterns. `border border-border bg-background hover:bg-accent rounded-4xl px-4 py-2 text-sm font-medium`
- **Destructive:** `bg-destructive/10 text-destructive border border-destructive/20 rounded-4xl`
- **Icon button:** `w-9 h-9 rounded-4xl border border-border hover:bg-accent`

**Rule:** `variant="outline"` is NOT the default secondary — use `ghost` for most secondary actions.

### Cards & Containers
- **Standard Card:** `bg-card border border-border rounded-lg shadow-sm`
- **Glass Card:** `.glass-card` (`border border-border/50 bg-card/60 backdrop-blur-md`) — use for floating panels or overlays
- **Premium Surface:** Add `.premium-glow` for subtle radial depth on dark surfaces
- Padding: `p-4` (compact) or `p-5` (standard)
- Hover: `hover:border-border/80 transition-colors`

### Inputs & Forms
- Background: `bg-muted/50`
- Border: `border border-border rounded-lg`
- Focus: `focus:ring-1 focus:ring-ring focus:bg-background transition-all`
- Placeholder: `text-muted-foreground/60`

### Badges & Pills
- **Role:** `text-xs font-medium px-2 py-0.5 rounded-full` (Pill shape required)
- **Semantic States:**
  - Active: `bg-emerald-500/10 text-emerald-600`
  - Pending: `bg-amber-500/10 text-amber-600`
  - Danger: `bg-rose-500/10 text-rose-600`
  - Neutral: `bg-zinc-500/10 text-zinc-600`
- **Informational (Blue):** `bg-blue-500/10 text-blue-600` — used for taxonomy labels

### Navigation
- Sidebar: 240px, `bg-sidebar/92 backdrop-blur-3xl`, `border-r border-border/10`
- Nav items: 13px, `rounded-md`, `px-3 py-1.5`
- Active: `bg-primary/10 text-primary font-medium`
- Inactive: `text-muted-foreground hover:text-foreground hover:bg-accent/50`
- Icons: 16px, Phosphor `regular` (inactive) → `fill` (active)

### Top Bar
- Height: `h-14` (56px)
- Background: `bg-background/80 backdrop-blur-sm` (frosted glass)
- Border: `border-b border-border`
- Layout: breadcrumbs left, `search | divider | theme-toggle | notifications | avatar` right

### Data Visualization
- **Utilization Ring Chart:**
  - Background track: `stroke-muted/40` or light-gray for visibility.
  - Active segment: `stroke-primary` (brand indigo).
  - Center label: `text-[10px] font-bold` for percentage.
  - Sizing: Compact (32-48px) for cards, standard (120px+) for dashboards.

### Filtering & Search
- **Searchable Multi-Select:**
  - Layout: `Popover` containing a `Command` input and list.
  - Sectioning: Support for category headers (e.g., Service Category).
  - Interaction: Checkbox-based selection with instant count feedback in the trigger.
  - Inline mode: Supports nested popovers without occlusion.

### Feedback & Modals
- **Quiet Success Pattern:**
  - Used for non-disruptive confirmation of administrative actions (e.g., inviting users, creating entities).
  - Surface: `bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl`.
  - Icon: Animated checkmark with a `primary/10` pulse ring.
  - Typography: `text-title font-semibold` for heading, `text-nav text-muted-foreground` for body.
  - Actions: Primary CTA with `ArrowRight` icon, secondary Ghost CTA for navigation.

### Complex Forms
- **Floating Anchor Navigation:**
  - Sidebar-based jump-links for long, multi-section forms.
  - Active state: `text-primary border-l-2 border-primary pl-3`.
  - Inactive state: `text-muted-foreground border-l-2 border-transparent pl-3 hover:text-foreground`.
- **Floating Action Bar:**
  - Fixed-bottom controls for primary form actions.
  - Surface: `bg-white/80 backdrop-blur-2xl border border-white/50 shadow-lg rounded-full`.
  - Layout: Cancel (Ghost) | Divider | Submit (Primary Pill).
- **International Phone Input:**
  - Split control: Country Popover (flag + dial code) + Numeric Input.
  - Standardized validation: `border-destructive` for errors, `WarningCircle` icon feedback.

### Semantic Color Convention

Status and state colors use **Tailwind utility classes** (not CSS custom properties) because they represent universally understood semantic meanings that remain consistent across themes.

| Semantic | Color | Tailwind Pattern | Usage |
|---|---|---|---|
| **Success/Active** | Emerald | `bg-emerald-500/10 text-emerald-600` | Active status, approvals, positive metrics |
| **Warning/Pending** | Amber | `bg-amber-500/10 text-amber-600` | Pending states, attention needed |
| **Danger/Error** | Rose | `bg-rose-500/10 text-rose-600` | Destructive actions, rejected, errors |
| **Neutral/Removed** | Zinc | `bg-zinc-500/10 text-zinc-600` | Inactive, archived, disabled |
| **Brand Accent** | Primary | `bg-primary/10 text-primary` | Active filters, selected states, links |

> **Rule:** Never use hardcoded `indigo-*` for active/selected UI states. Use `primary` tokens instead (`bg-primary/10 text-primary border-primary/20`) so the brand color responds to theme changes. Reserve named colors (emerald, amber, rose) only for semantic states.

---

## 5. Layout Principles

### Spacing Scale
- Base unit: 4px
- Primary rhythm: 4px, 8px, 12px, 16px, 24px
- Section gap: `gap-3` (12px) between cards/panels
- Page padding: `px-6 py-6`
- Card padding: `p-4` (compact) or `p-5` (standard)

### Grid & Container
- Sidebar: 240px fixed width
- Content: fills remaining space, no max-width constraint
- Stats: `grid-cols-4` on desktop, `grid-cols-2` on tablet, `grid-cols-1` on mobile
- Detail pages: `grid-cols-3` (2/3 main + 1/3 sidebar)
- **Multi-Section Forms:**
  - Sidebar: 208px (`w-52`) for Anchor Navigation.
  - Main Content: 672px (`max-w-2xl`) for form sections.
  - Gap: `gap-8` between sidebar and content.
  - Section Spacing: `space-y-6` between section cards.

### Whitespace Philosophy
- **Tight within, generous between.** Components are compact internally but breathe externally.
- No heavy dividers between sections — whitespace + border-bottom is sufficient.
- `gap-3` (12px) is the default for card grids. Not 16px, not 24px.

---

## 6. Depth & Elevation

| Level | Treatment | Usage |
|---|---|---|
| **Flat** | No border, no shadow | Text blocks, backgrounds |
| **Surface** | `border border-border rounded-lg` | Cards, panels, inputs |
| **Elevated** | `border border-border rounded-3xl shadow-lg` | Dropdowns, popovers |
| **Overlay** | `shadow-lg border border-border rounded-3xl` | Modals, dialogs |

**Shadow Philosophy:** Shadows are almost invisible on this system. Depth is communicated through border contrast and background color differences (card vs background). Only popovers and modals use visible shadows.

---

## 7. Do's and Don'ts

### Do
- Use `text-[13px]` for nav items and section headers — not 14px, not 12px
- Use `text-[15px]` for form section titles and modal headers — the "Subtitle" role
- Use `rounded-lg` for cards and `rounded-md` for nav items — consistent mid-radius
- Use `border border-border` for all surface containers — never box-shadow alone
- Use `font-semibold` (600) for all emphasized text — page titles, card titles, table headers, badges
- Use warm-stone border tokens — the subtle warmth distinguishes WellUber from cold grays
- Use `tracking-tight` on page headings — creates the Vercel-level compression
- Keep the primary indigo for CTAs and primary actions only — everything else is neutral
- Use `uppercase` ONLY for sidebar section labels and monospace ID badges
- Use **Title Case** for all headers: "Employee Directory", not "Employee directory"
- Use `bg-primary/10 text-primary` for active filter states — not hardcoded `indigo-*`

### Don't
- **CRITICAL: Don't use `font-bold` (700) anywhere.** Max weight is 600 (`font-semibold`). This is a hard rule to maintain the SaaS premium aesthetic.
- Don't use heavy box-shadows — depth comes from borders and subtle glass effects.
- Don't apply primary color to large surfaces — it is a laser-focused brand accent.
- Don't use `text-base` (16px) for body text — use `text-sm` (14px) for readability.
- Don't use hardcoded Tailwind colors (`indigo-500`, `blue-600`) for structural UI. Use `primary` or `muted` tokens.
- Don't use Sentence case for headers — use Title Case ("Account Details").

---

## 8. Developer Actionability Checklist

Use this 5-point check before submitting any UI change:
1.  **Typography**: Is there any `font-bold`? (Change to `font-semibold`).
2.  **Tokens**: Are there any hardcoded hex/Tailwind colors? (Use `primary`, `border`, `muted`).
3.  **Radius**: Do interactive triggers (Buttons/Badges) use `rounded-4xl`?
4.  **Casing**: Are all headers and labels in **Title Case**?
5.  **Density**: Is the body text exactly `14px` (`text-sm`)?

---

## 9. Responsive Behavior

### Breakpoints

| Name | Width | Changes |
|---|---|---|
| Mobile | <640px | Sidebar hidden, hamburger menu, single-column content |
| Tablet | 640–1024px | Sidebar overlay/drawer, 2-column stat grid |
| Desktop | 1024–1280px | Full sidebar, 3–4 column grids |
| Wide | >1280px | Full layout, generous spacing |

### Collapsing Strategy
- Sidebar: always visible ≥1024px, overlay/drawer below
- Stats: 4-col → 2-col → 1-col
- Activity + settlement: 2/3 + 1/3 → stacked
- Search: hidden on small mobile, expands on focus

---

## 10. Agent Prompt Guide

### Quick Color Reference
- Page background: white (`oklch(1 0 0)`)
- Primary text: near-black (`oklch(0.147 0.004 49.25)`)
- Secondary text: muted (`oklch(0.553 0.013 58.071)`)
- Border: warm stone (`oklch(0.923 0.003 48.717)`)
- Brand accent: deep indigo (`oklch(0.457 0.215 277.023)` = `#4338CA`)
- Focus ring: primary indigo (`oklch(0.457 0.215 277.023)`)

### Example Component Prompts
- "Create a stat card: `bg-card border border-border rounded-lg p-4`. Label at 12px font-medium text-muted-foreground. Value at 24px font-semibold tracking-tight. Icon at 16px in muted-foreground/50."
- "Build a nav item: `px-3 py-1.5 rounded-md text-[13px]`. Active: `bg-accent text-foreground font-medium`. Inactive: `text-muted-foreground hover:bg-accent/50`."
- "Design a data table row: `text-sm text-foreground`. Status badge: `text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700`."

---

## 11. Design Changelog

| Date | Change | Screens |
|---|---|---|
| 2026-04-03 | Initial scaffold — shadcn Luma preset, Geist font | All |
| 2026-04-03 | Theme default to light, add toggle, Linear/Vercel polish | Shell, sidebar, top bar, dashboard |
| 2026-04-03 | Organization Directory UI Refinement — Triage toolbar, Ring charts, Sectioned taxonomy | Organization List |
| 2026-04-10 | Typography audit — Added "Subtitle" (15px) and "Micro" (9px) roles, standardized Title Case rule, added Technical ID exception for uppercase, documented semantic color convention, reinforced `font-bold` prohibition | All |
| 2026-04-22 | Service Provider Unification — Documented "Quiet Success" pattern, International Phone Input, Floating Anchor Nav, and Floating Action Bar | Service Provider, Forms |
| 2026-04-27 | Token overhaul — primary to `oklch(0.457 0.24 277.023)` / dark `oklch(0.585 0.233 277.117)`, sidebar to dark frosted blue both modes, typography to rem, button variant clarification (ghost vs outline vs default) | All |
| 2026-04-30 | Token reconciliation — primary locked to exact brand `#4338CA` (`oklch(0.457 0.215 277.023)`), dark primary adjusted for WCAG AA (`oklch(0.56 0.208 277.117)`), muted/border/accent aligned with latest spec, created root `AGENTS.md`, added `lint:design` guardrail | All |

---

## 12. Icons

- **Library:** Phosphor Icons (`@phosphor-icons/react`)
- **Default weight:** `regular`
- **Active weight:** `fill`
- **Nav size:** 16px
- **Top bar action size:** 16px
- **Page header size:** 20px
- **Stat card size:** 16px at 50% opacity

---

## 13. Persona-Specific Variations

### Navigation Width
```
All personas:    240px sidebar
```

### Nav Sections
```
Host Admin:      MANAGEMENT (4) + BENEFITS (2) + SYSTEM (1)
Org Admin:       MANAGEMENT (2) + BENEFITS (2) + SETTINGS (1)
Service Provider: MANAGEMENT (2) + BENEFITS (2) + SETTINGS (1)
```

### Shared Components
Sidebar, TopBar, ThemeToggle, and layout shell are shared across all personas. Nav items are configured per-persona in the `AppSidebar` client component.
