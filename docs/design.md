# DESIGN.md — WellUber Admin

> **Status:** Active
> **Last Updated:** 2026-04-03
> **Design Source:** shadcn/ui Luma preset + custom refinements
> **Inspiration:** Linear, Vercel, Supabase, Midday
> **Format:** [VoltAgent DESIGN.md](https://github.com/VoltAgent/awesome-design-md)

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
- 240px sidebar with bottom-anchored user card — Linear-style layout
- 56px (h-14) top bar with frosted glass (`bg-background/80 backdrop-blur-sm`)

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
| Muted Foreground | `--muted-foreground` | `oklch(0.553 0.013 58.071)` | Secondary text, labels |
| Primary | `--primary` | `oklch(0.457 0.24 277.023)` | CTAs, brand accent — **use sparingly** |
| Primary Foreground | `--primary-foreground` | `oklch(0.962 0.018 272.314)` | Text on primary buttons |
| Accent | `--accent` | `oklch(0.97 0.001 106.424)` | Active nav item, hover states |
| Border | `--border` | `oklch(0.923 0.003 48.717)` | Warm stone dividers, card borders |
| Destructive | `--destructive` | `oklch(0.577 0.245 27.325)` | Errors, delete actions |
| Ring | `--ring` | `oklch(0.709 0.01 56.259)` | Focus rings |

### Dark Mode

| Role | Token | Value |
|---|---|---|
| Background | `--background` | `oklch(0.147 0.004 49.25)` |
| Foreground | `--foreground` | `oklch(0.985 0.001 106.423)` |
| Card | `--card` | `oklch(0.216 0.006 56.043)` |
| Muted | `--muted` | `oklch(0.268 0.007 34.298)` |
| Primary | `--primary` | `oklch(0.398 0.195 277.366)` |
| Border | `--border` | `oklch(1 0 0 / 10%)` |

### Sidebar

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `oklch(0.985 0.001 106.423)` | `oklch(0.216 0.006 56.043)` |
| `--sidebar-foreground` | `oklch(0.147 0.004 49.25)` | `oklch(0.985 0.001 106.423)` |
| `--sidebar-border` | `oklch(0.923 0.003 48.717)` | `oklch(1 0 0 / 10%)` |

---

## 3. Typography Rules

### Font Family
- **Primary:** Geist Variable (loaded via `next/font/google`)
- **Monospace:** Geist Mono Variable (for code, technical labels)
- CSS variable: `--font-sans`, `--font-mono`

### Hierarchy

| Role | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| **Page Title** | 18px (`text-lg`) | 600 (semibold) | `tracking-tight` | Page headings |
| **Section Title** | 13px | 600 (semibold) | normal | Card/panel headings |
| **Body** | 14px (`text-sm`) | 400 | normal | Standard content |
| **Nav Item** | 13px | 500 (medium) | normal | Sidebar navigation links |
| **Label** | 12px (`text-xs`) | 500 (medium) | normal | Stat card labels, metadata |
| **Section Label** | 10px | 600 (semibold) | `tracking-[0.08em]` | Sidebar section titles, uppercase |
| **Caption** | 11px | 400 | normal | Timestamps, footnotes |

### Principles
- **Three weights:** 400 (read), 500 (navigate/interact), 600 (announce/title)
- Never use `font-bold` (700) in the admin UI. 600 is the max.
- `tracking-tight` on page titles only. Body runs at normal tracking.
- Geist Mono for any code, technical IDs, or monetary values.

---

## 4. Component Stylings

### Buttons
- **Primary:** `bg-primary text-primary-foreground rounded-4xl px-4 py-2 text-sm font-medium`
- **Secondary/Ghost:** `border border-border bg-background hover:bg-accent rounded-4xl px-4 py-2 text-sm font-medium`
- **Destructive:** `bg-destructive text-white rounded-4xl` — confirmations only
- **Icon button:** `w-9 h-9 rounded-4xl border border-border hover:bg-accent` — top bar actions

### Cards & Containers
- Background: `bg-card`
- Border: `border border-border rounded-lg`
- No box-shadows. Depth comes from border contrast.
- Padding: `p-4` (compact) or `p-5` (standard)
- Hover: `hover:border-border/80 transition-colors` (subtle)

### Inputs & Forms
- Background: `bg-muted/50`
- Border: `border border-border rounded-lg`
- Focus: `focus:ring-1 focus:ring-ring focus:bg-background`
- Placeholder: `text-muted-foreground/60`
- Padding: `px-3 py-1.5` (compact) or `px-4 py-2` (standard)

### Badges & Pills
- **Status badge:** `text-xs font-medium px-2 py-0.5 rounded-full`
  - Active: `bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400`
  - Pending: `bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400`
  - Suspended: `bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400`

### Navigation
- Sidebar: 240px fixed, `bg-sidebar`, `border-r border-border`
- Nav items: 13px, `rounded-md`, `px-3 py-1.5`
- Active: `bg-accent text-foreground font-medium`
- Inactive: `text-muted-foreground hover:text-foreground hover:bg-accent/50`
- Icons: 16px, Phosphor `regular` weight (inactive) → `fill` weight (active)

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
- Use `rounded-lg` for cards and `rounded-md` for nav items — consistent mid-radius
- Use `border border-border` for all surface containers — never box-shadow alone
- Use `font-semibold` (600) for page titles — never `font-bold` (700)
- Use warm-stone border tokens — the subtle warmth distinguishes WellUber from cold grays
- Use `tracking-tight` on page headings — creates the Vercel-level compression
- Keep the primary indigo for CTAs and primary actions only — everything else is neutral

### Don't
- Don't use `font-bold` (700) — max weight is 600 (semibold)
- Don't use heavy box-shadows — depth comes from borders
- Don't apply primary color to backgrounds or large surfaces — it's for buttons and links
- Don't use `text-base` (16px) for body text in the admin UI — use `text-sm` (14px) or 13px
- Don't add decorative gradients — this is infrastructure, not a marketing site
- Don't use more than 3 font weights on any screen

---

## 8. Responsive Behavior

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

## 9. Agent Prompt Guide

### Quick Color Reference
- Page background: white (`oklch(1 0 0)`)
- Primary text: near-black (`oklch(0.147 0.004 49.25)`)
- Secondary text: muted (`oklch(0.553 0.013 58.071)`)
- Border: warm stone (`oklch(0.923 0.003 48.717)`)
- Brand accent: deep indigo (`oklch(0.457 0.24 277.023)`)
- Focus ring: soft stone (`oklch(0.709 0.01 56.259)`)

### Example Component Prompts
- "Create a stat card: `bg-card border border-border rounded-lg p-4`. Label at 12px font-medium text-muted-foreground. Value at 24px font-semibold tracking-tight. Icon at 16px in muted-foreground/50."
- "Build a nav item: `px-3 py-1.5 rounded-md text-[13px]`. Active: `bg-accent text-foreground font-medium`. Inactive: `text-muted-foreground hover:bg-accent/50`."
- "Design a data table row: `text-sm text-foreground`. Status badge: `text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700`."

---

## 10. Design Changelog

| Date | Change | Screens |
|---|---|---|
| 2026-04-03 | Initial scaffold — shadcn Luma preset, Geist font | All |
| 2026-04-03 | Theme default to light, add toggle, Linear/Vercel polish | Shell, sidebar, top bar, dashboard |
| 2026-04-03 | Organization Directory UI Refinement — Triage toolbar, Ring charts, Sectioned taxonomy | Organization List |

---

## 11. Icons

- **Library:** Phosphor Icons (`@phosphor-icons/react`)
- **Default weight:** `regular`
- **Active weight:** `fill`
- **Nav size:** 16px
- **Top bar action size:** 16px
- **Page header size:** 20px
- **Stat card size:** 16px at 50% opacity

---

## 12. Persona-Specific Variations

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
