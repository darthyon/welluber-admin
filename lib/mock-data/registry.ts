import type { Brand } from "@/types/brand"
import type { Organization, Employee, Dependent } from "@/features/organizations/types"
import type { ServiceProvider } from "@/types/provider"
import type { Member, Administrator } from "@/features/users/types"
import type { AuditLogEntry } from "@/features/audit-log/types"
import type { GeneratedVoucher } from "@/features/voucher-packages/types"
import type { Account } from "@/features/accounts/types"
import type { TopupTransaction } from "@/features/manual-topup/types"
import type { PolicyListItem, PolicyData } from "@/features/policies/types"

interface RegistryState {
  brands: Map<string, Brand>
  organizations: Map<string, Organization>
  serviceProviders: Map<string, ServiceProvider>
  employees: Map<string, Employee>
  members: Map<string, Member>
  admins: Map<string, Administrator>
  policies: Map<string, PolicyListItem>
  policyData: Map<string, PolicyData>
  generatedVouchers: Map<string, GeneratedVoucher>
  accounts: Map<string, Account>
  topupHistory: Map<string, TopupTransaction>
  auditLogs: Map<string, AuditLogEntry>
  dependents: Map<string, Dependent>
}

export const Registry: RegistryState = {
  brands: new Map(),
  organizations: new Map(),
  serviceProviders: new Map(),
  employees: new Map(),
  members: new Map(),
  admins: new Map(),
  policies: new Map(),
  policyData: new Map(),
  generatedVouchers: new Map(),
  accounts: new Map(),
  topupHistory: new Map(),
  auditLogs: new Map(),
  dependents: new Map(),
}

export function resetRegistry(): void {
  for (const map of Object.values(Registry)) {
    map.clear()
  }
}
