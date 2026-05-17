"use client"

import { useSyncExternalStore, useMemo } from "react"
import {
  brandStore,
  orgStore,
  spStore,
  employeeStore,
  memberStore,
  adminStore,
  claimStore,
  voucherStore,
  accountStore,
  auditLogStore,
  policyStore,
  benefitAssignmentStore,
  employeeUsageLogStore,
  walletUsageLogStore,
  memberProfileStore,
  employeeAccountStore,
  dependentAccountStore,
  tenantStore,
  permissionStore,
  roleStore,
  adminUserStore,
  adminUserRoleStore,
  userAuditLogStore,
} from "@/lib/mock-data/store"
import type { Brand } from "@/types/brand"
import type { Organization, Employee } from "@/features/organizations/types"
import type { ServiceProvider } from "@/types/provider"
import type { Member, Administrator } from "@/features/users/types"
import type { AuditLogEntry } from "@/features/audit-log/types"
import type { GeneratedVoucher } from "@/features/voucher-packages/types"
import type { Account } from "@/features/accounts/types"
import { getAvailableBalance, getCreditUsed } from "@/features/accounts/types"
import type { BenefitAssignment, EmployeePoolSummary } from "@/types/benefit-assignment"
import { getAvailableAmount, getUtilisationPct } from "@/types/benefit-assignment"
import type { EmployeeUsageLog, WalletUsageLog, UsagePeriod } from "@/types/usage-log"
import type { MemberProfile } from "@/types/member-profile"
import type { EmployeeAccount, DependentAccount, EmployeeAccountLinkageStatus } from "@/types/employee-account"
import type { Tenant, Permission, Role, AdminUser, AdminUserRole, UserAuditLog, TenantType, RoleKey, PermissionKey } from "@/types/iam"
import type { GlobalClaimRow } from "@/lib/mock-data/factories/claim"
import type { PolicyListItem, PolicyData } from "@/features/policies/types"

export function useBrands() {
  const data = useSyncExternalStore(brandStore.subscribe, brandStore.get, brandStore.get)
  return { brands: data as Brand[], add: brandStore.add, update: brandStore.update, remove: brandStore.remove }
}

export function useOrganizations() {
  const data = useSyncExternalStore(orgStore.subscribe, orgStore.get, orgStore.get)
  return { organizations: data as Organization[], add: orgStore.add, update: orgStore.update, remove: orgStore.remove }
}

export function useServiceProviders() {
  const data = useSyncExternalStore(spStore.subscribe, spStore.get, spStore.get)
  return { serviceProviders: data as ServiceProvider[], add: spStore.add, update: spStore.update, remove: spStore.remove }
}

export function useEmployees() {
  const data = useSyncExternalStore(employeeStore.subscribe, employeeStore.get, employeeStore.get)
  return { employees: data as Employee[], add: employeeStore.add, update: employeeStore.update, remove: employeeStore.remove }
}

export function useMembers() {
  const data = useSyncExternalStore(memberStore.subscribe, memberStore.get, memberStore.get)
  return { members: data as Member[], add: memberStore.add, update: memberStore.update, remove: memberStore.remove }
}

export function useAdmins() {
  const data = useSyncExternalStore(adminStore.subscribe, adminStore.get, adminStore.get)
  return { admins: data as Administrator[], add: adminStore.add, update: adminStore.update, remove: adminStore.remove }
}

export function useClaims() {
  const data = useSyncExternalStore(claimStore.subscribe, claimStore.get, claimStore.get)
  return { claims: data as GlobalClaimRow[], add: claimStore.add, update: claimStore.update, remove: claimStore.remove }
}

export function useVouchers() {
  const data = useSyncExternalStore(voucherStore.subscribe, voucherStore.get, voucherStore.get)
  return { vouchers: data as GeneratedVoucher[], add: voucherStore.add, update: voucherStore.update, remove: voucherStore.remove }
}

export function useAccountStore() {
  const data = useSyncExternalStore(accountStore.subscribe, accountStore.get, accountStore.get)
  return { accounts: data as Account[], add: accountStore.add, update: accountStore.update, remove: accountStore.remove }
}

export function useAuditLogs() {
  const data = useSyncExternalStore(auditLogStore.subscribe, auditLogStore.get, auditLogStore.get)
  return { auditLogs: data as AuditLogEntry[], add: auditLogStore.add, update: auditLogStore.update, remove: auditLogStore.remove }
}

// ── BenefitAssignment ─────────────────────────────────────────────────────────

export function useBenefitAssignments(employeeId?: string) {
  const data = useSyncExternalStore(
    benefitAssignmentStore.subscribe,
    benefitAssignmentStore.get,
    benefitAssignmentStore.get,
  ) as BenefitAssignment[]

  const assignments = useMemo(
    () => (employeeId ? data.filter(a => a.employeeId === employeeId) : data),
    [data, employeeId],
  )

  return {
    assignments,
    add: benefitAssignmentStore.add,
    update: benefitAssignmentStore.update,
    remove: benefitAssignmentStore.remove,
  }
}

/** Returns a pool summary for one employee, grouped by benefit group. */
export function useEmployeePoolSummary(employeeId: string): EmployeePoolSummary {
  const { assignments } = useBenefitAssignments(employeeId)

  return useMemo(() => {
    const byGroup = assignments.map(a => ({
      benefitGroupId: a.benefitGroupId,
      benefitGroupName: a.benefitGroupId, // real name would come from policy data
      policyId: a.policyId,
      policyName: a.policyId,             // real name would come from policy data
      assignment: a,
      availableAmount: getAvailableAmount(a),
      utilisationPct: getUtilisationPct(a),
    }))

    const totalAllocated = assignments.reduce((s, a) => s + a.allocatedAmount, 0)
    const totalUsed      = assignments.reduce((s, a) => s + a.usedAmount, 0)
    const totalAvailable = Math.max(0, totalAllocated - totalUsed)

    return {
      employeeId,
      totalAllocated,
      totalUsed,
      totalAvailable,
      utilisationPct: totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0,
      byGroup,
    }
  }, [assignments, employeeId])
}

// ── Account balance helpers ───────────────────────────────────────────────────

export interface AccountBalanceSummary {
  balance: number
  creditLimit: number
  /** balance + creditLimit */
  available: number
  /** How much of the creditLimit is currently in use (balance < 0) */
  creditUsed: number
  /** 0–100 */
  creditUsedPct: number
  isActive: boolean
}

export function useAccountBalance(accountId: string): AccountBalanceSummary | null {
  const { accounts } = useAccountStore()

  return useMemo(() => {
    const account = accounts.find(a => a.id === accountId)
    if (!account) return null

    const available   = getAvailableBalance(account)
    const creditUsed  = getCreditUsed(account)
    const creditUsedPct = account.creditLimit > 0
      ? Math.round((creditUsed / account.creditLimit) * 100)
      : 0

    return {
      balance: account.balance,
      creditLimit: account.creditLimit,
      available,
      creditUsed,
      creditUsedPct,
      isActive: account.isActive,
    }
  }, [accounts, accountId])
}

// ── Usage logs ────────────────────────────────────────────────────────────────

export function useEmployeeUsageLogs(opts?: {
  employeeId?: string
  period?: UsagePeriod
  benefitAssignmentId?: string
}) {
  const data = useSyncExternalStore(
    employeeUsageLogStore.subscribe,
    employeeUsageLogStore.get,
    employeeUsageLogStore.get,
  ) as EmployeeUsageLog[]

  const logs = useMemo(() => {
    let result = data
    if (opts?.employeeId)          result = result.filter(l => l.employeeId === opts.employeeId)
    if (opts?.period)              result = result.filter(l => l.period === opts.period)
    if (opts?.benefitAssignmentId) result = result.filter(l => l.benefitAssignmentId === opts.benefitAssignmentId)
    return result.sort((a, b) => b.periodKey.localeCompare(a.periodKey))
  }, [data, opts?.employeeId, opts?.period, opts?.benefitAssignmentId])

  return { logs, add: employeeUsageLogStore.add, update: employeeUsageLogStore.update }
}

// ── MemberProfile ─────────────────────────────────────────────────────────────

export function useMemberProfiles() {
  const data = useSyncExternalStore(
    memberProfileStore.subscribe, memberProfileStore.get, memberProfileStore.get,
  ) as MemberProfile[]
  return { memberProfiles: data, add: memberProfileStore.add, update: memberProfileStore.update, remove: memberProfileStore.remove }
}

// ── EmployeeAccount ───────────────────────────────────────────────────────────

export function useEmployeeAccounts(opts?: {
  memberProfileId?: string
  orgId?: string
  linkageStatus?: EmployeeAccountLinkageStatus
}) {
  const data = useSyncExternalStore(
    employeeAccountStore.subscribe, employeeAccountStore.get, employeeAccountStore.get,
  ) as EmployeeAccount[]

  const accounts = useMemo(() => {
    let result = data
    if (opts?.memberProfileId) result = result.filter(a => a.memberProfileId === opts.memberProfileId)
    if (opts?.orgId)           result = result.filter(a => a.orgId === opts.orgId)
    if (opts?.linkageStatus)   result = result.filter(a => a.linkageStatus === opts.linkageStatus)
    return result
  }, [data, opts?.memberProfileId, opts?.orgId, opts?.linkageStatus])

  return { employeeAccounts: accounts, add: employeeAccountStore.add, update: employeeAccountStore.update }
}

// ── IAM hooks ─────────────────────────────────────────────────────────────────

export function useTenants(type?: TenantType) {
  const data = useSyncExternalStore(tenantStore.subscribe, tenantStore.get, tenantStore.get) as Tenant[]
  const tenants = useMemo(() => type ? data.filter(t => t.type === type) : data, [data, type])
  return { tenants, add: tenantStore.add, update: tenantStore.update }
}

export function useRoles(tenantType?: TenantType) {
  const data = useSyncExternalStore(roleStore.subscribe, roleStore.get, roleStore.get) as Role[]
  const roles = useMemo(() => tenantType ? data.filter(r => r.tenantType === tenantType) : data, [data, tenantType])
  return { roles }
}

export function usePermissions(keys?: PermissionKey[]) {
  const data = useSyncExternalStore(permissionStore.subscribe, permissionStore.get, permissionStore.get) as Permission[]
  const permissions = useMemo(() => keys ? data.filter(p => keys.includes(p.key)) : data, [data, keys])
  return { permissions }
}

export function useAdminUsers(opts?: { tenantId?: string; status?: AdminUser["status"] }) {
  const data = useSyncExternalStore(adminUserStore.subscribe, adminUserStore.get, adminUserStore.get) as AdminUser[]
  const adminUsers = useMemo(() => {
    let r = data
    if (opts?.tenantId) r = r.filter(u => u.tenantId === opts.tenantId)
    if (opts?.status)   r = r.filter(u => u.status === opts.status)
    return r
  }, [data, opts?.tenantId, opts?.status])
  return { adminUsers, add: adminUserStore.add, update: adminUserStore.update }
}

export function useAdminUserRoles(adminUserId?: string) {
  const data = useSyncExternalStore(adminUserRoleStore.subscribe, adminUserRoleStore.get, adminUserRoleStore.get) as AdminUserRole[]
  const assignments = useMemo(() => adminUserId ? data.filter(r => r.adminUserId === adminUserId && r.isActive) : data, [data, adminUserId])
  return { assignments, add: adminUserRoleStore.add, update: adminUserRoleStore.update }
}

/** Returns effective permission keys for a user (union of all assigned roles) */
export function useEffectivePermissions(adminUserId: string): PermissionKey[] {
  const { assignments } = useAdminUserRoles(adminUserId)
  const { roles } = useRoles()
  const { permissions } = usePermissions()
  const { rolePermissions } = useMemo(() => ({ rolePermissions: [] as { roleId: string; permissionId: string }[] }), [])

  return useMemo(() => {
    const roleIds = new Set(assignments.map(a => a.roleId))
    // This is a simplified client-side check — real checks happen server-side
    const ROLE_PERMISSIONS_MAP = require("@/types/iam").ROLE_PERMISSIONS as Record<RoleKey, PermissionKey[]>
    const result = new Set<PermissionKey>()
    roles.filter(r => roleIds.has(r.id)).forEach(r => {
      const perms = ROLE_PERMISSIONS_MAP[r.key] ?? []
      perms.forEach(p => result.add(p))
    })
    return Array.from(result)
  }, [assignments, roles])
}

export function useUserAuditLogs(opts?: { adminUserId?: string; tenantId?: string; resource?: string }) {
  const data = useSyncExternalStore(userAuditLogStore.subscribe, userAuditLogStore.get, userAuditLogStore.get) as UserAuditLog[]
  const logs = useMemo(() => {
    let r = data
    if (opts?.adminUserId) r = r.filter(l => l.adminUserId === opts.adminUserId)
    if (opts?.tenantId)    r = r.filter(l => l.tenantId === opts.tenantId)
    if (opts?.resource)    r = r.filter(l => l.resource === opts.resource)
    return r.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [data, opts?.adminUserId, opts?.tenantId, opts?.resource])
  return { logs, add: userAuditLogStore.add }
}

export function useDependentAccounts(employeeAccountId?: string) {
  const data = useSyncExternalStore(
    dependentAccountStore.subscribe, dependentAccountStore.get, dependentAccountStore.get,
  ) as DependentAccount[]

  const accounts = useMemo(
    () => (employeeAccountId ? data.filter(a => a.employeeAccountId === employeeAccountId) : data),
    [data, employeeAccountId],
  )
  return { dependentAccounts: accounts, add: dependentAccountStore.add, update: dependentAccountStore.update }
}

export function useWalletUsageLogs(opts?: {
  accountId?: string
  period?: UsagePeriod
}) {
  const data = useSyncExternalStore(
    walletUsageLogStore.subscribe,
    walletUsageLogStore.get,
    walletUsageLogStore.get,
  ) as WalletUsageLog[]

  const logs = useMemo(() => {
    let result = data
    if (opts?.accountId) result = result.filter(l => l.accountId === opts.accountId)
    if (opts?.period)    result = result.filter(l => l.period === opts.period)
    return result.sort((a, b) => b.periodKey.localeCompare(a.periodKey))
  }, [data, opts?.accountId, opts?.period])

  return { logs, add: walletUsageLogStore.add, update: walletUsageLogStore.update }
}

export function usePolicies() {
  const policies = useSyncExternalStore(policyStore.subscribe, policyStore.get, policyStore.get)
  const policyDataMap = useSyncExternalStore(
    policyStore.subscribe,
    policyStore.getDataMap,
    policyStore.getDataMap,
  )
  return {
    policies: policies as PolicyListItem[],
    policyDataMap: policyDataMap as Record<string, PolicyData>,
    getBundle: policyStore.getBundle,
    add: policyStore.add,
    update: policyStore.update,
    remove: policyStore.remove,
  }
}
