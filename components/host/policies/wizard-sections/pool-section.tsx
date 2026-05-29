"use client"

import { Gear, Check, CalendarBlank, Calendar } from "@phosphor-icons/react"
import { ChoiceCard } from "@/components/shared/choice-card"
import { FormSelect } from "@/components/shared/form-select"
import { MonthPickerField } from "@/components/shared/month-picker-field"
import { cn } from "@/lib/utils"
import type { ProrateUnit, RefreshCycle } from "@/types/policy"
import {
  DEPENDENTS_POOL_OPTIONS,
  PRORATE_UNITS,
  REFRESH_CYCLES,
  getAvailableRefreshCycles,
} from "../wizard-constants"
import { SectionHeader, FieldLabel, ErrorText, HelpText } from "../wizard-shared-ui"
import type { PolicyWizardCtx } from "../wizard-section-types"

const DEPENDENT_TYPES = [
  { value: "spouse" as const, label: "Spouse" },
  { value: "child" as const, label: "Child" },
  { value: "mother" as const, label: "Mother" },
  { value: "father" as const, label: "Father" },
  { value: "sibling" as const, label: "Sibling" },
  { value: "inlaw" as const, label: "In-law" },
]

const DEPENDENT_LABELS: Record<string, string> = {
  spouse: "Spouse",
  child: "Child",
  mother: "Mother",
  father: "Father",
  sibling: "Sibling",
  inlaw: "In-law",
}

interface PoolSectionProps {
  ctx: PolicyWizardCtx
}

export function PoolSection({ ctx }: PoolSectionProps) {
  const { policyData, setPolicyData, validationErrors } = ctx

  const availableCycles = getAvailableRefreshCycles(
    policyData.utilisationMode ?? "Fixed",
    policyData.prorateUnit
  )

  return (
    <div className="space-y-8">
      {/* ── Pool & Cycle ── */}
      <div className="space-y-6">
        <SectionHeader
          icon={Gear}
          title="Pool &amp; Cycle"
          description="Configure fund allocation and refresh intervals"
        />

        {/* Employee Policy Amount */}
        <div className="space-y-1.5">
          <FieldLabel helpKey="spendingCap">Employee Policy Amount</FieldLabel>
          <input
            type="number"
            min={0}
            placeholder="e.g. 3000"
            className="w-full max-w-[240px] rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
            value={policyData.totalCapAmount ?? ""}
            onChange={(e) =>
              setPolicyData({
                ...policyData,
                totalCapAmount: e.target.value === "" ? undefined : parseFloat(e.target.value),
              })
            }
          />
          <HelpText>
            Optional. Maximum total an employee can claim under this policy per cycle.
          </HelpText>
          {(policyData.dependentCoverages?.length ?? 0) > 0 &&
            policyData.dependentsPoolType === "SharedWithEmployee" && (
              <p className="text-micro text-faint">
                Dependents share this employee amount
                {typeof policyData.totalCapAmount === "number"
                  ? ` (RM ${policyData.totalCapAmount.toFixed(2)})`
                  : ""}
                .
              </p>
            )}
        </div>

        {/* Cover Dependents */}
        <div className="space-y-3">
          <FieldLabel helpKey="dependentsPooling">Cover Dependents</FieldLabel>
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
                      : DEPENDENT_TYPES.map((t) => ({ type: t.value }))
                    : [],
                  dependentsPoolType: e.target.checked
                    ? (policyData.dependentsPoolType ?? "SharedWithEmployee")
                    : undefined,
                })
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            Include dependents in this policy
          </label>
          {(policyData.dependentCoverages?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {(() => {
                const allSelected = DEPENDENT_TYPES.every((t) =>
                  policyData.dependentCoverages?.some((c) => c.type === t.value)
                )
                return (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPolicyData({
                          ...policyData,
                          dependentCoverages: allSelected
                            ? []
                            : DEPENDENT_TYPES.map((t) => ({ type: t.value, capAmount: undefined })),
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
                      const isSelected =
                        policyData.dependentCoverages?.some((c) => c.type === opt.value) ?? false
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? (policyData.dependentCoverages ?? []).filter(
                                  (c) => c.type !== opt.value
                                )
                              : [
                                  ...(policyData.dependentCoverages ?? []),
                                  { type: opt.value, capAmount: undefined },
                                ]
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
          <div className="animate-in space-y-3 duration-300 fade-in slide-in-from-top-1">
            <FieldLabel required helpKey="dependentsPooling">
              Dependents Pool Type
            </FieldLabel>
            {validationErrors.dependentsPoolType && (
              <ErrorText>{validationErrors.dependentsPoolType}</ErrorText>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

        {/* Dependent Pool Amount (Shared) */}
        {(policyData.dependentCoverages?.length ?? 0) > 0 &&
          policyData.dependentsPoolType === "Shared" && (
            <div className="animate-in space-y-1.5 duration-300 fade-in slide-in-from-top-1">
              <FieldLabel helpKey="spendingCap">Dependent Pool Amount</FieldLabel>
              <input
                type="number"
                min={0}
                placeholder="e.g. 1500"
                className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                value={policyData.dependentCapAmount ?? ""}
                onChange={(e) =>
                  setPolicyData({
                    ...policyData,
                    dependentCapAmount:
                      e.target.value === "" ? undefined : parseFloat(e.target.value),
                  })
                }
              />
              <HelpText>Total shared pool for all dependents per cycle.</HelpText>
            </div>
          )}

        {/* Dependent Amounts (Individual) */}
        {(policyData.dependentCoverages?.length ?? 0) > 0 &&
          policyData.dependentsPoolType === "Individual" && (
            <div className="animate-in space-y-3 duration-300 fade-in slide-in-from-top-1">
              <FieldLabel required helpKey="spendingCap">
                Dependent Amounts
              </FieldLabel>
              <div className="grid max-w-xl grid-cols-1 gap-4 md:grid-cols-2">
                {(policyData.dependentCoverages ?? []).map((coverage) => (
                  <div key={coverage.type} className="space-y-1.5">
                    <label className="block text-label font-medium text-subtle">
                      {DEPENDENT_LABELS[coverage.type] ?? coverage.type}
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 1500"
                      className={cn(
                        "w-full rounded-lg border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10",
                        validationErrors[`dependent_cap_${coverage.type}`]
                          ? "border-destructive"
                          : "border-border"
                      )}
                      value={coverage.capAmount ?? ""}
                      onChange={(e) =>
                        setPolicyData((prev) => ({
                          ...prev,
                          dependentCoverages: (prev.dependentCoverages ?? []).map((c) =>
                            c.type === coverage.type
                              ? {
                                  ...c,
                                  capAmount:
                                    e.target.value === "" ? undefined : parseFloat(e.target.value),
                                }
                              : c
                          ),
                        }))
                      }
                    />
                    {validationErrors[`dependent_cap_${coverage.type}`] && (
                      <ErrorText>
                        {validationErrors[`dependent_cap_${coverage.type}`]}
                      </ErrorText>
                    )}
                  </div>
                ))}
              </div>
              <HelpText>Per-dependent-type cap amounts.</HelpText>
            </div>
          )}

        {/* Utilisation Mode + Refresh */}
        <div className="space-y-6 border-t border-border/60 pt-6">
          <div className="space-y-3">
            <FieldLabel helpKey="utilisationMode">Utilisation Mode</FieldLabel>
            <HelpText>
              This will be the default for all benefit groups, which can be overridden per group.
            </HelpText>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
            <div className="animate-in space-y-1.5 duration-300 fade-in slide-in-from-top-1">
              <FieldLabel required helpKey="prorateUnit">
                Prorate Unit
              </FieldLabel>
              <FormSelect
                value={policyData.prorateUnit || ""}
                onChange={(v) => {
                  const newUnit = v as ProrateUnit
                  const newAvailable = newUnit
                    ? getAvailableRefreshCycles("Prorated", newUnit)
                    : REFRESH_CYCLES
                  const currentCycle = policyData.refreshCycle
                  const adjustedCycle =
                    currentCycle && newAvailable.includes(currentCycle)
                      ? currentCycle
                      : newAvailable[0]
                  setPolicyData({
                    ...policyData,
                    prorateUnit: newUnit || undefined,
                    refreshCycle: adjustedCycle,
                  })
                }}
                options={PRORATE_UNITS.map((u) => ({ label: u, value: u }))}
                placeholder="Select prorate unit..."
                error={!!validationErrors.prorateUnit}
                triggerClassName="max-w-[240px]"
              />
              {validationErrors.prorateUnit && (
                <ErrorText>{validationErrors.prorateUnit}</ErrorText>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <FieldLabel helpKey="refreshCycle">Refresh Cycle</FieldLabel>
            <FormSelect
              value={policyData.refreshCycle}
              onChange={(v) => setPolicyData({ ...policyData, refreshCycle: v as RefreshCycle })}
              options={availableCycles.map((c) => ({ label: c, value: c }))}
              error={!!validationErrors.refreshCycle}
              triggerClassName="max-w-[240px]"
            />
            {validationErrors.refreshCycle && (
              <ErrorText>{validationErrors.refreshCycle}</ErrorText>
            )}
          </div>
        </div>
      </div>

      {/* ── Refresh Start Reference ── */}
      <div className="space-y-6 border-t border-border/60 pt-6">
        <SectionHeader
          icon={Calendar}
          title="Refresh Start Reference"
          description="When should this policy's benefit cycle begin each year?"
        />

        <div className="space-y-3">
          <FieldLabel required>Cycle Type</FieldLabel>
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
        </div>

        {policyData.refreshStartReference === "calendar_year" && (
          <div className="space-y-2">
            <FieldLabel required>Start Month</FieldLabel>
            {validationErrors.refreshStartMonth && (
              <ErrorText>{validationErrors.refreshStartMonth}</ErrorText>
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
  )
}
