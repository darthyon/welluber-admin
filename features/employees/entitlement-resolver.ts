import { getEmployeeEntitlement } from "@/components/host/employees/employee-entitlements-mock"
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"
import type { BeneficiaryUsage } from "./types"
import {
  buildEntitlementGroupPoolDisplay,
  getSharedDependentPoolCeiling,
  type EntitlementGroupPoolDisplay,
} from "./entitlement-pool-display"

/**
 * The one place entitlement is resolved for an employee.
 *
 * Host console and org portal both call this, so the same person can no longer
 * show different numbers depending on which console you are looking at. All
 * arithmetic lives in `entitlement-pool-display.ts`; nothing here recomputes a
 * pool.
 */

export interface EntitlementGroupPool {
  group: BenefitGroup
  display: EntitlementGroupPoolDisplay
}

export interface EntitlementSummary {
  /** Policy-wide ceiling across every group. */
  allocated: number
  used: number
  left: number
  employeeUsed: number
  dependentUsed: number
  hasDependents: boolean
}

export interface ResolvedEntitlement {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  usage: BeneficiaryUsage[]
  pools: EntitlementGroupPool[]
  summary: EntitlementSummary
}

function buildSummary(
  policy: BenefitPolicy,
  groups: BenefitGroup[],
  pools: EntitlementGroupPool[]
): EntitlementSummary {
  const employeeUsed = pools.reduce((sum, p) => sum + p.display.employeeUsed, 0)
  const dependentUsed = pools.reduce(
    (sum, p) => sum + p.display.dependentUsed,
    0
  )
  const hasDependents = pools.some((p) =>
    p.display.beneficiaries.some((b) => b.beneficiaryType === "dependent")
  )

  // Summed group allocations, used only as the fallback ceiling.
  const summedAllocated = pools.reduce((sum, p) => sum + p.display.allocated, 0)

  // At policy scope `totalCapAmount` is the real ceiling — summing group
  // allocations over-reports whenever groups draw on one policy-wide pot.
  const employeeCeiling = policy.totalCapAmount ?? summedAllocated

  // A shared dependent pool has its own ceiling on top of the employee's.
  const dependentCeiling =
    policy.dependentsPoolType === "Shared"
      ? getSharedDependentPoolCeiling(policy, groups, 0)
      : 0

  const allocated = employeeCeiling + dependentCeiling
  const used = employeeUsed + dependentUsed

  return {
    allocated,
    used,
    left: Math.max(allocated - used, 0),
    employeeUsed,
    dependentUsed,
    hasDependents,
  }
}

/**
 * Resolve an employee's entitlement into per-group pools plus a policy-level
 * summary. Returns `null` when the employee has no assigned policy — callers
 * must render an empty state rather than falling back to another employee.
 */
export function resolveEmployeeEntitlement(
  employeeId: string
): ResolvedEntitlement | null {
  const entitlement = getEmployeeEntitlement(employeeId)
  if (!entitlement) return null

  const { policy, groups, benefits, usage } = entitlement

  const pools: EntitlementGroupPool[] = []
  for (const group of groups) {
    const display = buildEntitlementGroupPoolDisplay({
      policy,
      group,
      benefits,
      usage,
      employeeId,
    })
    if (!display) continue
    pools.push({ group, display })
  }

  return {
    policy,
    groups,
    benefits,
    usage,
    pools,
    summary: buildSummary(policy, groups, pools),
  }
}
