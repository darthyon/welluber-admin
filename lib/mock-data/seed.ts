import type { EmployeeUtilisationRow, EmployeeClaim } from "@/types/claims"
import type { EmployeeDirectoryItem, AssignablePolicy, FormPolicy, VoucherRedemption } from "@/features/employees/types"
import { Registry } from "./registry"
import { MOCK_POLICY_TEMPLATES } from "./policy-templates"
import { createBrand } from "./factories/brand"
import { createOrganization, createNewOrganization } from "./factories/organization"
import { createServiceProvider } from "./factories/service-provider"
import { createEmployee } from "./factories/employee"
import { createMember, createAdmin } from "./factories/user"
import { createPolicy } from "./factories/policy"
import { createClaim } from "./factories/claim"
import { createGeneratedVoucher, createTopupTransaction } from "./factories/voucher"
import { createAccount } from "./factories/account"
import { createAuditLog } from "./factories/audit-log"
import { createDependent } from "./factories/dependent"
import { createEntitlement } from "./factories/entitlement"
import {
  createClaimsTimeSeries,
  createBenefitBreakdown,
  createTopProviders,
  createBranchWallets,
  createPolicyUtilisation,
  createOrgCoverageFunnel,
  createBenefitGroupUsage,
  createEmployeeGroupUtilisation,
  createVoucherCounts,
  createRecentActivity,
} from "./factories/org-analytics"

function seedAll() {
  // Dependency order: no-dep entities first, then dependents
  const brands = Array.from({ length: 10 }, (_, i) => createBrand(i))
  const organizations = [
    ...Array.from({ length: 7 }, (_, i) => createOrganization(i)),
    createNewOrganization({
      id: "ORG-NEW-20260501-0001",
      name: "Maju Retail Sdn Bhd",
      registrationNumber: "202401089231",
      industry: "Retail",
      type: "sdn_bhd",
      financialYearStart: "2026-01-01T00:00:00Z",
      tinNumber: "C20240108923",
      state: "Selangor",
      country: "Malaysia",
      bankAccountDetails: { bankName: "Maybank Berhad", accountNumber: "5142 0001 2345", accountName: "Maju Retail Sdn Bhd" },
      subscription: { plan: "standard", startDate: "2026-04-01T00:00:00Z" },
      accountLimit: 50000,
      creditLimit: 50000,
      branches: ["BR-NEW-20260501-0001"],
      createdAt: "2026-04-01T09:00:00Z",
      updatedAt: "2026-04-01T09:00:00Z",
    }),
    createNewOrganization({
      id: "ORG-NEW-20260510-0002",
      name: "Borneo Logistics Partners",
      registrationNumber: "202501045678",
      industry: "Logistics",
      type: "partnership",
      financialYearStart: "2026-04-01T00:00:00Z",
      tinNumber: "D20250104567",
      state: "Sabah",
      country: "Malaysia",
      bankAccountDetails: { bankName: "Public Bank Berhad", accountNumber: "3112 5544 3322", accountName: "Borneo Logistics Partners" },
      subscription: { plan: "standard", startDate: "2026-05-01T00:00:00Z" },
      accountLimit: 30000,
      creditLimit: 30000,
      branches: ["BR-NEW-20260510-0001"],
      createdAt: "2026-05-01T09:00:00Z",
      updatedAt: "2026-05-01T09:00:00Z",
    }),
    createNewOrganization({
      id: "ORG-NEW-20260515-0003",
      name: "TechVenture MY Sdn Bhd",
      registrationNumber: "202601001122",
      industry: "Technology",
      type: "sdn_bhd",
      financialYearStart: "2026-01-01T00:00:00Z",
      tinNumber: "C20260100112",
      state: "Kuala Lumpur",
      country: "Malaysia",
      bankAccountDetails: { bankName: "CIMB Bank Berhad", accountNumber: "8001 0011 2233", accountName: "TechVenture MY Sdn Bhd" },
      subscription: { plan: "premium", startDate: "2026-05-15T00:00:00Z" },
      accountLimit: 100000,
      creditLimit: 100000,
      branches: ["BR-NEW-20260515-0001"],
      createdAt: "2026-05-15T09:00:00Z",
      updatedAt: "2026-05-15T09:00:00Z",
    }),
  ]
  const serviceProviders = Array.from({ length: 10 }, (_, i) => createServiceProvider(i))
  const employees = Array.from({ length: 50 }, (_, i) => createEmployee(i))
  const members = Array.from({ length: 10 }, (_, i) => createMember(i))
  const admins = Array.from({ length: 10 }, (_, i) => createAdmin(i))
  const policyBundles = Array.from({ length: 10 }, (_, i) => createPolicy(i))
  const policies = policyBundles.map(b => b.policy)
  const claims = Array.from({ length: 10 }, (_, i) => createClaim(i))
  const generatedVouchers = Array.from({ length: 10 }, (_, i) => createGeneratedVoucher(i))
  const accounts = Array.from({ length: 10 }, (_, i) => createAccount(i))
  const topupHistory = Array.from({ length: 10 }, (_, i) => createTopupTransaction(i))
  const auditLogs = Array.from({ length: 10 }, (_, i) => createAuditLog(i))
  const dependents = Array.from({ length: 10 }, (_, i) => createDependent(i))
  const entitlements = Array.from({ length: 8 }, (_, i) => createEntitlement(i))

  // Populate registry (single source of truth for ID lookups)
  brands.forEach(b => Registry.brands.set(b.id, b))
  organizations.forEach(o => Registry.organizations.set(o.id, o))
  serviceProviders.forEach(sp => Registry.serviceProviders.set(sp.id, sp))
  employees.forEach(e => Registry.employees.set(e.id, e))
  members.forEach(m => Registry.members.set(m.id, m))
  admins.forEach(a => Registry.admins.set(a.id, a))
  policyBundles.forEach(b => {
    Registry.policies.set(b.policy.id, b.policy)
    Registry.policyData.set(b.policy.id, b.data)
  })
  generatedVouchers.forEach(v => Registry.generatedVouchers.set(v.id, v))
  accounts.forEach(a => Registry.accounts.set(a.id, a))
  topupHistory.forEach(t => Registry.topupHistory.set(t.id, t))
  auditLogs.forEach(a => Registry.auditLogs.set(a.id, a))
  dependents.forEach(d => Registry.dependents.set(d.id, d))

  return {
    brands,
    organizations,
    serviceProviders,
    employees,
    members,
    admins,
    policies,
    policyBundles,
    claims,
    generatedVouchers,
    accounts,
    topupHistory,
    auditLogs,
    dependents,
    entitlements,
  }
}

const SEED = seedAll()

// Named exports matching existing MOCK_* naming conventions
export const MOCK_BRANDS = SEED.brands
export const MOCK_ORGS = SEED.organizations
export const MOCK_SPS = SEED.serviceProviders
export const MOCK_EMPLOYEE_ENTITIES = SEED.employees
export const MOCK_MEMBERS = SEED.members
export const MOCK_ADMINS = SEED.admins
export const MOCK_POLICIES = SEED.policies
export const MOCK_POLICY_BUNDLES = SEED.policyBundles
export const MOCK_CLAIMS = SEED.claims
export const MOCK_GENERATED_VOUCHERS = SEED.generatedVouchers
export const MOCK_ACCOUNTS = SEED.accounts
export const MOCK_TOPUP_HISTORY = SEED.topupHistory
export const MOCK_AUDIT_LOGS = SEED.auditLogs
export const MOCK_DEPENDENTS = SEED.dependents
export const MOCK_ENTITLEMENTS = SEED.entitlements

// Policy data map keyed by policy ID (replaces POLICY_DATA_MAP_INITIAL)
export const MOCK_POLICY_DATA_MAP: Record<string, ReturnType<typeof import("./factories/policy").createPolicy>["data"]> = Object.fromEntries(
  SEED.policyBundles.map(b => [b.policy.id, b.data])
)

// Dashboard-derived summaries (real IDs, computed from MOCK_ORGS / MOCK_SPS)
export const MOCK_TOP_ORGS = MOCK_ORGS
  .filter(o => o.status === "active")
  .sort((a, b) => b.utilizationRate - a.utilizationRate)
  .slice(0, 5)
  .map((o, i) => ({
    id: o.id,
    rank: i + 1,
    name: o.name,
    utilizationRate: o.utilizationRate,
    claimsCount: o.claimsCount ?? 0,
  }))

export const MOCK_TOP_SPS = MOCK_SPS
  .filter(sp => sp.status === "active")
  .sort((a, b) => (b.activeVoucherCount ?? 0) - (a.activeVoucherCount ?? 0))
  .slice(0, 5)
  .map((sp, i) => ({
    id: sp.id,
    rank: i + 1,
    name: sp.name,
    activeVoucherCount: sp.activeVoucherCount ?? 0,
    serviceCategories: sp.serviceCategories,
  }))

// Employee utilisation drill-down (shared between org detail and policy wizard)
export const MOCK_EMPLOYEE_UTILISATION: EmployeeUtilisationRow[] = [
  {
    id: "EMP-20260115-0001", name: "Robert Fox", empCode: "ACM-001", branch: "ACME HQ",
    allocated: 2500, used: 1200,
    claims: [
      { id: "c1", voucherCode: "VCH-2026-0081", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Gymnasium Facilities", provider: "Celebrity Fitness KLCC", location: "Kuala Lumpur", date: "12 Mar 2026", amount: 180, status: "confirmed" },
      { id: "c2", voucherCode: "VCH-2026-0114", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Clinical Therapy", provider: "Mind & Soul Clinic", location: "Mont Kiara", date: "20 Mar 2026", amount: 320, status: "confirmed" },
      { id: "c3", voucherCode: "VCH-2026-0198", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Group Fitness", provider: "Ritual Yoga Studio", location: "Bangsar", date: "01 Apr 2026", amount: 95, status: "pre-auth" },
      { id: "c4", voucherCode: "VCH-2026-0211", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Dietary Counseling", provider: "NutriCare Clinic", location: "Damansara", date: "05 Apr 2026", amount: 605, status: "confirmed" },
      { id: "c4b", voucherCode: "VCH-2026-0302", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Chiropractic Treatment", provider: "SpineCare KL", location: "Mont Kiara", date: "20 Apr 2026", amount: 1200, status: "flagged" },
    ],
  },
  {
    id: "EMP-20260115-0002", name: "Jenny Wilson", empCode: "ACM-042", branch: "ACME Subang Jaya",
    allocated: 2500, used: 2125,
    claims: [
      { id: "c5", voucherCode: "VCH-2026-0033", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Gymnasium Facilities", provider: "Fitness First Subang", location: "Subang Jaya", date: "03 Jan 2026", amount: 200, status: "confirmed" },
      { id: "c6", voucherCode: "VCH-2026-0057", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Therapeutic Spa", provider: "Hammam Spa & Wellness", location: "Shah Alam", date: "18 Feb 2026", amount: 380, status: "confirmed" },
      { id: "c7", voucherCode: "VCH-2026-0089", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Mental Fitness", provider: "Calm Studio KL", location: "Subang Jaya", date: "10 Mar 2026", amount: 145, status: "confirmed" },
      { id: "c8", voucherCode: "VCH-2026-0132", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Group Fitness", provider: "Barry's Bootcamp", location: "TTDI", date: "22 Mar 2026", amount: 200, status: "cancelled" },
      { id: "c9", voucherCode: "VCH-2026-0201", voucherName: "Lifestyle Pocket Voucher", transactionType: "reimbursement", service: "Clinical Therapy", provider: "Therapy Works PJ", location: "Petaling Jaya", date: "08 Apr 2026", amount: 400, status: "confirmed" },
      { id: "c10", voucherCode: "VCH-2026-0215", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Dietary Counseling", provider: "NutriCare Clinic", location: "Subang Jaya", date: "10 Apr 2026", amount: 800, status: "pre-auth" },
      { id: "c10b", voucherCode: "VCH-2026-0318", voucherName: "Lifestyle Pocket Voucher", transactionType: "reimbursement", service: "Optical Frames", provider: "Specsavers Subang", location: "Subang Jaya", date: "22 Apr 2026", amount: 650, status: "pending_review" },
      { id: "c10c", voucherCode: "VCH-2026-0341", voucherName: "Lifestyle Pocket Voucher", transactionType: "reimbursement", service: "Dental Treatment", provider: "SmileCare Dental", location: "Petaling Jaya", date: "28 Apr 2026", amount: 480, status: "pending_review" },
    ],
  },
  {
    id: "EMP-20260115-0003", name: "Dianne Russell", empCode: "GHL-156", branch: "Global Health HQ",
    allocated: 2500, used: 375,
    claims: [
      { id: "c11", voucherCode: "VCH-2026-0177", voucherName: "Rejuvenation Fund Voucher", transactionType: "redemption", service: "Therapeutic Spa", provider: "Relaxe Spa KL", location: "KLCC", date: "15 Mar 2026", amount: 250, status: "confirmed" },
      { id: "c12", voucherCode: "VCH-2026-0190", voucherName: "Rejuvenation Fund Voucher", transactionType: "redemption", service: "Group Fitness", provider: "TRX Studio KL", location: "Bukit Bintang", date: "28 Mar 2026", amount: 125, status: "pre-auth" },
    ],
  },
  {
    id: "EMP-20260115-0004", name: "Marvin McKinney", empCode: "ZNT-089", branch: "Zenith HQ",
    allocated: 2500, used: 300,
    claims: [
      { id: "c13", voucherCode: "VCH-2026-0144", voucherName: "Mental Health Support Voucher", transactionType: "redemption", service: "Mental Fitness", provider: "Headspace Partner KL", location: "Online", date: "01 Apr 2026", amount: 120, status: "confirmed" },
      { id: "c14", voucherCode: "VCH-2026-0188", voucherName: "Mental Health Support Voucher", transactionType: "refund", service: "Clinical Therapy", provider: "Mind & Soul Clinic", location: "Mont Kiara", date: "09 Apr 2026", amount: 180, status: "confirmed" },
    ],
  },
]

// Employee directory (presentation join type — org/branch names denormalised for table display)
export const MOCK_EMPLOYEES: EmployeeDirectoryItem[] = [
  { id: "EMP-20260115-0001", orgId: "ORG-20260115-0001", name: "Robert Fox", email: "robert.f@acme.com", organization: "ACME Corporation", branch: "ACME HQ", joinDate: "12 Oct 2023", lastActive: "09 Apr 2026, 17:15", status: "Linked", empCode: "ACM-001", departmentId: "DC-002", department: "Tech", tierId: "TC-003", tier: "Manager", employmentType: "full-time", benefitPolicies: [{ policyId: "POL-20260115-0001", policyName: "Acme Employee Wellness Policy FY2026", assignedGroupIds: ["POL-20260115-0001-G1", "POL-20260115-0001-G2"], benefitGroups: ["Gym", "Mental Health"], utilisation: 48 }, { policyId: "POL-20260115-0002", policyName: "Acme Leadership Benefits Policy FY2026", assignedGroupIds: ["POL-20260115-0002-G1", "POL-20260115-0002-G2"], benefitGroups: [], utilisation: 0 }] },
  { id: "EMP-20260115-0002", orgId: "ORG-20260115-0001", name: "Jenny Wilson", email: "jenny.w@acme.com", organization: "ACME Corporation", branch: "ACME Subang Jaya", joinDate: "05 Mar 2026", lastActive: "09 Apr 2026, 16:45", status: "Linked", empCode: "ACM-042", departmentId: "DC-003", department: "Marketing", tierId: "TC-002", tier: "Senior Manager", employmentType: "full-time", benefitPolicies: [{ policyId: "POL-20260115-0002", policyName: "Acme Leadership Benefits Policy FY2026", assignedGroupIds: ["POL-20260115-0002-G1", "POL-20260115-0002-G2"], benefitGroups: ["Food", "Travel"], utilisation: 85 }] },
  { id: "EMP-20260115-0003", orgId: "ORG-20260301-0002", name: "Dianne Russell", email: "dianne.r@globalhealth.com", organization: "Global Health Ltd", branch: "Global Health HQ", joinDate: "20 May 2026", lastActive: "09 Apr 2026, 10:20", status: "Pending", empCode: "GHL-156", departmentId: "DC-103", department: "Marketing", tierId: "TC-006", tier: "Associate", employmentType: "internship", benefitPolicies: [{ policyId: "POL-20260115-0003", policyName: "Global Tech Core Benefits Policy FY2026", assignedGroupIds: ["POL-20260115-0003-G1"], benefitGroups: ["Spa Sessions", "Massages", "Facials", "Manicures", "Pedicures", "Aromatherapy", "Hot Stone"], utilisation: 15 }] },
  { id: "EMP-20260115-0004", orgId: "ORG-20260115-0001", name: "Marvin McKinney", email: "marvin.m@acme.com", organization: "ACME Corporation", branch: "ACME HQ", joinDate: "12 Jan 2026", lastActive: "08 Apr 2026, 14:30", status: "Linked", empCode: "ACM-089", departmentId: "DC-005", department: "Operations", tierId: "TC-003", tier: "Manager", employmentType: "contract", benefitPolicies: [{ policyId: "POL-20260115-0001", policyName: "Acme Employee Wellness Policy FY2026", assignedGroupIds: ["POL-20260115-0001-G2"], benefitGroups: ["Counseling", "Meditation Apps"], utilisation: 12 }] },
  { id: "EMP-20260115-0005", orgId: "ORG-20260115-0001", name: "Jason Teh", email: "jason.t@acme.com", organization: "ACME Corporation", branch: "ACME HQ", joinDate: "01 May 2026", lastActive: "01 May 2026, 09:00", status: "Pending", empCode: "ACM-212", departmentId: "DC-004", department: "Finance", tierId: "TC-001", tier: "Executive", employmentType: "full-time", benefitPolicies: [] },
  { id: "EMP-20260115-0006", orgId: "ORG-20260115-0001", name: "Ahmad Faizal", email: "ahmad.f@acme.com", organization: "ACME Corporation", branch: "ACME Subang Jaya", joinDate: "15 Jan 2026", lastActive: "07 May 2026, 08:45", status: "Linked", empCode: "ACM-301", departmentId: "DC-005", department: "Operations", tierId: "TC-002", tier: "Senior Manager", employmentType: "full-time", benefitPolicies: [{ policyId: "POL-20260115-0001", policyName: "Acme Employee Wellness Policy FY2026", assignedGroupIds: ["POL-20260115-0001-G1", "POL-20260115-0001-G2"], benefitGroups: ["Physical Wellbeing", "Mental Fitness"], utilisation: 60 }] },
  { id: "EMP-20260115-0007", orgId: "ORG-20260115-0001", name: "Nurul Huda", email: "nurul.h@acme.com", organization: "ACME Corporation", branch: "ACME HQ", joinDate: "01 Apr 2026", lastActive: "06 May 2026, 11:30", status: "Linked", empCode: "ACM-015", departmentId: "DC-001", department: "HR", tierId: "TC-003", tier: "Manager", employmentType: "full-time", benefitPolicies: [] },
  { id: "EMP-20260115-0008", orgId: "ORG-20260115-0001", name: "Kevin Tan", email: "kevin.t@acme.com", organization: "ACME Corporation", branch: "ACME HQ", joinDate: "01 Apr 2026", lastActive: "05 May 2026, 15:00", status: "Linked", empCode: "ACM-016", departmentId: "DC-002", department: "Tech", tierId: "TC-004", tier: "Associate", employmentType: "full-time", benefitPolicies: [] },
  { id: "EMP-20260115-0009", orgId: "ORG-20260301-0002", name: "Priya Raj", email: "priya.r@globalhealth.com", organization: "Global Health Ltd", branch: "Global Health HQ", joinDate: "01 Apr 2026", lastActive: "07 May 2026, 09:15", status: "Linked", empCode: "GHL-201", departmentId: "DC-101", department: "HR", tierId: "TC-005", tier: "Director", employmentType: "full-time", benefitPolicies: [{ policyId: "POL-20260115-0003", policyName: "Global Tech Core Benefits Policy FY2026", assignedGroupIds: ["POL-20260115-0003-G1"], benefitGroups: ["Premium Wellness", "Clinical Therapy"], utilisation: 30 }] },
  { id: "EMP-20260115-0010", orgId: "ORG-20260115-0001", name: "David Lee", email: "david.l@acme.com", organization: "ACME Corporation", branch: "ACME HQ", joinDate: "15 Mar 2026", lastActive: "06 May 2026, 13:45", status: "Linked", empCode: "ACM-009", departmentId: "DC-003", department: "Marketing", tierId: "TC-004", tier: "Associate", employmentType: "part-time", benefitPolicies: [] },
  { id: "EMP-20260115-0011", orgId: "ORG-20260115-0001", name: "Lisa Wong", email: "lisa.w@acme.com", organization: "ACME Corporation", branch: "ACME Subang Jaya", joinDate: "10 Jan 2026", lastActive: "08 May 2026, 10:00", status: "Linked", empCode: "ACM-055", departmentId: "DC-002", department: "Tech", tierId: "TC-004", tier: "Associate", employmentType: "full-time", benefitPolicies: [] },
  { id: "EMP-20260115-0012", orgId: "ORG-20260115-0001", name: "Siti Aminah", email: "siti.a@acme.com", organization: "ACME Corporation", branch: "ACME HQ", joinDate: "01 Feb 2026", lastActive: "08 May 2026, 08:30", status: "Linked", empCode: "ACM-077", departmentId: "DC-001", department: "HR", tierId: "TC-003", tier: "Manager", employmentType: "contract", benefitPolicies: [] },
]

// Employee claims (per-employee detail view)
export const MOCK_EMPLOYEE_CLAIMS: EmployeeClaim[] = [
  { id: "c1", voucherCode: "VCH-2026-0081", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Gymnasium Facilities", provider: "Celebrity Fitness KLCC", location: "Kuala Lumpur", date: "12 Mar 2026", amount: 180, status: "confirmed", benefitGroup: "Gym Membership" },
  { id: "c2", voucherCode: "VCH-2026-0114", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Clinical Therapy", provider: "Mind & Soul Clinic", location: "Mont Kiara", date: "20 Mar 2026", amount: 320, status: "confirmed", benefitGroup: "Mental Health" },
  { id: "c3", voucherCode: "VCH-2026-0198", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Group Fitness", provider: "Ritual Yoga Studio", location: "Bangsar", date: "01 Apr 2026", amount: 95, status: "pre-auth", benefitGroup: "Gym Membership" },
  { id: "c4", voucherCode: "VCH-2026-0211", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Dietary Counseling", provider: "NutriCare Clinic", location: "Damansara", date: "05 Apr 2026", amount: 605, status: "confirmed", benefitGroup: "Mental Health" },
  { id: "c5", voucherCode: "VCH-2026-0033", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Grab Food Voucher", provider: "Grab Malaysia", location: "Online", date: "03 Jan 2026", amount: 200, status: "confirmed", benefitGroup: "Food & Beverage" },
  { id: "c6", voucherCode: "VCH-2026-0102", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Flight Subsidy", provider: "AirAsia", location: "KLIA2", date: "15 Feb 2026", amount: 450, status: "confirmed", benefitGroup: "Travel" },
  { id: "c7", voucherCode: "VCH-2026-0189", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Hotel Stay", provider: "Marriott Putrajaya", location: "Putrajaya", date: "20 Mar 2026", amount: 200, status: "pre-auth", benefitGroup: "Travel" },
]

// Employee voucher redemptions (per-employee voucher history view)
export const MOCK_EMPLOYEE_VOUCHERS: VoucherRedemption[] = [
  { id: "v1", voucherCode: "VCH-2026-0081", voucherName: "Gym Membership Pass", category: "Wellness Allocation", benefitType: "Gym & Fitness", date: "12 Mar 2026", redeemedBy: "Robert Fox", redeemedByType: "Employee", amount: 180, provider: "Celebrity Fitness KLCC", branch: "ACME HQ", city: "Kuala Lumpur", status: "confirmed" },
  { id: "v2", voucherCode: "VCH-2026-0114", voucherName: "Mental Health Consultation", category: "Wellness Allocation", benefitType: "Mental Health", date: "20 Mar 2026", redeemedBy: "Robert Fox", redeemedByType: "Employee", amount: 320, provider: "Mind & Soul Clinic", branch: "ACME HQ", city: "Mont Kiara", status: "confirmed" },
  { id: "v3", voucherCode: "VCH-2026-0198", voucherName: "Group Yoga Class", category: "Wellness Allocation", benefitType: "Yoga & Meditation", date: "01 Apr 2026", redeemedBy: "Sarah Fox", redeemedByType: "Dependent", amount: 95, provider: "Ritual Yoga Studio", branch: "ACME HQ", city: "Bangsar", status: "pre-auth" },
  { id: "v4", voucherCode: "VCH-2026-0211", voucherName: "Nutrition Counseling Session", category: "Wellness Allocation", benefitType: "Nutrition & Diet", date: "05 Apr 2026", redeemedBy: "Robert Fox", redeemedByType: "Employee", amount: 605, provider: "NutriCare Clinic", branch: "ACME HQ", city: "Damansara", status: "confirmed" },
  { id: "v5", voucherCode: "VCH-2026-0256", voucherName: "Food & Dining Voucher", category: "Lifestyle Pocket", benefitType: "Food & Beverage", date: "18 Apr 2026", redeemedBy: "Robert Fox", redeemedByType: "Employee", amount: 120, provider: "GrabFood", branch: "ACME HQ", city: "Kuala Lumpur", status: "confirmed" },
]

// Assignable policies (policy assign modal — richer shape with eligibility)
export const MOCK_ASSIGNABLE_POLICIES: AssignablePolicy[] = [
  { id: "POL-20260115-0001", name: "Acme Employee Wellness Policy FY2026", description: "Core employee wellness handbook policy covering gym, mental health, and nutrition.", benefitGroups: ["Gym Membership", "Mental Health", "Optical"], totalAllocated: 2500, eligibility: { employeeTypes: ["Full-time", "Part-time"], roles: ["All Roles"] } },
  { id: "POL-20260115-0002", name: "Acme Leadership Benefits Policy FY2026", description: "Leadership-tier handbook policy with expanded lifestyle and clinical coverage.", benefitGroups: ["Food & Beverage", "Entertainment", "Transportation"], totalAllocated: 1000, eligibility: { employeeTypes: ["Full-time"], roles: ["All Roles"] } },
  { id: "POL-20260115-0003", name: "Global Tech Core Benefits Policy FY2026", description: "Core logistics workforce handbook policy with essential wellness coverage.", benefitGroups: ["Gym Membership", "Mental Health", "Optical", "Health Screening"], totalAllocated: 5000, eligibility: { employeeTypes: ["Full-time"], roles: ["Manager", "Director", "Executive"] } },
  { id: "POL-20260115-0004", name: "Basic Health Support", description: "Essential health benefits for entry-level employees.", benefitGroups: ["Mental Health", "Optical"], totalAllocated: 1500, eligibility: { employeeTypes: ["Full-time", "Contract"], roles: ["All Roles"] } },
]

// Form policies (policy selector in employee create/edit form)
export const MOCK_FORM_POLICIES: FormPolicy[] = [
  { id: "POL-20260115-0001", name: "Acme Employee Wellness Policy FY2026", version: "V1.1", groups: [{ id: "POL-20260115-0001-G1", name: "Gym Membership" }, { id: "POL-20260115-0001-G2", name: "Mental Health" }] },
  { id: "POL-20260115-0002", name: "Acme Leadership Benefits Policy FY2026", version: "V2.0", groups: [{ id: "POL-20260115-0002-G1", name: "Travel" }, { id: "POL-20260115-0002-G2", name: "Food & Dining" }] },
  { id: "POL-20260115-0003", name: "Global Tech Core Benefits Policy FY2026", version: "V1.0", groups: [{ id: "POL-20260115-0003-G1", name: "Spa Sessions" }, { id: "POL-20260115-0003-G2", name: "Massages" }] },
]

export { MOCK_POLICY_TEMPLATES }

// Org analytics — dashboard charts and top-10 panels
const ACME_ORG_ID = "ORG-20260115-0001"
export const MOCK_CLAIMS_TIMESERIES = createClaimsTimeSeries(ACME_ORG_ID)
export const MOCK_BENEFIT_BREAKDOWN = createBenefitBreakdown(ACME_ORG_ID)
export const MOCK_TOP_PROVIDERS = createTopProviders(ACME_ORG_ID)
export const MOCK_BRANCH_WALLETS = createBranchWallets(ACME_ORG_ID)
export const MOCK_POLICY_UTILISATION = createPolicyUtilisation(ACME_ORG_ID)
export const MOCK_COVERAGE_FUNNEL = createOrgCoverageFunnel(ACME_ORG_ID)
export const MOCK_BENEFIT_GROUP_USAGE = createBenefitGroupUsage(ACME_ORG_ID)
export const MOCK_EMPLOYEE_GROUP_UTILISATION = createEmployeeGroupUtilisation(ACME_ORG_ID)
export const MOCK_VOUCHER_COUNTS = createVoucherCounts(ACME_ORG_ID)
export const MOCK_RECENT_ACTIVITY = createRecentActivity(ACME_ORG_ID)
