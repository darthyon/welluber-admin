# Flow: Authentication & Authorization

> **Status:** Planned
> **Last Updated:** 2026-04-03
> **Personas:** All

---

## 1. Login Flow

### Trigger
User navigates to the application without a valid session.

### Steps
1. User is redirected to `/login`
2. User enters credentials (email + password)
3. System validates credentials
4. System determines user persona (host/org/sp)
5. System redirects to appropriate dashboard:
   - Host → `/dashboard`
   - Org → `/[orgSlug]/dashboard`
   - SP → `/[spSlug]/dashboard`

### Error Paths
- Invalid credentials → Inline error message
- Account locked → Contact admin message
- Session expired → Redirect to login with return URL

---

## 2. Role-Based Access Control

### Permission Matrix

| Feature | Host | Org Admin | SP Admin |
|---|---|---|---|
| View all organizations | ✅ | ❌ | ❌ |
| Manage own organization | ✅ | ✅ | ❌ |
| View all providers | ✅ | ❌ | ❌ |
| Manage own provider | ✅ | ❌ | ✅ |
| Create policies | ✅ | ✅ (scoped) | ❌ |
| View transactions | ✅ | ✅ (scoped) | ✅ (scoped) |
| System settings | ✅ | ❌ | ❌ |

---

## 3. Middleware Logic

```
Request → middleware.ts
  ├── No session? → Redirect to /login
  ├── Host role? → Allow access to (host) routes
  ├── Org role? → Allow access to (org)/[orgSlug] routes only
  └── SP role? → Allow access to (serviceprovider)/[spSlug] routes only
```
