"use client"

import { Gear } from "@phosphor-icons/react"
import { ChoiceCard } from "@/components/shared/choice-card"
import { DetailSection } from "@/components/shared/detail-section"
import { FieldHelp } from "@/components/shared/field-help"
import { DEPENDENTS_POOL_OPTIONS, MONTHS } from "./wizard-constants"
import { SelectablePillGroup } from "./selectable-pill-group"
import type { BenefitPolicy, DependentCoverageType } from "@/types/policy"

const REFRESH_LABELS: Record<string, string> = {
  financial_year: "Financial Year",
  calendar_year: "Calendar Year",
}

const DEPENDENT_TYPE_OPTIONS: Array<{ label: string; value: DependentCoverageType }> = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "sibling", label: "Sibling" },
  { value: "inlaw", label: "In-law" },
]

interface PolicyDataProps {
  policyData: Partial<BenefitPolicy>
}

interface EditableDependentsSectionProps extends PolicyDataProps {
  isViewMode: boolean
  setPolicyData: React.Dispatch<React.SetStateAction<Partial<BenefitPolicy>>>
  validationErrors: Record<string, string>
}

function getDependentCoverages(policyData: Partial<BenefitPolicy>) {
  return policyData.dependentCoverages ?? []
}

function getSelectedDependentTypes(policyData: Partial<BenefitPolicy>) {
  return getDependentCoverages(policyData).map((coverage) => coverage.type)
}

function updateDependentsPoolType(policyData: Partial<BenefitPolicy>) {
  return policyData.dependentsPoolType ?? "SharedWithEmployee"
}

export function PoolReadOnlySections({ policyData }: PolicyDataProps) {
  return (
    <div className="animate-in space-y-8 duration-300 fade-in">
      <DetailSection
        title="Benefit Pool Strategy"
        icon={<Gear size={18} weight="duotone" />}
        description="Fund allocation configuration"
        ghost
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ReadOnlyField
            label="Pool Type"
            value={policyData.benefitPoolType === "Shared" ? "Shared Pool" : "Individual"}
          />
          <ReadOnlyField
            label="Dependents"
            value={(policyData.dependentCoverages?.length ?? 0) > 0 ? "Covered" : "Employee Only"}
          />
          <ReadOnlyField
            label="Employee Policy Amount"
            value={policyData.totalCapAmount ? `RM ${policyData.totalCapAmount.toFixed(2)}` : "Not Set"}
          />
          {(policyData.dependentCoverages?.length ?? 0) > 0 ? (
            <ReadOnlyField
              label="Dependents Pool Type"
              value={
                policyData.dependentsPoolType === "SharedWithEmployee"
                  ? "Shared with Employee"
                  : policyData.dependentsPoolType
              }
            />
          ) : null}
          <ReadOnlyField
            label="Utilisation Mode"
            value={policyData.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"}
          />
          {policyData.utilisationMode === "Prorated" ? (
            <ReadOnlyField label="Prorate Unit" value={policyData.prorateUnit} />
          ) : null}
        </div>
      </DetailSection>

      <DetailSection
        title="Cycle & Lifecycle"
        icon={<Gear size={18} weight="duotone" />}
        description="Refresh intervals"
        ghost
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ReadOnlyField label="Refresh Cycle" value={policyData.refreshCycle} />
          <ReadOnlyField
            label="Refresh Start Reference"
            value={
              REFRESH_LABELS[policyData.refreshStartReference || ""] ||
              policyData.refreshStartReference
            }
          />
          {policyData.refreshStartMonth ? (
            <ReadOnlyField label="Start Month" value={MONTHS[policyData.refreshStartMonth - 1]} />
          ) : null}
        </div>
      </DetailSection>
    </div>
  )
}

export function EditableDependentsSection({
  policyData,
  isViewMode,
  setPolicyData,
  validationErrors,
}: EditableDependentsSectionProps) {
  const selectedTypes = getSelectedDependentTypes(policyData)
  const hasDependents = selectedTypes.length > 0

  return (
    <>
      <div className="space-y-3">
        <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
          Cover Dependents <FieldHelp termKey="dependentsPooling" />
        </label>
        <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body font-medium text-foreground">
          <input
            type="checkbox"
            checked={hasDependents}
            onChange={(event) =>
              setPolicyData({
                ...policyData,
                dependentCoverages: event.target.checked
                  ? hasDependents
                    ? policyData.dependentCoverages
                    : DEPENDENT_TYPE_OPTIONS.map((option) => ({ type: option.value }))
                  : [],
                dependentsPoolType: event.target.checked
                  ? updateDependentsPoolType(policyData)
                  : undefined,
              })
            }
            className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            disabled={isViewMode}
          />
          Include dependents in this policy
        </label>
        {hasDependents ? (
          <SelectablePillGroup
            disabled={isViewMode}
            options={DEPENDENT_TYPE_OPTIONS}
            selectedValues={selectedTypes}
            buttonClassName="px-3 py-1.5 text-label font-medium"
            onToggleAll={() =>
              setPolicyData({
                ...policyData,
                dependentCoverages:
                  selectedTypes.length === DEPENDENT_TYPE_OPTIONS.length
                    ? []
                    : DEPENDENT_TYPE_OPTIONS.map((option) => ({ type: option.value })),
                dependentsPoolType:
                  selectedTypes.length === DEPENDENT_TYPE_OPTIONS.length
                    ? undefined
                    : updateDependentsPoolType(policyData),
              })
            }
            onToggle={(value) => {
              const nextDependentCoverages = selectedTypes.includes(value as DependentCoverageType)
                ? getDependentCoverages(policyData).filter((coverage) => coverage.type !== value)
                : [...getDependentCoverages(policyData), { type: value as DependentCoverageType }]
              setPolicyData({
                ...policyData,
                dependentCoverages: nextDependentCoverages,
                dependentsPoolType:
                  nextDependentCoverages.length > 0
                    ? updateDependentsPoolType(policyData)
                    : undefined,
              })
            }}
          />
        ) : null}
      </div>

      {hasDependents ? (
        <div className="space-y-3">
          <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
            Dependents Pool Type <span className="text-rose-600 dark:text-rose-400">*</span>
            <FieldHelp termKey="dependentsPooling" />
          </label>
          {validationErrors.dependentsPoolType ? (
            <p className="text-label font-medium text-rose-600 dark:text-rose-400">
              {validationErrors.dependentsPoolType}
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:max-w-2xl">
            {DEPENDENTS_POOL_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                title={option.title}
                description={option.description}
                icon={option.icon}
                selected={policyData.dependentsPoolType === option.value}
                onSelect={() => setPolicyData({ ...policyData, dependentsPoolType: option.value })}
              />
            ))}
          </div>
        </div>
      ) : null}

      {hasDependents && policyData.dependentsPoolType === "Shared" ? (
        <div className="space-y-1.5">
          <label className="text-label font-medium text-subtle">Dependent Pool Amount</label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 1500"
            className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
            value={policyData.dependentCapAmount ?? ""}
            onChange={(event) =>
              setPolicyData({
                ...policyData,
                dependentCapAmount: event.target.value === "" ? undefined : parseFloat(event.target.value),
              })
            }
            disabled={isViewMode}
          />
          <p className="text-micro text-faint">Total shared pool for all dependents per cycle.</p>
        </div>
      ) : null}

      {hasDependents && policyData.dependentsPoolType === "Individual" ? (
        <div className="space-y-3">
          <label className="text-label font-medium text-subtle">
            Dependent Amounts <span className="text-rose-600 dark:text-rose-400">*</span>
          </label>
          <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            {getDependentCoverages(policyData).map((coverage) => (
              <div key={coverage.type} className="space-y-1.5">
                <label className="block text-label font-medium text-subtle">
                  {DEPENDENT_TYPE_OPTIONS.find((option) => option.value === coverage.type)?.label}
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1500"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                  value={coverage.capAmount ?? ""}
                  onChange={(event) =>
                    setPolicyData((prev) => ({
                      ...prev,
                      dependentCoverages: (prev.dependentCoverages ?? []).map((currentCoverage) =>
                        currentCoverage.type === coverage.type
                          ? {
                              ...currentCoverage,
                              capAmount:
                                event.target.value === ""
                                  ? undefined
                                  : parseFloat(event.target.value),
                            }
                          : currentCoverage
                      ),
                    }))
                  }
                  disabled={isViewMode}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="text-body font-medium text-foreground">{value || "—"}</p>
    </div>
  )
}
