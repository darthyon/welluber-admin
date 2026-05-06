import type { Employee, EmploymentType } from "@/features/organizations/types"

const NAMES = [
  "Ahmad Faizal", "Sarah Lim", "Michael Tan", "Nurul Huda",
  "Kevin Tan", "Priya Raj", "Robert Fox", "Jenny Wilson",
  "David Lee", "Aisha Karim",
]
const DEPARTMENTS = ["Engineering", "Product", "Finance", "HR", "Operations", "Marketing", "Sales", "Legal"]
const ORG_IDS = [
  "ORG-20260115-0001", "ORG-20260301-0002", "ORG-20260310-0003",
  "ORG-20260401-0004", "ORG-20260401-0005",
]
const BRANCH_IDS = [
  "BR-20260115-0001", "BR-20260301-0001", "BR-20260310-0001",
  "BR-20260401-0004", "BR-20260401-0005",
]
const EMP_TYPES: EmploymentType[] = ["full_time", "full_time", "full_time", "part_time", "contract", "internship", "full_time", "full_time", "contract", "full_time"]
const TIERS = ["Executive", "Senior Manager", "Manager", "Associate", "Associate", "Executive", "Manager", "Senior Manager", "Associate", "Executive"]

export function createEmployee(index: number): Employee {
  const n = index + 1
  const orgIdx = index % ORG_IDS.length
  return {
    id: `EMP-20260115-${String(n).padStart(4, "0")}`,
    orgId: ORG_IDS[orgIdx]!,
    branchId: BRANCH_IDS[orgIdx]!,
    name: NAMES[index] ?? `Employee ${n}`,
    email: `${(NAMES[index] ?? `employee${n}`).toLowerCase().replace(/\s+/g, ".")}@company.com`,
    empCode: `EMP-${String(n).padStart(3, "0")}`,
    department: DEPARTMENTS[index % DEPARTMENTS.length],
    role: TIERS[index],
    tier: TIERS[index],
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
