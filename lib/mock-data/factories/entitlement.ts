import { MOCK_EMPLOYEES } from "../seed"

export type EntitlementPoolType = "SharedWithEmployee" | "Shared" | "Individual"

export interface BenefitGroupWallet {
  id: string
  groupName: string
  poolType: EntitlementPoolType
  allocatedAmount: number
  usedAmount: number
  isSubCapped?: boolean
  subCapLimit?: number
  resetCycle: string
  familyBreakdown?: Array<{
    name: string
    role: "Employee" | "Spouse" | "Child"
    usedAmount: number
    percentage: number
  }>
}

export interface BeneficiaryAllocationRow {
  name: string
  role: "Employee" | "Spouse" | "Child"
  allocatedAmount: number
  usedAmount: number
  isSharedFamilyPot?: boolean
}

export interface EmployeeEntitlementsSummary {
  policyName: string
  policyId: string
  totalCeiling: number
  totalSpent: number
  overallRemaining: number
  overallUtilisation: number
  beneficiarySummary?: BeneficiaryAllocationRow[]
  groups: BenefitGroupWallet[]
}

export interface Entitlement {
  id: string
  beneficiaryName: string
  type: "Employee" | "Dependent"
  employeeId: string
  employeeName: string
  policyId: string
  policy: string
  benefitGroup: string
  branchName: string
  allocatedAmount: number
  usedAmount: number
  status: "active" | "expired" | "pending"
  poolType: EntitlementPoolType
}

const ROWS: Omit<Entitlement, "id">[] = [
  { beneficiaryName: "Robert Fox", type: "Employee", employeeId: "EMP-20260115-0001", employeeName: "Robert Fox", policyId: "POL-20260115-0001", policy: "Acme Flexi Wellness Policy FY2026", benefitGroup: "Gym & Fitness", branchName: "Kuala Lumpur HQ", allocatedAmount: 350, usedAmount: 270, status: "active", poolType: "SharedWithEmployee" },
  { beneficiaryName: "Siti Rahmah", type: "Dependent", employeeId: "EMP-20260115-0001", employeeName: "Robert Fox", policyId: "POL-20260115-0001", policy: "Acme Flexi Wellness Policy FY2026", benefitGroup: "Wellness Activities", branchName: "Kuala Lumpur HQ", allocatedAmount: 300, usedAmount: 200, status: "active", poolType: "SharedWithEmployee" },
  { beneficiaryName: "Sarah Lim", type: "Employee", employeeId: "EMP-20260115-0002", employeeName: "Sarah Lim", policyId: "POL-20260115-0002", policy: "Acme Leadership Wellness Policy FY2026", benefitGroup: "Sports & Recreation", branchName: "Subang Jaya Branch", allocatedAmount: 500, usedAmount: 180, status: "active", poolType: "Individual" },
  { beneficiaryName: "Michael Tan", type: "Employee", employeeId: "EMP-20260115-0003", employeeName: "Michael Tan", policyId: "POL-20260115-0001", policy: "Acme Flexi Wellness Policy FY2026", benefitGroup: "Gym & Fitness", branchName: "Penang Office", allocatedAmount: 350, usedAmount: 0, status: "pending", poolType: "Individual" },
  { beneficiaryName: "Nurul Huda", type: "Employee", employeeId: "EMP-20260115-0004", employeeName: "Nurul Huda", policyId: "POL-20260115-0003", policy: "Acme Nutrition Supplement FY2026", benefitGroup: "Nutrition Plans", branchName: "Kuala Lumpur HQ", allocatedAmount: 400, usedAmount: 400, status: "expired", poolType: "Shared" },
  { beneficiaryName: "Kevin Tan", type: "Employee", employeeId: "EMP-20260115-0005", employeeName: "Kevin Tan", policyId: "POL-20260115-0004", policy: "Acme Active Living Policy FY2026", benefitGroup: "Sports & Recreation", branchName: "Kuala Lumpur HQ", allocatedAmount: 500, usedAmount: 80, status: "active", poolType: "Individual" },
  { beneficiaryName: "Priya Raj", type: "Employee", employeeId: "EMP-20260115-0006", employeeName: "Priya Raj", policyId: "POL-20260115-0003", policy: "Acme Nutrition Supplement FY2026", benefitGroup: "Dietary Support", branchName: "Subang Jaya Branch", allocatedAmount: 300, usedAmount: 0, status: "active", poolType: "Shared" },
  { beneficiaryName: "Farah Nordin", type: "Employee", employeeId: "EMP-20260115-0007", employeeName: "Farah Nordin", policyId: "POL-20260115-0001", policy: "Acme Flexi Wellness Policy FY2026", benefitGroup: "Gym & Fitness", branchName: "Kuala Lumpur HQ", allocatedAmount: 350, usedAmount: 95, status: "active", poolType: "Individual" },
]

export function createEntitlement(index: number): Entitlement {
  const n = index + 1
  return { id: `ENT-20260115-${String(n).padStart(4, "0")}`, ...ROWS[index % ROWS.length]! }
}

export function getEmployeeEntitlements(employeeId: string): EmployeeEntitlementsSummary {
  const emp = MOCK_EMPLOYEES.find((e) => e.id === employeeId)
  const empName = emp?.name ?? "Employee"

  // C-01: Robert Fox (EMP-20260115-0001) — Pure Individual Solo Wallet (Uncapped)
  if (employeeId === "EMP-20260115-0001" || empName.includes("Robert Fox")) {
    return {
      policyName: "Acme Employee Essentials 2026",
      policyId: "POL-20260115-0001",
      totalCeiling: 1000,
      totalSpent: 350,
      overallRemaining: 650,
      overallUtilisation: 35,
      beneficiarySummary: [
        { name: `${empName} (Employee)`, role: "Employee", allocatedAmount: 1000, usedAmount: 350 },
      ],
      groups: [
        {
          id: "GRP-C01",
          groupName: "🏋️ Gym & Fitness Access",
          poolType: "Individual",
          allocatedAmount: 1000,
          usedAmount: 350,
          resetCycle: "31 Dec 2026",
        },
      ],
    }
  }

  // C-02: Marvin McKinney (EMP-20260115-0004) — Individual Solo (Sub-Capped Group Limit)
  if (employeeId === "EMP-20260115-0004" || empName.includes("Marvin McKinney")) {
    return {
      policyName: "Contract Staff Essentials Policy 2026",
      policyId: "POL-20260115-0011",
      totalCeiling: 1000,
      totalSpent: 200,
      overallRemaining: 800,
      overallUtilisation: 20,
      beneficiarySummary: [
        { name: `${empName} (Employee)`, role: "Employee", allocatedAmount: 1000, usedAmount: 200 },
      ],
      groups: [
        {
          id: "GRP-C02",
          groupName: "💆 Massage & Bodywork Therapy",
          poolType: "Individual",
          allocatedAmount: 200,
          usedAmount: 200,
          isSubCapped: true,
          subCapLimit: 200,
          resetCycle: "31 Dec 2026",
        },
      ],
    }
  }

  // C-03: Jenny Wilson (EMP-20260115-0002) — Separate Parent & Child Individual Wallets
  if (employeeId === "EMP-20260115-0002" || empName.includes("Jenny Wilson")) {
    return {
      policyName: "Acme Family Dental & Optical Plan",
      policyId: "POL-20260115-0002",
      totalCeiling: 1000,
      totalSpent: 450,
      overallRemaining: 550,
      overallUtilisation: 45,
      beneficiarySummary: [
        { name: `${empName} (Employee)`, role: "Employee", allocatedAmount: 500, usedAmount: 200 },
        { name: "Daniel Wilson (Spouse)", role: "Spouse", allocatedAmount: 250, usedAmount: 0 },
        { name: "Emma Wilson (Child)", role: "Child", allocatedAmount: 250, usedAmount: 250 },
      ],
      groups: [
        {
          id: "GRP-C03-A",
          groupName: "🦷 Employee Dental Wallet",
          poolType: "Individual",
          allocatedAmount: 500,
          usedAmount: 200,
          resetCycle: "31 Dec 2026",
        },
        {
          id: "GRP-C03-B",
          groupName: "👶 Dependent Child Dental Wallet",
          poolType: "Individual",
          allocatedAmount: 250,
          usedAmount: 250,
          resetCycle: "31 Dec 2026",
        },
      ],
    }
  }

  // Default / Ahmad Faizal (EMP-20260115-0006) — Solo Personal Wallet + Family Shared Pot
  return {
    policyName: "Acme Executive Family Wellness Plan",
    policyId: "POL-20260115-0010",
    totalCeiling: 2500,
    totalSpent: 1270,
    overallRemaining: 1230,
    overallUtilisation: 51,
    beneficiarySummary: [
      { name: `${empName} (Employee)`, role: "Employee", allocatedAmount: 1350, usedAmount: 670 },
      { name: "Siti Rahmah (Spouse)", role: "Spouse", allocatedAmount: 0, usedAmount: 600, isSharedFamilyPot: true },
      { name: "Tommy (Child)", role: "Child", allocatedAmount: 0, usedAmount: 0, isSharedFamilyPot: true },
    ],
    groups: [
      {
        id: "GRP-C05-Solo",
        groupName: "🏋️ Personal Gym Wallet",
        poolType: "Individual",
        allocatedAmount: 350,
        usedAmount: 270,
        resetCycle: "31 Dec 2026",
      },
      {
        id: "GRP-C05-Family",
        groupName: "🧘 Family Shared Therapy Pot",
        poolType: "SharedWithEmployee",
        allocatedAmount: 1000,
        usedAmount: 1000,
        resetCycle: "31 Dec 2026",
        familyBreakdown: [
          { name: `${empName} (Employee)`, role: "Employee", usedAmount: 400, percentage: 40 },
          { name: "Siti Rahmah (Spouse)", role: "Spouse", usedAmount: 600, percentage: 60 },
          { name: "Tommy (Child)", role: "Child", usedAmount: 0, percentage: 0 },
        ],
      },
    ],
  }

  // C-06: Nurul Huda (EMP-20260115-0007) — Sub-Capped Family Shared Pot
  if (employeeId === "EMP-20260115-0007" || empName.includes("Nurul Huda")) {
    return {
      policyName: "Acme Sub-Capped Family Wellness Policy",
      policyId: "POL-20260115-0007",
      totalCeiling: 2000,
      totalSpent: 500,
      overallRemaining: 1500,
      overallUtilisation: 25,
      groups: [
        {
          id: "GRP-C06",
          groupName: "🧘 Mental Therapy (Sub-Capped Family Pot)",
          poolType: "SharedWithEmployee",
          allocatedAmount: 1000,
          usedAmount: 500,
          isSubCapped: true,
          subCapLimit: 500,
          resetCycle: "31 Dec 2026",
          familyBreakdown: [
            { name: "Nurul Huda (Employee)", role: "Employee", usedAmount: 300, percentage: 60 },
            { name: "Aisyah (Child)", role: "Child", usedAmount: 200, percentage: 40 },
          ],
        },
      ],
    }
  }

  // C-07: Michael Tan (EMP-20260115-0003) — Policy Shared Group Pool (Uncapped per emp)
  if (employeeId === "EMP-20260115-0003" || empName.includes("Michael Tan")) {
    return {
      policyName: "Acme Health Screening Policy 2026",
      policyId: "POL-20260115-0003",
      totalCeiling: 3000,
      totalSpent: 1200,
      overallRemaining: 1800,
      overallUtilisation: 40,
      groups: [
        {
          id: "GRP-C07",
          groupName: "🩺 Executive Health Screening",
          poolType: "Shared",
          allocatedAmount: 3000,
          usedAmount: 1200,
          resetCycle: "31 Dec 2026",
        },
      ],
    }
  }

  // C-08: Priya Raj (EMP-20260115-0009) — Policy Shared Pool (With Per-Emp Sub-Cap)
  if (employeeId === "EMP-20260115-0009" || empName.includes("Priya Raj")) {
    return {
      policyName: "Global Health Corporate Screening 2026",
      policyId: "POL-20260115-0009",
      totalCeiling: 10000,
      totalSpent: 4500,
      overallRemaining: 5500,
      overallUtilisation: 45,
      groups: [
        {
          id: "GRP-C08",
          groupName: "🩺 Health Screening (Policy Fund + Per-Emp Cap)",
          poolType: "Shared",
          allocatedAmount: 10000,
          usedAmount: 500,
          isSubCapped: true,
          subCapLimit: 500,
          resetCycle: "31 Dec 2026",
        },
      ],
    }
  }

  // C-09: Kevin Tan (EMP-20260115-0008) — Policy Shared Dependent Pool
  if (employeeId === "EMP-20260115-0008" || empName.includes("Kevin Tan")) {
    return {
      policyName: "Acme Pediatric & Dependent Care Policy",
      policyId: "POL-20260115-0008",
      totalCeiling: 5000,
      totalSpent: 1500,
      overallRemaining: 3500,
      overallUtilisation: 30,
      groups: [
        {
          id: "GRP-C09",
          groupName: "👶 Global Pediatric & Childcare Shared Pool",
          poolType: "Shared",
          allocatedAmount: 5000,
          usedAmount: 1500,
          resetCycle: "31 Dec 2026",
        },
      ],
    }
  }

  // C-10: Farah Nordin (EMP-20260115-0010) — Policy Shared Pool + Family Unit Pot
  if (employeeId === "EMP-20260115-0010" || empName.includes("Farah Nordin")) {
    return {
      policyName: "Acme Emergency Family Support Plan",
      policyId: "POL-20260115-0010",
      totalCeiling: 8000,
      totalSpent: 2400,
      overallRemaining: 5600,
      overallUtilisation: 30,
      groups: [
        {
          id: "GRP-C10",
          groupName: "🚑 Emergency Family Medical Pot",
          poolType: "SharedWithEmployee",
          allocatedAmount: 8000,
          usedAmount: 2400,
          resetCycle: "31 Dec 2026",
          familyBreakdown: [
            { name: "Farah Nordin (Employee)", role: "Employee", usedAmount: 1000, percentage: 42 },
            { name: "Zaim Nordin (Spouse)", role: "Spouse", usedAmount: 1400, percentage: 58 },
          ],
        },
      ],
    }
  }

  // C-11: David Lee (EMP-20260115-0011) — Solo Gym + Policy Shared Dependent Pool
  if (employeeId === "EMP-20260115-0011" || empName.includes("David Lee")) {
    return {
      policyName: "Acme Hybrid Executive Plan 2026",
      policyId: "POL-20260115-0011",
      totalCeiling: 4000,
      totalSpent: 1100,
      overallRemaining: 2900,
      overallUtilisation: 28,
      groups: [
        {
          id: "GRP-C11-Solo",
          groupName: "🏋️ Dedicated Gym Wallet",
          poolType: "Individual",
          allocatedAmount: 500,
          usedAmount: 350,
          resetCycle: "31 Dec 2026",
        },
        {
          id: "GRP-C11-Shared",
          groupName: "👶 Shared Pediatric Pool",
          poolType: "Shared",
          allocatedAmount: 3500,
          usedAmount: 750,
          resetCycle: "31 Dec 2026",
        },
      ],
    }
  }

  // C-12: Default / Sarah Lim (EMP-20260115-0012) — Multi-Group Flexi Master Policy (All Combined)
  return {
    policyName: "Acme Comprehensive Flexi Master Policy 2026",
    policyId: "POL-20260115-0012",
    totalCeiling: 5000,
    totalSpent: 2120,
    overallRemaining: 2880,
    overallUtilisation: 42,
    groups: [
      {
        id: "GRP-C12-A",
        groupName: "🏋️ Gym & Fitness Access",
        poolType: "Individual",
        allocatedAmount: 350,
        usedAmount: 270,
        resetCycle: "31 Dec 2026",
      },
      {
        id: "GRP-C12-B",
        groupName: "💆 Massage & Bodywork Therapy",
        poolType: "Individual",
        allocatedAmount: 200,
        usedAmount: 200,
        isSubCapped: true,
        subCapLimit: 200,
        resetCycle: "31 Dec 2026",
      },
      {
        id: "GRP-C12-C",
        groupName: "🧘 Mental Health & Therapy",
        poolType: "SharedWithEmployee",
        allocatedAmount: 1000,
        usedAmount: 1000,
        resetCycle: "31 Dec 2026",
        familyBreakdown: [
          { name: `${empName} (Employee)`, role: "Employee", usedAmount: 400, percentage: 40 },
          { name: "Siti Rahmah (Spouse)", role: "Spouse", usedAmount: 600, percentage: 60 },
          { name: "Tommy Fox (Child)", role: "Child", usedAmount: 0, percentage: 0 },
        ],
      },
      {
        id: "GRP-C12-D",
        groupName: "🩺 Executive Health Screening",
        poolType: "Shared",
        allocatedAmount: 3450,
        usedAmount: 650,
        resetCycle: "31 Dec 2026",
      },
    ],
  }
}

