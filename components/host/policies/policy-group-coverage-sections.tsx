"use client"

import type { Dispatch, SetStateAction } from "react"
import { Check, User, UsersFour } from "@phosphor-icons/react"
import { FieldHelp } from "@/components/shared/field-help"
import { FormSelect } from "@/components/shared/form-select"
import { Switch } from "@/components/shared/switch"
import { cn } from "@/lib/utils"
import { ErrorText } from "@/components/host/policies/wizard-shared-ui"
import type {
  BenefitGroup,
  BenefitPolicy,
  DependentCoverageType,
} from "@/types/policy"

export const DEP_TYPES: { value: DependentCoverageType; label: string }[] = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "sibling", label: "Sibling" },
  { value: "inlaw", label: "In-law" },
]

interface PolicyGroupCoverageColumnsProps {
  blurGroupCopayValue?: (groupId: string, type: "Percentage" | "Fixed", value: number) => void
  group: BenefitGroup
  groupErrors: Record<string, string>
  onOpenDependentCoverage: () => void
  policyData: Partial<BenefitPolicy>
  updateDependentCoPayment: (
    groupId: string,
    field: "required" | "type" | "value",
    value: boolean | string | number
  ) => void
  updateGroup: (
    groupId: string,
    field: keyof BenefitGroup,
    value: string | number | boolean | undefined
  ) => void
  updateGroupCoPayment: (
    groupId: string,
    field: "required" | "type" | "value",
    value: boolean | string | number
  ) => void
}

export function PolicyGroupCoverageColumns({
  blurGroupCopayValue,
  group,
  groupErrors,
  onOpenDependentCoverage,
  policyData,
  updateDependentCoPayment,
  updateGroup,
  updateGroupCoPayment,
}: PolicyGroupCoverageColumnsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {group.coverageScope !== "Dependent" ? (
        <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
          <p className="flex items-center gap-1.5 text-label font-semibold text-foreground">
            <User size={14} weight="duotone" className="text-primary" />
            Employee
          </p>
          <GroupCapField
            error={groupErrors[`group_cap_${group.id}`]}
            label="Group Cap"
            onChange={(value) => updateGroup(group.id, "maxUsagePerCycle", value)}
            value={group.maxUsagePerCycle}
          />
          <GroupCopayField
            error={groupErrors[`group_copay_${group.id}`]}
            onBlur={() =>
              blurGroupCopayValue?.(
                group.id,
                group.coPayment?.type ?? "Percentage",
                group.coPayment?.value ?? 0,
              )
            }
            onCheckedChange={(checked) => updateGroupCoPayment(group.id, "required", checked)}
            onChangeType={(value) => updateGroupCoPayment(group.id, "type", value)}
            onChangeValue={(value) => updateGroupCoPayment(group.id, "value", value)}
            required={group.coPayment?.required ?? false}
            type={group.coPayment?.type ?? "Percentage"}
            value={group.coPayment?.value ?? 0}
          />
        </div>
      ) : null}

      {group.coverageScope !== "Employee" ? (
        (policyData.dependentCoverages?.length ?? 0) > 0 ? (
          <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
            <p className="flex items-center gap-1.5 text-label font-semibold text-foreground">
              <UsersFour size={14} weight="duotone" className="text-primary" />
              Dependent
            </p>
            <GroupCapField
              error={groupErrors[`group_dep_cap_${group.id}`]}
              label="Group Cap"
              onChange={(value) => updateGroup(group.id, "dependentGroupCap", value)}
              value={group.dependentGroupCap}
            />
            <GroupCopayField
              error={groupErrors[`group_dep_copay_${group.id}`]}
              onCheckedChange={(checked) => updateDependentCoPayment(group.id, "required", checked)}
              onChangeType={(value) => updateDependentCoPayment(group.id, "type", value)}
              onChangeValue={(value) => updateDependentCoPayment(group.id, "value", value)}
              required={group.dependentCoPayment?.required ?? false}
              type={group.dependentCoPayment?.type ?? "Percentage"}
              value={group.dependentCoPayment?.value ?? 0}
            />
          </div>
        ) : (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/5 p-4 text-center">
            <UsersFour size={28} weight="duotone" className="text-border" />
            <p className="text-label font-medium text-faint">No Dependent Coverage</p>
            <button
              type="button"
              onClick={onOpenDependentCoverage}
              className="text-label font-medium text-primary hover:underline"
            >
              Add dependent coverage →
            </button>
          </div>
        )
      ) : null}
    </div>
  )
}

function GroupCapField({
  error,
  label,
  onChange,
  value,
}: {
  error?: string
  label: string
  onChange: (value: number | undefined) => void
  value?: number
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-label font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          {label} <FieldHelp termKey="groupCap" />
        </span>
      </p>
      <input
        type="number"
        className={cn(
          "h-10 w-32 rounded-lg border bg-background px-3 py-2 text-label outline-none focus:ring-2 focus:ring-primary/10",
          error ? "border-destructive" : "border-border",
        )}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? undefined : parseFloat(event.target.value))
        }
        placeholder="0.00"
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  )
}

function GroupCopayField({
  error,
  onBlur,
  onCheckedChange,
  onChangeType,
  onChangeValue,
  required,
  type,
  value,
}: {
  error?: string
  onBlur?: () => void
  onCheckedChange: (checked: boolean) => void
  onChangeType: (value: string) => void
  onChangeValue: (value: number) => void
  required: boolean
  type: "Percentage" | "Fixed"
  value: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="inline-flex items-center gap-1.5 text-label font-medium text-muted-foreground">
        Co-payment <FieldHelp termKey="coPayment" />
      </label>
      <div className="flex items-center gap-2">
        <Switch checked={required} onCheckedChange={onCheckedChange} />
        {required ? (
          <div className="flex items-center gap-1.5">
            <FormSelect
              value={type}
              onChange={onChangeType}
              options={[
                { label: "%", value: "Percentage" },
                { label: "RM", value: "Fixed" },
              ]}
              triggerClassName="h-10 min-w-[76px]"
            />
            <input
              type="number"
              className={cn(
                "h-10 w-24 rounded-lg border bg-background px-3 py-2 text-right font-mono text-label outline-none",
                error ? "border-destructive" : "border-border",
              )}
              value={value || ""}
              onChange={(event) =>
                onChangeValue(event.target.value === "" ? 0 : parseFloat(event.target.value))
              }
              onBlur={onBlur}
            />
          </div>
        ) : null}
      </div>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  )
}

interface PolicyDependentCoverageModalProps {
  depModalGroupId: string | null
  groupId: string
  onClose: () => void
  policyData: Partial<BenefitPolicy>
  setPolicyData: Dispatch<SetStateAction<Partial<BenefitPolicy>>>
}

export function PolicyDependentCoverageModal({
  depModalGroupId,
  groupId,
  onClose,
  policyData,
  setPolicyData,
}: PolicyDependentCoverageModalProps) {
  if (depModalGroupId !== groupId) return null

  const current = policyData.dependentCoverages ?? []
  const allSelected = DEP_TYPES.every((type) => current.some((coverage) => coverage.type === type.value))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
        <div className="space-y-1 p-6 pb-4">
          <p className="text-body font-semibold text-foreground">Add Dependent Coverage</p>
          <p className="text-label text-muted-foreground">
            Select which dependents this group covers.
          </p>
        </div>
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            <CoverageChip
              label="All"
              selected={allSelected}
              onClick={() =>
                setPolicyData((prev) => ({
                  ...prev,
                  dependentCoverages: allSelected
                    ? []
                    : DEP_TYPES.map((type) => ({ type: type.value, capAmount: undefined })),
                  dependentsPoolType: allSelected
                    ? undefined
                    : (prev.dependentsPoolType ?? "SharedWithEmployee"),
                }))
              }
            />
            {DEP_TYPES.map((option) => {
              const selected = current.some((coverage) => coverage.type === option.value)
              return (
                <CoverageChip
                  key={option.value}
                  label={option.label}
                  selected={selected}
                  onClick={() =>
                    setPolicyData((prev) => {
                      const next = selected
                        ? (prev.dependentCoverages ?? []).filter(
                            (coverage) => coverage.type !== option.value,
                          )
                        : [
                            ...(prev.dependentCoverages ?? []),
                            { type: option.value, capAmount: undefined },
                          ]
                      return {
                        ...prev,
                        dependentCoverages: next,
                        dependentsPoolType:
                          next.length > 0
                            ? (prev.dependentsPoolType ?? "SharedWithEmployee")
                            : undefined,
                      }
                    })
                  }
                />
              )
            })}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-label font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={(policyData.dependentCoverages?.length ?? 0) === 0}
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-label font-medium text-primary-foreground disabled:opacity-40"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

function CoverageChip({
  label,
  onClick,
  selected,
}: {
  label: string
  onClick: () => void
  selected: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-4xl border px-3 py-1.5 text-label font-medium transition-all",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-primary/30",
      )}
    >
      {selected ? <Check size={11} weight="bold" className="mr-1.5 inline" /> : null}
      {label}
    </button>
  )
}
