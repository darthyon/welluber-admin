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
  MOCK_ENTITLEMENTS,
  MOCK_TOP_ORGS,
  MOCK_TOP_SPS,
  MOCK_EMPLOYEE_UTILISATION,
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_CLAIMS,
  MOCK_EMPLOYEE_VOUCHERS,
  MOCK_ASSIGNABLE_POLICIES,
  MOCK_FORM_POLICIES,
  MOCK_POLICY_TEMPLATES,
  MOCK_CLAIMS_TIMESERIES,
  MOCK_BENEFIT_BREAKDOWN,
  MOCK_TOP_PROVIDERS,
  MOCK_BRANCH_ACCOUNTS,
  MOCK_POLICY_UTILISATION,
  MOCK_COVERAGE_FUNNEL,
  MOCK_BENEFIT_GROUP_USAGE,
  MOCK_EMPLOYEE_GROUP_UTILISATION,
  MOCK_VOUCHER_COUNTS,
  MOCK_RECENT_ACTIVITY,
  MOCK_ORG_PORTAL_ACTIVITY,
} from "./seed"

// Org analytics types + utilities
export type {
  ClaimsDataPoint,
  BenefitCategoryBreakdown,
  TopProvider,
  BranchAccount,
  PolicyUtilisation,
  OrgCoverageFunnel,
  BenefitGroupUsage,
  EmployeeGroupUtilisation,
  VoucherCounts,
  ActivityFeedItem,
  ActivityEventType,
  OrgPortalActivityItem,
} from "./factories/org-analytics"
export { bucketByMonth, bucketByYear } from "./factories/org-analytics"

// Service taxonomy
export { SERVICES } from "./service-catalog"
export type { ServiceId } from "./service-catalog"

// Acme org-detail seed (shared by host org-detail tabs + org portal)
export {
  ACME_BRANCHES,
  ACME_POLICIES,
  ACME_BRANCHES_BY_SLUG,
  ACME_POLICIES_BY_SLUG,
} from "./acme-org-detail"
export type { AcmeBranchRow, AcmePolicyRow } from "./acme-org-detail"

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
} from "./store"

// Factory functions (for generating additional test data)
export { createBrand } from "./factories/brand"
export {
  createOrganization,
  MOCK_ORG_UTILISATION,
} from "./factories/organization"
export { createServiceProvider } from "./factories/service-provider"
export { createEmployee } from "./factories/employee"
export { createMember, createAdmin } from "./factories/user"
export { createPolicy } from "./factories/policy"
export type { PolicyBundle } from "./factories/policy"
export { createClaim } from "./factories/claim"
export type { GlobalClaimRow } from "./factories/claim"
export {
  createGeneratedVoucher,
  createTopupTransaction,
} from "./factories/voucher"
export { createAccount, createAccountTransactions } from "./factories/account"
export { createAuditLog } from "./factories/audit-log"
export { createDependent } from "./factories/dependent"
export { createEntitlement } from "./factories/entitlement"
export type { Entitlement } from "./factories/entitlement"
export { MOCK_LOCATION_SUGGESTIONS } from "./factories/location"
export type { LocationSuggestion } from "./factories/location"
export type {
  EmployeeDirectoryItem,
  AssignablePolicy,
  FormPolicy,
  VoucherRedemption,
} from "@/features/employees/types"
