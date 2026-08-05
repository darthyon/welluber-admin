import type { EmployeeUtilisationRow, EmployeeClaim } from "@/types/claims"
import type {
  EmployeeDirectoryItem,
  AssignablePolicy,
  FormPolicy,
  VoucherRedemption,
} from "@/features/employees/types"
import { Registry } from "./registry"
import { requireEmployeeIdentity } from "./employee-identity"
import { MOCK_POLICY_TEMPLATES } from "./policy-templates"
import { createBrand } from "./factories/brand"
import {
  createOrganization,
  createNewOrganization,
} from "./factories/organization"
import { createServiceProvider } from "./factories/service-provider"
import { createEmployee } from "./factories/employee"
import { createMember, createAdmin } from "./factories/user"
import { createPolicy } from "./factories/policy"
import { createClaim } from "./factories/claim"
import {
  createGeneratedVoucher,
  createTopupTransaction,
} from "./factories/voucher"
import { createAccount } from "./factories/account"
import { createAuditLog } from "./factories/audit-log"
import { createDependent } from "./factories/dependent"
import { createEntitlement } from "./factories/entitlement"
import {
  createClaimsTimeSeries,
  createBenefitBreakdown,
  createTopProviders,
  createBranchAccounts,
  createPolicyUtilisation,
  createOrgCoverageFunnel,
  createBenefitGroupUsage,
  createEmployeeTierUtilisation,
  createVoucherCounts,
  createRecentActivity,
  createOrgPortalActivity,
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
      address: { line: "No. 22, Jalan Kemajuan", city: "Petaling Jaya", state: "Selangor", postalCode: "47800", country: "Malaysia" },
      bankAccountDetails: {
        bankName: "Maybank Berhad",
        accountNumber: "5142 0001 2345",
        accountName: "Maju Retail Sdn Bhd",
      },
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
      address: { line: "Lot 5, Jalan Coastal Highway", city: "Kota Kinabalu", state: "Sabah", postalCode: "88000", country: "Malaysia" },
      bankAccountDetails: {
        bankName: "Public Bank Berhad",
        accountNumber: "3112 5544 3322",
        accountName: "Borneo Logistics Partners",
      },
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
      address: { line: "Level 8, Menara TechVenture", city: "Kuala Lumpur", state: "Kuala Lumpur", postalCode: "50450", country: "Malaysia" },
      bankAccountDetails: {
        bankName: "CIMB Bank Berhad",
        accountNumber: "8001 0011 2233",
        accountName: "TechVenture MY Sdn Bhd",
      },
      subscription: { plan: "premium", startDate: "2026-05-15T00:00:00Z" },
      accountLimit: 100000,
      creditLimit: 100000,
      branches: ["BR-NEW-20260515-0001"],
      createdAt: "2026-05-15T09:00:00Z",
      updatedAt: "2026-05-15T09:00:00Z",
    }),
  ]
  const serviceProviders = Array.from({ length: 10 }, (_, i) =>
    createServiceProvider(i)
  )
  const employees = Array.from({ length: 50 }, (_, i) => createEmployee(i))
  const members = Array.from({ length: 10 }, (_, i) => createMember(i))
  const admins = Array.from({ length: 10 }, (_, i) => createAdmin(i))
  const policyBundles = Array.from({ length: 10 }, (_, i) => createPolicy(i))
  const policies = policyBundles.map((b) => b.policy)
  const claims = Array.from({ length: 10 }, (_, i) => createClaim(i))
  const generatedVouchers = Array.from({ length: 10 }, (_, i) =>
    createGeneratedVoucher(i)
  )
  const accounts = Array.from({ length: 10 }, (_, i) => createAccount(i))
  const topupHistory = Array.from({ length: 10 }, (_, i) =>
    createTopupTransaction(i)
  )
  const auditLogs = Array.from({ length: 10 }, (_, i) => createAuditLog(i))
  const dependents = Array.from({ length: 10 }, (_, i) => createDependent(i))
  const entitlements = Array.from({ length: 8 }, (_, i) => createEntitlement(i))

  // Populate registry (single source of truth for ID lookups)
  brands.forEach((b) => Registry.brands.set(b.id, b))
  organizations.forEach((o) => Registry.organizations.set(o.id, o))
  serviceProviders.forEach((sp) => Registry.serviceProviders.set(sp.id, sp))
  employees.forEach((e) => Registry.employees.set(e.id, e))
  members.forEach((m) => Registry.members.set(m.id, m))
  admins.forEach((a) => Registry.admins.set(a.id, a))
  policyBundles.forEach((b) => {
    Registry.policies.set(b.policy.id, b.policy)
    Registry.policyData.set(b.policy.id, b.data)
  })
  generatedVouchers.forEach((v) => Registry.generatedVouchers.set(v.id, v))
  accounts.forEach((a) => Registry.accounts.set(a.id, a))
  topupHistory.forEach((t) => Registry.topupHistory.set(t.id, t))
  auditLogs.forEach((a) => Registry.auditLogs.set(a.id, a))
  dependents.forEach((d) => Registry.dependents.set(d.id, d))

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
export const MOCK_POLICY_DATA_MAP: Record<
  string,
  ReturnType<typeof import("./factories/policy").createPolicy>["data"]
> = Object.fromEntries(SEED.policyBundles.map((b) => [b.policy.id, b.data]))

// Dashboard-derived summaries (real IDs, computed from MOCK_ORGS / MOCK_SPS)
export const MOCK_TOP_ORGS = MOCK_ORGS.filter((o) => o.status === "active")
  .sort((a, b) => b.utilizationRate - a.utilizationRate)
  .slice(0, 5)
  .map((o, i) => ({
    id: o.id,
    rank: i + 1,
    name: o.name,
    utilizationRate: o.utilizationRate,
    claimsCount: o.claimsCount ?? 0,
  }))

export const MOCK_TOP_SPS = MOCK_SPS.filter((sp) => sp.status === "active")
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
const EMPLOYEE_UTILISATION_ROWS: Array<
  Omit<EmployeeUtilisationRow, "id" | "name" | "empCode" | "branch"> & {
    employeeId: string
  }
> = [
  {
    employeeId: "EMP-20260115-0001",
    allocated: 2500,
    used: 1200,
    claims: [
      {
        id: "c1",
        voucherCode: "VCH-2026-0081",
        voucherName: "Wellness Allocation Voucher",
        transactionType: "redemption",
        service: "Gymnasium Facilities",
        provider: "Celebrity Fitness KLCC",
        location: "Kuala Lumpur",
        date: "12 Mar 2026",
        amount: 180,
        status: "confirmed",
      },
      {
        id: "c2",
        voucherCode: "VCH-2026-0114",
        voucherName: "Wellness Allocation Voucher",
        transactionType: "redemption",
        service: "Clinical Therapy",
        provider: "Mind & Soul Clinic",
        location: "Mont Kiara",
        date: "20 Mar 2026",
        amount: 320,
        status: "confirmed",
      },
      {
        id: "c3",
        voucherCode: "VCH-2026-0198",
        voucherName: "Wellness Allocation Voucher",
        transactionType: "redemption",
        service: "Group Fitness",
        provider: "Ritual Yoga Studio",
        location: "Bangsar",
        date: "01 Apr 2026",
        amount: 95,
        status: "pre-auth",
      },
      {
        id: "c4",
        voucherCode: "VCH-2026-0211",
        voucherName: "Wellness Allocation Voucher",
        transactionType: "reimbursement",
        service: "Dietary Counseling",
        provider: "NutriCare Clinic",
        location: "Damansara",
        date: "05 Apr 2026",
        amount: 605,
        status: "confirmed",
      },
      {
        id: "c4b",
        voucherCode: "VCH-2026-0302",
        voucherName: "Wellness Allocation Voucher",
        transactionType: "reimbursement",
        service: "Chiropractic Treatment",
        provider: "SpineCare KL",
        location: "Mont Kiara",
        date: "20 Apr 2026",
        amount: 1200,
        status: "flagged",
      },
    ],
  },
  {
    employeeId: "EMP-20260115-0002",
    allocated: 2500,
    used: 2125,
    claims: [
      {
        id: "c5",
        voucherCode: "VCH-2026-0033",
        voucherName: "Lifestyle Pocket Voucher",
        transactionType: "redemption",
        service: "Gymnasium Facilities",
        provider: "Fitness First Subang",
        location: "Subang Jaya",
        date: "03 Jan 2026",
        amount: 200,
        status: "confirmed",
      },
      {
        id: "c6",
        voucherCode: "VCH-2026-0057",
        voucherName: "Lifestyle Pocket Voucher",
        transactionType: "redemption",
        service: "Therapeutic Spa",
        provider: "Hammam Spa & Wellness",
        location: "Shah Alam",
        date: "18 Feb 2026",
        amount: 380,
        status: "confirmed",
      },
      {
        id: "c7",
        voucherCode: "VCH-2026-0089",
        voucherName: "Lifestyle Pocket Voucher",
        transactionType: "redemption",
        service: "Mental Fitness",
        provider: "Calm Studio KL",
        location: "Subang Jaya",
        date: "10 Mar 2026",
        amount: 145,
        status: "confirmed",
      },
      {
        id: "c8",
        voucherCode: "VCH-2026-0132",
        voucherName: "Lifestyle Pocket Voucher",
        transactionType: "redemption",
        service: "Group Fitness",
        provider: "Barry's Bootcamp",
        location: "TTDI",
        date: "22 Mar 2026",
        amount: 200,
        status: "cancelled",
      },
      {
        id: "c9",
        voucherCode: "VCH-2026-0201",
        voucherName: "Lifestyle Pocket Voucher",
        transactionType: "reimbursement",
        service: "Clinical Therapy",
        provider: "Therapy Works PJ",
        location: "Petaling Jaya",
        date: "08 Apr 2026",
        amount: 400,
        status: "confirmed",
      },
      {
        id: "c10",
        voucherCode: "VCH-2026-0215",
        voucherName: "Lifestyle Pocket Voucher",
        transactionType: "redemption",
        service: "Dietary Counseling",
        provider: "NutriCare Clinic",
        location: "Subang Jaya",
        date: "10 Apr 2026",
        amount: 800,
        status: "pre-auth",
      },
      {
        id: "c10b",
        voucherCode: "VCH-2026-0318",
        voucherName: "Lifestyle Pocket Voucher",
        transactionType: "reimbursement",
        service: "Optical Frames",
        provider: "Specsavers Subang",
        location: "Subang Jaya",
        date: "22 Apr 2026",
        amount: 650,
        status: "pending_review",
      },
      {
        id: "c10c",
        voucherCode: "VCH-2026-0341",
        voucherName: "Lifestyle Pocket Voucher",
        transactionType: "reimbursement",
        service: "Dental Treatment",
        provider: "SmileCare Dental",
        location: "Petaling Jaya",
        date: "28 Apr 2026",
        amount: 480,
        status: "pending_review",
      },
    ],
  },
  {
    employeeId: "EMP-20260115-0003",
    allocated: 2500,
    used: 375,
    claims: [
      {
        id: "c11",
        voucherCode: "VCH-2026-0177",
        voucherName: "Rejuvenation Fund Voucher",
        transactionType: "redemption",
        service: "Therapeutic Spa",
        provider: "Relaxe Spa KL",
        location: "KLCC",
        date: "15 Mar 2026",
        amount: 250,
        status: "confirmed",
      },
      {
        id: "c12",
        voucherCode: "VCH-2026-0190",
        voucherName: "Rejuvenation Fund Voucher",
        transactionType: "redemption",
        service: "Group Fitness",
        provider: "TRX Studio KL",
        location: "Bukit Bintang",
        date: "28 Mar 2026",
        amount: 125,
        status: "pre-auth",
      },
    ],
  },
  {
    employeeId: "EMP-20260115-0004",
    allocated: 2500,
    used: 300,
    claims: [
      {
        id: "c13",
        voucherCode: "VCH-2026-0144",
        voucherName: "Mental Health Support Voucher",
        transactionType: "redemption",
        service: "Mental Fitness",
        provider: "Headspace Partner KL",
        location: "Online",
        date: "01 Apr 2026",
        amount: 120,
        status: "confirmed",
      },
      {
        id: "c14",
        voucherCode: "VCH-2026-0188",
        voucherName: "Mental Health Support Voucher",
        transactionType: "refund",
        service: "Clinical Therapy",
        provider: "Mind & Soul Clinic",
        location: "Mont Kiara",
        date: "09 Apr 2026",
        amount: 180,
        status: "confirmed",
      },
    ],
  },
]

export const MOCK_EMPLOYEE_UTILISATION: EmployeeUtilisationRow[] =
  EMPLOYEE_UTILISATION_ROWS.map(({ employeeId, ...row }) => {
    const identity = requireEmployeeIdentity(employeeId)
    return {
      id: identity.id,
      name: identity.name,
      empCode: identity.empCode,
      branch: identity.branch ?? identity.branchId,
      ...row,
    }
  })

// Employee directory (presentation join type — org/branch names denormalised for
// table display). Identity fields are resolved from `employee-identity.ts`; only
// the directory-specific attributes are declared here.
type EmployeeDirectoryExtras = Omit<
  EmployeeDirectoryItem,
  "orgId" | "name" | "email" | "organization" | "branch" | "empCode"
>

const EMPLOYEE_DIRECTORY_EXTRAS: EmployeeDirectoryExtras[] = [
  {
    id: "EMP-20260115-0001",
    joinDate: "12 Oct 2023",
    lastActive: "09 Apr 2026, 17:15",
    departmentId: "DC-002",
    department: "Tech",
    tierId: "TC-003",
    tier: "Manager",
    role: "Team Lead",
    employmentType: "full-time",
    benefitPolicies: [
      {
        policyId: "POL-20260115-0001",
        policyName: "Employee Essentials 2026",
        assignedGroupIds: ["POL-20260115-0001-G1"],
        benefitGroups: ["General Wellness"],
        utilisation: 20,
      },
    ],
  },
  {
    id: "EMP-20260115-0002",
    joinDate: "05 Mar 2026",
    lastActive: "09 Apr 2026, 16:45",
    departmentId: "DC-003",
    department: "Marketing",
    tierId: "TC-002",
    tier: "Senior Manager",
    role: "Marketing Manager",
    employmentType: "full-time",
    benefitPolicies: [
      {
        policyId: "POL-20260115-0002",
        policyName: "Acme Family Wellness 2026",
        assignedGroupIds: ["POL-20260115-0002-G1", "POL-20260115-0002-G2"],
        benefitGroups: ["Physical Wellbeing", "Mental Fitness"],
        utilisation: 15,
      },
    ],
  },
  {
    id: "EMP-20260115-0003",
    joinDate: "20 May 2026",
    lastActive: "09 Apr 2026, 10:20",
    departmentId: "DC-003",
    department: "Marketing",
    tierId: "TC-001",
    tier: "Associate",
    role: "Business Analyst",
    employmentType: "full-time",
    benefitPolicies: [
      {
        policyId: "POL-20260115-0003",
        policyName: "Acme Nutrition Plan FY2026",
        assignedGroupIds: ["POL-20260115-0003-G1"],
        benefitGroups: ["Nutrition & Recovery"],
        utilisation: 54,
      },
    ],
  },
  {
    id: "EMP-20260115-0004",
    joinDate: "12 Jan 2026",
    lastActive: "08 Apr 2026, 14:30",
    departmentId: "DC-005",
    department: "Operations",
    tierId: "TC-003",
    tier: "Manager",
    role: "Project Manager",
    employmentType: "contract",
    benefitPolicies: [
      {
        policyId: "POL-20260115-0011",
        policyName: "Contract Staff Essentials 2026",
        assignedGroupIds: ["POL-20260115-0011-G1"],
        benefitGroups: ["Basic Medical"],
        utilisation: 40,
      },
    ],
  },
  {
    id: "EMP-20260115-0005",
    joinDate: "01 May 2026",
    lastActive: "01 May 2026, 09:00",
    departmentId: "DC-004",
    department: "Finance",
    tierId: "TC-001",
    tier: "Executive",
    role: "CFO",
    employmentType: "full-time",
    benefitPolicies: [
      {
        policyId: "POL-20260115-0012",
        policyName: "Acme Lifestyle & Wellness 2026",
        assignedGroupIds: ["POL-20260115-0012-G1"],
        benefitGroups: ["Lifestyle & Wellness"],
        utilisation: 30,
      },
    ],
  },
  {
    id: "EMP-20260115-0006",
    joinDate: "15 Jan 2026",
    lastActive: "07 May 2026, 08:45",
    departmentId: "DC-005",
    department: "Operations",
    tierId: "TC-002",
    tier: "Senior Manager",
    role: "Operations Manager",
    employmentType: "full-time",
    benefitPolicies: [
      {
        policyId: "POL-20260115-0010",
        policyName: "Executive Benefits Programme 2026",
        assignedGroupIds: ["POL-20260115-0010-G1", "POL-20260115-0010-G2"],
        benefitGroups: ["Comprehensive Health", "Wellness Extras"],
        utilisation: 21,
      },
    ],
  },
  {
    id: "EMP-20260115-0007",
    joinDate: "01 Apr 2026",
    lastActive: "06 May 2026, 11:30",
    departmentId: "DC-001",
    department: "HR",
    tierId: "TC-003",
    tier: "Manager",
    role: "Account Manager",
    employmentType: "full-time",
    benefitPolicies: [],
  },
  {
    id: "EMP-20260115-0008",
    joinDate: "01 Apr 2026",
    lastActive: "05 May 2026, 15:00",
    departmentId: "DC-002",
    department: "Tech",
    tierId: "TC-004",
    tier: "Associate",
    role: "Software Engineer",
    employmentType: "full-time",
    benefitPolicies: [],
  },
  {
    id: "EMP-20260115-0009",
    joinDate: "01 Apr 2026",
    lastActive: "07 May 2026, 09:15",
    departmentId: "DC-101",
    department: "HR",
    tierId: "TC-005",
    tier: "Director",
    role: "Engineering Director",
    employmentType: "full-time",
    benefitPolicies: [
      {
        policyId: "POL-20260115-0003",
        policyName: "Global Tech Core Benefits Policy FY2026",
        assignedGroupIds: ["POL-20260115-0003-G1"],
        benefitGroups: ["Premium Wellness", "Clinical Therapy"],
        utilisation: 30,
      },
    ],
  },
  {
    id: "EMP-20260115-0010",
    joinDate: "15 Mar 2026",
    lastActive: "06 May 2026, 13:45",
    departmentId: "DC-003",
    department: "Marketing",
    tierId: "TC-004",
    tier: "Associate",
    role: "Marketing Specialist",
    employmentType: "part-time",
    benefitPolicies: [],
  },
  {
    id: "EMP-20260115-0011",
    joinDate: "10 Jan 2026",
    lastActive: "08 May 2026, 10:00",
    departmentId: "DC-002",
    department: "Tech",
    tierId: "TC-004",
    tier: "Associate",
    role: "Product Designer",
    employmentType: "full-time",
    benefitPolicies: [],
  },
  {
    id: "EMP-20260115-0012",
    joinDate: "01 Feb 2026",
    lastActive: "08 May 2026, 08:30",
    departmentId: "DC-001",
    department: "HR",
    tierId: "TC-003",
    tier: "Manager",
    role: "Sales Manager",
    employmentType: "contract",
    benefitPolicies: [],
  },
]

export const MOCK_EMPLOYEES: EmployeeDirectoryItem[] =
  EMPLOYEE_DIRECTORY_EXTRAS.map((extras) => {
    const identity = requireEmployeeIdentity(extras.id)
    return {
      ...extras,
      orgId: identity.orgId,
      name: identity.name,
      email: identity.email,
      empCode: identity.empCode,
      organization: identity.organization ?? identity.orgId,
      branch: identity.branch ?? identity.branchId,
    }
  })

// Employee claims (per-employee detail view)
// Employee claims (per-employee detail view).
// These are the ledger that entitlement spend is DERIVED from — `deriveUsage()`
// folds them into BeneficiaryUsage. Editing an amount here changes what the
// Entitlement tab shows; there is no separate hand-typed spend figure to update.
// `cancelled` rows are intentional: they must NOT count toward spend.
export const MOCK_EMPLOYEE_CLAIMS: EmployeeClaim[] = [
  {
    id: "EMC-0001",
    voucherCode: "VCH-2026-0081",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Gym Access",
    provider: "Celebrity Fitness KLCC",
    location: "Kuala Lumpur",
    date: "12 Mar 2026",
    amount: 180,
    status: "confirmed",
    benefitGroup: "General Wellness",
    employeeId: "EMP-20260115-0001",
    beneficiaryId: "EMP-20260115-0001",
    benefitId: "POL-20260115-0001-B1",
  },
  {
    id: "EMC-0002",
    voucherCode: "VCH-2026-0082",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Optical",
    provider: "VisionFirst Optometry",
    location: "Bangsar",
    date: "05 Apr 2026",
    amount: 120,
    status: "pre-auth",
    benefitGroup: "General Wellness",
    employeeId: "EMP-20260115-0001",
    beneficiaryId: "EMP-20260115-0001",
    benefitId: "POL-20260115-0001-B3",
  },
  {
    id: "EMC-0003",
    voucherCode: "VCH-2026-0083",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Health Screening",
    provider: "Pantai Wellness Lab",
    location: "Kuala Lumpur",
    date: "18 Apr 2026",
    amount: 250,
    status: "cancelled",
    benefitGroup: "General Wellness",
    employeeId: "EMP-20260115-0001",
    beneficiaryId: "EMP-20260115-0001",
    benefitId: "POL-20260115-0001-B2",
  },
  {
    id: "EMC-0004",
    voucherCode: "VCH-2026-0084",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Gym Access",
    provider: "PrimeFit Gym & Studio",
    location: "Subang Jaya",
    date: "03 Mar 2026",
    amount: 180,
    status: "confirmed",
    benefitGroup: "Physical Wellbeing",
    employeeId: "EMP-20260115-0002",
    beneficiaryId: "EMP-20260115-0002",
    benefitId: "POL-20260115-0002-B1",
  },
  {
    id: "EMC-0005",
    voucherCode: "VCH-2026-0085",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Personal Training",
    provider: "PrimeFit Gym & Studio",
    location: "Subang Jaya",
    date: "19 Mar 2026",
    amount: 40,
    status: "pre-auth",
    benefitGroup: "Physical Wellbeing",
    employeeId: "EMP-20260115-0002",
    beneficiaryId: "EMP-20260115-0002",
    benefitId: "POL-20260115-0002-B2",
  },
  {
    id: "EMC-0006",
    voucherCode: "VCH-2026-0086",
    voucherName: "Mental Wellness Voucher",
    transactionType: "redemption",
    service: "Therapy & Counselling",
    provider: "AgileMind Therapy Centre",
    location: "Petaling Jaya",
    date: "27 Mar 2026",
    amount: 120,
    status: "confirmed",
    benefitGroup: "Mental Fitness",
    employeeId: "EMP-20260115-0002",
    beneficiaryId: "EMP-20260115-0002",
    benefitId: "POL-20260115-0002-B3",
  },
  {
    id: "EMC-0007",
    voucherCode: "VCH-2026-0087",
    voucherName: "Mental Wellness Voucher",
    transactionType: "reimbursement",
    service: "Meditation",
    provider: "Nova Mindfulness Studio",
    location: "Mont Kiara",
    date: "09 Apr 2026",
    amount: 80,
    status: "confirmed",
    benefitGroup: "Mental Fitness",
    employeeId: "EMP-20260115-0002",
    beneficiaryId: "EMP-20260115-0002",
    benefitId: "POL-20260115-0002-B4",
  },
  {
    id: "EMC-0008",
    voucherCode: "VCH-2026-0088",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Personal Training",
    provider: "PrimeFit Gym & Studio",
    location: "Subang Jaya",
    date: "22 Mar 2026",
    amount: 20,
    status: "confirmed",
    benefitGroup: "Physical Wellbeing",
    employeeId: "EMP-20260115-0002",
    beneficiaryId: "DEP-0002-1",
    benefitId: "POL-20260115-0002-B2",
  },
  {
    id: "EMC-0009",
    voucherCode: "VCH-2026-0089",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Gym Access",
    provider: "PrimeFit Gym & Studio",
    location: "Subang Jaya",
    date: "30 Mar 2026",
    amount: 10,
    status: "confirmed",
    benefitGroup: "Physical Wellbeing",
    employeeId: "EMP-20260115-0002",
    beneficiaryId: "DEP-0002-2",
    benefitId: "POL-20260115-0002-B1",
  },
  {
    id: "EMC-0010",
    voucherCode: "VCH-2026-0090",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Nutritional Counselling",
    provider: "NutriCare Clinic",
    location: "Damansara",
    date: "14 Mar 2026",
    amount: 500,
    status: "confirmed",
    benefitGroup: "Nutrition & Recovery",
    employeeId: "EMP-20260115-0003",
    beneficiaryId: "EMP-20260115-0003",
    benefitId: "POL-20260115-0009-B1",
  },
  {
    id: "EMC-0011",
    voucherCode: "VCH-2026-0091",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Nutritional Counselling",
    provider: "NutriCare Clinic",
    location: "Damansara",
    date: "21 Mar 2026",
    amount: 150,
    status: "confirmed",
    benefitGroup: "Nutrition & Recovery",
    employeeId: "EMP-20260115-0003",
    beneficiaryId: "DEP-0003-1",
    benefitId: "POL-20260115-0009-B1",
  },
  {
    id: "EMC-0012",
    voucherCode: "VCH-2026-0092",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Nutritional Counselling",
    provider: "NutriCare Clinic",
    location: "Damansara",
    date: "02 Apr 2026",
    amount: 100,
    status: "confirmed",
    benefitGroup: "Nutrition & Recovery",
    employeeId: "EMP-20260115-0003",
    beneficiaryId: "DEP-0003-2",
    benefitId: "POL-20260115-0009-B1",
  },
  {
    id: "EMC-0013",
    voucherCode: "VCH-2026-0093",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "GP / Clinic Visit",
    provider: "Klinik Mediviron",
    location: "Kuala Lumpur",
    date: "08 Mar 2026",
    amount: 120,
    status: "confirmed",
    benefitGroup: "General Medical",
    employeeId: "EMP-20260115-0004",
    beneficiaryId: "EMP-20260115-0004",
    benefitId: "POL-20260115-0011-B1",
  },
  {
    id: "EMC-0014",
    voucherCode: "VCH-2026-0094",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "reimbursement",
    service: "GP / Clinic Visit",
    provider: "Klinik Mediviron",
    location: "Kuala Lumpur",
    date: "16 Mar 2026",
    amount: 80,
    status: "confirmed",
    benefitGroup: "General Medical",
    employeeId: "EMP-20260115-0004",
    beneficiaryId: "DEP-0004-1",
    benefitId: "POL-20260115-0011-B1",
  },
  {
    id: "EMC-0015",
    voucherCode: "VCH-2026-0095",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "GP / Clinic Visit",
    provider: "Klinik Mediviron",
    location: "Kuala Lumpur",
    date: "28 Mar 2026",
    amount: 70,
    status: "confirmed",
    benefitGroup: "General Medical",
    employeeId: "EMP-20260115-0004",
    beneficiaryId: "DEP-0004-2",
    benefitId: "POL-20260115-0011-B1",
  },
  {
    id: "EMC-0016",
    voucherCode: "VCH-2026-0096",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Gym Access",
    provider: "Ritual Yoga Studio",
    location: "Bangsar",
    date: "06 Mar 2026",
    amount: 350,
    status: "confirmed",
    benefitGroup: "Lifestyle & Wellness",
    employeeId: "EMP-20260115-0005",
    beneficiaryId: "EMP-20260115-0005",
    benefitId: "POL-20260115-0012-B1",
  },
  {
    id: "EMC-0017",
    voucherCode: "VCH-2026-0097",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Therapy & Counselling",
    provider: "Mind & Soul Clinic",
    location: "Mont Kiara",
    date: "24 Mar 2026",
    amount: 200,
    status: "confirmed",
    benefitGroup: "Lifestyle & Wellness",
    employeeId: "EMP-20260115-0005",
    beneficiaryId: "EMP-20260115-0005",
    benefitId: "POL-20260115-0012-B2",
  },
  {
    id: "EMC-0018",
    voucherCode: "VCH-2026-0098",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Gym Access",
    provider: "Ritual Yoga Studio",
    location: "Bangsar",
    date: "31 Mar 2026",
    amount: 50,
    status: "confirmed",
    benefitGroup: "Lifestyle & Wellness",
    employeeId: "EMP-20260115-0005",
    beneficiaryId: "DEP-0005-1",
    benefitId: "POL-20260115-0012-B1",
  },
  {
    id: "EMC-0019",
    voucherCode: "VCH-2026-0099",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Gym Access",
    provider: "Ritual Yoga Studio",
    location: "Bangsar",
    date: "31 Mar 2026",
    amount: 50,
    status: "confirmed",
    benefitGroup: "Lifestyle & Wellness",
    employeeId: "EMP-20260115-0005",
    beneficiaryId: "DEP-0005-2",
    benefitId: "POL-20260115-0012-B1",
  },
  {
    id: "EMC-0020",
    voucherCode: "VCH-2026-0100",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Therapy & Counselling",
    provider: "Mind & Soul Clinic",
    location: "Mont Kiara",
    date: "11 Apr 2026",
    amount: 180,
    status: "cancelled",
    benefitGroup: "Lifestyle & Wellness",
    employeeId: "EMP-20260115-0005",
    beneficiaryId: "DEP-0005-1",
    benefitId: "POL-20260115-0012-B2",
  },
  {
    id: "EMC-0021",
    voucherCode: "VCH-2026-0101",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "reimbursement",
    service: "Medical / Specialist",
    provider: "Apex Occupational Health",
    location: "Bangsar",
    date: "04 Mar 2026",
    amount: 600,
    status: "confirmed",
    benefitGroup: "Comprehensive Health",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "EMP-20260115-0006",
    benefitId: "POL-20260115-0010-B1",
  },
  {
    id: "EMC-0022",
    voucherCode: "VCH-2026-0102",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Medical / Specialist",
    provider: "Apex Occupational Health",
    location: "Bangsar",
    date: "10 Mar 2026",
    amount: 300,
    status: "confirmed",
    benefitGroup: "Comprehensive Health",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "DEP-0006-1",
    benefitId: "POL-20260115-0010-B1",
  },
  {
    id: "EMC-0023",
    voucherCode: "VCH-2026-0103",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Medical / Specialist",
    provider: "Apex Occupational Health",
    location: "Bangsar",
    date: "17 Mar 2026",
    amount: 180,
    status: "confirmed",
    benefitGroup: "Comprehensive Health",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "DEP-0006-3",
    benefitId: "POL-20260115-0010-B1",
  },
  {
    id: "EMC-0024",
    voucherCode: "VCH-2026-0104",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Medical / Specialist",
    provider: "Apex Occupational Health",
    location: "Bangsar",
    date: "23 Mar 2026",
    amount: 90,
    status: "confirmed",
    benefitGroup: "Comprehensive Health",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "DEP-0006-4",
    benefitId: "POL-20260115-0010-B1",
  },
  {
    id: "EMC-0025",
    voucherCode: "VCH-2026-0105",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Medical / Specialist",
    provider: "Apex Occupational Health",
    location: "Bangsar",
    date: "01 Apr 2026",
    amount: 350,
    status: "confirmed",
    benefitGroup: "Comprehensive Health",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "DEP-0006-6",
    benefitId: "POL-20260115-0010-B1",
  },
  {
    id: "EMC-0026",
    voucherCode: "VCH-2026-0106",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Dental",
    provider: "BrightSmile Dental",
    location: "Mont Kiara",
    date: "07 Apr 2026",
    amount: 200,
    status: "confirmed",
    benefitGroup: "Comprehensive Health",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "DEP-0006-1",
    benefitId: "POL-20260115-0010-B2",
  },
  {
    id: "EMC-0027",
    voucherCode: "VCH-2026-0107",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Gym Access",
    provider: "Celebrity Fitness KLCC",
    location: "Kuala Lumpur",
    date: "12 Apr 2026",
    amount: 300,
    status: "confirmed",
    benefitGroup: "Wellness Extras",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "EMP-20260115-0006",
    benefitId: "POL-20260115-0010-B3",
  },
  {
    id: "EMC-0028",
    voucherCode: "VCH-2026-0108",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "reimbursement",
    service: "Gym Access",
    provider: "Celebrity Fitness KLCC",
    location: "Kuala Lumpur",
    date: "15 Apr 2026",
    amount: 100,
    status: "confirmed",
    benefitGroup: "Wellness Extras",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "DEP-0006-2",
    benefitId: "POL-20260115-0010-B3",
  },
  {
    id: "EMC-0029",
    voucherCode: "VCH-2026-0109",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Nutritional Counselling",
    provider: "NutriCare Clinic",
    location: "Damansara",
    date: "18 Apr 2026",
    amount: 200,
    status: "confirmed",
    benefitGroup: "Wellness Extras",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "EMP-20260115-0006",
    benefitId: "POL-20260115-0010-B4",
  },
  {
    id: "EMC-0030",
    voucherCode: "VCH-2026-0110",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Nutritional Counselling",
    provider: "NutriCare Clinic",
    location: "Damansara",
    date: "20 Apr 2026",
    amount: 50,
    status: "confirmed",
    benefitGroup: "Wellness Extras",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "DEP-0006-2",
    benefitId: "POL-20260115-0010-B4",
  },
  {
    id: "EMC-0031",
    voucherCode: "VCH-2026-0111",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Therapy & Counselling",
    provider: "AgileMind Therapy Centre",
    location: "Petaling Jaya",
    date: "25 Apr 2026",
    amount: 120,
    status: "pre-auth",
    benefitGroup: "Wellness Extras",
    employeeId: "EMP-20260115-0006",
    beneficiaryId: "EMP-20260115-0006",
    benefitId: "POL-20260115-0010-B5",
  },
]

// Employee voucher redemptions (per-employee voucher history view)
export const MOCK_EMPLOYEE_VOUCHERS: VoucherRedemption[] = [
  {
    id: "v1",
    employeeId: "EMP-20260115-0001",
    voucherCode: "VCH-2026-0081",
    voucherName: "Gym Membership Pass",
    category: "Wellness Allocation",
    benefitType: "Gym & Fitness",
    date: "12 Mar 2026",
    redeemedBy: "Robert Fox",
    redeemedByType: "Employee",
    amount: 180,
    provider: "Celebrity Fitness KLCC",
    branch: "ACME HQ",
    city: "Kuala Lumpur",
    status: "confirmed",
  },
  {
    id: "v2",
    employeeId: "EMP-20260115-0001",
    voucherCode: "VCH-2026-0114",
    voucherName: "Mental Health Consultation",
    category: "Wellness Allocation",
    benefitType: "Mental Health",
    date: "20 Mar 2026",
    redeemedBy: "Robert Fox",
    redeemedByType: "Employee",
    amount: 320,
    provider: "Mind & Soul Clinic",
    branch: "ACME HQ",
    city: "Mont Kiara",
    status: "confirmed",
  },
  {
    id: "v3",
    employeeId: "EMP-20260115-0002",
    voucherCode: "VCH-2026-0198",
    voucherName: "Group Yoga Class",
    category: "Wellness Allocation",
    benefitType: "Yoga & Meditation",
    date: "01 Apr 2026",
    redeemedBy: "Daniel Wilson",
    redeemedByType: "Dependent",
    amount: 95,
    provider: "Ritual Yoga Studio",
    branch: "ACME Subang Jaya",
    city: "Bangsar",
    status: "pre-auth",
  },
  {
    id: "v4",
    employeeId: "EMP-20260115-0001",
    voucherCode: "VCH-2026-0211",
    voucherName: "Nutrition Counseling Session",
    category: "Wellness Allocation",
    benefitType: "Nutrition & Diet",
    date: "05 Apr 2026",
    redeemedBy: "Robert Fox",
    redeemedByType: "Employee",
    amount: 605,
    provider: "NutriCare Clinic",
    branch: "ACME HQ",
    city: "Damansara",
    status: "confirmed",
  },
  {
    id: "v5",
    employeeId: "EMP-20260115-0006",
    voucherCode: "VCH-2026-0256",
    voucherName: "Food & Dining Voucher",
    category: "Lifestyle Pocket",
    benefitType: "Food & Beverage",
    date: "18 Apr 2026",
    redeemedBy: "Ahmad Faizal",
    redeemedByType: "Employee",
    amount: 120,
    provider: "GrabFood",
    branch: "ACME Subang Jaya",
    city: "Kuala Lumpur",
    status: "confirmed",
  },
]

// Assignable policies (policy assign modal — richer shape with eligibility)
export const MOCK_ASSIGNABLE_POLICIES: AssignablePolicy[] = [
  {
    id: "POL-20260115-0001",
    name: "Acme Employee Wellness Policy FY2026",
    description:
      "Core employee wellness handbook policy covering gym, mental health, and nutrition.",
    benefitGroups: ["Gym Membership", "Mental Health", "Optical"],
    totalAllocated: 2500,
    eligibility: {
      employeeTypes: ["Full-time", "Part-time"],
      roles: ["All Roles"],
    },
  },
  {
    id: "POL-20260115-0002",
    name: "Acme Leadership Benefits Policy FY2026",
    description:
      "Leadership-tier handbook policy with expanded lifestyle and clinical coverage.",
    benefitGroups: ["Food & Beverage", "Entertainment", "Transportation"],
    totalAllocated: 1000,
    eligibility: { employeeTypes: ["Full-time"], roles: ["All Roles"] },
  },
  {
    id: "POL-20260115-0003",
    name: "Global Tech Core Benefits Policy FY2026",
    description:
      "Core logistics workforce handbook policy with essential wellness coverage.",
    benefitGroups: [
      "Gym Membership",
      "Mental Health",
      "Optical",
      "Health Screening",
    ],
    totalAllocated: 5000,
    eligibility: {
      employeeTypes: ["Full-time"],
      roles: ["Manager", "Director", "Executive"],
    },
  },
  {
    id: "POL-20260115-0004",
    name: "Basic Health Support",
    description: "Essential health benefits for entry-level employees.",
    benefitGroups: ["Mental Health", "Optical"],
    totalAllocated: 1500,
    eligibility: {
      employeeTypes: ["Full-time", "Contract"],
      roles: ["All Roles"],
    },
  },
]

// Form policies (policy selector in employee create/edit form)
export const MOCK_FORM_POLICIES: FormPolicy[] = [
  {
    id: "POL-20260115-0001",
    name: "Acme Employee Wellness Policy FY2026",
    version: "V1.1",
    groups: [
      { id: "POL-20260115-0001-G1", name: "Gym Membership" },
      { id: "POL-20260115-0001-G2", name: "Mental Health" },
    ],
  },
  {
    id: "POL-20260115-0002",
    name: "Acme Leadership Benefits Policy FY2026",
    version: "V2.0",
    groups: [
      { id: "POL-20260115-0002-G1", name: "Travel" },
      { id: "POL-20260115-0002-G2", name: "Food & Dining" },
    ],
  },
  {
    id: "POL-20260115-0003",
    name: "Global Tech Core Benefits Policy FY2026",
    version: "V1.0",
    groups: [
      { id: "POL-20260115-0003-G1", name: "Spa Sessions" },
      { id: "POL-20260115-0003-G2", name: "Massages" },
    ],
  },
]

export { MOCK_POLICY_TEMPLATES }

// Org analytics — dashboard charts and top-10 panels
const ACME_ORG_ID = "ORG-20260115-0001"
export const MOCK_CLAIMS_TIMESERIES = createClaimsTimeSeries(ACME_ORG_ID)
export const MOCK_BENEFIT_BREAKDOWN = createBenefitBreakdown(ACME_ORG_ID)
export const MOCK_TOP_PROVIDERS = createTopProviders(ACME_ORG_ID)
export const MOCK_BRANCH_ACCOUNTS = createBranchAccounts(ACME_ORG_ID)
export const MOCK_POLICY_UTILISATION = createPolicyUtilisation(ACME_ORG_ID)
export const MOCK_COVERAGE_FUNNEL = createOrgCoverageFunnel(ACME_ORG_ID)
export const MOCK_BENEFIT_GROUP_USAGE = createBenefitGroupUsage(ACME_ORG_ID)
export const MOCK_EMPLOYEE_TIER_UTILISATION =
  createEmployeeTierUtilisation(ACME_ORG_ID)
export const MOCK_VOUCHER_COUNTS = createVoucherCounts(ACME_ORG_ID)
export const MOCK_RECENT_ACTIVITY = createRecentActivity(ACME_ORG_ID)
export const MOCK_ORG_PORTAL_ACTIVITY = createOrgPortalActivity(ACME_ORG_ID)
