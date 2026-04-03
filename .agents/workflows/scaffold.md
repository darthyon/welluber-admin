---
description: How to scaffold a new feature module
---

# Scaffold New Feature

## Steps

1. **Create the docs first**
   - Add or update `docs/flows/flows_[feature].md`
   - Define the user flow, happy/unhappy paths
   - Reference `docs/personas/host.md` for permission scope

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

4. **Create components if needed**
   ```
   components/shared/    # If reusable across personas
   components/host/      # If host-specific
   ```

5. **Add navigation entry**
   - Update `lib/navigation.ts` to include the new section

// turbo
6. **Verify**
   ```bash
   pnpm typecheck && pnpm lint && pnpm build
   ```
