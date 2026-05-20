import type {
  Tenant, Permission, Role, RolePermission,
  User, UserRole, UserAuditLog,
  PermissionKey, RoleKey, TenantType,
} from "@/types/iam"
import { ROLE_PERMISSIONS } from "@/types/iam"

const NOW = "2026-01-01T00:00:00Z"

// ── Tenants ───────────────────────────────────────────────────────────────────

export const TENANTS: Tenant[] = [
  { id: "host",                type: "host", entityId: null,                  name: "WellUber Platform", isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: "org-ORG-20260115-0001", type: "org",  entityId: "ORG-20260115-0001", name: "Acme Corporation Sdn Bhd", isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: "org-ORG-20260301-0002", type: "org",  entityId: "ORG-20260301-0002", name: "Global Tech Solutions", isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: "org-ORG-20260310-0003", type: "org",  entityId: "ORG-20260310-0003", name: "Nexus Innovations", isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: "sp-SP-20260101-0001",  type: "sp",   entityId: "SP-20260101-0001",  name: "Zenith Yoga Studio", isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: "sp-SP-20260115-0002",  type: "sp",   entityId: "SP-20260115-0002",  name: "AgileMind Therapy Centre", isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: "sp-SP-20260201-0003",  type: "sp",   entityId: "SP-20260201-0003",  name: "CoreFit Rehabilitation", isActive: true, createdAt: NOW, updatedAt: NOW },
]

// ── Permissions ───────────────────────────────────────────────────────────────

const PERMISSION_DEFS: Array<Omit<Permission, "id" | "createdAt" | "updatedAt">> = [
  { key: "org:read",             resource: "org",        action: "read",     scope: "own_tenant", description: "View organisation details", tenantType: "host" },
  { key: "org:write",            resource: "org",        action: "write",    scope: "own_tenant", description: "Create and edit organisations", tenantType: "host" },
  { key: "org:delete",           resource: "org",        action: "delete",   scope: "own_tenant", description: "Deactivate organisations", tenantType: "host" },
  { key: "employee:read",        resource: "employee",   action: "read",     scope: "own_tenant", description: "View employee directory", tenantType: "all" },
  { key: "employee:write",       resource: "employee",   action: "write",    scope: "own_tenant", description: "Add and edit employees", tenantType: "all" },
  { key: "employee:deactivate",  resource: "employee",   action: "deactivate", scope: "own_tenant", description: "Offboard employees", tenantType: "all" },
  { key: "policy:read",          resource: "policy",     action: "read",     scope: "own_tenant", description: "View benefit policies", tenantType: "all" },
  { key: "policy:write",         resource: "policy",     action: "write",    scope: "own_tenant", description: "Create and edit policies", tenantType: "host" },
  { key: "policy:assign",        resource: "policy",     action: "assign",   scope: "own_tenant", description: "Assign policies to employees", tenantType: "all" },
  { key: "policy:deactivate",    resource: "policy",     action: "deactivate", scope: "own_tenant", description: "Deactivate active policies", tenantType: "host" },
  { key: "account:read",         resource: "account",    action: "read",     scope: "own_tenant", description: "View wallet balances and transactions", tenantType: "all" },
  { key: "account:topup",        resource: "account",    action: "topup",    scope: "own_tenant", description: "Submit and approve wallet top-ups", tenantType: "all" },
  { key: "account:credit_limit", resource: "account",    action: "credit_limit", scope: "own_tenant", description: "Set or adjust credit limits", tenantType: "host" },
  { key: "claim:read",           resource: "claim",      action: "read",     scope: "own_tenant", description: "View claims and redemptions", tenantType: "all" },
  { key: "claim:confirm",        resource: "claim",      action: "confirm",  scope: "own_tenant", description: "Confirm walk-in claims", tenantType: "sp" },
  { key: "claim:cancel",         resource: "claim",      action: "cancel",   scope: "own_tenant", description: "Cancel claims and reversals", tenantType: "all" },
  { key: "voucher:read",         resource: "voucher",    action: "read",     scope: "own_tenant", description: "View voucher packages", tenantType: "all" },
  { key: "voucher:write",        resource: "voucher",    action: "write",    scope: "own_tenant", description: "Create and edit vouchers", tenantType: "sp" },
  { key: "voucher:publish",      resource: "voucher",    action: "publish",  scope: "own_tenant", description: "Publish and activate vouchers", tenantType: "sp" },
  { key: "settlement:read",      resource: "settlement", action: "read",     scope: "own_tenant", description: "View settlement statements", tenantType: "all" },
  { key: "settlement:approve",   resource: "settlement", action: "approve",  scope: "own_tenant", description: "SP approves settlement statement", tenantType: "sp" },
  { key: "settlement:trigger",   resource: "settlement", action: "trigger",  scope: "all_tenants", description: "Host triggers payout to SP", tenantType: "host" },
  { key: "audit:read",           resource: "audit",      action: "read",     scope: "own_tenant", description: "View audit log", tenantType: "all" },
  { key: "user:invite",          resource: "user",       action: "invite",   scope: "own_tenant", description: "Invite new admin users", tenantType: "all" },
  { key: "user:deactivate",      resource: "user",       action: "deactivate", scope: "own_tenant", description: "Suspend or deactivate admin users", tenantType: "all" },
  { key: "user:role_assign",     resource: "user",       action: "role_assign", scope: "own_tenant", description: "Assign roles to users", tenantType: "all" },
  { key: "platform:config",      resource: "platform",   action: "config",   scope: "all_tenants", description: "Configure platform settings, cron, expired splits", tenantType: "host" },
  { key: "platform:taxonomy",    resource: "platform",   action: "taxonomy", scope: "all_tenants", description: "Manage service taxonomy (Tier 1/2/3)", tenantType: "host" },
]

export const PERMISSIONS: Permission[] = PERMISSION_DEFS.map((p, i) => ({
  id: `PERM-${String(i + 1).padStart(3, "0")}`,
  ...p,
  createdAt: NOW,
  updatedAt: NOW,
}))

// ── Roles ─────────────────────────────────────────────────────────────────────

const ROLE_DEFS: Array<Omit<Role, "id" | "createdAt" | "updatedAt">> = [
  // Host
  { key: "super_admin",    tenantType: "host", displayName: "Super Admin",    description: "Full platform access — all tenants, all operations", isSystem: true },
  { key: "platform_admin", tenantType: "host", displayName: "Platform Admin", description: "Manage orgs, SPs, policies and settlements — no platform config", isSystem: true },
  { key: "finance_viewer", tenantType: "host", displayName: "Finance Viewer", description: "Read-only access to accounts and settlements", isSystem: true },
  { key: "viewer",         tenantType: "host", displayName: "Viewer",         description: "Read-only access across the platform", isSystem: true },
  // Org
  { key: "org_admin",      tenantType: "org",  displayName: "Org Admin",      description: "Full organisation management including user invites", isSystem: true },
  { key: "hr_manager",     tenantType: "org",  displayName: "HR Manager",     description: "Employee management and policy assignment", isSystem: true },
  { key: "hr_viewer",      tenantType: "org",  displayName: "HR Viewer",      description: "Read-only employee and policy view", isSystem: true },
  { key: "finance_manager",tenantType: "org",  displayName: "Finance Manager",description: "Wallet top-ups and utilisation reports", isSystem: true },
  // SP
  { key: "sp_admin",       tenantType: "sp",   displayName: "SP Admin",       description: "Full service provider management", isSystem: true },
  { key: "branch_manager", tenantType: "sp",   displayName: "Branch Manager", description: "Branch operations, vouchers, and claims", isSystem: true },
  { key: "staff",          tenantType: "sp",   displayName: "Staff",          description: "Walk-in claim processing at assigned branches only", isSystem: true },
]

export const ROLES: Role[] = ROLE_DEFS.map((r, i) => ({
  id: `ROLE-${String(i + 1).padStart(3, "0")}`,
  ...r,
  createdAt: NOW,
  updatedAt: NOW,
}))

// ── RolePermissions ───────────────────────────────────────────────────────────

export const ROLE_PERMISSION_RECORDS: RolePermission[] = ROLES.flatMap(role => {
  const permKeys = ROLE_PERMISSIONS[role.key] ?? []
  return permKeys
    .map(key => PERMISSIONS.find(p => p.key === key))
    .filter(Boolean)
    .map(perm => ({
      roleId: role.id,
      permissionId: perm!.id,
      createdAt: NOW,
    }))
})

// ── Users ────────────────────────────────────────────────────────────────

const ADMIN_DEFS: Array<Omit<User, "id" | "createdAt" | "updatedAt">> = [
  // Host admins
  { tenantId: "host", email: "yon@welluber.com",     name: "Yon Yusuf",     status: "active",              lastLoginAt: "2026-05-14T14:30:00Z" },
  { tenantId: "host", email: "danish@welluber.com",  name: "Danish Azhar",  status: "active",              lastLoginAt: "2026-05-12T09:15:00Z" },
  { tenantId: "host", email: "amira@welluber.com",   name: "Amira Rahman",  status: "active",              lastLoginAt: "2026-05-10T11:00:00Z" },
  // Acme org admins
  { tenantId: "org-ORG-20260115-0001", email: "hr.acme@acme.com.my",       name: "Haziq Rashid",     status: "active",              invitedAt: "2026-01-15T08:00:00Z", lastLoginAt: "2026-05-13T09:00:00Z" },
  { tenantId: "org-ORG-20260115-0001", email: "finance.acme@acme.com.my",  name: "Lena Yap",         status: "active",              invitedAt: "2026-01-15T08:00:00Z", lastLoginAt: "2026-05-10T10:00:00Z" },
  { tenantId: "org-ORG-20260115-0001", email: "viewer.acme@acme.com.my",   name: "Wei Lin Chong",    status: "pending_activation",  invitedAt: "2026-05-01T08:00:00Z" },
  // Global Tech org admin
  { tenantId: "org-ORG-20260301-0002", email: "hr@globaltech.com.my",      name: "Priya Krishnan",   status: "active",              invitedAt: "2026-03-01T08:00:00Z", lastLoginAt: "2026-05-11T08:30:00Z" },
  // Zenith SP admins
  { tenantId: "sp-SP-20260101-0001", email: "admin@zenithyoga.my",    name: "Hafiz Azmi",       status: "active",   invitedAt: "2026-01-10T08:00:00Z", lastLoginAt: "2026-05-14T07:45:00Z" },
  { tenantId: "sp-SP-20260101-0001", email: "klcc@zenithyoga.my",     name: "James Wong",       status: "active",   invitedAt: "2026-01-10T08:00:00Z", lastLoginAt: "2026-05-13T17:00:00Z", branchIds: ["SPB-0001"] },
  // AgileMind SP admin
  { tenantId: "sp-SP-20260115-0002", email: "admin@agilemind.my",    name: "Sara Lim",         status: "active",   invitedAt: "2026-01-15T08:00:00Z", lastLoginAt: "2026-05-12T14:00:00Z" },
]

export const USERS: User[] = ADMIN_DEFS.map((a, i) => ({
  id: `ADM-20260115-${String(i + 1).padStart(4, "0")}`,
  ...a,
  createdAt: NOW,
  updatedAt: NOW,
}))

// ── UserRoles ────────────────────────────────────────────────────────────

function roleId(key: RoleKey): string {
  return ROLES.find(r => r.key === key)!.id
}

const USER_ROLE_DEFS: Array<Omit<UserRole, "id" | "createdAt" | "updatedAt">> = [
  // Host
  { userId: "ADM-20260115-0001", tenantId: "host", roleId: roleId("super_admin"),    assignedBy: "ADM-20260115-0001", assignedAt: NOW, isActive: true },
  { userId: "ADM-20260115-0002", tenantId: "host", roleId: roleId("platform_admin"), assignedBy: "ADM-20260115-0001", assignedAt: NOW, isActive: true },
  { userId: "ADM-20260115-0003", tenantId: "host", roleId: roleId("finance_viewer"), assignedBy: "ADM-20260115-0001", assignedAt: NOW, isActive: true },
  // Acme org
  { userId: "ADM-20260115-0004", tenantId: "org-ORG-20260115-0001", roleId: roleId("org_admin"),      assignedBy: "ADM-20260115-0001", assignedAt: NOW, isActive: true },
  { userId: "ADM-20260115-0005", tenantId: "org-ORG-20260115-0001", roleId: roleId("finance_manager"),assignedBy: "ADM-20260115-0004", assignedAt: NOW, isActive: true },
  { userId: "ADM-20260115-0006", tenantId: "org-ORG-20260115-0001", roleId: roleId("hr_viewer"),      assignedBy: "ADM-20260115-0004", assignedAt: NOW, isActive: true },
  // Global Tech org
  { userId: "ADM-20260115-0007", tenantId: "org-ORG-20260301-0002", roleId: roleId("hr_manager"),     assignedBy: "ADM-20260115-0001", assignedAt: NOW, isActive: true },
  // SP
  { userId: "ADM-20260115-0008", tenantId: "sp-SP-20260101-0001", roleId: roleId("sp_admin"),       assignedBy: "ADM-20260115-0001", assignedAt: NOW, isActive: true },
  { userId: "ADM-20260115-0009", tenantId: "sp-SP-20260101-0001", roleId: roleId("staff"),           assignedBy: "ADM-20260115-0008", assignedAt: NOW, isActive: true },
  { userId: "ADM-20260115-0010", tenantId: "sp-SP-20260115-0002", roleId: roleId("sp_admin"),       assignedBy: "ADM-20260115-0001", assignedAt: NOW, isActive: true },
]

export const USER_ROLES: UserRole[] = USER_ROLE_DEFS.map((r, i) => ({
  id: `AUR-20260115-${String(i + 1).padStart(4, "0")}`,
  ...r,
  createdAt: NOW,
  updatedAt: NOW,
}))

// ── UserAuditLogs ─────────────────────────────────────────────────────────────

const AUDIT_DEFS: Array<Omit<UserAuditLog, "id">> = [
  { userId: "ADM-20260115-0001", tenantId: "host",                    action: "org.create",          resource: "Organization",  resourceId: "ORG-20260115-0001", description: "Created Acme Corporation Sdn Bhd", after: { name: "Acme Corporation Sdn Bhd", status: "draft" }, createdAt: "2026-01-15T09:00:00Z" },
  { userId: "ADM-20260115-0001", tenantId: "host",                    action: "user.invite",         resource: "User",     resourceId: "ADM-20260115-0004", description: "Invited Haziq Rashid as org_admin for Acme",                                                            createdAt: "2026-01-15T09:05:00Z" },
  { userId: "ADM-20260115-0004", tenantId: "org-ORG-20260115-0001",  action: "employee.create",     resource: "Employee",      resourceId: "EMP-20260115-0001", description: "Added Ahmad Faizal to Kuala Lumpur HQ",                                                                 createdAt: "2026-01-15T10:00:00Z" },
  { userId: "ADM-20260115-0004", tenantId: "org-ORG-20260115-0001",  action: "policy.assign",       resource: "BenefitPolicy", resourceId: "POL-20260115-0001", description: "Assigned Acme Employee Wellness Policy to Ahmad Faizal",                                                createdAt: "2026-01-16T09:00:00Z" },
  { userId: "ADM-20260115-0005", tenantId: "org-ORG-20260115-0001",  action: "account.topup",       resource: "Account",       resourceId: "ACC-20260115-0001", description: "Submitted top-up request RM 10,000 for Acme HQ Wallet", after: { amount: 10000, method: "bank_transfer" }, createdAt: "2026-03-15T14:00:00Z" },
  { userId: "ADM-20260115-0001", tenantId: "host",                    action: "account.credit_limit",resource: "Account",       resourceId: "ACC-20260115-0001", description: "Updated credit limit to RM 5,000", before: { creditLimit: 3000 }, after: { creditLimit: 5000 },        createdAt: "2026-02-01T10:00:00Z" },
  { userId: "ADM-20260115-0008", tenantId: "sp-SP-20260101-0001",    action: "voucher.publish",     resource: "SpVoucher",     resourceId: "VCH-2024-0081",     description: "Published Wellness Allocation Voucher",                                                                 createdAt: "2026-01-20T11:00:00Z" },
  { userId: "ADM-20260115-0001", tenantId: "host",                    action: "settlement.trigger",  resource: "Settlement",    resourceId: "SET-2026-0001",     description: "Triggered payout to Zenith Yoga Studio — April 2026",                                                  createdAt: "2026-05-01T09:00:00Z" },
  { userId: "ADM-20260115-0004", tenantId: "org-ORG-20260115-0001",  action: "employee.deactivate", resource: "Employee",      resourceId: "EMP-20260115-0006", description: "Offboarded Priya Raj — last day 31 Mar 2026",                                                           createdAt: "2026-04-01T00:00:00Z" },
  { userId: "ADM-20260115-0002", tenantId: "host",                    action: "policy.write",        resource: "BenefitPolicy", resourceId: "POL-20260115-0002", description: "Updated Acme Leadership Benefits Policy — increased totalCapAmount", before: { totalCapAmount: 1500 }, after: { totalCapAmount: 2000 }, createdAt: "2026-04-10T14:00:00Z" },
]

export const USER_AUDIT_LOGS: UserAuditLog[] = AUDIT_DEFS.map((a, i) => ({
  id: `UAL-20260115-${String(i + 1).padStart(4, "0")}`,
  ...a,
}))

// ── Factory functions for seed.ts ─────────────────────────────────────────────

export function createTenant(index: number):      Tenant        { return TENANTS[index % TENANTS.length]! }
export function createPermission(index: number):  Permission    { return PERMISSIONS[index % PERMISSIONS.length]! }
export function createRole(index: number):        Role          { return ROLES[index % ROLES.length]! }
export function createUser(index: number):   AdminUser     { return USERS[index % USERS.length]! }
export function createUserRole(index: number): AdminUserRole { return USER_ROLES[index % USER_ROLES.length]! }
export function createUserAuditLog(index: number): UserAuditLog { return USER_AUDIT_LOGS[index % USER_AUDIT_LOGS.length]! }
