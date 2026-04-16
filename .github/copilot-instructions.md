## Design Context

### Users
WellUber Console is a B2B SaaS admin console used primarily by:
- **Host admins (WellUber ops)**: “god mode” management across organizations, benefit policies, wallets, service providers, and user/admin access.
- **Org admins (corporate HR/benefits)**: employee + dependent management, allocations, utilization, and day-to-day administration.
- **Service provider admins**: provider profile, branches, vouchers, portfolio/tax setup, and operational configuration.

Users typically work on desktop, in office/ops contexts, optimizing for speed, correctness, and traceability.

### Brand Personality
**Precision infrastructure** — calm, exacting, quietly premium.

The UI should feel like reliable operational tooling: information-dense without being cramped, intentional hierarchy, fast interactions, and minimal decorative noise.

### Aesthetic Direction
- **Theme**: Light-mode default with full dark mode support (class strategy via `next-themes`).
- **Design system base**: shadcn/ui Luma preset + Radix primitives with custom refinements.
- **Typography**: Geist Variable for UI + Geist Mono for IDs/technical values.
- **Color**: Deep indigo as the sole brand accent, used sparingly (CTAs/primary actions). Warm-stone neutrals for borders/surfaces. OKLCH tokens.
- **Layout**: Linear-inspired shell (240px sidebar, compact type), whitespace-as-structure, borders define surfaces, restrained shadows.

**References**: Linear, Vercel, Supabase, Midday.  
**Anti-references**: neon-on-dark cyber dashboards, playful/toy fintech vibes, card-on-card “AI dashboard” templates, and dated enterprise styling (thick borders/bevels).

### Design Principles
- **Speed with safety**: make common ops fast (search/filter/bulk flows) while preventing mistakes with clear affordances and confirmation where it matters.
- **Information hierarchy over decoration**: typography + spacing carry the design; avoid ornamental gradients and noisy visuals.
- **Brand color is rare**: indigo is for primary intent (CTAs/links/selected states), not for large surfaces.
- **Traceability is a feature**: design for auditability (history, IDs, consistent labeling, predictable structure).
- **Density with rhythm**: compact UI, but never cramped—tight within groups, generous between sections.

