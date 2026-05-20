"use client"

import { useMemo } from "react"
import { DetailField } from "@/components/shared/detail-field"
import { cn } from "@/lib/utils"
import type {
  Benefit,
  BenefitGroup,
  BenefitGroupCoverageScope,
  BenefitPolicy,
  RefreshCycle,
  UtilisationMode,
} from "@/types/policy"

function formatRM(amount: number | undefined): string {
  const value = typeof amount === "number" ? amount : 0
  return `RM ${value.toFixed(2)}`
}

function allocationLabel(
  group: BenefitGroup,
  policy: Partial<Pick<BenefitPolicy, "utilisationMode" | "prorateUnit">>
): string {
  const hasOverride = Boolean(group.utilisationMode)
  const fallbackMode: UtilisationMode = "Fixed"
  const effectiveMode =
    group.utilisationMode ?? policy.utilisationMode ?? fallbackMode
  if (effectiveMode === "Prorated") {
    const unit = group.prorateUnit ?? policy.prorateUnit ?? "Monthly"
    return `${hasOverride ? "Override" : "Inherit"} · Prorated · ${unit}`
  }
  return `${hasOverride ? "Override" : "Inherit"} · Fixed`
}

function refreshLabel(
  group: BenefitGroup,
  policy: Partial<Pick<BenefitPolicy, "refreshCycle">>
): string {
  const fallbackRefresh: RefreshCycle = "Yearly"
  return group.refreshCycle
    ? `Override · ${group.refreshCycle}`
    : `Inherit · ${policy.refreshCycle ?? fallbackRefresh}`
}

function poolShapeLabel(group: BenefitGroup): string {
  return group.distributionType === "SharedAmount"
    ? "Shared Pool"
    : "Per Benefit"
}

function budgetLabel(group: BenefitGroup): string {
  const coverageScope: BenefitGroupCoverageScope =
    group.coverageScope ?? "Employee"
  if (group.distributionType !== "SharedAmount") return "Per Service Amounts"
  if (coverageScope === "Both") {
    return `${formatRM(group.maxUsagePerCycle)} / ${formatRM(group.dependentGroupCap)}`
  }
  if (coverageScope === "Dependent") return formatRM(group.dependentGroupCap)
  return formatRM(group.maxUsagePerCycle)
}

function coPaySummary(group: BenefitGroup, benefits: Benefit[]): string {
  const scope: BenefitGroupCoverageScope = group.coverageScope ?? "Employee"

  if (group.distributionType === "SharedAmount") {
    const employeeRequired =
      scope !== "Dependent" && (group.coPayment?.required ?? false)
    const dependentRequired =
      scope !== "Employee" && (group.dependentCoPayment?.required ?? false)
    const count = (employeeRequired ? 1 : 0) + (dependentRequired ? 1 : 0)
    return count === 0
      ? "No Co-pay"
      : `${count} Side${count === 1 ? "" : "s"} Require Co-pay`
  }

  const requiredCount = benefits.reduce((acc, b) => {
    const emp = scope !== "Dependent" && (b.coPayment?.required ?? false)
    const dep =
      scope !== "Employee" && (b.dependentCoPayment?.required ?? false)
    return acc + (emp || dep ? 1 : 0)
  }, 0)

  if (requiredCount === 0) return "No Co-pay"
  return `${requiredCount} Service${requiredCount === 1 ? "" : "s"} Require Co-pay`
}

export function BenefitGroupSnapshot({
  policy,
  group,
  benefits,
  className,
}: {
  policy: Partial<
    Pick<BenefitPolicy, "utilisationMode" | "prorateUnit" | "refreshCycle">
  >
  group: BenefitGroup
  benefits: Benefit[]
  className?: string
}) {
  const tiles = useMemo(() => {
    const covers: BenefitGroupCoverageScope = group.coverageScope ?? "Employee"

    return [
      { label: "Covers", value: covers },
      { label: "Pool Shape", value: poolShapeLabel(group) },
      { label: "Budget / Cap", value: budgetLabel(group) },
      { label: "Allocation", value: allocationLabel(group, policy) },
      { label: "Refresh", value: refreshLabel(group, policy) },
      {
        label: "Services",
        value: `${benefits.length} Service${benefits.length === 1 ? "" : "s"}`,
      },
      { label: "Co-pay", value: coPaySummary(group, benefits) },
    ]
  }, [benefits, group, policy])

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/10 p-4",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <DetailField key={t.label} label={t.label} value={t.value} />
        ))}
      </div>
    </div>
  )
}
