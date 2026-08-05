import { requireEmployeeIdentity } from "../employee-identity"

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

/**
 * Entitlement facts only. `employeeName` and `branchName` come from
 * `employee-identity.ts`; `beneficiaryName` is declared only for dependents,
 * since an employee beneficiary is by definition the employee.
 */
type EntitlementRow = Omit<
  Entitlement,
  "id" | "employeeName" | "branchName" | "beneficiaryName"
> & { beneficiaryName?: string }

const ROWS: EntitlementRow[] = [
  { type: "Employee", employeeId: "EMP-20260115-0001", policyId: "POL-20260115-0001", policy: "Acme Flexi Wellness Policy FY2026", benefitGroup: "Gym & Fitness", allocatedAmount: 350, usedAmount: 270, status: "active", poolType: "SharedWithEmployee" },
  { beneficiaryName: "Siti Rahmah", type: "Dependent", employeeId: "EMP-20260115-0001", policyId: "POL-20260115-0001", policy: "Acme Flexi Wellness Policy FY2026", benefitGroup: "Wellness Activities", allocatedAmount: 300, usedAmount: 200, status: "active", poolType: "SharedWithEmployee" },
  { type: "Employee", employeeId: "EMP-20260115-0002", policyId: "POL-20260115-0002", policy: "Acme Leadership Wellness Policy FY2026", benefitGroup: "Sports & Recreation", allocatedAmount: 500, usedAmount: 180, status: "active", poolType: "Individual" },
  { type: "Employee", employeeId: "EMP-20260115-0003", policyId: "POL-20260115-0001", policy: "Acme Flexi Wellness Policy FY2026", benefitGroup: "Gym & Fitness", allocatedAmount: 350, usedAmount: 0, status: "pending", poolType: "Individual" },
  { type: "Employee", employeeId: "EMP-20260115-0004", policyId: "POL-20260115-0003", policy: "Acme Nutrition Supplement FY2026", benefitGroup: "Nutrition Plans", allocatedAmount: 400, usedAmount: 400, status: "expired", poolType: "Shared" },
  { type: "Employee", employeeId: "EMP-20260115-0005", policyId: "POL-20260115-0004", policy: "Acme Active Living Policy FY2026", benefitGroup: "Sports & Recreation", allocatedAmount: 500, usedAmount: 80, status: "active", poolType: "Individual" },
  { type: "Employee", employeeId: "EMP-20260115-0006", policyId: "POL-20260115-0003", policy: "Acme Nutrition Supplement FY2026", benefitGroup: "Dietary Support", allocatedAmount: 300, usedAmount: 0, status: "active", poolType: "Shared" },
  { type: "Employee", employeeId: "EMP-20260115-0007", policyId: "POL-20260115-0001", policy: "Acme Flexi Wellness Policy FY2026", benefitGroup: "Gym & Fitness", allocatedAmount: 350, usedAmount: 95, status: "active", poolType: "Individual" },
]

export function createEntitlement(index: number): Entitlement {
  const n = index + 1
  const { beneficiaryName, ...row } = ROWS[index % ROWS.length]!
  const identity = requireEmployeeIdentity(row.employeeId)
  return {
    id: `ENT-20260115-${String(n).padStart(4, "0")}`,
    ...row,
    employeeName: identity.name,
    branchName: identity.branch ?? identity.branchId,
    beneficiaryName: beneficiaryName ?? identity.name,
  }
}


