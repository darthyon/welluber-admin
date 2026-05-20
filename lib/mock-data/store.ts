"use client"

import {
  MOCK_BRANDS, MOCK_ORGS, MOCK_SPS, MOCK_EMPLOYEE_ENTITIES,
  MOCK_MEMBERS, MOCK_ADMINS, MOCK_CLAIMS,
  MOCK_GENERATED_VOUCHERS, MOCK_ACCOUNTS, MOCK_AUDIT_LOGS,
  MOCK_POLICY_BUNDLES, MOCK_BENEFIT_ASSIGNMENTS,
  MOCK_EMPLOYEE_USAGE_LOGS, MOCK_WALLET_USAGE_LOGS,
  MOCK_MEMBER_PROFILES, MOCK_EMPLOYEE_ACCOUNTS, MOCK_DEPENDENT_ACCOUNTS,
  MOCK_TENANTS, MOCK_PERMISSIONS, MOCK_ROLES, MOCK_ROLE_PERMISSIONS,
  MOCK_USERS, MOCK_USER_ROLES, MOCK_USER_AUDIT_LOGS,
} from "./seed"
import type { Brand } from "@/types/brand"
import type { Organization, Employee } from "@/features/organizations/types"
import type { ServiceProvider } from "@/types/provider"
import type { Member, Administrator } from "@/features/users/types"
import type { AuditLogEntry } from "@/features/audit-log/types"
import type { GeneratedVoucher } from "@/features/voucher-packages/types"
import type { Account } from "@/features/accounts/types"
import type { BenefitAssignment } from "@/types/benefit-assignment"
import type { EmployeeUsageLog, WalletUsageLog } from "@/types/usage-log"
import type { MemberProfile } from "@/types/member-profile"
import type { EmployeeAccount, DependentAccount } from "@/types/employee-account"
import type { Tenant, Permission, Role, RolePermission, User, UserRole, UserAuditLog } from "@/types/iam"
import type { PolicyListItem } from "@/features/policies/types"
import type { PolicyData } from "@/features/policies/types"
import type { PolicyBundle } from "./factories/policy"

function createStore<T extends { id: string }>(initial: T[]) {
  let _items = [...initial]
  const _listeners = new Set<() => void>()
  const _notify = () => _listeners.forEach(l => l())

  return {
    get: () => _items,
    subscribe: (cb: () => void) => {
      _listeners.add(cb)
      return () => _listeners.delete(cb)
    },
    add: (item: T) => { _items = [item, ..._items]; _notify() },
    update: (id: string, patch: Partial<T>) => {
      _items = _items.map(i => i.id === id ? { ...i, ...patch } : i)
      _notify()
    },
    remove: (id: string) => {
      _items = _items.filter(i => i.id !== id)
      _notify()
    },
    reset: () => { _items = [...initial]; _notify() },
  }
}

// Policy store needs special handling because POLICY_DATA_MAP is keyed separately
function createPolicyStore(bundles: PolicyBundle[]) {
  let _bundles = [...bundles]
  const _listeners = new Set<() => void>()
  const _notify = () => _listeners.forEach(l => l())

  const _items = () => _bundles.map(b => b.policy)
  const _dataMap = () => Object.fromEntries(_bundles.map(b => [b.policy.id, b.data]))

  return {
    get: _items,
    getDataMap: _dataMap,
    getBundle: (id: string) => _bundles.find(b => b.policy.id === id),
    subscribe: (cb: () => void) => {
      _listeners.add(cb)
      return () => _listeners.delete(cb)
    },
    add: (bundle: PolicyBundle) => { _bundles = [bundle, ..._bundles]; _notify() },
    update: (id: string, patch: Partial<PolicyListItem>, dataPatch?: Partial<PolicyData>) => {
      _bundles = _bundles.map(b => b.policy.id === id
        ? { policy: { ...b.policy, ...patch }, data: dataPatch ? { ...b.data, ...dataPatch } : b.data }
        : b
      )
      _notify()
    },
    remove: (id: string) => { _bundles = _bundles.filter(b => b.policy.id !== id); _notify() },
    reset: () => { _bundles = [...bundles]; _notify() },
  }
}

export const brandStore          = createStore<Brand>(MOCK_BRANDS)
export const orgStore            = createStore<Organization>(MOCK_ORGS)
export const spStore             = createStore<ServiceProvider>(MOCK_SPS)
export const employeeStore       = createStore<Employee>(MOCK_EMPLOYEE_ENTITIES)
export const memberStore         = createStore<Member>(MOCK_MEMBERS)
export const adminStore          = createStore<Administrator>(MOCK_ADMINS)
export const claimStore          = createStore(MOCK_CLAIMS)
export const voucherStore        = createStore<GeneratedVoucher>(MOCK_GENERATED_VOUCHERS)
export const accountStore        = createStore<Account>(MOCK_ACCOUNTS)
export const auditLogStore       = createStore<AuditLogEntry>(MOCK_AUDIT_LOGS)
export const policyStore         = createPolicyStore(MOCK_POLICY_BUNDLES)
export const benefitAssignmentStore  = createStore<BenefitAssignment>(MOCK_BENEFIT_ASSIGNMENTS)
export const employeeUsageLogStore   = createStore<EmployeeUsageLog>(MOCK_EMPLOYEE_USAGE_LOGS)
export const walletUsageLogStore     = createStore<WalletUsageLog>(MOCK_WALLET_USAGE_LOGS)
export const memberProfileStore      = createStore<MemberProfile>(MOCK_MEMBER_PROFILES)
export const employeeAccountStore    = createStore<EmployeeAccount>(MOCK_EMPLOYEE_ACCOUNTS)
export const dependentAccountStore   = createStore<DependentAccount>(MOCK_DEPENDENT_ACCOUNTS)
// IAM stores
export const tenantStore             = createStore<Tenant>(MOCK_TENANTS)
export const permissionStore         = createStore<Permission>(MOCK_PERMISSIONS)
export const roleStore               = createStore<Role>(MOCK_ROLES)
export const rolePermissionStore     = createStore<RolePermission & { id: string }>(
  MOCK_ROLE_PERMISSIONS.map((rp, i) => ({ ...rp, id: `RP-${i}` }))
)
export const userStore          = createStore<User>(MOCK_USERS)
export const userRoleStore      = createStore<UserRole>(MOCK_USER_ROLES)
export const userAuditLogStore       = createStore<UserAuditLog>(MOCK_USER_AUDIT_LOGS)
