# Product Requirements Document — WellUber Admin

> **Status:** Draft
> **Last Updated:** 2026-04-03
> **Owner:** [Your Name]

---

## 1. Overview

**WellUber Admin** is a SaaS administration portal for managing corporate flexible benefit programs. It serves three distinct user personas through a unified platform.

### 1.1 Problem Statement

<!-- What pain point does this solve? -->

### 1.2 Target Users

| Persona | Role | Access Level |
|---|---|---|
| **Host Admin** | Platform super-admin (WellUber team) | God mode — full system access |
| **Org Admin** | Organization HR/admin | Own organization, employees, policies |
| **Service Provider** | Vendor/provider admin | Own branches, vouchers, settlements |

### 1.3 Success Metrics

<!-- KPIs to measure product success -->
- [ ] Define adoption metric
- [ ] Define engagement metric
- [ ] Define operational efficiency metric

---

## 2. Feature Scope

### 2.1 Host Admin (God Mode) — Phase 1

| Feature | Priority | Status |
|---|---|---|
| Dashboard (platform overview) | P0 | Planned |
| Organization Management (CRUD, onboarding) | P0 | Planned |
| Service Provider Management (CRUD, registration) | P0 | Planned |
| Global User Management | P1 | Planned |
| Benefit Policy Configuration | P1 | Planned |
| Transaction Monitoring | P1 | Planned |
| System Settings | P2 | Planned |

### 2.2 Org Admin — Phase 2

<!-- Subset of Host features scoped to own organization -->

### 2.3 Service Provider — Phase 2

<!-- Subset of Host features scoped to own provider -->

---

## 3. Non-Functional Requirements

### 3.1 Performance
- Page load: < 2s (LCP)
- Interaction: < 100ms (INP)

### 3.2 Accessibility
- WCAG 2.1 AA compliance

### 3.3 Browser Support
- Chrome, Safari, Firefox, Edge (latest 2 versions)

### 3.4 Security
- Role-based access control (RBAC)
- Session management
- Audit logging

---

## 4. Out of Scope (Phase 1)

<!-- Explicitly list what we are NOT building -->
- Mobile-native apps
- Public-facing marketing site
- Multi-language support (i18n) — deferred to Phase 3
- Billing/subscription management

---

## 5. Open Questions

<!-- Track unresolved decisions here -->
- [ ] Auth provider decision (NextAuth, Clerk, custom?)
- [ ] Database choice (Supabase, PlanetScale, custom?)
- [ ] Point system vs monetary units (ref: previous PRD work)
