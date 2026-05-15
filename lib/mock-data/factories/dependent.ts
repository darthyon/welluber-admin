import type { Dependent, DependentRelationship } from "@/features/organizations/types"

const NAMES = ["Siti Rahmah", "Ali Faizal", "Emma Tan", "David Chen", "Lily Wong", "Rizal Ahmad", "Hannah Lim", "Omar Yusuf", "Grace Lee", "Adam Razif"]
const RELATIONSHIPS: DependentRelationship[] = ["spouse", "child", "spouse", "child", "mother", "spouse", "child", "father", "spouse", "child"]
const EMP_IDS = [
  "EMP-20260115-0001", "EMP-20260115-0001", "EMP-20260115-0002",
  "EMP-20260115-0003", "EMP-20260115-0004", "EMP-20260115-0005",
  "EMP-20260115-0005", "EMP-20260115-0006", "EMP-20260115-0007", "EMP-20260115-0008",
]
const EMP_NAMES = [
  "Ahmad Faizal", "Ahmad Faizal", "Sarah Lim",
  "Michael Tan", "Nurul Huda", "Kevin Tan",
  "Kevin Tan", "Priya Raj", "Robert Fox", "Jenny Wilson",
]
const JOIN_DATES = [
  "15 Jan 2026", "15 Jan 2026", "15 Jan 2026",
  "15 Jan 2026", "01 Apr 2026", "01 Apr 2026",
  "01 Apr 2026", "01 Apr 2026", "01 Apr 2026", "01 Apr 2026",
]

export function createDependent(index: number): Dependent {
  const n = index + 1
  return {
    id: `DEP-20260115-${String(n).padStart(4, "0")}`,
    employeeId: EMP_IDS[index]!,
    employeeName: EMP_NAMES[index] ?? `Employee ${index + 1}`,
    name: NAMES[index] ?? `Dependent ${n}`,
    relationship: RELATIONSHIPS[index]!,
    status: index === 5 ? "deactivated" : "active",
    joinDate: JOIN_DATES[index] ?? "01 Jan 2026",
  }
}
