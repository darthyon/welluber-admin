# ADR-002: Single Repo (No Monorepo)

> **Status:** Accepted
> **Date:** 2026-04-03

## Context

Considered whether to structure as a monorepo (Turborepo + workspaces) or a single Next.js application.

## Decision

Use a **single repository** with route groups for persona isolation.

## Rationale

- Only one deployable application (admin portal)
- Multiple personas are not separate apps — they share the same UI framework, design system, and data layer
- Route groups provide sufficient isolation without workspace overhead
- Monorepo complexity is not justified until a second app exists (e.g., marketing site, mobile API)
- Can graduate to monorepo later by extracting `packages/ui` when needed

## Consequences

- All code lives in one repo — simpler CI/CD
- Shared components are in `components/shared/` not a separate package
- If a second app is added, consider extracting to monorepo at that point
