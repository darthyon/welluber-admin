import type { ProrateUnit, RefreshCycle, DependentsPoolType } from "@/types/policy"
import { User, UsersFour, Users, type IconProps } from "@phosphor-icons/react"
import React from "react"

export const CONTENT_TABS = [
  { id: 1, title: "Overview" },
  { id: 2, title: "Pool & Cycle" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Claims Usage", viewOnly: true },
] as const

export const CREATE_STEPS = [
  { id: 1, title: "Basics" },
  { id: 2, title: "Pool Config" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Assign Employees" },
  { id: 5, title: "Review" },
] as const

export const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
] as const

export const PRORATE_UNITS: ProrateUnit[] = ["Daily", "Weekly", "Monthly", "Quarterly"]

export const REFRESH_CYCLES: RefreshCycle[] = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
]

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

export const DEPENDENTS_POOL_OPTIONS: {
  value: DependentsPoolType
  title: string
  description: string
  icon: React.ElementType<IconProps>
}[] = [
  {
    value: "Individual",
    title: "Individual",
    description: "Each dependent has their own benefit pool.",
    icon: User,
  },
  {
    value: "Shared",
    title: "Shared",
    description: "All dependents share the same pool.",
    icon: UsersFour,
  },
  {
    value: "SharedWithEmployee",
    title: "Shared with Employee",
    description: "Dependents share the employee's pool.",
    icon: Users,
  },
]

export function getAvailableRefreshCycles(
  utilisationMode: "Fixed" | "Prorated",
  prorateUnit?: ProrateUnit
): RefreshCycle[] {
  if (utilisationMode === "Fixed") {
    return ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]
  }
  if (!prorateUnit) return REFRESH_CYCLES
  const unitIdx = PRORATE_UNITS.indexOf(prorateUnit)
  return REFRESH_CYCLES.slice(unitIdx + 1)
}
