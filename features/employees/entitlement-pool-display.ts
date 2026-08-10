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
  /** Total unique capacity represented by this benefit group. */
  allocated: number
  used: number
  left: number
  /** Separate ceilings used by the group table and shared-pool summaries. */
  employeeAllocated: number
  dependentAllocated: number
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

/**
 * Ceiling for ONE group's shared dependent pool.
 *
 * Most specific cap wins: a cap declared on the group beats the policy-wide
 * dependent ceiling, which beats simply summing what the benefits allocate.
 *
 * This is deliberately NOT the same order as
 * `getSharedDependentPoolCeiling()` below — see the note there.
 */
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

/**
 * Ceiling for the dependent pool ACROSS ALL GROUPS — the figure the allocation
 * summary shows, not a single group's.
 *
 * The precedence inverts on purpose. At group scope the group's own cap is the
 * more specific rule, so it wins. At policy scope `dependentCapAmount` IS the
 * total dependent ceiling, so it wins over the sum of the per-group caps —
 * summing them would over-report whenever groups share one policy-wide pot.
 */
export function getSharedDependentPoolCeiling(
  policy: BenefitPolicy,
  groups: BenefitGroup[],
  fallback: number
) {
  if (typeof policy.dependentCapAmount === "number")
    return policy.dependentCapAmount

  const groupCapTotal = groups.reduce(
    (sum, group) => sum + (group.dependentGroupCap ?? 0),
    0
  )
  if (groupCapTotal > 0) return groupCapTotal

  return fallback
}

/**
 * A single group can never allocate more than the policy's own ceiling.
 *
 * Only ever lowers the figure, so groups that sit under the cap are untouched.
 * Without it a combined pool reported the sum of its benefits (e.g. 1,600)
 * while the policy summary reported the cap (800) — on the same screen.
 */
function capToPolicyCeiling(policy: BenefitPolicy, allocated: number) {
  return typeof policy.totalCapAmount === "number"
    ? Math.min(allocated, policy.totalCapAmount)
    : allocated
}

function coverageKey(relationship?: string) {
  return relationship?.trim().toLowerCase()
}

/** Per-dependent-type ceilings from `policy.dependentCoverages[].capAmount`. */
export function getIndividualDependentCaps(policy: BenefitPolicy) {
  const caps = new Map<string, number>()
  for (const coverage of policy.dependentCoverages ?? []) {
    const key = coverageKey(coverage.type)
    if (!key || typeof coverage.capAmount !== "number") continue
    caps.set(key, coverage.capAmount)
  }
  return caps
}

/**
 * Policy-level ceiling for individual dependent wallets.
 *
 * Individual wallets remain independent, but a dependent type cap is a
 * policy-level ceiling. Aggregate each beneficiary across groups first, then
 * apply that cap once so a spouse cannot be counted above their policy limit
 * merely because the policy contains several benefit groups.
 */
export function getIndividualDependentPoolCeiling(
  policy: BenefitPolicy,
  usage: BeneficiaryUsage[]
) {
  const caps = getIndividualDependentCaps(policy)
  const byBeneficiary = new Map<
    string,
    { relationship?: string; allocated: number }
  >()

  for (const row of usage) {
    if (!row.relationship) continue
    const current = byBeneficiary.get(row.beneficiaryId)
    if (current) {
      current.allocated += row.allocated
      continue
    }
    byBeneficiary.set(row.beneficiaryId, {
      relationship: row.relationship,
      allocated: row.allocated,
    })
  }

  return Array.from(byBeneficiary.values()).reduce((sum, beneficiary) => {
    const cap = caps.get(coverageKey(beneficiary.relationship) ?? "")
    return (
      sum +
      (typeof cap === "number"
        ? Math.min(beneficiary.allocated, cap)
        : beneficiary.allocated)
    )
  }, 0)
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
    const employeeAllocated = capToPolicyCeiling(
      policy,
      combinedAllocated(employeeRows)
    )
    return {
      kind: "employee",
      allocated: employeeAllocated,
      used: employeeUsed,
      left: Math.max(employeeAllocated - employeeUsed, 0),
      employeeAllocated,
      dependentAllocated: 0,
      employeeUsed,
      dependentUsed: 0,
      beneficiaries: aggregateBeneficiaries(
        employeeRows,
        employeeAllocated,
        employeeId
      ),
    }
  }

  // `benefitPoolType: "Shared"` is the org-level shared pot: employee and
  // dependents draw on ONE pool, same as SharedWithEmployee at the group level.
  // Omitting it made a shared-pot policy fall through to `individual` and
  // report each beneficiary's share as a separate allocation.
  if (
    policy.dependentsPoolType === "SharedWithEmployee" ||
    policy.benefitPoolType === "Shared"
  ) {
    const allocated = capToPolicyCeiling(policy, combinedAllocated(rows))
    const used = employeeUsed + dependentUsed
    return {
      kind: "combined",
      allocated,
      used,
      left: Math.max(allocated - used, 0),
      employeeAllocated: allocated,
      dependentAllocated: 0,
      employeeUsed,
      dependentUsed,
      beneficiaries: aggregateBeneficiaries(rows, allocated, employeeId),
    }
  }

  if (policy.dependentsPoolType === "Shared") {
    const employeeAllocated = capToPolicyCeiling(
      policy,
      combinedAllocated(employeeRows)
    )
    const dependentAllocated = sharedAllocated(policy, group, dependentRows)
    const allocated = employeeAllocated + dependentAllocated
    const used = employeeUsed + dependentUsed
    return {
      kind: "shared",
      allocated,
      used,
      left: Math.max(allocated - used, 0),
      employeeAllocated,
      dependentAllocated,
      employeeUsed,
      dependentUsed,
      beneficiaries: aggregateBeneficiaries(rows, allocated, employeeId),
    }
  }

  // Individual dependent wallets — clamp each beneficiary to the ceiling its
  // dependent type declares, so a spouse cap cannot be exceeded by summing the
  // per-benefit allocations.
  const caps = getIndividualDependentCaps(policy)
  const employeeAllocated = capToPolicyCeiling(
    policy,
    combinedAllocated(employeeRows)
  )
  const employeeBeneficiaries = aggregateBeneficiaries(
    employeeRows,
    employeeAllocated,
    employeeId
  )
  const dependentBeneficiaries = aggregateBeneficiaries(
    dependentRows,
    0,
    employeeId
  ).map((beneficiary) => {
    const cap = caps.get(coverageKey(beneficiary.relationship) ?? "")
    if (typeof cap !== "number") return beneficiary
    const allocated = Math.min(beneficiary.allocated, cap)
    return {
      ...beneficiary,
      allocated,
      left: Math.max(allocated - beneficiary.used, 0),
    }
  })
  const dependentAllocated = dependentBeneficiaries.reduce(
    (sum, beneficiary) => sum + beneficiary.allocated,
    0
  )
  const allocated = employeeAllocated + dependentAllocated
  const used = employeeUsed + dependentUsed

  return {
    kind: "individual",
    allocated,
    used,
    left: Math.max(allocated - used, 0),
    employeeAllocated,
    dependentAllocated,
    employeeUsed,
    dependentUsed,
    beneficiaries: [...employeeBeneficiaries, ...dependentBeneficiaries],
  }
}
