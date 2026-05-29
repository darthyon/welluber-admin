"use client"

import { IdentificationCard, Check, Plus, DiceFive, CaretDown } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { EMPLOYMENT_TYPES } from "../wizard-constants"
import { SectionHeader, FieldLabel, ErrorText, HelpText } from "../wizard-shared-ui"
import type { PolicyWizardCtx } from "../wizard-section-types"

const AI_POLICY_NAMES = [
  "Wellness Allocation 2026",
  "Active Living Plan",
  "Mind & Care Essentials",
  "Executive Health Plus",
  "Fitness First Bundle",
  "Holistic Wellness Program",
  "Recovery & Recharge",
  "Corporate Vitality Plan",
]

import { MOCK_ORGS } from "@/lib/mock-data"
import { FormSelect } from "@/components/shared/form-select"

interface PolicyDetailsSectionProps {
  ctx: PolicyWizardCtx
}

export function PolicyDetailsSection({ ctx }: PolicyDetailsSectionProps) {
  const {
    policyData,
    setPolicyData,
    validationErrors,
    lockedOrganizationId,
    tierOptions,
    departmentOptions,
    nameInputRef,
    toggleEmploymentType,
    blurName,
  } = ctx

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={IdentificationCard}
        title="Policy Details"
        description="Name your policy and define who is eligible"
      />

      {/* Policy Name */}
      <div className="space-y-1.5">
        <FieldLabel required>Policy Name</FieldLabel>
        <div
          className={cn(
            "flex w-full items-center overflow-hidden rounded-lg border bg-background transition-all focus-within:ring-2 focus-within:ring-primary/10",
            validationErrors.name
              ? "border-destructive focus-within:border-destructive"
              : "focus-within:border-primary/40"
          )}
        >
          <input
            ref={nameInputRef}
            type="text"
            maxLength={100}
            placeholder="e.g. Wellness Premium 2026"
            aria-invalid={!!validationErrors.name}
            aria-describedby={validationErrors.name ? "policy-name-error" : undefined}
            className="min-w-0 flex-1 border-0 px-4 py-3 text-body font-semibold text-foreground outline-none"
            value={policyData.name || ""}
            onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
            onBlur={blurName}
          />
          <span className="shrink-0 px-2 text-micro text-faint tabular-nums">
            {(policyData.name || "").length}/100
          </span>
          <button
            type="button"
            onClick={() => {
              const random = AI_POLICY_NAMES[Math.floor(Math.random() * AI_POLICY_NAMES.length)]
              setPolicyData({ ...policyData, name: random })
            }}
            className="inline-flex shrink-0 items-center gap-1 px-3 py-3 text-label font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary/80"
          >
            <DiceFive size={14} weight="bold" />
            Suggest
          </button>
        </div>
        {validationErrors.name && (
          <ErrorText id="policy-name-error">{validationErrors.name}</ErrorText>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <FieldLabel>Description</FieldLabel>
        <div className="relative w-full rounded-lg border border-border bg-background transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
          <textarea
            placeholder="Describe the purpose of this benefit policy..."
            rows={3}
            maxLength={300}
            className="min-h-[80px] w-full resize-none border-0 bg-transparent px-4 py-3 pb-7 text-body font-medium text-muted-foreground outline-none"
            value={policyData.description || ""}
            onChange={(e) => setPolicyData({ ...policyData, description: e.target.value })}
          />
          <span className="absolute right-3 bottom-2 text-micro text-faint tabular-nums">
            {(policyData.description || "").length}/300
          </span>
        </div>
      </div>

      {/* Organisation */}
      <div className="space-y-1.5">
        <FieldLabel required>Organisation</FieldLabel>
        <FormSelect
          value={policyData.organizationId || ""}
          onChange={(v) => setPolicyData({ ...policyData, organizationId: v })}
          options={MOCK_ORGS.map((org) => ({ label: org.name, value: org.id }))}
          placeholder="Select organisation..."
          disabled={!!lockedOrganizationId}
          error={!!validationErrors.organizationId}
        />
        {validationErrors.organizationId && (
          <ErrorText>{validationErrors.organizationId}</ErrorText>
        )}
      </div>

      {/* Eligible Tiers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldLabel>Eligible Tiers</FieldLabel>
          {policyData.organizationId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-label font-medium text-primary hover:bg-primary/5"
              onClick={() =>
                window.open(`/organizations/${policyData.organizationId}?tab=settings`, "_blank")
              }
            >
              <Plus size={12} weight="bold" />
              Add Tier
            </Button>
          )}
        </div>
        {!policyData.organizationId ? (
          <p className="text-label text-faint italic">Select an organisation to load tier options.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(() => {
              const tierIds = policyData.eligibility?.tierIds ?? []
              const allSelected =
                tierOptions.length > 0 && tierOptions.every((t) => tierIds.includes(t.value))
              return (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPolicyData({
                        ...policyData,
                        eligibility: {
                          ...policyData.eligibility,
                          tierIds: allSelected ? [] : tierOptions.map((t) => t.value),
                        },
                      })
                    }
                    className={cn(
                      "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                      allSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {allSelected && <Check size={12} weight="bold" className="mr-1.5 inline" />}
                    All
                  </button>
                  {tierOptions.map((tier) => {
                    const selected = tierIds.includes(tier.value)
                    return (
                      <button
                        type="button"
                        key={tier.value}
                        onClick={() => {
                          const updated = selected
                            ? tierIds.filter((id) => id !== tier.value)
                            : [...tierIds, tier.value]
                          setPolicyData({
                            ...policyData,
                            eligibility: { ...policyData.eligibility, tierIds: updated },
                          })
                        }}
                        className={cn(
                          "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {selected && <Check size={12} weight="bold" className="mr-1.5 inline" />}
                        {tier.label}
                      </button>
                    )
                  })}
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* Eligible Departments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldLabel>Eligible Departments</FieldLabel>
          {policyData.organizationId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-label font-medium text-primary hover:bg-primary/5"
              onClick={() =>
                window.open(`/organizations/${policyData.organizationId}?tab=settings`, "_blank")
              }
            >
              <Plus size={12} weight="bold" />
              Add Department
            </Button>
          )}
        </div>
        {!policyData.organizationId ? (
          <p className="text-label text-faint italic">
            Select an organisation to load department options.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(() => {
              const deptIds = policyData.eligibility?.departmentIds ?? []
              const allSelected =
                departmentOptions.length > 0 &&
                departmentOptions.every((d) => deptIds.includes(d.value))
              return (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPolicyData({
                        ...policyData,
                        eligibility: {
                          ...policyData.eligibility,
                          departmentIds: allSelected ? [] : departmentOptions.map((d) => d.value),
                        },
                      })
                    }
                    className={cn(
                      "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                      allSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {allSelected && <Check size={12} weight="bold" className="mr-1.5 inline" />}
                    All
                  </button>
                  {departmentOptions.map((dept) => {
                    const selected = deptIds.includes(dept.value)
                    return (
                      <button
                        type="button"
                        key={dept.value}
                        onClick={() => {
                          const updated = selected
                            ? deptIds.filter((id) => id !== dept.value)
                            : [...deptIds, dept.value]
                          setPolicyData({
                            ...policyData,
                            eligibility: { ...policyData.eligibility, departmentIds: updated },
                          })
                        }}
                        className={cn(
                          "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {selected && <Check size={12} weight="bold" className="mr-1.5 inline" />}
                        {dept.label}
                      </button>
                    )
                  })}
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* Employment Types */}
      <div className="space-y-3">
        <FieldLabel required>Employment Types</FieldLabel>
        {validationErrors.eligibleEmploymentTypes && (
          <ErrorText>{validationErrors.eligibleEmploymentTypes}</ErrorText>
        )}
        <div className="flex flex-wrap gap-2">
          {(() => {
            const allSelected = EMPLOYMENT_TYPES.every((t) =>
              policyData.eligibleEmploymentTypes?.includes(t.id)
            )
            return (
              <button
                type="button"
                onClick={() =>
                  setPolicyData({
                    ...policyData,
                    eligibleEmploymentTypes: allSelected ? [] : EMPLOYMENT_TYPES.map((t) => t.id),
                  })
                }
                className={cn(
                  "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                  allSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                )}
              >
                {allSelected && <Check size={12} weight="bold" className="mr-1.5 inline" />}
                All
              </button>
            )
          })()}
          {EMPLOYMENT_TYPES.map((type) => {
            const selected = policyData.eligibleEmploymentTypes?.includes(type.id) || false
            return (
              <button
                type="button"
                key={type.id}
                onClick={() => toggleEmploymentType(type.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                )}
              >
                {selected && <Check size={12} weight="bold" className="mr-1.5 inline" />}
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="border-t border-border/60 pt-4">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="group flex w-full items-center gap-2 text-left">
            <CaretDown
              size={14}
              weight="bold"
              className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
            <span className="text-body font-semibold text-foreground">Advanced Filters</span>
            <span className="ml-1 text-label font-medium text-faint">(optional)</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <p className="mb-4 text-label text-muted-foreground">
              Narrow which employees are automatically assigned this policy.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <FieldLabel>Age Range (Min)</FieldLabel>
                <input
                  type="number"
                  placeholder="e.g. 18"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                  value={policyData.eligibility?.minAge || ""}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      eligibility: {
                        ...policyData.eligibility,
                        minAge: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                />
                <HelpText>Leave blank for no minimum.</HelpText>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Age Range (Max)</FieldLabel>
                <input
                  type="number"
                  placeholder="e.g. 65"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                  value={policyData.eligibility?.maxAge || ""}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      eligibility: {
                        ...policyData.eligibility,
                        maxAge: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                />
                <HelpText>Leave blank for no maximum.</HelpText>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Gender</FieldLabel>
                <div className="flex gap-2">
                  {(["all", "male", "female"] as const).map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() =>
                        setPolicyData({
                          ...policyData,
                          eligibility: { ...policyData.eligibility, gender: g },
                        })
                      }
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-body font-medium capitalize transition-all",
                        policyData.eligibility?.gender === g ||
                          (!policyData.eligibility?.gender && g === "all")
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-border/80"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
