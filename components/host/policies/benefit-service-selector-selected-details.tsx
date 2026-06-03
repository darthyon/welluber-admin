"use client"

import { cn } from "@/lib/utils"
import type { Benefit, BenefitGroupCoverageScope } from "@/types/policy"
import { FieldHelp } from "@/components/shared/field-help"
import { FormSelect } from "@/components/shared/form-select"
import { Switch } from "@/components/shared/switch"

function CoPaymentToggle({
  label,
  required,
  type,
  value,
  errorKey,
  groupErrors,
  onCheckedChange,
  onChangeType,
  onChangeValue,
}: {
  label: string
  required: boolean
  type: "Percentage" | "Fixed"
  value: number
  errorKey: string
  groupErrors: Record<string, string>
  onCheckedChange: (checked: boolean) => void
  onChangeType: (value: string) => void
  onChangeValue: (value: number) => void
}) {
  return (
    <div className="space-y-1">
      <label className="inline-flex items-center gap-1 text-micro font-medium text-faint">
        {label} <FieldHelp termKey="coPayment" />
      </label>
      <div className="flex items-center gap-3">
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
                "h-10 w-24 rounded-lg border bg-background px-3 py-2 text-right font-mono text-label outline-none focus:ring-2 focus:ring-primary/10",
                groupErrors[errorKey] ? "border-destructive" : "border-border",
              )}
              value={value || ""}
              onChange={(event) =>
                onChangeValue(event.target.value === "" ? 0 : parseFloat(event.target.value))
              }
            />
          </div>
        ) : null}
      </div>
      {groupErrors[errorKey] ? <p className="text-micro text-destructive">{groupErrors[errorKey]}</p> : null}
    </div>
  )
}

export function SelectedBenefitDetails({
  benefit,
  coverageScope,
  groupErrors,
  groupId,
  isBoth,
  isDependentOnly,
  onUpdateBenefit,
  policyDependentCap,
  policyEmployeeCap,
}: {
  benefit: Benefit
  coverageScope: BenefitGroupCoverageScope
  groupErrors: Record<string, string>
  groupId: string
  isBoth: boolean
  isDependentOnly: boolean
  onUpdateBenefit: (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[],
  ) => void
  policyDependentCap?: number
  policyEmployeeCap?: number
}) {
  return (
    <div className="animate-in space-y-4 border-t border-border/40 bg-muted/10 px-4 pb-5 pt-3 duration-150 fade-in slide-in-from-top-1">
      {policyEmployeeCap || policyDependentCap ? (
        <p className="text-micro text-faint">
          Policy default: {policyEmployeeCap ? `RM ${policyEmployeeCap.toLocaleString()} emp` : ""}
          {policyEmployeeCap && policyDependentCap ? " / " : ""}
          {policyDependentCap ? `RM ${policyDependentCap.toLocaleString()} dep` : ""}
        </p>
      ) : null}

      {isBoth ? (
        <BothCoverageEditor
          benefit={benefit}
          groupErrors={groupErrors}
          groupId={groupId}
          onUpdateBenefit={onUpdateBenefit}
        />
      ) : (
        <SingleCoverageEditor
          benefit={benefit}
          coverageScope={coverageScope}
          groupErrors={groupErrors}
          groupId={groupId}
          isDependentOnly={isDependentOnly}
          onUpdateBenefit={onUpdateBenefit}
        />
      )}
    </div>
  )
}

function BothCoverageEditor({
  benefit,
  groupErrors,
  groupId,
  onUpdateBenefit,
}: {
  benefit: Benefit
  groupErrors: Record<string, string>
  groupId: string
  onUpdateBenefit: (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[],
  ) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <CoverageAmountCard
        benefit={benefit}
        field="employeeAmount"
        groupErrors={groupErrors}
        groupId={groupId}
        label="Employee"
        onUpdateBenefit={onUpdateBenefit}
      />
      <CoverageAmountCard
        benefit={benefit}
        coPayFieldPrefix="dependentCoPayment"
        field="dependantAmount"
        groupErrors={groupErrors}
        groupId={groupId}
        label="Dependent"
        onUpdateBenefit={onUpdateBenefit}
      />
      {groupErrors[`benefit_${groupId}_${benefit.serviceId}`] ? (
        <p className="text-micro text-destructive md:col-span-2">
          {groupErrors[`benefit_${groupId}_${benefit.serviceId}`]}
        </p>
      ) : null}
    </div>
  )
}

function CoverageAmountCard({
  benefit,
  coPayFieldPrefix = "coPayment",
  field,
  groupErrors,
  groupId,
  label,
  onUpdateBenefit,
}: {
  benefit: Benefit
  coPayFieldPrefix?: "coPayment" | "dependentCoPayment"
  field: "employeeAmount" | "dependantAmount"
  groupErrors: Record<string, string>
  groupId: string
  label: string
  onUpdateBenefit: (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[],
  ) => void
}) {
  const isDependent = field === "dependantAmount"
  const copay = isDependent
    ? (benefit.dependentCoPayment ?? { required: false, type: "Percentage" as const, value: 0 })
    : benefit.coPayment

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1">
        <label className="block text-micro font-medium text-faint">Amount (RM)</label>
        <input
          type="number"
          className={cn(
            "h-10 w-32 rounded-lg border bg-background px-3 py-2 text-right font-mono text-label outline-none focus:ring-2 focus:ring-primary/10",
            groupErrors[`benefit_${groupId}_${benefit.serviceId}`] ? "border-destructive" : "border-border",
          )}
          value={benefit[field] ?? ""}
          onChange={(event) => {
            const nextValue = event.target.value === "" ? 0 : parseFloat(event.target.value)
            const otherValue =
              field === "employeeAmount"
                ? (benefit.dependantAmount ?? 0)
                : (benefit.employeeAmount ?? 0)
            onUpdateBenefit(benefit.id, field, nextValue)
            onUpdateBenefit(benefit.id, "amount", nextValue + otherValue)
          }}
        />
      </div>
      <CoPaymentToggle
        label="Co-payment"
        required={copay.required}
        type={copay.type}
        value={copay.value}
        errorKey={`${isDependent ? "dep_copay" : "copay"}_${groupId}_${benefit.serviceId}`}
        groupErrors={groupErrors}
        onCheckedChange={(checked) =>
          onUpdateBenefit(benefit.id, `${coPayFieldPrefix}.required`, checked)
        }
        onChangeType={(value) => onUpdateBenefit(benefit.id, `${coPayFieldPrefix}.type`, value)}
        onChangeValue={(value) => onUpdateBenefit(benefit.id, `${coPayFieldPrefix}.value`, value)}
      />
    </div>
  )
}

function SingleCoverageEditor({
  benefit,
  coverageScope,
  groupErrors,
  groupId,
  isDependentOnly,
  onUpdateBenefit,
}: {
  benefit: Benefit
  coverageScope: BenefitGroupCoverageScope
  groupErrors: Record<string, string>
  groupId: string
  isDependentOnly: boolean
  onUpdateBenefit: (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[],
  ) => void
}) {
  const errorKey = `benefit_${groupId}_${benefit.serviceId}`

  return (
    <div className="flex flex-wrap items-end gap-5">
      <div className="space-y-1">
        <label className="block text-micro font-medium text-faint">
          {coverageScope === "Dependent" ? "Dependent Amount (RM)" : "Employee Amount (RM)"}
        </label>
        <input
          type="number"
          className={cn(
            "h-10 w-32 rounded-lg border bg-background px-3 py-2 text-right font-mono text-label outline-none focus:ring-2 focus:ring-primary/10",
            groupErrors[errorKey] ? "border-destructive" : "border-border",
          )}
          value={
            isDependentOnly
              ? (typeof benefit.dependantAmount === "number" ? benefit.dependantAmount : benefit.amount) || ""
              : benefit.amount || ""
          }
          onChange={(event) => {
            const value = event.target.value === "" ? 0 : parseFloat(event.target.value)
            if (isDependentOnly) {
              onUpdateBenefit(benefit.id, "dependantAmount", value)
              onUpdateBenefit(benefit.id, "amount", value)
            } else {
              onUpdateBenefit(benefit.id, "amount", value)
            }
          }}
        />
        {groupErrors[errorKey] ? <p className="text-micro text-destructive">{groupErrors[errorKey]}</p> : null}
      </div>

      <CoPaymentToggle
        label="Co-payment"
        required={isDependentOnly ? (benefit.dependentCoPayment?.required ?? false) : benefit.coPayment.required}
        type={isDependentOnly ? (benefit.dependentCoPayment?.type ?? "Percentage") : benefit.coPayment.type}
        value={isDependentOnly ? (benefit.dependentCoPayment?.value ?? 0) : benefit.coPayment.value}
        errorKey={isDependentOnly ? `dep_copay_${groupId}_${benefit.serviceId}` : `copay_${groupId}_${benefit.serviceId}`}
        groupErrors={groupErrors}
        onCheckedChange={(checked) =>
          onUpdateBenefit(
            benefit.id,
            isDependentOnly ? "dependentCoPayment.required" : "coPayment.required",
            checked,
          )
        }
        onChangeType={(value) =>
          onUpdateBenefit(
            benefit.id,
            isDependentOnly ? "dependentCoPayment.type" : "coPayment.type",
            value,
          )
        }
        onChangeValue={(value) =>
          onUpdateBenefit(
            benefit.id,
            isDependentOnly ? "dependentCoPayment.value" : "coPayment.value",
            value,
          )
        }
      />
    </div>
  )
}
