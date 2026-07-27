"use client"

import { useState } from "react"
import {
  ArrowClockwise,
  CaretDown,
  TreeStructure,
  User,
  UsersThree,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  StackedPoolBar,
  type PoolSegment,
} from "@/components/shared/stacked-pool-bar"
import {
  ContractSection,
  DataGrid,
  DataPoint,
  TechnicalBadge,
} from "@/components/host/policies/policy-datapoint-ui"
import {
  formatCopay,
  formatRM,
  getEffectiveRefresh,
  getGroupCap,
  hasDependentSide,
  hasEmployeeSide,
} from "@/components/host/policies/policy-datapoint-helpers"
import { getMainServiceIcon } from "@/components/host/policies/detail-tabs/policy-detail-helpers"
import {
  getMainServiceName,
  resolveMainServiceId,
} from "@/lib/mock-data/service-catalog"
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"
import type { BeneficiaryUsage } from "@/features/employees/types"
import {
  getEmployeeEntitlement,
  type AssignedPolicyEntitlement,
} from "./employee-entitlements-mock"

const EMP_FILL = "bg-primary"
const DEP_FILL = "bg-teal-500 dark:bg-teal-400"
const DEPENDENT_FILL_CLASSES = [
  "bg-teal-600 dark:bg-teal-400",
  "bg-teal-500 dark:bg-teal-400",
  "bg-teal-400 dark:bg-teal-500",
]
const OTHER_DEPENDENTS_FILL = "bg-teal-700 dark:bg-teal-300"

/** A single rendered pool bar for one benefit (employee, a dependent, or combined). */
interface PoolBar {
  key: string
  label: string
  icon: "employee" | "dependent" | "combined"
  allocated: number
  spent: number
  balance: number
  segments: PoolSegment[]
  details?: PoolDetailRow[]
}

/** Aggregated summary row across all benefits for one pool lane. */
interface PoolSummaryRow {
  key: string
  allocationGroup: string
  label: string
  icon: "employee" | "dependent" | "combined"
  totalAllocated: number
  totalSpent: number
  totalBalance: number
  segments: PoolSegment[]
  details?: PoolDetailRow[]
}

interface PoolDetailRow {
  key: string
  label: string
  relationshipLabel?: string
  allocated: number
  spent: number
  balance: number
}

function SummaryStat({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div className="min-w-0">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold text-foreground tabular-nums",
          compact ? "text-lead" : "text-heading"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function PoolStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[6rem]">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lead font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}

function getDependentFillClass(index: number) {
  return DEPENDENT_FILL_CLASSES[index] ?? OTHER_DEPENDENTS_FILL
}

function getUtilisationPercentage(allocated: number, spent: number) {
  return allocated > 0
    ? Math.min(Math.round((spent / allocated) * 100), 100)
    : 0
}

function buildDependentSegments(details: PoolDetailRow[]): PoolSegment[] {
  const visibleDetails = details.slice(0, 3)
  const otherDetails = details.slice(3)
  const segments = visibleDetails.map((detail, index) => ({
    label: detail.label,
    spent: detail.spent,
    className: getDependentFillClass(index),
  }))

  if (otherDetails.length) {
    segments.push({
      label: "Others",
      spent: otherDetails.reduce((sum, detail) => sum + detail.spent, 0),
      className: OTHER_DEPENDENTS_FILL,
    })
  }

  return segments.filter((segment) => segment.spent > 0)
}

function buildSharedSegments(
  employeeSpent: number,
  dependentSpent: number,
  primary: "employee" | "dependent" = "employee"
) {
  const orderedEntries =
    primary === "employee"
      ? [
          { label: "Employee", spent: employeeSpent, className: EMP_FILL },
          { label: "Dependents", spent: dependentSpent, className: DEP_FILL },
        ]
      : [
          { label: "Dependents", spent: dependentSpent, className: DEP_FILL },
          { label: "Employee", spent: employeeSpent, className: EMP_FILL },
        ]

  return orderedEntries.filter((segment) => segment.spent > 0)
}

function SummaryLegend({
  allocated,
  segments,
  compact = false,
}: {
  allocated: number
  segments: PoolSegment[]
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center",
        compact ? "gap-x-4 gap-y-1" : "gap-x-6 gap-y-2"
      )}
    >
      {segments.map((segment, index) => {
        const pct =
          allocated > 0
            ? Math.min(Math.round((segment.spent / allocated) * 100), 100)
            : 0
        return (
          <div
            key={index}
            className={cn(
              "flex items-center text-muted-foreground",
              compact ? "gap-1.5 text-micro" : "gap-2 text-label"
            )}
          >
            <span
              className={cn(
                "rounded-full",
                compact ? "h-2 w-2" : "h-2.5 w-2.5",
                segment.className
              )}
            />
            <span>{segment.label}</span>
            <span className="text-foreground tabular-nums">
              {formatRM(segment.spent)} ({pct}%)
            </span>
          </div>
        )
      })}
    </div>
  )
}

function buildAllocationSummarySegments(rows: PoolSummaryRow[]) {
  const employeeSpent = rows
    .filter((row) => row.icon === "employee")
    .reduce((sum, row) => sum + row.totalSpent, 0)
  const dependentSpent = rows
    .filter((row) => row.icon === "dependent")
    .reduce((sum, row) => sum + row.totalSpent, 0)

  return [
    { label: "Employee", spent: employeeSpent, className: EMP_FILL },
    { label: "Dependents Combined", spent: dependentSpent, className: DEP_FILL },
  ].filter((segment) => segment.spent > 0)
}

function PoolIdentity({
  icon,
  label,
  tone,
  subtitle,
}: {
  icon: PoolBar["icon"] | PoolSummaryRow["icon"]
  label: string
  tone?: string
  subtitle: string
}) {
  const toneDescription = getPoolToneDescription(tone)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-4xl border border-border bg-muted/30">
        <PoolIcon icon={icon} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-lead font-semibold text-foreground">
            {label}
          </p>
          {tone ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <span className="rounded-4xl border border-primary/15 bg-primary/8 px-2 py-0.5 text-label font-medium text-primary">
                  {tone}
                </span>
              </TooltipTrigger>
              {toneDescription ? (
                <TooltipContent
                  side="top"
                  className="max-w-[240px] text-label text-muted-foreground"
                >
                  {toneDescription}
                </TooltipContent>
              ) : null}
            </Tooltip>
          ) : null}
        </div>
        {subtitle && subtitle !== label ? (
          <p className="mt-0.5 text-label text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

function PoolIcon({
  icon,
}: {
  icon: PoolBar["icon"] | PoolSummaryRow["icon"]
}) {
  if (icon === "combined") {
    return (
      <UsersThree size={14} weight="fill" className="text-muted-foreground" />
    )
  }
  if (icon === "dependent") {
    return <User size={14} weight="fill" className="text-teal-500" />
  }
  return <User size={14} weight="fill" className="text-primary" />
}

function getPoolToneDescription(tone?: string) {
  switch (tone) {
    case "Individual":
      return "Each beneficiary allocation is tracked separately and is not shared with other covered members."
    case "Shared":
      return "All covered dependents draw from the same dependent allocation."
    case "Combined":
      return "The employee and covered dependents share one allocation limit."
    default:
      return null
  }
}

function buildDependentDetails(rows: BeneficiaryUsage[]): PoolDetailRow[] {
  const detailMap = new Map<string, PoolDetailRow>()

  for (const row of rows) {
    const key = row.beneficiaryId
    const existing = detailMap.get(key)
    if (!existing) {
      detailMap.set(key, {
        key,
        label: row.beneficiaryName ?? row.relationship ?? "Dependent",
        relationshipLabel: row.relationship,
        allocated: row.allocated,
        spent: row.spent,
        balance: row.balance,
      })
      continue
    }

    existing.allocated += row.allocated
    existing.spent += row.spent
    existing.balance += row.balance
  }

  return Array.from(detailMap.values())
}

function mergeDetailRows(...detailGroups: Array<PoolDetailRow[] | undefined>) {
  const merged = new Map<string, PoolDetailRow>()

  for (const group of detailGroups) {
    for (const detail of group ?? []) {
      const existing = merged.get(detail.key)
      if (!existing) {
        merged.set(detail.key, { ...detail })
        continue
      }

      existing.allocated += detail.allocated
      existing.spent += detail.spent
      existing.balance += detail.balance
    }
  }

  return Array.from(merged.values())
}

function toCoverageKey(relationship?: string) {
  return relationship?.trim().toLowerCase()
}

function getIndividualDependentCapMap(policy: BenefitPolicy) {
  const caps = new Map<string, number>()

  for (const coverage of policy.dependentCoverages ?? []) {
    const key = toCoverageKey(coverage.type)
    if (!key || typeof coverage.capAmount !== "number") {
      continue
    }

    caps.set(key, coverage.capAmount)
  }

  return caps
}

function getSharedDependentPoolAllocated(
  policy: BenefitPolicy,
  groups: BenefitGroup[],
  fallback: number
) {
  const groupCap = groups.reduce(
    (sum, group) => sum + (group.dependentGroupCap ?? 0),
    0
  )

  if (typeof policy.dependentCapAmount === "number") {
    return policy.dependentCapAmount
  }

  if (groupCap > 0) {
    return groupCap
  }

  return fallback
}

function normaliseSummaryRows(
  entitlement: AssignedPolicyEntitlement,
  rows: PoolSummaryRow[],
  applyPolicyCaps = true
) {
  const employeeSpent = entitlement.usage
    .filter((row) => !row.relationship)
    .reduce((sum, row) => sum + row.spent, 0)
  const dependentSpent = entitlement.usage
    .filter((row) => row.relationship)
    .reduce((sum, row) => sum + row.spent, 0)
  const dependentCaps = getIndividualDependentCapMap(entitlement.policy)

  return rows.map((row) => {
    if (row.allocationGroup === "combined") {
      const allocated = applyPolicyCaps
        ? (entitlement.policy.totalCapAmount ?? row.totalAllocated)
        : row.totalAllocated
      const sharedBalance = Math.max(
        allocated - (employeeSpent + dependentSpent),
        0
      )
      const isDependentRow = row.key === "combined-dep"

      return {
        ...row,
        totalAllocated: allocated,
        totalSpent: isDependentRow ? dependentSpent : employeeSpent,
        totalBalance: sharedBalance,
        label: isDependentRow ? "Dependents" : "Employee",
        segments: buildSharedSegments(
          employeeSpent,
          dependentSpent,
          isDependentRow ? "dependent" : "employee"
        ),
      }
    }

    if (row.key === "emp") {
      const allocated = applyPolicyCaps
        ? (entitlement.policy.totalCapAmount ?? row.totalAllocated)
        : row.totalAllocated

      return {
        ...row,
        totalAllocated: allocated,
        totalSpent: employeeSpent,
        totalBalance: Math.max(allocated - employeeSpent, 0),
      }
    }

    if (row.key === "dep-shared") {
      const allocated = getSharedDependentPoolAllocated(
        entitlement.policy,
        entitlement.groups,
        row.totalAllocated
      )

      return {
        ...row,
        totalAllocated: allocated,
        totalBalance: Math.max(allocated - row.totalSpent, 0),
        segments: buildSharedSegments(0, row.totalSpent, "dependent"),
      }
    }

    if (row.key === "dep-individual") {
      const details = applyPolicyCaps
        ? row.details?.map((detail) => {
            const relationshipKey = toCoverageKey(detail.relationshipLabel)
            const cap = relationshipKey ? dependentCaps.get(relationshipKey) : undefined
            const allocated = typeof cap === "number"
              ? Math.min(detail.allocated, cap)
              : detail.allocated
            return {
              ...detail,
              allocated,
              balance: Math.max(allocated - detail.spent, 0),
            }
          })
        : row.details
      const totalAllocated =
        details?.reduce((sum, detail) => sum + detail.allocated, 0) ??
        row.totalAllocated

      return {
        ...row,
        totalAllocated,
        totalBalance: Math.max(totalAllocated - row.totalSpent, 0),
        details,
        label: "Dependents",
      }
    }

    return row
  })
}

/** Roll up all benefit usage into one PoolSummaryRow per pool lane.
 *  Mirrors buildBenefitBars gating logic so numbers always match the bars below. */
function buildSummaryRows(
  entitlement: AssignedPolicyEntitlement,
  applyPolicyCaps = true
): PoolSummaryRow[] {
  const { policy, groups, benefits, usage } = entitlement
  const poolType = policy.dependentsPoolType
  const depsCovered = (policy.dependentCoverages?.length ?? 0) > 0

  const rowMap = new Map<string, PoolSummaryRow>()
  const combinedDetails = new Map<string, PoolDetailRow>()

  for (const group of groups) {
    const scope = group.coverageScope ?? "Employee"
    const groupBenefits = benefits.filter((b) => b.groupId === group.id)

    for (const benefit of groupBenefits) {
      const rows = usage.filter((u) => u.benefitId === benefit.id)
      const emp = rows.find((u) => !u.relationship)
      const deps = rows.filter((u) => u.relationship)
      const showDeps = depsCovered && hasDependentSide(scope) && deps.length > 0
      const isCombined =
        poolType === "SharedWithEmployee" || policy.benefitPoolType === "Shared"

      if (isCombined && emp) {
        const existingEmployee = rowMap.get("combined-emp")
        if (!existingEmployee) {
          rowMap.set("combined-emp", {
            key: "combined-emp",
            allocationGroup: "combined",
            label: "Employee",
            icon: "employee",
            totalAllocated: emp.allocated,
            totalSpent: emp.spent,
            totalBalance: 0,
            segments: [
              { label: "Employee", spent: emp.spent, className: EMP_FILL },
            ],
          })
        } else {
          existingEmployee.totalAllocated += emp.allocated
          existingEmployee.totalSpent += emp.spent
          existingEmployee.segments[0].spent += emp.spent
        }
        if (showDeps) {
          const depSpent = deps.reduce((s, d) => s + d.spent, 0)
          const dependentDetails = buildDependentDetails(deps)
          const existingDependent = rowMap.get("combined-dep")
          if (!existingDependent) {
            rowMap.set("combined-dep", {
              key: "combined-dep",
              allocationGroup: "combined",
              label: "Dependents",
              icon: "dependent",
              totalAllocated: emp.allocated,
              totalSpent: depSpent,
              totalBalance: 0,
              segments: [
                { label: "Dependents", spent: depSpent, className: DEP_FILL },
              ],
              details: dependentDetails,
            })
          } else {
            existingDependent.totalAllocated += emp.allocated
            existingDependent.totalSpent += depSpent
            existingDependent.segments[0].spent += depSpent
            existingDependent.details = mergeDetailRows(
              existingDependent.details,
              dependentDetails
            )
            existingDependent.label = "Dependents"
          }
          for (const dep of deps) {
            const existing = combinedDetails.get(dep.beneficiaryId)
            if (!existing) {
              combinedDetails.set(dep.beneficiaryId, {
                key: dep.beneficiaryId,
                label: dep.beneficiaryName ?? dep.relationship ?? "Dependent",
                relationshipLabel: dep.relationship,
                allocated: dep.allocated,
                spent: dep.spent,
                balance: dep.balance,
              })
              continue
            }

            existing.allocated += dep.allocated
            existing.spent += dep.spent
            existing.balance += dep.balance
          }
        }
      } else {
        if (hasEmployeeSide(scope) && emp) {
          const existing = rowMap.get("emp")
          if (!existing) {
            rowMap.set("emp", {
              key: "emp",
              allocationGroup: "emp",
              label: "Employee",
              icon: "employee",
              totalAllocated: emp.allocated,
              totalSpent: emp.spent,
              totalBalance: emp.balance,
              segments: [
                { label: "Employee", spent: emp.spent, className: EMP_FILL },
              ],
            })
          } else {
            existing.totalAllocated += emp.allocated
            existing.totalSpent += emp.spent
            existing.totalBalance += emp.balance
            existing.segments[0].spent += emp.spent
          }
        }

        if (showDeps) {
          if (poolType === "Shared") {
            const depSpent = deps.reduce((s, d) => s + d.spent, 0)
            const depAlloc = deps[0]?.allocated ?? 0
            const existing = rowMap.get("dep-shared")
            if (!existing) {
              rowMap.set("dep-shared", {
                key: "dep-shared",
                allocationGroup: "dep-shared",
                label: "Dependents",
                icon: "dependent",
                totalAllocated: depAlloc,
                totalSpent: depSpent,
                totalBalance: Math.max(depAlloc - depSpent, 0),
                segments: [
                  { label: "Dependents", spent: depSpent, className: DEP_FILL },
                ],
                details: buildDependentDetails(deps),
              })
            } else {
              existing.totalAllocated += depAlloc
              existing.totalSpent += depSpent
              existing.totalBalance = Math.max(
                existing.totalAllocated - existing.totalSpent,
                0
              )
              existing.segments[0].spent += depSpent
              existing.details = mergeDetailRows(
                existing.details,
                buildDependentDetails(deps)
              )
            }
          } else {
            const depSpent = deps.reduce((s, d) => s + d.spent, 0)
            const depAllocated = deps.reduce((s, d) => s + d.allocated, 0)
            const depBalance = deps.reduce((s, d) => s + d.balance, 0)
            const existing = rowMap.get("dep-individual")
            if (!existing) {
              rowMap.set("dep-individual", {
                key: "dep-individual",
                allocationGroup: "dep-individual",
                label: "Dependents",
                icon: "dependent",
                totalAllocated: depAllocated,
                totalSpent: depSpent,
                totalBalance: depBalance,
                segments: [
                  { label: "Dependents", spent: depSpent, className: DEP_FILL },
                ],
                details: buildDependentDetails(deps),
              })
            } else {
              existing.totalAllocated += depAllocated
              existing.totalSpent += depSpent
              existing.totalBalance += depBalance
              existing.segments[0].spent += depSpent
              existing.details = mergeDetailRows(
                existing.details,
                buildDependentDetails(deps)
              )
              existing.label = "Dependents"
            }
          }
        }
      }
    }
  }

  const combinedDependents = rowMap.get("combined-dep")
  if (combinedDependents) {
    combinedDependents.details = Array.from(combinedDetails.values())
    combinedDependents.label = "Dependents"
  }

  return normaliseSummaryRows(
    entitlement,
    Array.from(rowMap.values()),
    applyPolicyCaps
  )
}

function PoolSummaryRows({
  rows,
  testId,
}: {
  rows: PoolSummaryRow[]
  testId?: string
}) {
  return (
    <div className="space-y-3" data-testid={testId}>
      <div className="grid grid-cols-4 pb-2.5 text-body font-semibold text-muted-foreground border-b border-border/60">
        <span>Beneficiary Name</span>
        <span>Allocated Quota</span>
        <span>Spent</span>
        <span className="text-right">Balance Left</span>
      </div>
      <div className="divide-y divide-border/40 text-body">
        {rows.map((row) => (
          <div key={row.key} className="py-3 space-y-2">
            <div className="grid grid-cols-4 items-center">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                  {row.icon === "employee" ? (
                    <User size={14} weight="bold" />
                  ) : (
                    <UsersThree size={14} weight="bold" />
                  )}
                </span>
                <span className="font-semibold text-foreground">{row.label}</span>
              </div>
              <span className="text-foreground font-medium">
                {row.allocationGroup === "combined" ? "Combined Pool" : formatRM(row.totalAllocated)}
              </span>
              <span className="text-foreground font-medium">{formatRM(row.totalSpent)}</span>
              <span className="text-right font-semibold text-primary">
                {row.allocationGroup === "combined" ? "Shared" : formatRM(row.totalBalance)}
              </span>
            </div>
            {row.details && row.details.length > 0 && (
              <div className="pl-9 pt-1.5 space-y-2">
                {row.details.map((dep, dIdx) => {
                  const isIndividual = row.allocationGroup === "dep-individual"
                  return (
                    <div key={dIdx} className="grid grid-cols-4 items-center text-body text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/30">
                          <User size={12} />
                        </span>
                        <span>{dep.label} ({dep.relationshipLabel})</span>
                      </div>
                      <span>{isIndividual ? formatRM(dep.allocated) : "—"}</span>
                      <span>{formatRM(dep.spent)}</span>
                      <span className={isIndividual ? "text-right font-medium text-foreground" : "text-right font-medium text-primary"}>
                        {isIndividual ? formatRM(dep.balance) : "—"}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function OverallSummaryCard({ rows }: { rows: PoolSummaryRow[] }) {
  const totalSpent = rows.reduce((s, r) => s + r.totalSpent, 0)
  const allocationGroups = new Map<
    string,
    { allocated: number; balance: number }
  >()
  for (const row of rows) {
    const existing = allocationGroups.get(row.allocationGroup)
    if (!existing) {
      allocationGroups.set(row.allocationGroup, {
        allocated: row.totalAllocated,
        balance: row.totalBalance,
      })
      continue
    }

    allocationGroups.set(row.allocationGroup, {
      allocated: Math.max(existing.allocated, row.totalAllocated),
      balance: Math.max(existing.balance, row.totalBalance),
    })
  }
  const totalAllocated = Array.from(allocationGroups.values()).reduce(
    (sum, group) => sum + group.allocated,
    0
  )
  const totalBalance = Array.from(allocationGroups.values()).reduce(
    (sum, group) => sum + group.balance,
    0
  )

  const segments = buildAllocationSummarySegments(rows)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-5 space-y-5">
        <div>
          <h3 className="text-heading font-semibold text-foreground">
            Allocation Summary
          </h3>
          <p className="text-body text-muted-foreground mt-0.5">
            Individual allocations and real-time usage per person
          </p>
        </div>

        {/* Totals & Progress Bar in Same Row */}
        <div className="grid gap-6 border-t border-border/40 pt-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div className="grid grid-cols-3 gap-4">
            <SummaryStat
              label="Total Allocated"
              value={formatRM(totalAllocated)}
            />
            <SummaryStat
              label="Total Used"
              value={formatRM(totalSpent)}
            />
            <SummaryStat
              label="Total Balance Left"
              value={formatRM(totalBalance)}
            />
          </div>

          {/* 2-Tone Purple (Emp) & Teal (Deps) Stacked Progress Bar */}
          <div className="space-y-2">
            <StackedPoolBar
              allocated={totalAllocated}
              segments={segments}
              showLegend={false}
            />
            <SummaryLegend
              allocated={totalAllocated}
              segments={segments}
            />
          </div>
        </div>

        {/* Collapsible Accordion Person Table */}
        <Collapsible defaultOpen className="-mx-5 mt-4 -mb-5 border-t border-border bg-muted/10">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="group flex h-auto w-full items-center justify-between rounded-none px-5 py-3.5 text-body font-semibold text-foreground hover:bg-muted/30"
            >
              <span>Breakdown</span>
              <CaretDown
                size={16}
                className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border p-5 space-y-3">
              <div className="grid grid-cols-4 pb-2.5 text-body font-semibold text-muted-foreground border-b border-border/60">
                <span>Beneficiary Name</span>
                <span>Allocated Quota</span>
                <span>Spent</span>
                <span className="text-right">Balance Left</span>
              </div>
              <div className="divide-y divide-border/40 text-body">
                {rows.map((row) => (
                  <div key={row.key} className="py-3 space-y-2">
                    <div className="grid grid-cols-4 items-center">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                          {row.icon === "employee" ? (
                            <User size={14} weight="bold" />
                          ) : (
                            <UsersThree size={14} weight="bold" />
                          )}
                        </span>
                        <span className="font-semibold text-foreground">{row.label}</span>
                      </div>
                      <span className="text-foreground font-medium">
                        {row.allocationGroup === "combined" ? "Combined Pool" : formatRM(row.totalAllocated)}
                      </span>
                      <span className="text-foreground font-medium">{formatRM(row.totalSpent)}</span>
                      <span className="text-right font-semibold text-primary">
                        {row.allocationGroup === "combined" ? "Shared" : formatRM(row.totalBalance)}
                      </span>
                    </div>
                    {row.details && row.details.length > 0 && (
                      <div className="pl-9 pt-1.5 space-y-2">
                        {row.details.map((dep, dIdx) => (
                          <div key={dIdx} className="grid grid-cols-4 items-center text-body text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/30">
                                <User size={12} />
                              </span>
                              <span>{dep.label} ({dep.relationshipLabel})</span>
                            </div>
                            <span>—</span>
                            <span>{formatRM(dep.spent)}</span>
                            <span className="text-right font-medium text-primary">—</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

function SummaryDependentBreakdown({ row }: { row: PoolSummaryRow }) {
  const details = row.details ?? []
  const isIndividual = row.allocationGroup === "dep-individual"
  const visibleDetails = details

  if (!details.length) return null

  return (
    <div
      className="border-t border-border px-4 pt-4 pb-4"
      data-testid={`entitlement-summary-dependent-breakdown-${row.key}`}
    >
      <div className="mb-2">
        <p className="text-body font-semibold text-foreground">
          {isIndividual ? "Dependent Allocations" : "Dependent Breakdown"}
        </p>
      </div>
      <div
        className={cn(
          "hidden gap-4 border-b border-border pb-3 text-label font-medium text-muted-foreground md:grid",
          isIndividual
            ? "grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,1.2fr)]"
            : "grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,1.2fr)]"
        )}
      >
        <span>Beneficiary</span>
        <span>Relationship</span>
        {isIndividual ? <span>Allocated</span> : null}
        <span>Used</span>
        {isIndividual ? <span>Left</span> : null}
        <span>Utilisation</span>
      </div>
      <div className="divide-y divide-border">
        {visibleDetails.map((detail) => (
          <div
            key={detail.key}
            className={cn(
              "grid gap-x-4 gap-y-2 py-3 text-body md:items-center",
              isIndividual
                ? "md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,1.2fr)]"
                : "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,1.2fr)]"
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {detail.label}
              </p>
            </div>
            <div>
              <p className="text-label text-muted-foreground md:hidden">
                Relationship
              </p>
              <span className="text-foreground">
                {detail.relationshipLabel}
              </span>
            </div>
            {isIndividual ? (
              <div>
                <p className="text-label text-muted-foreground md:hidden">
                  Allocated
                </p>
                <span className="text-foreground tabular-nums">
                  {formatRM(detail.allocated)}
                </span>
              </div>
            ) : null}
            <div>
              <p className="text-label text-muted-foreground md:hidden">Used</p>
              <span className="text-foreground tabular-nums">
                {formatRM(detail.spent)}
              </span>
            </div>
            {isIndividual ? (
              <div>
                <p className="text-label text-muted-foreground md:hidden">
                  Left
                </p>
                <span className="text-foreground tabular-nums">
                  {formatRM(detail.balance)}
                </span>
              </div>
            ) : null}
            <div>
              <p className="text-label text-muted-foreground md:hidden">
                Utilisation
              </p>
              <span className="text-foreground tabular-nums">
                {getUtilisationPercentage(
                  isIndividual ? detail.allocated : row.totalAllocated,
                  detail.spent
                )}
                %
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Build the pool bar(s) for one benefit, applying coverageScope (which sides show)
 *  and the policy's dependentsPoolType (how the dependent side aggregates). */
function buildBenefitBars(
  policy: BenefitPolicy,
  group: BenefitGroup,
  benefit: Benefit,
  usage: BeneficiaryUsage[]
): PoolBar[] {
  const scope = group.coverageScope ?? "Employee"
  const rows = usage.filter((u) => u.benefitId === benefit.id)
  const emp = rows.find((u) => !u.relationship)
  const deps = rows.filter((u) => u.relationship)
  const depsCovered = (policy.dependentCoverages?.length ?? 0) > 0
  const showDeps = depsCovered && hasDependentSide(scope) && deps.length > 0
  const poolType = policy.dependentsPoolType
  const bars: PoolBar[] = []

  const isCombined =
    poolType === "SharedWithEmployee" || policy.benefitPoolType === "Shared"

  // Combined pool — employee + dependents share one ceiling
  if (
    hasEmployeeSide(scope) &&
    showDeps &&
    isCombined &&
    emp
  ) {
    const depSpent = deps.reduce((s, d) => s + d.spent, 0)
    const sharedBalance = Math.max(emp.allocated - (emp.spent + depSpent), 0)
    const details = buildDependentDetails(deps)
    bars.push({
      key: `${benefit.id}-combined-emp`,
      label: "Employee",
      icon: "employee",
      allocated: emp.allocated,
      spent: emp.spent,
      balance: sharedBalance,
      segments: buildSharedSegments(emp.spent, depSpent, "employee"),
    })
    bars.push({
      key: `${benefit.id}-combined-dep`,
      label: "Dependents",
      icon: "dependent",
      allocated: emp.allocated,
      spent: depSpent,
      balance: sharedBalance,
      segments: buildSharedSegments(emp.spent, depSpent, "dependent"),
      details,
    })
    return bars
  }

  // Employee bar
  if (hasEmployeeSide(scope) && emp) {
    bars.push({
      key: `${benefit.id}-emp`,
      label: "Employee",
      icon: "employee",
      allocated: emp.allocated,
      spent: emp.spent,
      balance: emp.balance,
      segments: [{ label: "Employee", spent: emp.spent, className: EMP_FILL }],
    })
  }

  // Dependent side
  if (showDeps) {
    if (poolType === "Shared") {
      const spent = deps.reduce((s, d) => s + d.spent, 0)
      const allocated = deps[0]?.allocated ?? 0
      bars.push({
        key: `${benefit.id}-dep-shared`,
        label: "Dependents",
        icon: "dependent",
        allocated,
        spent,
        balance: Math.max(allocated - spent, 0),
        segments: buildSharedSegments(0, spent, "dependent"),
        details: buildDependentDetails(deps),
      })
    } else {
      const details = buildDependentDetails(deps)
      const allocated = deps.reduce((sum, dep) => sum + dep.allocated, 0)
      const spent = deps.reduce((sum, dep) => sum + dep.spent, 0)
      const balance = deps.reduce((sum, dep) => sum + dep.balance, 0)
      bars.push({
        key: `${benefit.id}-deps-individual`,
        label: "Dependents",
        icon: "dependent",
        allocated,
        spent,
        balance,
        segments: [{ label: "Dependents", spent, className: DEP_FILL }],
        details,
      })
    }
  }

  return bars
}

function BenefitRow({
  policy,
  group,
  benefit,
  usage,
}: {
  policy: BenefitPolicy
  group: BenefitGroup
  benefit: Benefit
  usage: BeneficiaryUsage[]
}) {
  const rows = buildBenefitBars(policy, group, benefit, usage).map((bar) => ({
    key: bar.key,
    allocationGroup: bar.key.includes("combined")
      ? "combined"
      : bar.key.endsWith("-deps-individual")
        ? "dep-individual"
        : bar.key.endsWith("-dep-shared")
          ? "dep-shared"
          : `${benefit.id}-employee`,
    label: bar.label,
    icon: bar.icon,
    totalAllocated: bar.allocated,
    totalSpent: bar.spent,
    totalBalance: bar.balance,
    segments: bar.segments,
    details: bar.details,
  }))

  // Calculate remaining balance at the benefit level
  const totalAllocatedForBenefit = rows.reduce((sum, r) => sum + r.totalAllocated, 0)
  const totalSpentForBenefit = rows.reduce((sum, r) => sum + r.totalSpent, 0)
  // For combined/shared family pots, the allocation in rows is duplicated across employee and dependent rows,
  // so we check if the benefit uses a combined pool and resolve the correct balance from the employee usage details.
  const remainingForBenefit = (() => {
    const isCombinedPool = policy.dependentsPoolType === "SharedWithEmployee" || policy.benefitPoolType === "Shared"
    if (isCombinedPool) {
      const empRow = rows.find((r) => r.icon === "employee")
      return empRow ? empRow.totalBalance : Math.max(totalAllocatedForBenefit - totalSpentForBenefit, 0)
    }
    return Math.max(totalAllocatedForBenefit - totalSpentForBenefit, 0)
  })()

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button className="group flex w-full min-w-0 items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/30">
          <span className="shrink-0">
            {getMainServiceIcon(benefit.serviceId)}
          </span>
          <span className="truncate text-body font-semibold text-foreground">
            {getMainServiceName(benefit.serviceId)}
          </span>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <span className="text-body font-semibold text-primary">
              {formatRM(remainingForBenefit)} left
            </span>
            <TechnicalBadge>
              {resolveMainServiceId(benefit.serviceId)}
            </TechnicalBadge>
          </div>
          <CaretDown
            size={12}
            weight="bold"
            className="ml-1 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-border bg-muted/10 px-4 py-3">
          <PoolSummaryRows
            rows={rows}
            testId={`entitlement-benefit-summary-${benefit.id}`}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function GroupCard({
  entitlement,
  group,
}: {
  entitlement: AssignedPolicyEntitlement
  group: BenefitGroup
}) {
  const { policy, benefits, usage } = entitlement
  const scope = group.coverageScope ?? "Employee"
  const depsCovered = (policy.dependentCoverages?.length ?? 0) > 0
  const groupBenefits = benefits.filter((b) => b.groupId === group.id)

  const distribution =
    group.distributionType === "SharedAmount"
      ? "Shared Amount"
      : "Individual Amount"
  const meta = [
    scope,
    distribution,
    group.isTaxable ? "Taxable" : "Not Taxable",
  ].join(" · ")

  const empCap = getGroupCap(group, "employee")
  const depCap = getGroupCap(group, "dependent")

  return (
    <ContractSection
      title={group.name}
      description={meta}
      icon={<TreeStructure size={18} weight="duotone" />}
    >
      <div className="space-y-5">
        <div>
          <p className="mb-3 text-label font-semibold text-muted-foreground">
            Benefit Usage
          </p>
          {groupBenefits.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 py-6 text-center text-label text-faint">
              No benefits configured for this group.
            </p>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {groupBenefits.map((benefit) => (
                <BenefitRow
                  key={benefit.id}
                  policy={policy}
                  group={group}
                  benefit={benefit}
                  usage={usage}
                />
              ))}
            </div>
          )}
        </div>

        <Collapsible className="-mx-4 -mb-4 border-t border-border bg-muted/20">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="group flex h-auto w-full items-center justify-between rounded-none px-4 py-3 text-label font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <span className="flex items-start gap-2">
                <TreeStructure size={14} weight="duotone" className="mt-0.5" />
                <span>Benefit Group Details</span>
              </span>
              <CaretDown
                size={14}
                className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border px-4 pt-4 pb-4">
              <DataGrid>
                {hasEmployeeSide(scope) && (
                  <DataPoint
                    label="Employee Cap"
                    value={empCap.value}
                    helper={empCap.helper}
                  />
                )}
                {depsCovered && hasDependentSide(scope) && (
                  <DataPoint
                    label="Dependent Cap"
                    value={depCap.value}
                    helper={depCap.helper}
                  />
                )}
                <DataPoint
                  label="Co-pay"
                  value={formatCopay(group.coPayment)}
                />
                <DataPoint
                  label="Refresh"
                  value={`${getEffectiveRefresh(policy, group)} Refresh`}
                />
              </DataGrid>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ContractSection>
  )
}

interface EmployeeEntitlementsTabProps {
  employeeId: string
}

export function EmployeeEntitlementsTab({
  employeeId,
}: EmployeeEntitlementsTabProps) {
  const entitlement = getEmployeeEntitlement(employeeId)

  const summaryRows = buildSummaryRows(entitlement)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title font-semibold text-foreground">Usage</h2>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-medium">
          <ArrowClockwise size={14} weight="bold" />
          Refresh All
        </Button>
      </div>

      {/* Summary — overall card with collapsible pool breakdown */}
      <OverallSummaryCard rows={summaryRows} />

      {/* Benefit group cards for the employee's assigned policy */}
      <div className="space-y-4">
        {entitlement.groups.map((group) => (
          <GroupCard key={group.id} entitlement={entitlement} group={group} />
        ))}
      </div>
    </div>
  )
}
