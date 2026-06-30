export type EntitlementPoolType = "SharedWithEmployee" | "Shared" | "Individual"

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
