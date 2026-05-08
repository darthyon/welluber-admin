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
}

const ROWS: Omit<Entitlement, "id">[] = [
  { beneficiaryName: "Ahmad Faizal", type: "Employee", employeeId: "EMP-20260115-0001", employeeName: "Ahmad Faizal", policyId: "POL-20260115-0001", policy: "Acme Employee Wellness Policy FY2026", benefitGroup: "Physical Wellbeing", branchName: "Kuala Lumpur HQ", allocatedAmount: 350, usedAmount: 270, status: "active" },
  { beneficiaryName: "Siti Rahmah", type: "Dependent", employeeId: "EMP-20260115-0001", employeeName: "Ahmad Faizal", policyId: "POL-20260115-0001", policy: "Acme Employee Wellness Policy FY2026", benefitGroup: "Mental Fitness", branchName: "Kuala Lumpur HQ", allocatedAmount: 300, usedAmount: 200, status: "active" },
  { beneficiaryName: "Sarah Lim", type: "Employee", employeeId: "EMP-20260115-0002", employeeName: "Sarah Lim", policyId: "POL-20260115-0002", policy: "Acme Leadership Benefits Policy FY2026", benefitGroup: "Premium Wellness", branchName: "Subang Jaya Branch", allocatedAmount: 500, usedAmount: 180, status: "active" },
  { beneficiaryName: "Michael Tan", type: "Employee", employeeId: "EMP-20260115-0003", employeeName: "Michael Tan", policyId: "POL-20260115-0001", policy: "Acme Employee Wellness Policy FY2026", benefitGroup: "Physical Wellbeing", branchName: "Penang Office", allocatedAmount: 350, usedAmount: 0, status: "pending" },
  { beneficiaryName: "Nurul Huda", type: "Employee", employeeId: "EMP-20260115-0004", employeeName: "Nurul Huda", policyId: "POL-20260115-0001", policy: "Acme Employee Wellness Policy FY2026", benefitGroup: "Nutritional Support", branchName: "Kuala Lumpur HQ", allocatedAmount: 100, usedAmount: 100, status: "expired" },
  { beneficiaryName: "Kevin Tan", type: "Employee", employeeId: "EMP-20260115-0005", employeeName: "Kevin Tan", policyId: "POL-20260115-0004", policy: "Acme Engineering Wellness Supplement FY2026", benefitGroup: "Physical Wellbeing", branchName: "Kuala Lumpur HQ", allocatedAmount: 500, usedAmount: 80, status: "active" },
  { beneficiaryName: "Priya Raj", type: "Employee", employeeId: "EMP-20260115-0006", employeeName: "Priya Raj", policyId: "POL-20260115-0001", policy: "Acme Employee Wellness Policy FY2026", benefitGroup: "Mental Fitness", branchName: "Subang Jaya Branch", allocatedAmount: 300, usedAmount: 0, status: "active" },
  { beneficiaryName: "Robert Fox", type: "Employee", employeeId: "EMP-20260115-0007", employeeName: "Robert Fox", policyId: "POL-20260115-0001", policy: "Acme Employee Wellness Policy FY2026", benefitGroup: "Physical Wellbeing", branchName: "Kuala Lumpur HQ", allocatedAmount: 350, usedAmount: 95, status: "active" },
]

export function createEntitlement(index: number): Entitlement {
  const n = index + 1
  return { id: `ENT-20260115-${String(n).padStart(4, "0")}`, ...ROWS[index % ROWS.length]! }
}
