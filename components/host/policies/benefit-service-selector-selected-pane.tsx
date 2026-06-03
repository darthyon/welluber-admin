"use client"

import { CaretDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { SERVICES } from "@/lib/mock-data/service-catalog"
import type { Benefit, BenefitGroupCoverageScope } from "@/types/policy"
import { SelectedBenefitDetails } from "@/components/host/policies/benefit-service-selector-selected-details"

interface SelectedBenefitsPaneProps {
  coverageScope: BenefitGroupCoverageScope
  expandedBenefits: Set<string>
  groupBenefits: Benefit[]
  groupErrors: Record<string, string>
  groupId: string
  isBoth: boolean
  isDependentOnly: boolean
  onToggleBenefitExpanded: (benefitId: string) => void
  onUpdateBenefit: (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[],
  ) => void
  policyDependentCap?: number
  policyEmployeeCap?: number
}

export function SelectedBenefitsPane({
  coverageScope,
  expandedBenefits,
  groupBenefits,
  groupErrors,
  groupId,
  isBoth,
  isDependentOnly,
  onToggleBenefitExpanded,
  onUpdateBenefit,
  policyDependentCap,
  policyEmployeeCap,
}: SelectedBenefitsPaneProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="border-b border-border/60 bg-muted/10 px-4 py-2.5">
        <p className="text-label font-medium text-muted-foreground">
          {groupBenefits.length === 0 ? "Selected Services" : `Selected (${groupBenefits.length})`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groupBenefits.length === 0 ? (
          <div className="flex h-full items-center justify-center py-12">
            <p className="text-label text-faint italic">Select services from the list</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {groupBenefits.map((benefit) => {
              const service = SERVICES.find((item) => item.id === benefit.serviceId)
              const isExpanded = expandedBenefits.has(benefit.id)
              const employeeAmount =
                typeof benefit.employeeAmount === "number" ? benefit.employeeAmount : benefit.amount
              const dependentAmount =
                typeof benefit.dependantAmount === "number" ? benefit.dependantAmount : benefit.amount
              const amountSummary = isBoth
                ? `RM ${employeeAmount.toLocaleString()} employee / RM ${dependentAmount.toLocaleString()} dependent`
                : isDependentOnly
                  ? dependentAmount > 0
                    ? `RM ${dependentAmount.toLocaleString()}`
                    : "Set amount"
                  : benefit.amount > 0
                    ? `RM ${benefit.amount.toLocaleString()}`
                    : "Set amount"

              return (
                <div key={benefit.id}>
                  <button
                    type="button"
                    onClick={() => onToggleBenefitExpanded(benefit.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/20"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="truncate text-label font-medium text-foreground">
                        {service?.name ?? benefit.serviceId}
                      </span>
                      <span className="shrink-0 text-micro text-faint">{service?.category}</span>
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          "font-mono text-label tabular-nums",
                          benefit.amount > 0 ? "font-semibold text-foreground" : "text-faint italic",
                        )}
                      >
                        {amountSummary}
                      </span>
                      <CaretDown
                        size={12}
                        weight="bold"
                        className={cn(
                          "shrink-0 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {isExpanded ? (
                    <SelectedBenefitDetails
                      benefit={benefit}
                      coverageScope={coverageScope}
                      groupErrors={groupErrors}
                      groupId={groupId}
                      isBoth={isBoth}
                      isDependentOnly={isDependentOnly}
                      onUpdateBenefit={onUpdateBenefit}
                      policyDependentCap={policyDependentCap}
                      policyEmployeeCap={policyEmployeeCap}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
