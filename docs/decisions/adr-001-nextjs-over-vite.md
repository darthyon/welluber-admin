# ADR-001: Next.js over Vite

> **Status:** Accepted
> **Date:** 2026-04-03

## Context

The initial prototype was built with Vite + React SPA (generated from Google AI Studio). The project needs server-side rendering, file-based routing, middleware for role-based access, and API routes.

## Decision

Migrate to **Next.js 16** with App Router.

## Rationale

- File-based routing eliminates manual route management
- Route groups `(host)/(org)/(serviceprovider)` provide clean persona isolation
- Middleware enables auth/role-based redirects at the edge
- Server Components reduce client-side bundle size
- Server Actions simplify data mutation patterns
- shadcn CLI has first-class Next.js support

## Consequences

- Need to learn App Router patterns (layouts, loading, error boundaries)
- Server vs Client component boundaries require deliberate decisions
- Deployment requires Node.js runtime (not static hosting)
