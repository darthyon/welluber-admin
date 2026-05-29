"use client"

import { DetailSection } from "@/components/shared/detail-section"
import { FieldHelp } from "@/components/shared/field-help"
import { ChoiceCard } from "@/components/shared/choice-card"
import { FormSelect } from "@/components/shared/form-select"
import { MonthPickerField } from "@/components/shared/month-picker-field"
import { Check, Gear, CalendarBlank, Calendar } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { ReadField } from "../wizard-shared-ui"
import {
  DEPENDENTS_POOL_OPTIONS,
  PRORATE_UNITS,
  MONTHS,
  getAvailableRefreshCycles,
} from "../wizard-constants"
import type { ProrateUnit, RefreshCycle } from "@/types/policy"
import type { BenefitPolicyWizardCtx } from "../wizard-types"

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
    const refreshLabels: Record<string, string> = {
      financial_year: "Financial Year",
      calendar_year: "Calendar Year",
    }
    return (
      <div className="animate-in space-y-8 duration-300 fade-in">
        <DetailSection
          title="Benefit Pool Strategy"
          icon={<Gear size={18} weight="duotone" />}
          description="Fund allocation configuration"
          ghost
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ReadField
              label="Pool Type"
              value={policyData.benefitPoolType === "Shared" ? "Shared Pool" : "Individual"}
            />
            <ReadField
              label="Dependents"
              value={(policyData.dependentCoverages?.length ?? 0) > 0 ? "Covered" : "Employee Only"}
            />
            <ReadField
              label="Employee Policy Amount"
              value={policyData.totalCapAmount ? `RM ${policyData.totalCapAmount.toFixed(2)}` : "Not Set"}
            />
            {(policyData.dependentCoverages?.length ?? 0) > 0 && (
              <ReadField
                label="Dependents Pool Type"
                value={
                  policyData.dependentsPoolType === "SharedWithEmployee"
                    ? "Shared with Employee"
                    : policyData.dependentsPoolType
                }
              />
            )}
            <ReadField
              label="Utilisation Mode"
              value={policyData.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"}
            />
            {policyData.utilisationMode === "Prorated" && (
              <ReadField label="Prorate Unit" value={policyData.prorateUnit} />
            )}
          </div>
        </DetailSection>
        <DetailSection
          title="Cycle & Lifecycle"
          icon={<Gear size={18} weight="duotone" />}
          description="Refresh intervals"
          ghost
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ReadField label="Refresh Cycle" value={policyData.refreshCycle} />
            <ReadField
              label="Refresh Start Reference"
              value={
                refreshLabels[policyData.refreshStartReference || ""] ||
                policyData.refreshStartReference
              }
            />
            {policyData.refreshStartMonth && (
              <ReadField
                label="Start Month"
                value={MONTHS[policyData.refreshStartMonth - 1]}
              />
            )}
          </div>
        </DetailSection>
      </div>
    )
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

          {/* Cover Dependents */}
          <div className="space-y-3">
            <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
              Cover Dependents <FieldHelp termKey="dependentsPooling" />
            </label>
            <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body font-medium text-foreground">
              <input
                type="checkbox"
                checked={(policyData.dependentCoverages?.length ?? 0) > 0}
                onChange={(e) =>
                  setPolicyData({
                    ...policyData,
                    dependentCoverages: e.target.checked
                      ? policyData.dependentCoverages?.length
                        ? policyData.dependentCoverages
                        : [
                            { type: "spouse" },
                            { type: "child" },
                            { type: "mother" },
                            { type: "father" },
                            { type: "sibling" },
                            { type: "inlaw" },
                          ]
                      : [],
                    dependentsPoolType: e.target.checked
                      ? (policyData.dependentsPoolType ?? "SharedWithEmployee")
                      : undefined,
                  })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                disabled={isViewMode}
              />
              Include dependents in this policy
            </label>
            {(policyData.dependentCoverages?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const DEPENDENT_TYPES = [
                    { value: "spouse" as const, label: "Spouse" },
                    { value: "child" as const, label: "Child" },
                    { value: "mother" as const, label: "Mother" },
                    { value: "father" as const, label: "Father" },
                    { value: "sibling" as const, label: "Sibling" },
                    { value: "inlaw" as const, label: "In-law" },
                  ]
                  const allSelected = DEPENDENT_TYPES.every((t) =>
                    policyData.dependentCoverages?.some((c) => c.type === t.value)
                  )
                  return (
                    <>
                      <button
                        type="button"
                        disabled={isViewMode}
                        onClick={() =>
                          setPolicyData({
                            ...policyData,
                            dependentCoverages: allSelected
                              ? []
                              : DEPENDENT_TYPES.map((t) => ({ type: t.value })),
                            dependentsPoolType: allSelected
                              ? undefined
                              : (policyData.dependentsPoolType ?? "SharedWithEmployee"),
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-label font-medium transition-all",
                          allSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {allSelected && <Check size={11} weight="bold" className="mr-1.5 inline" />}
                        All
                      </button>
                      {DEPENDENT_TYPES.map((opt) => {
                        const isSelected = policyData.dependentCoverages?.some((c) => c.type === opt.value) ?? false
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={isViewMode}
                            onClick={() => {
                              const next = isSelected
                                ? (policyData.dependentCoverages ?? []).filter((c) => c.type !== opt.value)
                                : [...(policyData.dependentCoverages ?? []), { type: opt.value }]
                              setPolicyData({
                                ...policyData,
                                dependentCoverages: next,
                                dependentsPoolType:
                                  next.length > 0
                                    ? (policyData.dependentsPoolType ?? "SharedWithEmployee")
                                    : undefined,
                              })
                            }}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-label font-medium transition-all",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            {isSelected && <Check size={11} weight="bold" className="mr-1.5 inline" />}
                            {opt.label}
                          </button>
                        )
                      })}
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Dependents Pool Type */}
          {(policyData.dependentCoverages?.length ?? 0) > 0 && (
            <div className="space-y-3">
              <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                Dependents Pool Type{" "}
                <span className="text-rose-600 dark:text-rose-400">*</span>
                <FieldHelp termKey="dependentsPooling" />
              </label>
              {validationErrors.dependentsPoolType && (
                <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                  {validationErrors.dependentsPoolType}
                </p>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:max-w-2xl">
                {DEPENDENTS_POOL_OPTIONS.map((opt) => (
                  <ChoiceCard
                    key={opt.value}
                    title={opt.title}
                    description={opt.description}
                    icon={opt.icon}
                    selected={policyData.dependentsPoolType === opt.value}
                    onSelect={() => setPolicyData({ ...policyData, dependentsPoolType: opt.value })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Dependent Amount (Shared pool) */}
          {(policyData.dependentCoverages?.length ?? 0) > 0 &&
            policyData.dependentsPoolType === "Shared" && (
              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Dependent Pool Amount</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1500"
                  className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                  value={policyData.dependentCapAmount ?? ""}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      dependentCapAmount: e.target.value === "" ? undefined : parseFloat(e.target.value),
                    })
                  }
                  disabled={isViewMode}
                />
                <p className="text-micro text-faint">Total shared pool for all dependents per cycle.</p>
              </div>
            )}

          {/* Dependent Amounts (Individual pool) */}
          {(policyData.dependentCoverages?.length ?? 0) > 0 &&
            policyData.dependentsPoolType === "Individual" && (
              <div className="space-y-3">
                <label className="text-label font-medium text-subtle">
                  Dependent Amounts{" "}
                  <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                  {(policyData.dependentCoverages ?? []).map((coverage) => (
                    <div key={coverage.type} className="space-y-1.5">
                      <label className="block text-label font-medium text-subtle">
                        {coverage.type === "spouse"
                          ? "Spouse"
                          : coverage.type === "child"
                            ? "Child"
                            : coverage.type === "mother"
                              ? "Mother"
                              : coverage.type === "father"
                                ? "Father"
                                : coverage.type === "sibling"
                                  ? "Sibling"
                                  : "In-law"}
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 1500"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                        value={coverage.capAmount ?? ""}
                        onChange={(e) =>
                          setPolicyData((prev) => ({
                            ...prev,
                            dependentCoverages: (prev.dependentCoverages ?? []).map((c) =>
                              c.type === coverage.type
                                ? {
                                    ...c,
                                    capAmount: e.target.value === "" ? undefined : parseFloat(e.target.value),
                                  }
                                : c
                            ),
                          }))
                        }
                        disabled={isViewMode}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
