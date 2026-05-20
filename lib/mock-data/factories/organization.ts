import type { Organization } from "@/features/organizations/types"
import { MALAYSIAN_BANKS } from "@/lib/constants/banks"

const GENERATED_ORGS = [
  { name: "BrightPath Technologies Sdn Bhd", industry: "Technology", subIndustry: "Cybersecurity", type: "sdn_bhd" as const, plan: "standard" as const, status: "active" as const, empCount: 85, util: 42, state: "Selangor", country: "Malaysia" },
  { name: "Meridian Logistics Group", industry: "Logistics", subIndustry: "Freight & Distribution", type: "bhd" as const, plan: "premium" as const, status: "active" as const, empCount: 320, util: 61, state: "Johor", country: "Malaysia" },
  { name: "Solaris Energy Ventures", industry: "Energy", subIndustry: "Renewable Energy", type: "sole_proprietorship" as const, plan: "standard" as const, status: "deactivated" as const, empCount: 60, util: 22, state: "Sarawak", country: "Malaysia" },
  { name: "Pinnacle Medical Group", industry: "Healthcare", subIndustry: "Private Healthcare", type: "bhd" as const, plan: "enterprise" as const, status: "active" as const, empCount: 910, util: 78, state: "Wilayah Persekutuan", country: "Malaysia" },
  { name: "Horizon Retail Holdings", industry: "Retail", subIndustry: "Fashion & Apparel", type: "sdn_bhd" as const, plan: "premium" as const, status: "active" as const, empCount: 550, util: 55, state: "Penang", country: "Malaysia" },
  { name: "Apex Construction Sdn Bhd", industry: "Construction", subIndustry: "Civil Engineering", type: "sdn_bhd" as const, plan: "standard" as const, status: "active" as const, empCount: 140, util: 38, state: "Putrajaya", country: "Malaysia" },
  { name: "Luminary Education Group", industry: "Education", subIndustry: "Private Tutoring", type: "clbg" as const, plan: "standard" as const, status: "deactivated" as const, empCount: 45, util: 12, state: "Sabah", country: "Malaysia" },
]

const BANKS = MALAYSIAN_BANKS

export function createOrganization(index: number): Organization {
  if (index === 0) return {
    id: "ORG-20260115-0001",
    name: "Acme Corporation Sdn Bhd",
    registrationNumber: "1234567-T",
    industry: "Technology",
    subIndustry: "SaaS / Enterprise Software",
    type: "bhd",
    financialYearStart: "2026-01-01T00:00:00Z",
    subscription: { plan: "enterprise", billingInformation: "Acme Finance Dept", paymentMethod: "bank_transfer", startDate: "2026-01-15T10:00:00Z", status: "active" },
    status: "active",
    tinNumber: "TR-882910-01",
    state: "Wilayah Persekutuan",
    country: "Malaysia",
    bankAccountDetails: { bankName: "Maybank Berhad", accountNumber: "5140 1234 5678", accountName: "Acme Corporation Sdn Bhd" },
    employeeCount: 450,
    picId: "USR-20260101-0001",
    utilizationRate: 68,
    claimsCount: 24,
    totalAccountBalance: 45200,
    accountLimit: 60000,
    creditLimit: 10000,
    needsAction: [],
    services: ["Health Screenings", "Clinical Therapy"],
    policies: ["POL-20260115-0001", "POL-20260115-0002"],
    branches: ["BR-20260115-0001", "BR-20260115-0002", "BR-20260115-0003"],
    documents: [],
    employeesWithoutPolicy: 0,
    tierConfigs: [
      { id: "TC-001", name: "Executive", code: "EXE" },
      { id: "TC-002", name: "Senior Manager", code: "SM" },
      { id: "TC-003", name: "Manager", code: "MGR" },
      { id: "TC-004", name: "Associate", code: "ASC" },
    ],
    departmentConfigs: [
      { id: "DC-001", name: "HR", code: "HR" },
      { id: "DC-002", name: "Tech", code: "TECH" },
      { id: "DC-003", name: "Marketing", code: "MKT" },
      { id: "DC-004", name: "Finance", code: "FIN" },
      { id: "DC-005", name: "Operations", code: "OPS" },
    ],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-20T10:00:00Z",
  }

  if (index === 1) return {
    id: "ORG-20260301-0002",
    name: "Global Tech Solutions",
    registrationNumber: "9876543-K",
    industry: "Logistics",
    subIndustry: "Supply Chain",
    type: "llp",
    financialYearStart: "2026-04-01T00:00:00Z",
    subscription: { plan: "standard", billingInformation: "GT Logistics Finance", paymentMethod: "credit_card", startDate: "2026-03-01T10:00:00Z", status: "active" },
    status: "deactivated",
    tinNumber: "TR-993021-02",
    state: "Selangor",
    country: "Malaysia",
    bankAccountDetails: { bankName: "CIMB Bank", accountNumber: "8001 2233 4455", accountName: "Global Tech Solutions" },
    employeeCount: 120,
    picId: null,
    utilizationRate: 15,
    claimsCount: 8,
    totalAccountBalance: 12500,
    accountLimit: 85000,
    creditLimit: 15000,
    needsAction: ["Missing PIC"],
    services: ["General Practice", "Health Screenings"],
    policies: ["POL-20260115-0003"],
    branches: ["BR-20260301-0001"],
    documents: [],
    employeesWithoutPolicy: 12,
    tierConfigs: [
      { id: "TC-005", name: "Director", code: "DIR" },
      { id: "TC-006", name: "Associate", code: "ASC" },
    ],
    departmentConfigs: [
      { id: "DC-101", name: "HR", code: "HR" },
      { id: "DC-102", name: "Tech", code: "TECH" },
      { id: "DC-103", name: "Marketing", code: "MKT" },
    ],
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  }

  if (index === 2) return {
    id: "ORG-20260310-0003",
    name: "Nexus Innovations",
    registrationNumber: "5544332-M",
    industry: "Finance",
    subIndustry: "FinTech",
    type: "sole_proprietorship",
    financialYearStart: "2026-01-01T00:00:00Z",
    subscription: { plan: "premium", billingInformation: "Nexus Accounts", paymentMethod: "bank_transfer", startDate: "2026-02-10T10:00:00Z", status: "deactivated" },
    status: "deactivated",
    tinNumber: "TR-554433-03",
    state: "Singapore",
    country: "Singapore",
    bankAccountDetails: { bankName: "Public Bank", accountNumber: "3112 5544 3322", accountName: "Nexus Innovations" },
    employeeCount: 850,
    picId: "USR-20260115-0002",
    utilizationRate: 92,
    claimsCount: 156,
    totalAccountBalance: 4800,
    accountLimit: 5000,
    creditLimit: 2000,
    needsAction: ["Account low", "No policies"],
    services: ["Clinical Therapy", "Specialist Care"],
    policies: [],
    branches: ["BR-20260310-0001", "BR-20260310-0002"],
    documents: [],
    employeesWithoutPolicy: 850,
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  }

  // Generated entries (index 3-9)
  const g = index - 3
  const d = GENERATED_ORGS[g]!
  const n = index + 1
  const deptCodes = ["A", "B", "C", "D"]
  const tierCodes = ["L1", "L2", "L3"]
  return {
    id: `ORG-20260401-00${String(n).padStart(2, "0")}`,
    name: d.name,
    registrationNumber: `${1000000 + g}-X`,
    industry: d.industry,
    subIndustry: d.subIndustry,
    type: d.type,
    financialYearStart: "2026-01-01T00:00:00Z",
    subscription: { plan: d.plan, billingInformation: "Finance Dept", paymentMethod: "bank_transfer", startDate: "2026-04-01T10:00:00Z", status: d.status },
    status: d.status,
    tinNumber: `TR-${10000 + g * 111}-0${n}`,
    state: d.state,
    country: d.country,
    bankAccountDetails: { bankName: BANKS[g % BANKS.length]!, accountNumber: `5140 ${1000 + g} ${5678 + g}`, accountName: d.name },
    employeeCount: d.empCount,
    picId: "USR-20260101-0001",
    utilizationRate: d.util,
    claimsCount: 10 + g * 3,
    totalAccountBalance: 30000 + g * 5000,
    accountLimit: 80000,
    creditLimit: 15000 + g * 2500,
    needsAction: g % 4 === 0 ? ["No branches"] : [],
    services: ["Gymnasium Facilities", "Dietary Counseling"],
    policies: [],
    branches: [`BR-20260401-00${String(n).padStart(2, "0")}`],
    documents: [],
    employeesWithoutPolicy: g % 3 === 0 ? 8 : 0,
    tierConfigs: Array.from({ length: 3 }, (_, t) => ({
      id: `TC-G${g}-${tierCodes[t]}`,
      name: `${["Senior", "Manager", "Associate"][t]}`,
      code: tierCodes[t],
    })),
    departmentConfigs: Array.from({ length: 3 + (g % 2) }, (_, dIdx) => ({
      id: `DC-G${g}-${deptCodes[dIdx]}`,
      name: `${d.industry} ${["Ops", "Support", "Core", "Admin"][dIdx]}`,
      code: deptCodes[dIdx],
    })),
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-01T10:00:00Z",
  }
}

interface NewOrganizationOverrides {
  id?: string
  name?: string
  registrationNumber?: string
  industry?: string
  subIndustry?: string
  type?: Organization["type"]
  financialYearStart?: string
  tinNumber?: string
  state?: string
  country?: string
  bankAccountDetails?: Organization["bankAccountDetails"]
  subscription?: Partial<Organization["subscription"]>
  accountLimit?: number
  creditLimit?: number
  createdAt?: string
  updatedAt?: string
  branches?: string[]
}

export function createNewOrganization(overrides: NewOrganizationOverrides = {}): Organization {
  const now = new Date().toISOString()
  return {
    id: overrides.id ?? `ORG-NEW-${Date.now()}`,
    name: overrides.name ?? "New Organisation",
    registrationNumber: overrides.registrationNumber ?? "",
    industry: overrides.industry ?? "Technology",
    subIndustry: overrides.subIndustry,
    type: overrides.type ?? "sdn_bhd",
    financialYearStart: overrides.financialYearStart ?? "2026-01-01T00:00:00Z",
    tinNumber: overrides.tinNumber ?? "",
    state: overrides.state ?? "Kuala Lumpur",
    country: overrides.country ?? "Malaysia",
    bankAccountDetails: overrides.bankAccountDetails ?? {
      bankName: "",
      accountNumber: "",
      accountName: "",
    },
    subscription: {
      plan: "standard",
      startDate: overrides.createdAt ?? now,
      status: "inactive",
      ...overrides.subscription,
    },
    status: "inactive",
    employeeCount: 0,
    picId: null,
    utilizationRate: 0,
    claimsCount: 0,
    totalAccountBalance: 0,
    accountLimit: overrides.accountLimit ?? 50000,
    creditLimit: overrides.creditLimit ?? 50000,
    needsAction: ["Missing PIC", "No Employees", "No Policy"],
    services: [],
    policies: [],
    branches: overrides.branches ?? [],
    documents: [],
    employeesWithoutPolicy: 0,
    tierConfigs: [],
    departmentConfigs: [],
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  }
}

// Org utilisation rows for detail view
export const MOCK_ORG_UTILISATION = [
  {
    id: "EMP-20260115-0001",
    name: "Ahmad Faizal",
    empCode: "ACM-001",
    branch: "Kuala Lumpur HQ",
    allocated: 650,
    used: 420,
    claims: [
      { id: "CLM-2026-0001", voucherCode: "VCH-2024-0081", voucherName: "Wellness Allocation Voucher", transactionType: "redemption" as const, service: "Yoga Class", provider: "Zenith Yoga Studio", location: "Kuala Lumpur", date: "09 Apr 2026", amount: 120, status: "confirmed" as const },
      { id: "CLM-2026-0002", voucherCode: "VCH-2024-0114", voucherName: "Wellness Allocation Voucher", transactionType: "redemption" as const, service: "Individual Therapy", provider: "AgileMind Therapy Centre", location: "Petaling Jaya", date: "08 Apr 2026", amount: 200, status: "confirmed" as const },
    ],
  },
  {
    id: "EMP-20260115-0002",
    name: "Sarah Lim",
    empCode: "ACM-042",
    branch: "Subang Jaya",
    allocated: 650,
    used: 200,
    claims: [
      { id: "CLM-2026-0003", voucherCode: "VCH-2024-0198", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption" as const, service: "Swedish Massage", provider: "Serenity Spa & Aesthetics", location: "Kuala Lumpur", date: "07 Apr 2026", amount: 180, status: "pre-auth" as const },
    ],
  },
  {
    id: "EMP-20260115-0003",
    name: "Michael Tan",
    empCode: "ACM-156",
    branch: "Penang Office",
    allocated: 650,
    used: 0,
    claims: [],
  },
]
