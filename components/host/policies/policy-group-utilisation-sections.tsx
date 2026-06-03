"use client"

import { ArrowCounterClockwise, ChartLineUp, Gear } from "@phosphor-icons/react"
import { ChoiceCard } from "@/components/shared/choice-card"
import { FormSelect } from "@/components/shared/form-select"
import { BenefitServiceSelector } from "@/components/host/policies/benefit-service-selector"
import { PRORATE_UNITS, getAvailableRefreshCycles } from "@/components/host/policies/wizard-constants"
import { ErrorText } from "@/components/host/policies/wizard-shared-ui"
import type {
  Benefit,
  BenefitGroup,
  BenefitGroupCoverageScope,
  BenefitPolicy,
  ProrateUnit,
  RefreshCycle,
} from "@/types/policy"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"

interface PolicyGroupUtilisationSectionProps {
  group: BenefitGroup
  isViewMode?: boolean
  policyData: Partial<BenefitPolicy>
  updateGroup: (
    groupId: string,
    field: keyof BenefitGroup,
    value: string | number | boolean | undefined
  ) => void
}

export function PolicyGroupUtilisationSection({
  group,
  isViewMode = false,
  policyData,
  updateGroup,
}: PolicyGroupUtilisationSectionProps) {
  const effectiveUtilisationMode = group.utilisationMode ?? policyData.utilisationMode ?? "Fixed"
  const effectiveProrateUnit = group.prorateUnit ?? policyData.prorateUnit ?? "Monthly"

  return (
    <div className="space-y-3 border-t border-border/60 pt-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label font-medium text-muted-foreground">Utilisation Mode</p>
        {!isViewMode && (group.utilisationMode || group.prorateUnit || group.refreshCycle) ? (
          <button
            type="button"
            onClick={() => {
              updateGroup(group.id, "utilisationMode", undefined)
              updateGroup(group.id, "prorateUnit", undefined)
              updateGroup(group.id, "refreshCycle", undefined)
            }}
            className="flex items-center gap-1 text-micro text-faint transition-colors hover:text-muted-foreground"
          >
            <ArrowCounterClockwise size={11} />
            Reset to policy default
          </button>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-muted/10 p-3">
        <p className="text-micro text-faint">Policy Default Allocation</p>
        <p className="mt-0.5 text-label font-medium text-foreground">
          {policyData.utilisationMode === "Prorated"
            ? `Prorated · ${policyData.prorateUnit ?? "Monthly"}`
            : "Fixed Allocation"}{" "}
          · {policyData.refreshCycle ?? "Yearly"} refresh
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <ChoiceCard
          title="Fixed Allocation"
          description="Full allocation granted immediately."
          icon={Gear}
          selected={effectiveUtilisationMode === "Fixed"}
          onSelect={() => {
            updateGroup(group.id, "utilisationMode", "Fixed")
            updateGroup(group.id, "prorateUnit", undefined)
          }}
        />
        <ChoiceCard
          title="Prorated Allocation"
          description="Amounts prorated based on time."
          icon={ChartLineUp}
          selected={effectiveUtilisationMode === "Prorated"}
          onSelect={() => {
            updateGroup(group.id, "utilisationMode", "Prorated")
            if (!group.prorateUnit) updateGroup(group.id, "prorateUnit", "Monthly")
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {effectiveUtilisationMode === "Prorated" ? (
          <div className="animate-in space-y-1.5 duration-200 fade-in slide-in-from-top-1">
            <p className="text-label font-medium text-muted-foreground">Prorate Unit</p>
            <FormSelect
              value={effectiveProrateUnit}
              onChange={(value) => {
                const nextUnit = (value || undefined) as ProrateUnit | undefined
                updateGroup(group.id, "prorateUnit", nextUnit)
                const available = getAvailableRefreshCycles(
                  "Prorated",
                  (nextUnit ?? effectiveProrateUnit) as ProrateUnit,
                )
                const current = group.refreshCycle ?? policyData.refreshCycle
                if (current && !available.includes(current as RefreshCycle)) {
                  updateGroup(group.id, "refreshCycle", available[0])
                }
              }}
              options={[
                { label: "Inherit (Policy)", value: "" },
                ...PRORATE_UNITS.map((unit) => ({ label: unit, value: unit })),
              ]}
              triggerClassName="max-w-[240px]"
              disabled={isViewMode}
            />
          </div>
        ) : null}

        <div className="animate-in space-y-1.5 duration-200 fade-in slide-in-from-top-1">
          <p className="text-label font-medium text-muted-foreground">Refresh Cycle</p>
          <FormSelect
            value={group.refreshCycle ?? ""}
            onChange={(value) =>
              updateGroup(group.id, "refreshCycle", value === "" ? undefined : value)
            }
            options={[
              {
                label: `Inherit (Policy · ${policyData.refreshCycle ?? "Yearly"})`,
                value: "",
              },
              ...getAvailableRefreshCycles(
                effectiveUtilisationMode as "Fixed" | "Prorated",
                effectiveUtilisationMode === "Prorated"
                  ? (effectiveProrateUnit as ProrateUnit)
                  : undefined,
              ).map((cycle) => ({ label: cycle, value: cycle })),
            ]}
            triggerClassName="max-w-[240px]"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  )
}

interface PolicyGroupServicesSectionProps {
  coverageScope: BenefitGroupCoverageScope
  groupBenefits: Benefit[]
  groupErrors: Record<string, string>
  groupId: string
  groupIndex: number
  isViewMode: boolean
  onToggleService: (serviceId: MainServiceId) => void
  onUpdateBenefit: (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[]
  ) => void
  policyData: Partial<BenefitPolicy>
}

export function PolicyGroupServicesSection({
  coverageScope,
  groupBenefits,
  groupErrors,
  groupId,
  groupIndex,
  isViewMode,
  onToggleService,
  onUpdateBenefit,
  policyData,
}: PolicyGroupServicesSectionProps) {
  return (
    <div className="space-y-3">
      <BenefitServiceSelector
        groupId={groupId}
        groupBenefits={groupBenefits}
        isViewMode={isViewMode}
        groupErrors={groupErrors}
        coverageScope={coverageScope}
        policyEmployeeCap={policyData.totalCapAmount}
        policyDependentCap={policyData.dependentCapAmount}
        onToggleService={onToggleService}
        onUpdateBenefit={onUpdateBenefit}
      />
      {groupErrors[`group_${groupIndex}`] ? <ErrorText>{groupErrors[`group_${groupIndex}`]}</ErrorText> : null}
    </div>
  )
}
