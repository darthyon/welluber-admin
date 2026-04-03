# ADR-003: Route Groups for Multi-Persona

> **Status:** Accepted
> **Date:** 2026-04-03

## Context

The admin portal serves three user personas (Host, Org, SP) with overlapping but different feature sets. Need to share UI components while isolating navigation and layouts.

## Decision

Use **Next.js route groups** — `(host)`, `(org)`, `(serviceprovider)` — each with their own `layout.tsx`.

## Rationale

- Route groups don't affect URL structure — `/dashboard` not `/(host)/dashboard`
- Each persona gets its own sidebar configuration via shared layout component
- Build `(host)` first as the complete feature set, then create `(org)` and `(sp)` by subsetting
- Middleware will redirect users to the correct route group based on their role

## Consequences

- Need middleware to route users based on auth role
- Some pages may be duplicated across groups (with different scoping)
- Shared components must be persona-agnostic
