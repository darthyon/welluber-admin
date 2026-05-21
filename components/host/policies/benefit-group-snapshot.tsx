"use client"

import { useMemo } from "react"
import type React from "react"
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

function allocationChipLabel(
  group: BenefitGroup,
  policy: Partial<Pick<BenefitPolicy, "utilisationMode" | "prorateUnit">>
): string {
  const fallbackMode: UtilisationMode = "Fixed"
  const effectiveMode =
    group.utilisationMode ?? policy.utilisationMode ?? fallbackMode
  if (effectiveMode === "Prorated") {
    const unit = group.prorateUnit ?? policy.prorateUnit ?? "Monthly"
    return `Prorated Allocation · ${unit}`
  }
  return "Fixed Allocation"
}

function refreshChipLabel(
  group: BenefitGroup,
  policy: Partial<Pick<BenefitPolicy, "refreshCycle">>
): string {
  const fallbackRefresh: RefreshCycle = "Yearly"
  const effective = group.refreshCycle ?? policy.refreshCycle ?? fallbackRefresh
  return `${effective} Refresh`
}

function poolTypeChipLabel(group: BenefitGroup): string {
  return group.distributionType === "SharedAmount"
    ? "Shared Pool"
    : "Per Benefit Group"
}

function capChipLabel(group: BenefitGroup): string {
  const coverageScope: BenefitGroupCoverageScope =
    group.coverageScope ?? "Employee"
  if (group.distributionType !== "SharedAmount") return "Different Cap Per Service"
  if (coverageScope === "Both") {
    return `Shared Cap ${formatRM(group.maxUsagePerCycle)} / ${formatRM(
      group.dependentGroupCap
    )}`
  }
  if (coverageScope === "Dependent") return `Shared Cap ${formatRM(group.dependentGroupCap)}`
  return `Shared Cap ${formatRM(group.maxUsagePerCycle)}`
}

function coPayChipLabel(group: BenefitGroup, benefits: Benefit[]): {
  label: string
  variant: "neutral" | "warning"
} {
  const scope: BenefitGroupCoverageScope = group.coverageScope ?? "Employee"

  if (group.distributionType === "SharedAmount") {
    const employeeRequired =
      scope !== "Dependent" && (group.coPayment?.required ?? false)
    const dependentRequired =
      scope !== "Employee" && (group.dependentCoPayment?.required ?? false)
    const count = (employeeRequired ? 1 : 0) + (dependentRequired ? 1 : 0)
    return count === 0
      ? { label: "No Co-pay Required", variant: "neutral" }
      : {
          label: `${count} Side${count === 1 ? "" : "s"} Require Co-pay`,
          variant: "warning",
        }
  }

  const requiredCount = benefits.reduce((acc, b) => {
    const emp = scope !== "Dependent" && (b.coPayment?.required ?? false)
    const dep =
      scope !== "Employee" && (b.dependentCoPayment?.required ?? false)
    return acc + (emp || dep ? 1 : 0)
  }, 0)

  if (requiredCount === 0) {
    return { label: "No Co-pay Required", variant: "neutral" }
  }
  return {
    label: `${requiredCount} Service${requiredCount === 1 ? "" : "s"} Require Co-pay`,
    variant: "warning",
  }
}

function coverageChipLabel(scope: BenefitGroupCoverageScope): string {
  if (scope === "Both") return "Employee + Dependent"
  if (scope === "Dependent") return "Dependent Only"
  return "Employee Only"
}

function RuleChip({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode
  variant?: "neutral" | "warning"
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-4xl border px-2.5 text-label font-medium",
        variant === "warning"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
          : "border-border bg-muted/30 text-muted-foreground"
      )}
    >
      {children}
    </span>
  )
}

export function BenefitGroupSnapshot({
  policy,
  group,
  benefits,
  className,
  variant = "card",
}: {
  policy: Partial<
    Pick<BenefitPolicy, "utilisationMode" | "prorateUnit" | "refreshCycle">
  >
  group: BenefitGroup
  benefits: Benefit[]
  className?: string
  variant?: "card" | "inline"
}) {
  const chips = useMemo(() => {
    const scope: BenefitGroupCoverageScope = group.coverageScope ?? "Employee"
    const coPay = coPayChipLabel(group, benefits)

    return [
      { label: coverageChipLabel(scope), variant: "neutral" as const },
      { label: poolTypeChipLabel(group), variant: "neutral" as const },
      { label: capChipLabel(group), variant: "neutral" as const },
      { label: allocationChipLabel(group, policy), variant: "neutral" as const },
      { label: refreshChipLabel(group, policy), variant: "neutral" as const },
      { label: coPay.label, variant: coPay.variant },
    ]
  }, [benefits, group, policy])

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {chips.map((chip) => (
          <RuleChip key={chip.label} variant={chip.variant}>
            {chip.label}
          </RuleChip>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/10 p-4",
        className
      )}
    >
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <RuleChip key={chip.label} variant={chip.variant}>
            {chip.label}
          </RuleChip>
        ))}
      </div>
    </div>
  )
}
