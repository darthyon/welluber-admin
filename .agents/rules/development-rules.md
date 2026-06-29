# WellUber Admin — Development Rules

> This file acts as the "constitution" for any AI agent working on this codebase.
> Read this FIRST before making any changes.

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui (radix-luma style)
- **Icons:** Phosphor Icons (`@phosphor-icons/react`)
- **Font:** Geist Variable (via `next/font/google`)
- **Package Manager:** pnpm

---

## Coding Standards

### TypeScript
- Use strict TypeScript — no `any` types unless absolutely necessary
- Prefer `interface` over `type` for object shapes
- Use Zod for runtime validation of form data / API payloads
- Export types from `types/` directory, not inline

### React / Next.js
- Default to **Server Components** — only add `'use client'` when necessary (event handlers, hooks, browser APIs)
- Use `loading.tsx` for page-level loading states
- Use `error.tsx` for error boundaries
- File naming: `kebab-case` for files, `PascalCase` for components
- One component per file

### Styling
- Use shadcn component primitives — do NOT build custom components when shadcn has one
- Use Tailwind utility classes — do NOT write custom CSS unless necessary
- Use CSS variables from `globals.css` for all colors — never hardcode hex/oklch values in components
- Use `cn()` from `lib/utils` for conditional classes

### File Organization
- Route pages go in `app/(host)/` — keep them thin (import feature components)
- Business logic goes in `features/[domain]/`
- Shared UI goes in `components/shared/`
- Persona-specific UI goes in `components/[persona]/`
- shadcn primitives stay in `components/ui/` — do NOT modify these directly

---

## Constraints (NEVER Do)

- ❌ Never commit secrets, API keys, or credentials
- ❌ Never modify files in `components/ui/` — these are managed by shadcn CLI
- ❌ Never use `<a>` tags — use Next.js `<Link>` component
- ❌ Never use `useEffect` for data fetching — use Server Components or React Query
- ❌ Never hardcode color values — always use CSS variables
- ❌ Never use `px` units for spacing — use Tailwind's spacing scale
- ❌ Never create files outside of the `app/`, `components/`, `features/`, `lib/`, `hooks/`, `types/` directories
- ❌ Never use `console.log` in production code — use proper error boundaries

---

## Workflow for New Features

1. **Read the relevant docs** — `docs/prd.md`, `docs/flows/flows_*.md`, `docs/design.md`
2. **Plan** — Propose an implementation plan before writing code
3. **Implement** — Follow the coding standards above
4. **Verify** — Run `pnpm typecheck`, `pnpm lint`, `pnpm build`
5. **Update docs** — If the implementation deviates from the flow doc, update it

---

## Verification Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm lint:design  # Design system guardrails (hardcoded colors, tokens, typography)
pnpm typecheck    # TypeScript strict check
pnpm format       # Prettier formatting
```

Run **all** of these before submitting changes. `pnpm lint:design` is mandatory — it blocks hardcoded colors, `font-bold`, and token bypasses.
