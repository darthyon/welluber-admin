# Persona: Host Admin (God Mode)

> **Route Group:** `(host)`
> **URL Pattern:** `/dashboard`, `/organizations`, `/providers`, etc.

---

## Role Description

Platform-level super admin operated by the WellUber team. Has unrestricted access to all features and data across all organizations and service providers.

## Capabilities

### Management
- [x] View platform-wide dashboard with KPIs
- [x] Create, view, edit, deactivate organizations
- [x] Create, view, edit, deactivate service providers
- [x] Manage all users across all organizations

### Benefits
- [x] Create and manage benefit policies (global + org-specific)
- [x] Monitor all transactions across the platform
- [x] Configure voucher redemption rules

### System
- [x] System-wide settings and configuration
- [x] Manage admin user accounts
- [x] Audit logs and compliance monitoring

## Navigation Items

```typescript
[
  { section: "MANAGEMENT", items: ["Dashboard", "Organizations", "Service Providers", "Global Users"] },
  { section: "BENEFITS", items: ["Policies", "Transactions"] },
  { section: "SYSTEM", items: ["Settings"] },
]
```

## Key Difference from Other Personas

Host sees **everything**. Org and SP are subsets of this view, scoped to their own data.
