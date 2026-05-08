import type { Employee, EmploymentType } from "@/features/organizations/types"

const NAMES = [
  "Ahmad Faizal", "Sarah Lim", "Michael Tan", "Nurul Huda",
  "Kevin Tan", "Priya Raj", "Robert Fox", "Jenny Wilson",
  "David Lee", "Aisha Karim",
]
// Department + tier configs mirror MOCK_ORGS — keep ids in sync with org factory.
const DEPARTMENTS_BY_ORG: Record<string, { id: string; name: string }[]> = {
  "ORG-20260115-0001": [
    { id: "DC-001", name: "HR" },
    { id: "DC-002", name: "Tech" },
    { id: "DC-003", name: "Marketing" },
    { id: "DC-004", name: "Finance" },
    { id: "DC-005", name: "Operations" },
  ],
  "ORG-20260301-0002": [
    { id: "DC-101", name: "HR" },
    { id: "DC-102", name: "Tech" },
    { id: "DC-103", name: "Marketing" },
  ],
}
const TIERS_BY_ORG: Record<string, { id: string; name: string }[]> = {
  "ORG-20260115-0001": [
    { id: "TC-001", name: "Executive" },
    { id: "TC-002", name: "Senior Manager" },
    { id: "TC-003", name: "Manager" },
    { id: "TC-004", name: "Associate" },
  ],
  "ORG-20260301-0002": [
    { id: "TC-005", name: "Director" },
    { id: "TC-006", name: "Associate" },
  ],
}
const ORG_IDS = [
  "ORG-20260115-0001", "ORG-20260301-0002", "ORG-20260310-0003",
  "ORG-20260401-0004", "ORG-20260401-0005",
]
const BRANCH_IDS = [
  "BR-20260115-0001", "BR-20260301-0001", "BR-20260310-0001",
  "BR-20260401-0004", "BR-20260401-0005",
]
const EMP_TYPES: EmploymentType[] = ["full_time", "full_time", "full_time", "part_time", "contract", "internship", "full_time", "full_time", "contract", "full_time"]

export function createEmployee(index: number): Employee {
  const n = index + 1
  const orgIdx = index % ORG_IDS.length
  const orgId = ORG_IDS[orgIdx]!
  const orgDepts = DEPARTMENTS_BY_ORG[orgId] ?? []
  const orgTiers = TIERS_BY_ORG[orgId] ?? []
  const dept = orgDepts.length > 0 ? orgDepts[index % orgDepts.length]! : undefined
  const tier = orgTiers.length > 0 ? orgTiers[index % orgTiers.length]! : undefined
  return {
    id: `EMP-20260115-${String(n).padStart(4, "0")}`,
    orgId,
    branchId: BRANCH_IDS[orgIdx]!,
    name: NAMES[index] ?? `Employee ${n}`,
    email: `${(NAMES[index] ?? `employee${n}`).toLowerCase().replace(/\s+/g, ".")}@company.com`,
    empCode: `EMP-${String(n).padStart(3, "0")}`,
    departmentId: dept?.id,
    department: dept?.name,
    role: tier?.name,
    tierId: tier?.id,
    tier: tier?.name,
    dateOfBirth: `${1985 + (index % 15)}-0${(index % 9) + 1}-15T00:00:00Z`,
    gender: index % 3 === 0 ? "female" : "male",
    mobileNumber: `+6011${10000000 + index * 1234567}`,
    joinDate: index < 3 ? "2026-01-15T00:00:00Z" : "2026-04-01T00:00:00Z",
    probationEndDate: index % 5 === 0 ? "2026-07-01T00:00:00Z" : undefined,
    employmentType: EMP_TYPES[index]!,
    status: index === 7 ? "inactive" : "active",
    isProbation: index % 5 === 0,
  }
}
