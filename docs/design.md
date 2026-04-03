# Design System & Architecture — WellUber Admin

> **Status:** Draft — Updated as features are built
> **Last Updated:** 2026-04-03
> **Design Source:** shadcn/ui Luma preset (radix-luma)
> **Stitch Project:** [Link to Stitch project if available]

---

## 1. Visual Identity

### 1.1 Brand Tokens

| Token | Value | Usage |
|---|---|---|
| **Primary** | `oklch(0.457 0.24 277.023)` | Deep indigo — CTAs, active states, brand accent |
| **Background** | `oklch(1 0 0)` | Pure white canvas |
| **Card** | `oklch(1 0 0)` | Card surfaces |
| **Muted** | `oklch(0.97 0.001 106.424)` | Subtle backgrounds, disabled states |
| **Destructive** | `oklch(0.577 0.245 27.325)` | Error, danger, delete actions |
| **Border** | `oklch(0.923 0.003 48.717)` | Warm stone dividers |
| **Radius** | `0.625rem` base | Softly rounded — not pill, not sharp |

### 1.2 Typography

| Level | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| **Display** | Geist Variable | 700 | 30px / 1.875rem | -0.02em |
| **Heading** | Geist Variable | 700 | 24px / 1.5rem | -0.02em |
| **Subheading** | Geist Variable | 600 | 18px / 1.125rem | -0.01em |
| **Body** | Geist Variable | 400 | 14px / 0.875rem | 0 |
| **Label** | Geist Variable | 500 | 12px / 0.75rem | 0.01em |
| **Caption** | Geist Variable | 400 | 11px / 0.6875rem | 0.02em |

### 1.3 Icons

- **Library:** Phosphor Icons (`@phosphor-icons/react`)
- **Default weight:** `regular` (20px)
- **Active/selected weight:** `fill`
- **Navigation size:** 20px
- **Page header size:** 24px

### 1.4 Dark Mode

Full dark mode via `next-themes`. All color tokens have dark variants defined in `globals.css`. Dark background uses `oklch(0.147 0.004 49.25)`.

---

## 2. Layout Architecture

### 2.1 Shell Structure

```
┌──────────────────────────────────────────────────┐
│  Sidebar (w-64, fixed)  │  Main Content Area      │
│  ┌──────────────────┐   │  ┌────────────────────┐ │
│  │ Logo + Brand     │   │  │ Top Bar (h-16)     │ │
│  │ User Card        │   │  │ Search | Notif     │ │
│  │                  │   │  ├────────────────────┤ │
│  │ MANAGEMENT       │   │  │                    │ │
│  │  Dashboard       │   │  │  Page Content      │ │
│  │  Organizations   │   │  │  (scrollable)      │ │
│  │  Providers       │   │  │                    │ │
│  │  Users           │   │  │                    │ │
│  │                  │   │  │                    │ │
│  │ BENEFITS         │   │  │                    │ │
│  │  Policies        │   │  │                    │ │
│  │  Transactions    │   │  │                    │ │
│  │                  │   │  │                    │ │
│  │ SYSTEM           │   │  │                    │ │
│  │  Settings        │   │  │                    │ │
│  └──────────────────┘   │  └────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 2.2 Sidebar Behavior

- **Desktop:** Always visible, fixed width `w-64`
- **Mobile:** Collapsible drawer (sheet overlay)
- **Sections:** Grouped by function with uppercase labels
- **Active state:** Primary fill background, `fill` icon weight
- **Inactive state:** Muted foreground, `regular` icon weight

### 2.3 Top Bar

- Search input with `⌘K` shortcut hint
- Notification bell with unread indicator
- User context accessible from sidebar user card

### 2.4 Page Content Area

- Padding: `p-6` or `p-8`
- Max content width: none (full-width responsive)
- Background: `bg-background` (distinct from card/sidebar)

---

## 3. Component Patterns

### 3.1 Data Display

| Pattern | Component | Usage |
|---|---|---|
| **Stat Card** | Custom card with icon, value, trend | Dashboard KPIs |
| **Data Table** | shadcn table + pagination + filters | Directories, lists |
| **Status Badge** | shadcn badge with color coding | Active/Pending/Inactive |
| **Progress Bar** | shadcn progress | Enrollment rates, completion |

### 3.2 Forms & Input

| Pattern | Component | Usage |
|---|---|---|
| **Form Fields** | shadcn input + label + form | All data entry |
| **Select/Dropdown** | shadcn select | Category pickers, filters |
| **Search** | shadcn command (cmdk) | Global search, entity search |
| **Multi-step Wizard** | Custom stepper + card | Onboarding, policy creation |

### 3.3 Navigation

| Pattern | Component | Usage |
|---|---|---|
| **Sidebar** | shadcn sidebar | Primary nav |
| **Breadcrumb** | Custom breadcrumb | Detail page context |
| **Tabs** | shadcn tabs | Profile sections, settings |

### 3.4 Feedback

| Pattern | Component | Usage |
|---|---|---|
| **Dialog** | shadcn dialog | Confirmations, quick edits |
| **Toast** | shadcn sonner | Success/error notifications |
| **Empty State** | Custom centered card | No data, not configured |

---

## 4. Interaction Standards

### 4.1 Transitions

- **Page transitions:** None (instant route change, Next.js default)
- **Component mount:** `fade-in` 150ms ease-out
- **Hover effects:** 200ms ease-out on background/border color
- **Active press:** `scale(0.98)` 100ms

### 4.2 Loading States

- **Page-level:** Skeleton loader matching content layout
- **Table:** Row skeleton (5 rows)
- **Button:** Disabled + spinner icon (Phosphor `CircleNotch`)

### 4.3 Error States

- **Form validation:** Inline error text below field (destructive color)
- **API error:** Toast notification (sonner)
- **404/Empty:** Centered illustration + message + CTA

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| `sm` | 640px | Stack cards, hide sidebar overlay |
| `md` | 768px | 2-column grid for cards |
| `lg` | 1024px | Full sidebar visible |
| `xl` | 1280px | Wider content area |
| `2xl` | 1536px | Max comfortable reading width |

---

## 6. Persona-Specific Variations

### 6.1 Navigation Differences

```
Host Admin:     All sections visible
Org Admin:      No "Organizations" directory, no "System" section
Service Provider: Only "Dashboard", "Branches", "Vouchers", "Settlements", "Settings"
```

### 6.2 Shared Components

The sidebar component is shared across all personas. Navigation items are configured per-persona via `lib/navigation.ts`. The layout component reads the active persona and renders the appropriate nav config.

---

## 7. Design Changelog

<!-- Update this section as you build features -->

| Date | Change | Screens Affected |
|---|---|---|
| 2026-04-03 | Initial scaffold — shadcn Luma preset, Geist font | All |
