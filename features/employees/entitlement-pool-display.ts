import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"
import type { BeneficiaryUsage } from "./types"

export type EntitlementPoolKind =
  | "combined"
  | "shared"
  | "individual"
  | "employee"

export interface EntitlementBeneficiaryRow {
  id: string
  name: string
  relationship: string
  beneficiaryType: "employee" | "dependent"
  allocated: number
  used: number
  left: number
  shareOfPool: number
}

export interface EntitlementGroupPoolDisplay {
  kind: EntitlementPoolKind
  allocated: number
  used: number
  left: number
  employeeUsed: number
  dependentUsed: number
  beneficiaries: EntitlementBeneficiaryRow[]
}

function sumUsage(rows: BeneficiaryUsage[]) {
  return rows.reduce((sum, row) => sum + row.spent, 0)
}

function groupUsage(benefits: Benefit[], usage: BeneficiaryUsage[]) {
  const benefitIds = new Set(benefits.map((benefit) => benefit.id))
  return usage.filter((row) => benefitIds.has(row.benefitId))
}

function aggregateBeneficiaries(
  rows: BeneficiaryUsage[],
  allocated: number,
  employeeId?: string
) {
  const beneficiaries = new Map<string, EntitlementBeneficiaryRow>()

  for (const row of rows) {
    const beneficiaryType = row.relationship ? "dependent" : "employee"
    const existing = beneficiaries.get(row.beneficiaryId)
    if (existing) {
      existing.allocated += row.allocated
      existing.used += row.spent
      existing.left += row.balance
      continue
    }

    beneficiaries.set(row.beneficiaryId, {
      id: row.beneficiaryId,
      name:
        row.beneficiaryName ??
        (row.beneficiaryId === employeeId
          ? "Employee"
          : (row.relationship ?? "Dependent")),
      relationship: row.relationship ?? "Employee",
      beneficiaryType,
      allocated: row.allocated,
      used: row.spent,
      left: row.balance,
      shareOfPool: 0,
    })
  }

  return Array.from(beneficiaries.values()).map((beneficiary) => ({
    ...beneficiary,
    left: Math.max(beneficiary.allocated - beneficiary.used, 0),
    shareOfPool:
      allocated > 0
        ? Math.min(Math.round((beneficiary.used / allocated) * 100), 100)
        : 0,
  }))
}

function combinedAllocated(rows: BeneficiaryUsage[]) {
  const employeeAllocationByBenefit = new Map<string, number>()
  for (const row of rows) {
    if (!row.relationship)
      employeeAllocationByBenefit.set(row.benefitId, row.allocated)
  }
  return Array.from(employeeAllocationByBenefit.values()).reduce(
    (sum, allocation) => sum + allocation,
    0
  )
}

function sharedAllocated(
  policy: BenefitPolicy,
  group: BenefitGroup,
  rows: BeneficiaryUsage[]
) {
  if (typeof group.dependentGroupCap === "number")
    return group.dependentGroupCap
  if (typeof policy.dependentCapAmount === "number")
    return policy.dependentCapAmount

  const allocationByBenefit = new Map<string, number>()
  for (const row of rows) {
    if (row.relationship) allocationByBenefit.set(row.benefitId, row.allocated)
  }
  return Array.from(allocationByBenefit.values()).reduce(
    (sum, allocation) => sum + allocation,
    0
  )
}

export function buildEntitlementGroupPoolDisplay({
  policy,
  group,
  benefits,
  usage,
  employeeId,
}: {
  policy: BenefitPolicy
  group: BenefitGroup
  benefits: Benefit[]
  usage: BeneficiaryUsage[]
  employeeId?: string
}): EntitlementGroupPoolDisplay | null {
  const rows = groupUsage(
    benefits.filter((benefit) => benefit.groupId === group.id),
    usage
  )
  const employeeRows = rows.filter((row) => !row.relationship)
  const dependentRows = rows.filter((row) => row.relationship)
  const employeeUsed = sumUsage(employeeRows)
  const dependentUsed = sumUsage(dependentRows)

  if (!dependentRows.length) {
    const allocated = combinedAllocated(employeeRows)
    return {
      kind: "employee",
      allocated,
      used: employeeUsed,
      left: Math.max(allocated - employeeUsed, 0),
      employeeUsed,
      dependentUsed: 0,
      beneficiaries: aggregateBeneficiaries(
        employeeRows,
        allocated,
        employeeId
      ),
    }
  }

  if (policy.dependentsPoolType === "SharedWithEmployee") {
    const allocated = combinedAllocated(rows)
    const used = employeeUsed + dependentUsed
    return {
      kind: "combined",
      allocated,
      used,
      left: Math.max(allocated - used, 0),
      employeeUsed,
      dependentUsed,
      beneficiaries: aggregateBeneficiaries(rows, allocated, employeeId),
    }
  }

  if (policy.dependentsPoolType === "Shared") {
    const allocated = sharedAllocated(policy, group, dependentRows)
    return {
      kind: "shared",
      allocated,
      used: dependentUsed,
      left: Math.max(allocated - dependentUsed, 0),
      employeeUsed,
      dependentUsed,
      beneficiaries: aggregateBeneficiaries(
        dependentRows,
        allocated,
        employeeId
      ),
    }
  }

  const beneficiaries = aggregateBeneficiaries(dependentRows, 0, employeeId)
  return {
    kind: "individual",
    allocated: beneficiaries.reduce(
      (sum, beneficiary) => sum + beneficiary.allocated,
      0
    ),
    used: dependentUsed,
    left: beneficiaries.reduce((sum, beneficiary) => sum + beneficiary.left, 0),
    employeeUsed,
    dependentUsed,
    beneficiaries,
  }
}
