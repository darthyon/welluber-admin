/**
 * IAM — Identity & Access Management
 *
 * Standalone domain covering all admin-portal users, multi-tenant contexts,
 * role-based access control (RBAC), and user action audit logging.
 *
 * Replaces:
 *   - Administrator (features/users/types.ts)
 *   - OrganizationAdmin (features/organizations/types.ts)
 *   - SpAdmin (types/provider.ts)
 *   - AuditLogEntry (features/audit-log/types.ts)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-tenancy model
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   Tenant "host"            → WellUber platform team
 *   Tenant "org-{orgId}"     → One per Organization
 *   Tenant "sp-{spId}"       → One per ServiceProvider
 *
 * A user (AdminUser) belongs to exactly one tenant.
 * Roles and permissions are scoped per tenant type.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RBAC model
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   Permission  = atomic action on a resource (e.g. "employee:write")
 *   Role        = named set of permissions (e.g. "hr_manager")
 *   AdminUser   = has one or more Roles within their Tenant
 *
 * Effective permissions = union of all permissions from all assigned roles.
 * System roles (isSystem: true) cannot be deleted or modified.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Pre-defined roles
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   Host:  super_admin, platform_admin, finance_viewer, viewer
 *   Org:   org_admin, hr_manager, hr_viewer, finance_manager
 *   SP:    sp_admin, branch_manager, staff
 */

// ── Tenant ────────────────────────────────────────────────────────────────────

export type TenantType = "host" | "org" | "sp"

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

// ── AdminUser ─────────────────────────────────────────────────────────────────

/**
 * An admin-portal user. Replaces Administrator, OrganizationAdmin, SpAdmin.
 *
 * Distinct from MemberProfile (consumer identity).
 * AdminUser belongs to exactly one Tenant.
 * Roles are assigned via AdminUserRole (junction).
 */
export type AdminUserStatus = "active" | "pending_activation" | "suspended" | "deactivated"

export interface AdminUser {
  id: string                   // Firebase UID within the tenant
  tenantId: string             // FK → Tenant
  email: string
  name: string
  avatarUrl?: string
  status: AdminUserStatus
  /** Scope restriction for SP staff: only these branches */
  branchIds?: string[]         // Only relevant for "staff" role in SP tenant
  /** Who invited this user */
  invitedBy?: string           // FK → AdminUser
  invitedAt?: string
  /** Timestamps */
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// ── AdminUserRole (junction) ──────────────────────────────────────────────────

export interface AdminUserRole {
  id: string
  adminUserId: string   // FK → AdminUser
  tenantId: string      // FK → Tenant (redundant but useful for queries)
  roleId: string        // FK → Role
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
  adminUserId: string  // FK → AdminUser (who performed the action)
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
