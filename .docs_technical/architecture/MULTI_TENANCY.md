# Multi-Tenancy & Authentication

## Overview

WellUber uses **Firebase Authentication with multi-tenancy** to isolate user sessions between host, organizations, and service providers. One Firebase project hosts all tenants. Each organization and SP gets its own tenant, providing token-level isolation.

---

## Tenant Model

```mermaid
graph TD
    FP[Firebase Project<br/>welluber-prod]
    FP --> HT[Tenant: host<br/>WellUber team]
    FP --> OT1[Tenant: org-abc123<br/>Acme Corp]
    FP --> OT2[Tenant: org-def456<br/>Petronas]
    FP --> ST1[Tenant: sp-xyz789<br/>FitLife Gym]
    FP --> ST2[Tenant: sp-uvw012<br/>MindWell Clinic]
    FP --> MA[No tenant<br/>Member accounts<br/>personal identity]
```

| Tenant Type | ID Format | Who Authenticates Here |
|-------------|-----------|------------------------|
| Host | `host` | WellUber admin team |
| Organization | `org-{orgId}` | Org admins, HR staff |
| Service Provider | `sp-{spId}` | SP admins, branch staff |
| Member | No tenant (default project) | Employees using the Member App |

**Why separate member accounts from tenants?** Members have a permanent personal identity that outlives any employment. Corporate identities (org tenants) are additive — they unlock benefit wallets but do not own the account.

---

## Token Structure

Every authenticated request carries a Firebase ID token (JWT) with custom claims:

```typescript
interface WellUberTokenClaims {
  role: "host_admin" | "org_admin" | "sp_admin" | "sp_staff";
  tenantId: string;          // e.g. "org-abc123"
  entityId: string;          // orgId or spId this user manages
  permissions: Permission[]; // fine-grained permission list
  branchIds?: string[];      // SP staff: only these branches
}

type Permission =
  | "org:read" | "org:write" | "org:delete"
  | "employee:read" | "employee:write"
  | "policy:read" | "policy:write" | "policy:assign"
  | "wallet:read" | "wallet:topup"
  | "sp:read" | "sp:write"
  | "voucher:read" | "voucher:write" | "voucher:redeem"
  | "claim:read" | "claim:process"
  | "settlement:read" | "settlement:approve" | "settlement:trigger"
  | "audit:read"
  | "platform:config"; // host only
```

---

## Role → Permission Mapping

| Role | Permissions |
|------|-------------|
| **host_admin** | All permissions (full platform access) |
| **org_admin** | `org:read/write`, `employee:*`, `policy:read/assign`, `wallet:read/topup`, `claim:read`, `audit:read` |
| **sp_admin** | `sp:read/write`, `voucher:*`, `claim:read`, `settlement:read/approve`, `audit:read` |
| **sp_staff** | `voucher:redeem`, `claim:process` (scoped to assigned `branchIds`) |

---

## Two-Inbox Security Model

Members have two separate email identities to prevent impersonation:

```mermaid
sequenceDiagram
    participant M as Member
    participant APP as Member App
    participant API as REST API
    participant HR as Org Admin Portal
    participant FB as Firebase Auth

    Note over M,HR: Step 1 — Create personal account
    M->>APP: Sign up with personal email (Google SSO or email/pw)
    APP->>FB: Create account (no tenant)
    FB-->>APP: UID + ID token

    Note over M,HR: Step 2 — HR creates employee record
    HR->>API: POST /employees (corporate email, empCode)
    API->>FB: Create corporate email user in org-{orgId} tenant
    API->>API: Send magic link to corporate email

    Note over M,HR: Step 3 — Member links identity
    M->>APP: Open magic link from corporate email
    APP->>API: POST /identity/link (token from link)
    API->>FB: Link corporate identity to personal UID
    API->>API: Mark corporate identity as verified
    APP-->>M: Benefits wallet now active
```

**Security Properties:**
- Personal email account: permanent, never deleted when employment ends
- Corporate identity: deactivated by HR, benefits expire immediately
- Magic link: 60-minute expiry, single-use, invalidated after first use
- Universal link routing: `welluber://verify-identity/[token]` — no browser fallback

---

## Magic Link Specification

| Property | Value |
|----------|-------|
| Delivery method | Email to corporate address |
| Expiry | 60 minutes (strict) |
| Reuse | Single-use only (token invalidated on first click) |
| URL scheme | `welluber://verify-identity/[token]` |
| Fallback | Browser shows redirect message; no in-browser verification |
| Generation | API creates token, stores hash in Firestore with expiry |
| Validation | API checks token hash + expiry before linking identity |

---

## TOTP Voucher Codes

Used to authorize voucher redemption at an SP. Different from auth TOTP — this is a session-scoped code for a purchased voucher.

| Property | Value |
|----------|-------|
| Format | 6-digit numeric |
| Refresh | Every 30 seconds (standard TOTP algorithm, RFC 6238) |
| Validity window | Entire redemption period of the voucher |
| Replay prevention | Blocked by voucher status (`redeemed`), not by code itself |
| Display | Member App shows countdown timer to next refresh |
| SP entry | SP staff enters code in SP Portal or Member presents QR |

---

## Session Flow (Admin Portals)

```mermaid
sequenceDiagram
    participant Browser
    participant Portal as Next.js Portal
    participant API as REST API
    participant FB as Firebase Auth

    Browser->>Portal: GET /dashboard
    Portal->>Portal: Check session cookie (HttpOnly)
    alt No session
        Portal-->>Browser: Redirect to /login
        Browser->>Portal: POST /auth/login (email + pw or SSO)
        Portal->>FB: signInWithEmailAndPassword (tenant-aware)
        FB-->>Portal: ID token + refresh token
        Portal->>Portal: Set session cookie (HttpOnly, Secure)
        Portal-->>Browser: Redirect to /dashboard
    end

    Portal->>API: GET /api/orgs (Authorization: Bearer {idToken})
    API->>FB: verifyIdToken({idToken, checkRevoked: true})
    FB-->>API: Decoded claims (role, tenantId, entityId)
    API->>API: Check permissions from claims
    API-->>Portal: Data response
    Portal-->>Browser: Rendered page
```

**Token refresh:** Firebase handles refresh tokens automatically. Session cookies are rotated on each page load (server-side token exchange).

---

## Firestore Security Rules (Tenant Isolation)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Host tenant: full read/write
    match /{document=**} {
      allow read, write: if request.auth.token.role == 'host_admin';
    }

    // Org admin: own org subtree only
    match /organizations/{orgId}/{document=**} {
      allow read, write: if request.auth.token.entityId == orgId
                        && request.auth.token.role == 'org_admin';
    }

    // SP admin: own SP subtree only
    match /serviceProviders/{spId}/{document=**} {
      allow read, write: if request.auth.token.entityId == spId
                        && request.auth.token.role in ['sp_admin', 'sp_staff'];
    }

    // Members: own account data only
    match /members/{memberId}/{document=**} {
      allow read, write: if request.auth.uid == memberId;
    }
  }
}
```
