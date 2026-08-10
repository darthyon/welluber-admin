import { getEmployeeEntitlement } from "@/components/host/employees/employee-entitlements-mock"
import { getMainServiceName } from "@/lib/mock-data/service-catalog"
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"
import type { BeneficiaryUsage } from "./types"
import {
  buildEntitlementGroupPoolDisplay,
  getIndividualDependentCaps,
  getIndividualDependentPoolCeiling,
  getSharedDependentPoolCeiling,
  type EntitlementPoolKind,
  type EntitlementGroupPoolDisplay,
} from "./entitlement-pool-display"

export type { EntitlementPoolKind } from "./entitlement-pool-display"

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
  employeeAllocated: number
  dependentAllocated: number
  used: number
  left: number
  employeeUsed: number
  dependentUsed: number
  hasDependents: boolean
}

export type EntitlementAllocationScope =
  | { type: "overall" }
  | { type: "service"; groupId: string; benefitId: string }

export interface EntitlementAllocationRow {
  beneficiaryId: string
  name: string
  relationship: "Employee" | "Spouse" | "Child" | "Dependent"
  beneficiaryType: "employee" | "dependent"
  allocationType: EntitlementPoolKind
  allocated: number | null
  used: number
  balance: number | null
  allocationLabel?: string
  benefitGroups: EntitlementBenefitGroupMembership[]
}

export interface EntitlementBenefitGroupMembership {
  groupId: string
  groupName: string
  serviceNames: string[]
}

export interface EntitlementServiceAllocation {
  benefitId: string
  serviceId: string
  kind: EntitlementPoolKind
  summary: EntitlementSummary
  rows: EntitlementAllocationRow[]
}

export interface EntitlementAllocationDetail {
  scope: EntitlementAllocationScope
  kind: EntitlementPoolKind
  summary: EntitlementSummary
  rows: EntitlementAllocationRow[]
}

export interface ResolvedEntitlement {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  usage: BeneficiaryUsage[]
  pools: EntitlementGroupPool[]
  summary: EntitlementSummary
}

function allocationKindForPolicy(
  policy: BenefitPolicy,
  hasDependents: boolean
): EntitlementPoolKind {
  if (!hasDependents) return "employee"
  if (
    policy.benefitPoolType === "Shared" ||
    policy.dependentsPoolType === "SharedWithEmployee"
  ) {
    return "combined"
  }
  if (policy.dependentsPoolType === "Shared") return "shared"
  return "individual"
}

function relationshipLabel(
  relationship?: string
): EntitlementAllocationRow["relationship"] {
  if (relationship === "Spouse") return "Spouse"
  if (relationship === "Child") return "Child"
  return relationship ? "Dependent" : "Employee"
}

function allocationLabel(kind: EntitlementPoolKind) {
  if (kind === "shared") return "Shared Between Dependents"
  if (kind === "combined") return "Combined With Employee"
  return undefined
}

function detailSummary(
  rows: EntitlementAllocationRow[],
  kind: EntitlementPoolKind,
  sharedDependentAllocated = 0,
  combinedEmployeeAllocated = 0
): EntitlementSummary {
  const employeeRows = rows.filter((row) => row.beneficiaryType === "employee")
  const dependentRows = rows.filter(
    (row) => row.beneficiaryType === "dependent"
  )
  const employeeAllocated =
    kind === "combined"
      ? combinedEmployeeAllocated
      : employeeRows.reduce((sum, row) => sum + (row.allocated ?? 0), 0)
  const dependentAllocated =
    kind === "combined"
      ? 0
      : kind === "shared"
        ? sharedDependentAllocated
        : dependentRows.reduce((sum, row) => sum + (row.allocated ?? 0), 0)
  const employeeUsed = employeeRows.reduce((sum, row) => sum + row.used, 0)
  const dependentUsed = dependentRows.reduce((sum, row) => sum + row.used, 0)
  const allocated = employeeAllocated + dependentAllocated
  const used = employeeUsed + dependentUsed

  return {
    allocated,
    employeeAllocated,
    dependentAllocated,
    used,
    left: Math.max(allocated - used, 0),
    employeeUsed,
    dependentUsed,
    hasDependents: dependentRows.length > 0,
  }
}

function buildRowsFromUsage({
  rows,
  kind,
  employeeName,
}: {
  rows: BeneficiaryUsage[]
  kind: EntitlementPoolKind
  employeeName?: string
}) {
  const byBeneficiary = new Map<string, EntitlementAllocationRow>()

  for (const row of rows) {
    const isEmployee = !row.relationship
    const existing = byBeneficiary.get(row.beneficiaryId)
    if (existing) {
      existing.allocated =
        existing.allocated === null || (kind === "combined" && !isEmployee)
          ? null
          : existing.allocated + row.allocated
      existing.used += row.spent
      existing.balance =
        existing.allocated === null || kind === "combined"
          ? null
          : Math.max(existing.allocated - existing.used, 0)
      continue
    }

    const allocated =
      !isEmployee && kind !== "individual" ? null : row.allocated
    byBeneficiary.set(row.beneficiaryId, {
      beneficiaryId: row.beneficiaryId,
      name: isEmployee
        ? (employeeName ?? "Employee")
        : (row.beneficiaryName ?? row.relationship ?? "Dependent"),
      relationship: relationshipLabel(row.relationship),
      beneficiaryType: isEmployee ? "employee" : "dependent",
      allocationType: kind,
      allocated,
      used: row.spent,
      balance: allocated === null ? null : Math.max(allocated - row.spent, 0),
      allocationLabel: !isEmployee ? allocationLabel(kind) : undefined,
      benefitGroups: [],
    })
  }

  return Array.from(byBeneficiary.values()).sort((a, b) => {
    if (a.beneficiaryType !== b.beneficiaryType)
      return a.beneficiaryType === "employee" ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

function buildOverallRows(
  entitlement: ResolvedEntitlement,
  employeeName?: string
) {
  const kind = allocationKindForPolicy(
    entitlement.policy,
    entitlement.summary.hasDependents
  )
  const dependents = new Map<
    string,
    { name: string; relationship: string; allocated: number; used: number }
  >()

  for (const pool of entitlement.pools) {
    for (const beneficiary of pool.display.beneficiaries) {
      if (beneficiary.beneficiaryType !== "dependent") continue
      const current = dependents.get(beneficiary.id)
      if (current) {
        current.allocated += beneficiary.allocated
        current.used += beneficiary.used
      } else {
        dependents.set(beneficiary.id, {
          name: beneficiary.name,
          relationship: beneficiary.relationship,
          allocated: beneficiary.allocated,
          used: beneficiary.used,
        })
      }
    }
  }

  const caps = getIndividualDependentCaps(entitlement.policy)
  const rows: EntitlementAllocationRow[] = [
    {
      beneficiaryId: "employee",
      name: employeeName ?? "Employee",
      relationship: "Employee",
      beneficiaryType: "employee",
      allocationType: kind,
      allocated: entitlement.summary.employeeAllocated,
      used: entitlement.summary.employeeUsed,
      balance:
        kind === "combined"
          ? entitlement.summary.left
          : Math.max(
              entitlement.summary.employeeAllocated -
                entitlement.summary.employeeUsed,
              0
            ),
      benefitGroups: [],
    },
  ]

  for (const [beneficiaryId, beneficiary] of dependents) {
    const cap = caps.get(beneficiary.relationship.toLowerCase())
    const allocated =
      kind === "individual"
        ? typeof cap === "number"
          ? Math.min(beneficiary.allocated, cap)
          : beneficiary.allocated
        : null
    rows.push({
      beneficiaryId,
      name: beneficiary.name,
      relationship: relationshipLabel(beneficiary.relationship),
      beneficiaryType: "dependent",
      allocationType: kind,
      allocated,
      used: beneficiary.used,
      balance:
        allocated === null ? null : Math.max(allocated - beneficiary.used, 0),
      allocationLabel: allocationLabel(kind),
      benefitGroups: [],
    })
  }

  return {
    kind,
    rows: rows.map((row) => ({
      ...row,
      benefitGroups: buildBenefitGroupMemberships(entitlement, row),
    })),
  }
}

function buildBenefitGroupMemberships(
  entitlement: ResolvedEntitlement,
  row: EntitlementAllocationRow
): EntitlementBenefitGroupMembership[] {
  const coversEmployee = (coverageScope: BenefitGroup["coverageScope"]) =>
    coverageScope === "Employee" || coverageScope === "Both"
  const coversDependent = (coverageScope: BenefitGroup["coverageScope"]) =>
    coverageScope === "Dependent" || coverageScope === "Both"

  return entitlement.groups
    .filter((group) => {
      const coverageScope = group.coverageScope ?? "Employee"
      return row.beneficiaryType === "employee"
        ? coversEmployee(coverageScope)
        : coversDependent(coverageScope)
    })
    .map((group) => ({
      groupId: group.id,
      groupName: group.name,
      serviceNames: entitlement.benefits
        .filter((benefit) => benefit.groupId === group.id)
        .map((benefit) => getMainServiceName(benefit.serviceId)),
    }))
}

function sumAllocated(rows: BeneficiaryUsage[]) {
  return rows.reduce((sum, row) => sum + row.allocated, 0)
}

function sumSpent(rows: BeneficiaryUsage[]) {
  return rows.reduce((sum, row) => sum + row.spent, 0)
}

function buildServiceRows({
  employeeName,
  groupRows,
  kind,
  serviceRows,
}: {
  employeeName?: string
  groupRows: BeneficiaryUsage[]
  kind: EntitlementPoolKind
  serviceRows: BeneficiaryUsage[]
}) {
  const roster = new Map<
    string,
    { beneficiaryName?: string; relationship?: string }
  >()

  for (const row of groupRows) {
    if (!roster.has(row.beneficiaryId)) {
      roster.set(row.beneficiaryId, {
        beneficiaryName: row.beneficiaryName,
        relationship: row.relationship,
      })
    }
  }

  return Array.from(roster.entries())
    .map(([beneficiaryId, person]) => {
      const personRows = serviceRows.filter(
        (row) => row.beneficiaryId === beneficiaryId
      )
      const isEmployee = !person.relationship
      const allocated =
        !isEmployee && kind !== "individual" ? null : sumAllocated(personRows)
      const used = sumSpent(personRows)

      return {
        beneficiaryId,
        name: isEmployee
          ? (employeeName ?? "Employee")
          : (person.beneficiaryName ?? person.relationship ?? "Dependent"),
        relationship: relationshipLabel(person.relationship),
        beneficiaryType: isEmployee
          ? ("employee" as const)
          : ("dependent" as const),
        allocationType: kind,
        allocated,
        used,
        balance:
          allocated === null || kind === "combined"
            ? null
            : Math.max(allocated - used, 0),
        allocationLabel: !isEmployee ? allocationLabel(kind) : undefined,
        benefitGroups: [],
      }
    })
    .sort((a, b) => {
      if (a.beneficiaryType !== b.beneficiaryType) {
        return a.beneficiaryType === "employee" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
}

function sharedServiceAllocated(
  policy: BenefitPolicy,
  group: BenefitGroup,
  serviceRows: BeneficiaryUsage[]
) {
  const dependentAllocations = serviceRows
    .filter((row) => row.relationship)
    .map((row) => row.allocated)

  if (dependentAllocations.length > 0) {
    return Math.max(...dependentAllocations)
  }

  return group.dependentGroupCap ?? policy.dependentCapAmount ?? 0
}

function buildServiceSummary({
  group,
  groupRows,
  kind,
  policy,
  rows,
  serviceRows,
}: {
  group: BenefitGroup
  groupRows: BeneficiaryUsage[]
  kind: EntitlementPoolKind
  policy: BenefitPolicy
  rows: EntitlementAllocationRow[]
  serviceRows: BeneficiaryUsage[]
}): EntitlementSummary {
  const employeeRows = rows.filter((row) => row.beneficiaryType === "employee")
  const dependentRows = rows.filter(
    (row) => row.beneficiaryType === "dependent"
  )
  const employeeAllocated = employeeRows.reduce(
    (sum, row) => sum + (row.allocated ?? 0),
    0
  )
  const dependentAllocated =
    kind === "combined"
      ? 0
      : kind === "shared"
        ? sharedServiceAllocated(policy, group, serviceRows)
        : dependentRows.reduce((sum, row) => sum + (row.allocated ?? 0), 0)
  const employeeUsed = employeeRows.reduce((sum, row) => sum + row.used, 0)
  const dependentUsed = dependentRows.reduce((sum, row) => sum + row.used, 0)
  const allocated = employeeAllocated + dependentAllocated
  const used = employeeUsed + dependentUsed

  return {
    allocated,
    employeeAllocated,
    dependentAllocated,
    used,
    left: Math.max(allocated - used, 0),
    employeeUsed,
    dependentUsed,
    hasDependents: groupRows.some((row) => Boolean(row.relationship)),
  }
}

export function buildEntitlementServiceAllocation(
  entitlement: ResolvedEntitlement,
  groupId: string,
  benefitId: string,
  employeeName?: string
): EntitlementServiceAllocation {
  const group = entitlement.groups.find((candidate) => candidate.id === groupId)
  const benefit = entitlement.benefits.find(
    (candidate) => candidate.id === benefitId
  )
  const pool = entitlement.pools.find(
    (candidate) => candidate.group.id === groupId
  )
  const groupBenefitIds = new Set(
    entitlement.benefits
      .filter((candidate) => candidate.groupId === groupId)
      .map((candidate) => candidate.id)
  )
  const groupRows = entitlement.usage.filter((row) =>
    groupBenefitIds.has(row.benefitId)
  )
  const serviceRows = entitlement.usage.filter(
    (row) => row.benefitId === benefitId
  )
  const kind = pool?.display.kind ?? "employee"
  const rows = buildServiceRows({
    employeeName,
    groupRows,
    kind,
    serviceRows,
  })
  const summary = buildServiceSummary({
    group: group ?? {
      id: groupId,
      policyId: entitlement.policy.id,
      name: "Benefit Group",
      coverageScope: "Employee",
      distributionType: "IndividualBenefitAmount",
    },
    groupRows,
    kind,
    policy: entitlement.policy,
    rows,
    serviceRows,
  })

  return {
    benefitId,
    serviceId: benefit?.serviceId ?? "",
    kind,
    summary,
    rows: rows.map((row) =>
      row.beneficiaryType === "employee" && kind === "combined"
        ? { ...row, balance: summary.left }
        : row
    ),
  }
}

export function buildEntitlementAllocationDetail(
  entitlement: ResolvedEntitlement,
  scope: EntitlementAllocationScope,
  employeeName?: string
): EntitlementAllocationDetail {
  if (scope.type === "overall") {
    const { kind, rows } = buildOverallRows(entitlement, employeeName)
    return {
      scope,
      kind,
      summary: entitlement.summary,
      rows,
    }
  }

  const pool = entitlement.pools.find(
    (candidate) => candidate.group.id === scope.groupId
  )
  const rows = buildRowsFromUsage({
    rows: entitlement.usage.filter((row) => row.benefitId === scope.benefitId),
    kind: pool?.display.kind ?? "employee",
    employeeName,
  })
  const kind = pool?.display.kind ?? "employee"
  const summary = detailSummary(
    rows,
    kind,
    pool?.display.dependentAllocated,
    pool?.display.employeeAllocated
  )

  return {
    scope,
    kind,
    summary,
    rows: rows.map((row) =>
      row.beneficiaryType === "employee" && kind === "combined"
        ? { ...row, balance: summary.left }
        : row
    ),
  }
}

function buildSummary(
  policy: BenefitPolicy,
  groups: BenefitGroup[],
  pools: EntitlementGroupPool[],
  usage: BeneficiaryUsage[]
): EntitlementSummary {
  const employeeUsed = pools.reduce((sum, p) => sum + p.display.employeeUsed, 0)
  const dependentUsed = pools.reduce(
    (sum, p) => sum + p.display.dependentUsed,
    0
  )
  const hasDependents = pools.some((p) =>
    p.display.beneficiaries.some((b) => b.beneficiaryType === "dependent")
  )

  // Summed employee allocations are used only when the policy has no explicit
  // employee ceiling. Shared and combined group allocations must not become a
  // second copy of the policy-wide employee cap.
  const summedEmployeeAllocated = pools.reduce(
    (sum, p) => sum + p.display.employeeAllocated,
    0
  )

  // At policy scope `totalCapAmount` is the real ceiling — summing group
  // allocations over-reports whenever groups draw on one policy-wide pot.
  const employeeCeiling = policy.totalCapAmount ?? summedEmployeeAllocated

  // Independent dependent wallets are additional capacity. Shared dependent
  // pools have one policy-level ceiling; combined pools draw from the employee
  // ceiling and therefore add nothing here.
  const dependentCeiling =
    policy.dependentsPoolType === "Individual"
      ? getIndividualDependentPoolCeiling(policy, usage)
      : policy.dependentsPoolType === "Shared"
        ? getSharedDependentPoolCeiling(policy, groups, 0)
        : 0

  const allocated = employeeCeiling + dependentCeiling
  const used = employeeUsed + dependentUsed

  return {
    allocated,
    employeeAllocated: employeeCeiling,
    dependentAllocated: dependentCeiling,
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
    summary: buildSummary(policy, groups, pools, usage),
  }
}
