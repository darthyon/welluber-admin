---
description: How to translate design specs and Stitch exports into code
---

# Design-to-Code Workflow

## Steps

1. **Ingest the design spec**
   - Read `docs/design.md` for global design tokens and patterns
   - Check Stitch exports (if referenced) for specific screen layouts
   - Identify which shadcn components map to the design

2. **Identify components needed**
   - Check `components/ui/` for existing shadcn primitives
   - Check `components/shared/` for existing shared components
   - If a new component is needed, decide: shadcn primitive or custom?

3. **Build the page**
   - Create the route page in `app/(host)/[section]/page.tsx`
   - Import shared components, compose the layout
   - Keep the page file thin — delegate to feature components

4. **Style with design tokens**
   - Use only CSS variables from `globals.css`
   - Reference `docs/design.md` for spacing, typography, and interaction patterns
   - Use `cn()` for conditional styling

5. **Verify visually**
   - Run `pnpm dev` and check the page
   - Compare against the Stitch export or design spec
   - Check dark mode rendering
   - Check responsive breakpoints (mobile, tablet, desktop)

6. **Update design.md**
   - Add any new patterns or components to the Design Changelog
