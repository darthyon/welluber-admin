"use client"

import { DetailSection } from "@/components/shared/detail-section"
import { FieldHelp } from "@/components/shared/field-help"
import { ChoiceCard } from "@/components/shared/choice-card"
import { FormSelect } from "@/components/shared/form-select"
import { MonthPickerField } from "@/components/shared/month-picker-field"
import { Gear, CalendarBlank, Calendar } from "@phosphor-icons/react"
import {
  PRORATE_UNITS,
  getAvailableRefreshCycles,
} from "../wizard-constants"
import type { ProrateUnit, RefreshCycle } from "@/types/policy"
import type { BenefitPolicyWizardCtx } from "../wizard-types"
import { EditableDependentsSection, PoolReadOnlySections } from "../pool-step-sections"

interface PoolStepProps {
  ctx: BenefitPolicyWizardCtx
}

export function PoolStep({ ctx }: PoolStepProps) {
  const { policyData, setPolicyData, validationErrors, isViewMode } = ctx

  const availableCycles = getAvailableRefreshCycles(
    policyData.utilisationMode ?? "Fixed",
    policyData.prorateUnit
  )

  if (isViewMode) {
    return <PoolReadOnlySections policyData={policyData} />
  }

  return (
    <div className="max-w-3xl space-y-8">
      <DetailSection
        title="Benefit Pool Strategy"
        icon={<Gear size={18} weight="duotone" />}
        description="Choose how funds are allocated"
        ghost
      >
        <div className="space-y-6 md:max-w-xl">
          {/* Employee Policy Amount */}
          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
              Employee Policy Amount <FieldHelp termKey="spendingCap" />
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 3000"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
              value={policyData.totalCapAmount ?? ""}
              onChange={(e) =>
                setPolicyData({
                  ...policyData,
                  totalCapAmount: e.target.value === "" ? undefined : parseFloat(e.target.value),
                })
              }
              disabled={isViewMode}
            />
            <p className="text-micro text-faint">
              Optional. Maximum total an employee can claim under this policy per cycle.
            </p>
          </div>

          <EditableDependentsSection
            policyData={policyData}
            setPolicyData={setPolicyData}
            validationErrors={validationErrors}
            isViewMode={isViewMode}
          />

          {/* Utilisation Mode */}
          <div className="space-y-3">
            <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
              Utilisation Mode <FieldHelp termKey="utilisationMode" />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-xl">
              <ChoiceCard
                title="Fixed Allocation"
                description="Full benefit pool is granted upon assignment."
                icon={Gear}
                selected={policyData.utilisationMode === "Fixed"}
                onSelect={() =>
                  setPolicyData({ ...policyData, utilisationMode: "Fixed", prorateUnit: undefined })
                }
              />
              <ChoiceCard
                title="Prorated Allocation"
                description="Benefit amounts are prorated based on time."
                icon={Gear}
                selected={policyData.utilisationMode === "Prorated"}
                onSelect={() =>
                  setPolicyData({
                    ...policyData,
                    utilisationMode: "Prorated",
                    prorateUnit: policyData.prorateUnit ?? "Monthly",
                  })
                }
              />
            </div>
          </div>

          {policyData.utilisationMode === "Prorated" && (
            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                Prorate Unit{" "}
                <span className="text-rose-600 dark:text-rose-400">*</span>
                <FieldHelp termKey="prorateUnit" />
              </label>
              <FormSelect
                value={policyData.prorateUnit || ""}
                onChange={(v) => {
                  const newUnit = v as ProrateUnit
                  const newAvailable = newUnit
                    ? getAvailableRefreshCycles("Prorated", newUnit)
                    : []
                  const currentCycle = policyData.refreshCycle
                  const adjustedCycle =
                    currentCycle && newAvailable.includes(currentCycle) ? currentCycle : newAvailable[0]
                  setPolicyData({
                    ...policyData,
                    prorateUnit: newUnit || undefined,
                    refreshCycle: adjustedCycle,
                  })
                }}
                options={PRORATE_UNITS.map((u) => ({ label: u, value: u }))}
                placeholder="Select prorate unit..."
                error={!!validationErrors.prorateUnit}
              />
              {validationErrors.prorateUnit && (
                <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                  {validationErrors.prorateUnit}
                </p>
              )}
            </div>
          )}
        </div>
      </DetailSection>

      <DetailSection
        title="Cycle & Lifecycle"
        icon={<Gear size={18} weight="duotone" />}
        description="Refresh intervals and start reference"
        ghost
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
              Refresh Cycle <FieldHelp termKey="refreshCycle" />
            </label>
            <FormSelect
              value={policyData.refreshCycle}
              onChange={(v) => setPolicyData({ ...policyData, refreshCycle: v as RefreshCycle })}
              options={availableCycles.map((c) => ({ label: c, value: c }))}
              error={!!validationErrors.refreshCycle}
            />
            {validationErrors.refreshCycle && (
              <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                {validationErrors.refreshCycle}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
              Refresh Start Reference <FieldHelp termKey="refreshCycle" />
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ChoiceCard
                title="Financial Year"
                description="Cycle aligns to the organisation's financial year."
                icon={CalendarBlank}
                selected={policyData.refreshStartReference === "financial_year"}
                onSelect={() =>
                  setPolicyData({
                    ...policyData,
                    refreshStartReference: "financial_year",
                    refreshStartMonth: undefined,
                  })
                }
              />
              <ChoiceCard
                title="Calendar Year"
                description="Cycle aligns to the standard Jan–Dec calendar year."
                icon={Calendar}
                selected={policyData.refreshStartReference === "calendar_year"}
                onSelect={() =>
                  setPolicyData({ ...policyData, refreshStartReference: "calendar_year" })
                }
              />
            </div>
            {policyData.refreshStartReference === "calendar_year" && (
              <div className="space-y-2">
                <p className="text-label font-medium text-subtle">Start Month</p>
                {validationErrors.refreshStartMonth && (
                  <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                    {validationErrors.refreshStartMonth}
                  </p>
                )}
                <MonthPickerField
                  value={policyData.refreshStartMonth}
                  onChange={(m) => setPolicyData({ ...policyData, refreshStartMonth: m })}
                  error={!!validationErrors.refreshStartMonth}
                />
              </div>
            )}
          </div>
        </div>
      </DetailSection>
    </div>
  )
}
