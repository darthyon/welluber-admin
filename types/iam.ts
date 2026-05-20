/**
 * IAM — Identity & Access Management
 *
 * Standalone domain. A single `User` entity covers every identity in the system,
 * scoped by `Tenant`. This replaces all fragmented user types:
 *   - Administrator (features/users/types.ts)
 *   - OrganizationAdmin (features/organizations/types.ts)
 *   - SpAdmin (types/provider.ts)
 *   - AuditLogEntry (features/audit-log/types.ts)
 *   - MemberProfile (types/member-profile.ts) — planned, see note below
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-tenancy model
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   Tenant "host"            → WellUber platform team
 *   Tenant "org-{orgId}"     → One per Organization
 *   Tenant "sp-{spId}"       → One per ServiceProvider
 *   Tenant "member"          → [planned] Public/consumer users (Member App)
 *
 * Every `User` belongs to exactly one Tenant.
 * Roles and permissions are scoped per tenant type.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RBAC model
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   Permission = atomic action on a resource (e.g. "employee:write")
 *   Role       = named set of permissions    (e.g. "hr_manager")
 *   User       = has one or more Roles within their Tenant
 *
 * Effective permissions = union of permissions from all assigned roles.
 * System roles (isSystem: true) cannot be deleted or modified.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Pre-defined roles
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   Host:    super_admin, platform_admin, finance_viewer, viewer
 *   Org:     org_admin, hr_manager, hr_viewer, finance_manager
 *   SP:      sp_admin, branch_manager, staff
 *   Member:  member_user  [planned — replaces MemberProfile when added]
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Planned: Member tenant
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * When member (consumer) users are onboarded into IAM:
 *   - TenantType expands to include "member"
 *   - A single "member" tenant covers all public/consumer users
 *   - MemberProfile fields move to User (personalEmail, authProvider, etc.)
 *   - EmployeeAccount becomes the bridge from User → Employee (HR record)
 *   - Roles: member_user (can browse + purchase), member_linked (has active
 *     EmployeeAccount, benefit wallet unlocked)
 */

// ── Tenant ────────────────────────────────────────────────────────────────────

export type TenantType =
  | "host"    // WellUber platform team
  | "org"     // One tenant per Organization
  | "sp"      // One tenant per ServiceProvider
  | "member"  // [planned] All consumer/member app users

export interface Tenant {
  /**
   * Stable string ID that doubles as the Firebase tenant ID.
   *   "host"           for the WellUber platform tenant
   *   "org-{orgId}"    for an organisation tenant
   *   "sp-{spId}"      for a service-provider tenant
   */
  id: string
  type: TenantType
  /**
   * FK → Organization or ServiceProvider.
   * null for the host tenant.
   */
  entityId: string | null
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ── Permission ────────────────────────────────────────────────────────────────

/**
 * Pre-defined permission keys.
 * Convention: "{resource}:{action}"
 */
export type PermissionKey =
  // Organisation
  | "org:read"       | "org:write"       | "org:delete"
  // Employees
  | "employee:read"  | "employee:write"  | "employee:deactivate"
  // Policies
  | "policy:read"    | "policy:write"    | "policy:assign"  | "policy:deactivate"
  // Accounts / wallet
  | "account:read"   | "account:topup"   | "account:credit_limit"
  // Claims
  | "claim:read"     | "claim:confirm"   | "claim:cancel"
  // Vouchers
  | "voucher:read"   | "voucher:write"   | "voucher:publish"
  // Settlement
  | "settlement:read"| "settlement:approve" | "settlement:trigger"
  // Audit
  | "audit:read"
  // Users / IAM
  | "user:invite"    | "user:deactivate" | "user:role_assign"
  // Platform (host only)
  | "platform:config"| "platform:taxonomy"

export type ResourceScope = "own_tenant" | "all_tenants"

export interface Permission {
  id: string
  /** Canonical key used in token claims and permission checks */
  key: PermissionKey
  resource: string    // e.g. "employee", "policy", "account"
  action: string      // e.g. "read", "write", "approve"
  /**
   * "own_tenant"  → user can only act on resources within their own tenant
   * "all_tenants" → user can act across tenants (host admins only)
   */
  scope: ResourceScope
  description: string
  /** Which tenant type this permission applies to */
  tenantType: TenantType | "all"
  createdAt: string
  updatedAt: string
}

// ── Role ──────────────────────────────────────────────────────────────────────

export type RoleKey =
  // Host roles
  | "super_admin"       // Full platform access
  | "platform_admin"    // Manage orgs, SPs, policies — no platform config
  | "finance_viewer"    // View accounts and settlements
  | "viewer"            // Read-only across the platform
  // Org roles
  | "org_admin"         // Full org management
  | "hr_manager"        // Employee management + policy assignment
  | "hr_viewer"         // Read-only employee view
  | "finance_manager"   // Wallet top-ups + utilisation reports
  // SP roles
  | "sp_admin"          // Full SP management
  | "branch_manager"    // Branch management + vouchers (own branches)
  | "staff"             // Walk-in claim processing (own assigned branches)
  // Member roles [planned]
  | "member_user"       // Public user — can browse marketplace
  | "member_linked"     // Linked to an EmployeeAccount — benefit wallet active

export interface Role {
  id: string
  key: RoleKey
  tenantType: TenantType  // which tenant type this role belongs to
  displayName: string
  description: string
  /** System roles cannot be deleted or renamed */
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

// ── RolePermission (junction) ─────────────────────────────────────────────────

export interface RolePermission {
  roleId: string       // FK → Role
  permissionId: string // FK → Permission
  createdAt: string
}

// ── User ──────────────────────────────────────────────────────────────────────

/**
 * A user in the IAM system. Generic — covers every identity type:
 *
 *   tenantType "host"   → WellUber platform team member
 *   tenantType "org"    → HR manager, finance staff, org admin
 *   tenantType "sp"     → SP admin, branch manager, front-desk staff
 *   tenantType "member" → [planned] Consumer / Member App user
 *
 * Replaces: Administrator, OrganizationAdmin, SpAdmin, (future) MemberProfile.
 * Roles are assigned via UserRole (junction table).
 */
export type UserStatus = "active" | "pending_activation" | "suspended" | "deactivated"

export interface User {
  id: string          // Firebase UID within the tenant
  tenantId: string    // FK → Tenant
  email: string
  name: string
  avatarUrl?: string
  status: UserStatus
  /**
   * Branch scope — only relevant for SP staff role.
   * Limits claim processing to these specific branches.
   */
  branchIds?: string[]
  /** Who sent the invite that created this user */
  invitedBy?: string  // FK → User
  invitedAt?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// ── UserRole (junction) ───────────────────────────────────────────────────────

export interface UserRole {
  id: string
  userId: string    // FK → User
  tenantId: string  // FK → Tenant (denormalised for query efficiency)
  roleId: string    // FK → Role
  assignedBy: string    // FK → AdminUser (who granted this role)
  assignedAt: string
  /** Optional expiry for time-limited access grants */
  expiresAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ── UserAuditLog ──────────────────────────────────────────────────────────────

/**
 * Immutable record of every admin action.
 *
 * Written by the API on every state-changing operation.
 * 7-year retention for compliance (RMCD, PDPA).
 * createdAt only — never updated (append-only log).
 */
export interface UserAuditLog {
  id: string
  userId: string       // FK → User (who performed the action)
  tenantId: string     // FK → Tenant (which tenant context)
  /**
   * Dot-notation action key: "{resource}.{verb}"
   * e.g. "employee.create", "policy.activate", "settlement.trigger"
   */
  action: string
  resource: string     // Entity type: "Employee", "Policy", "Account", etc.
  resourceId?: string  // FK → the affected entity
  description: string  // Human-readable summary
  /** State before the action (for update/delete operations) */
  before?: Record<string, unknown>
  /** State after the action (for create/update operations) */
  after?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  /** Immutable — 7-year retention */
  createdAt: string
}

// ── Role → Permission mapping (reference) ─────────────────────────────────────

/**
 * Canonical role-to-permission matrix.
 * Source of truth for seeding RolePermission records.
 */
export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  // ── Host ──────────────────────────────────────────────────────────────────
  super_admin: [
    "org:read", "org:write", "org:delete",
    "employee:read", "employee:write", "employee:deactivate",
    "policy:read", "policy:write", "policy:assign", "policy:deactivate",
    "account:read", "account:topup", "account:credit_limit",
    "claim:read", "claim:confirm", "claim:cancel",
    "voucher:read", "voucher:write", "voucher:publish",
    "settlement:read", "settlement:approve", "settlement:trigger",
    "audit:read",
    "user:invite", "user:deactivate", "user:role_assign",
    "platform:config", "platform:taxonomy",
  ],
  platform_admin: [
    "org:read", "org:write",
    "employee:read", "employee:write",
    "policy:read", "policy:write", "policy:assign",
    "account:read", "account:topup",
    "claim:read", "settlement:read", "settlement:trigger",
    "voucher:read", "voucher:write",
    "audit:read",
    "user:invite", "user:deactivate",
  ],
  finance_viewer: [
    "account:read", "claim:read", "settlement:read", "audit:read",
  ],
  viewer: [
    "org:read", "employee:read", "policy:read",
    "claim:read", "voucher:read", "audit:read",
  ],

  // ── Org ───────────────────────────────────────────────────────────────────
  org_admin: [
    "employee:read", "employee:write", "employee:deactivate",
    "policy:read", "policy:assign",
    "account:read", "account:topup",
    "claim:read", "audit:read",
    "user:invite", "user:deactivate",
  ],
  hr_manager: [
    "employee:read", "employee:write", "employee:deactivate",
    "policy:read", "policy:assign",
    "account:read",
    "claim:read",
  ],
  hr_viewer: [
    "employee:read", "policy:read", "account:read", "claim:read",
  ],
  finance_manager: [
    "account:read", "account:topup",
    "claim:read", "settlement:read",
    "audit:read",
  ],

  // ── Member [planned] ─────────────────────────────────────────────────────
  member_user:   [],  // No admin permissions — member roles TBD when member tenant is built
  member_linked: [],  // Same — wallet access governed by EmployeeAccount, not IAM permissions

  // ── SP ────────────────────────────────────────────────────────────────────
  sp_admin: [
    "voucher:read", "voucher:write", "voucher:publish",
    "claim:read", "claim:confirm", "claim:cancel",
    "settlement:read", "settlement:approve",
    "audit:read",
    "user:invite", "user:deactivate",
  ],
  branch_manager: [
    "voucher:read", "voucher:write",
    "claim:read", "claim:confirm", "claim:cancel",
    "settlement:read",
  ],
  staff: [
    "claim:confirm", "claim:cancel",
  ],
}
