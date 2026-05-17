// Seed data (MOCK_* arrays, cross-linked IDs, derived summaries)
export {
  MOCK_BRANDS,
  MOCK_ORGS,
  MOCK_SPS,
  MOCK_EMPLOYEE_ENTITIES,
  MOCK_MEMBERS,
  MOCK_ADMINS,
  MOCK_POLICIES,
  MOCK_POLICY_BUNDLES,
  MOCK_POLICY_DATA_MAP,
  MOCK_CLAIMS,
  MOCK_GENERATED_VOUCHERS,
  MOCK_ACCOUNTS,
  MOCK_TOPUP_HISTORY,
  MOCK_AUDIT_LOGS,
  MOCK_DEPENDENTS,
  MOCK_BENEFIT_ASSIGNMENTS,
  MOCK_TOP_ORGS,
  MOCK_TOP_SPS,
  MOCK_EMPLOYEE_UTILISATION,
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_CLAIMS,
  MOCK_EMPLOYEE_VOUCHERS,
  MOCK_ASSIGNABLE_POLICIES,
  MOCK_FORM_POLICIES,
  MOCK_POLICY_TEMPLATES,
} from "./seed"

// Service taxonomy
export { SERVICES } from "./service-catalog"
export type { ServiceId } from "./service-catalog"

// Registry (ID → entity lookups)
export { Registry, resetRegistry } from "./registry"

// Mutable stores (for hooks/data-hooks.ts in Phase 3)
export {
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
} from "./store"

// Factory functions (for generating additional test data)
export { createBrand } from "./factories/brand"
export { createOrganization, MOCK_ORG_UTILISATION } from "./factories/organization"
export { createServiceProvider } from "./factories/service-provider"
export { createEmployee } from "./factories/employee"
export { createMember, createAdmin } from "./factories/user"
export { createPolicy } from "./factories/policy"
export type { PolicyBundle } from "./factories/policy"
export { createClaim } from "./factories/claim"
export type { GlobalClaimRow } from "./factories/claim"
export { createGeneratedVoucher, createTopupTransaction } from "./factories/voucher"
export { createAccount, createAccountTransactions } from "./factories/account"
export { createAuditLog } from "./factories/audit-log"
export { createDependent } from "./factories/dependent"
export { createBenefitAssignment } from "./factories/benefit-assignment"
export type { BenefitAssignment } from "@/types/benefit-assignment"
export { createEmployeeUsageLog, createWalletUsageLog } from "./factories/usage-log"
export type { EmployeeUsageLog, WalletUsageLog } from "@/types/usage-log"
export { MOCK_LOCATION_SUGGESTIONS } from "./factories/location"
export type { LocationSuggestion } from "./factories/location"
export type { EmployeeDirectoryItem, AssignablePolicy, FormPolicy, VoucherRedemption } from "@/features/employees/types"
