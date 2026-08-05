---
description: How to scaffold a new feature module
---

# Scaffold New Feature

## Steps

1. **Create the docs first**
   - Add or update `docs/flows/FLOW-[feature].md`, and list it in
     `docs/flows/README.md`
   - Define the user flow, happy/unhappy paths, with a mermaid diagram
   - Mark anything that does not persist — most prototype forms validate but do
     not write to a store, and the flow doc must say so
   - For permission scope see `AGENTS.md` (the old `docs/personas/` set was
     deleted in `5711ca0`)

2. **Create the feature module**
   ```
   features/[feature-name]/
   ├── actions.ts      # Server actions
   ├── hooks.ts        # Client hooks
   ├── types.ts        # TypeScript interfaces
   └── schemas.ts      # Zod validation schemas
   ```

3. **Create the route pages**
   ```
   app/(host)/[feature-name]/
   ├── page.tsx         # List/directory page
   ├── loading.tsx      # Loading skeleton
   ├── [id]/
   │   └── page.tsx     # Detail page
   ```

4. **Design & Typography Standards**
   - **Case**: Always use **Title Case** for all UI labels, headers, and metadata (e.g., "Active Policy" instead of "Active policy").
   - **Typography Matrix**:
     - **Dashboard Titles (KPIs & Cards)**: `text-[13px] font-semibold tracking-tight`
     - **Card Descriptions**: Use `Tooltip` with an `Info` icon (`size={14}`) next to the title instead of inline text.
     - **Entity Card Names**: `text-[14px] font-semibold tracking-tight` (Org name, SP name, Branch name)
     - **Section Headers**: `text-[15px] font-semibold tracking-tight` (Internal page sections)
     - **Table Headers**: `text-[13px] font-semibold text-muted-foreground/70 tracking-tight`
     - **Secondary Labels/Metadata**: `text-[11px] font-semibold text-muted-foreground/80 tracking-tight`
   - **Prohibited**:
     - NO `uppercase` or `tracking-widest` classes for standard labels.
     - NO `font-bold` for administrative labels (use `semibold`).
   - **Components**: Always prefer `DetailField`, `DetailSection`, and `StatusBadge` for data presentation.

5. **Navigation & CRUD Standards**
   - **Tab Persistence**:
     - Detail pages with tabs (e.g., `[id]/page.tsx`) **must** use the `useTabPersistence` hook to sync the active tab with the URL search parameter (`?tab=...`).
     - Sub-views (e.g., internal detail views or visibility states) **must** use the `useQueryState` hook to ensure deep-linking and state persistence on refresh.
   - **CRUD Navigation Patterns**:
     - **Create**: Redirect to the **newly created entity's detail page** (e.g., `router.push(`/organizations/${newId}`)`).
     - **Edit**: Redirect back to the **entity's detail page** (e.g., `router.push(`/organizations/${id}`)`).
     - **Delete**: Redirect to the **listing or directory page** (e.g., `router.push("/organizations")`).
   - **Back Navigation**: Consistently implement breadcrumbs or "Back to [Parent]" links using `next/link` or `router.push`.

6. **Create components if needed**
   ```
   components/shared/    # If reusable across personas
   components/host/      # If host-specific
   ```

6. **Add navigation entry**
   - Update `lib/navigation.ts` to include the new section

// turbo
7. **Verify**
   ```bash
   pnpm typecheck && pnpm lint && pnpm build
   ```
