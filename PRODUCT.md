# Product

## Register

product

## Users

WellUber Console is a B2B SaaS admin console used primarily by:

- **Host admins (WellUber ops):** "god mode" management across organizations, benefit policies, wallets, service providers, and user/admin access.
- **Org admins (corporate HR/benefits):** employee + dependent management, allocations, utilization, and day-to-day administration.
- **Service provider admins:** provider profile, branches, vouchers, portfolio/tax setup, and operational configuration.

Users work on desktop, in office/ops contexts, optimizing for speed, correctness, and traceability.

## Product Purpose

Operational control plane for the WellUber benefits ecosystem. Success means admins complete critical workflows quickly and confidently, with clear audit trails and no destructive surprises.

## Brand Personality

Precision infrastructure — calm, exacting, quietly premium.

The UI should feel like reliable operational tooling: information-dense without being cramped, intentional hierarchy, fast interactions, minimal decorative noise.

References: Linear, Vercel, Supabase, Midday.

## Anti-references

- Neon-on-dark cyber dashboards
- Playful/toy fintech vibes
- Card-on-card "AI dashboard" templates
- Dated enterprise styling (thick borders, bevels, heavy drop shadows)
- Gradient text or decorative glassmorphism

## Design Principles

- **Speed with safety:** make common ops fast (search/filter/bulk flows) while preventing mistakes with clear affordances and confirmation where it matters.
- **Information hierarchy over decoration:** typography + spacing carry the design; avoid ornamental gradients and noisy visuals.
- **Brand color is rare:** indigo is for primary intent (CTAs/links/selected states), not for large surfaces.
- **Traceability is a feature:** design for auditability — history, IDs, consistent labeling, predictable structure.
- **Density with rhythm:** compact UI, never cramped — tight within groups, generous between sections.

## Aesthetic Direction

- **Theme:** Light-mode default with full dark mode support (class strategy via `next-themes`).
- **Design system base:** shadcn/ui + Radix primitives with custom refinements.
- **Typography:** Geist Variable for UI, Geist Mono for IDs/technical values.
- **Color:** Deep indigo (`#4338CA`) as sole brand accent, used sparingly. Cool-slate neutrals for borders/surfaces. OKLCH tokens throughout.
- **Layout:** Linear-inspired shell (240px floating sidebar, compact type), whitespace-as-structure, borders define surfaces, restrained shadows.

## Accessibility & Inclusion

WCAG 2.1 AA compliance. Keyboard navigation throughout. Screen reader support on all interactive elements. Avoid motion for users with `prefers-reduced-motion`. Sufficient contrast on all text and interactive states.
