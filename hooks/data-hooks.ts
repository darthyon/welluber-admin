"use client"

import { useSyncExternalStore } from "react"
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
} from "@/lib/mock-data/store"
import type { Brand } from "@/types/brand"
import type { Organization, Employee } from "@/features/organizations/types"
import type { ServiceProvider } from "@/types/provider"
import type { Member, Administrator } from "@/features/users/types"
import type { AuditLogEntry } from "@/features/audit-log/types"
import type { GeneratedVoucher } from "@/features/voucher-packages/types"
import type { Account } from "@/features/accounts/types"
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
