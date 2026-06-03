"use client"

import { IdentificationCard, Plus, DiceFive, CaretDown } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { EMPLOYMENT_TYPES } from "../wizard-constants"
import { SectionHeader, FieldLabel, ErrorText } from "../wizard-shared-ui"
import type { PolicyWizardCtx } from "../wizard-section-types"
import { PolicyAdvancedFilters } from "../policy-advanced-filters"
import { SelectablePillGroup } from "../selectable-pill-group"

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
  const selectedTierIds = policyData.eligibility?.tierIds ?? []
  const selectedDepartmentIds = policyData.eligibility?.departmentIds ?? []
  const selectedEmploymentTypes = policyData.eligibleEmploymentTypes ?? []

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
          <SelectablePillGroup
            options={tierOptions}
            selectedValues={selectedTierIds}
            buttonClassName="px-4 py-2 text-body font-semibold"
            onToggleAll={() =>
              setPolicyData({
                ...policyData,
                eligibility: {
                  ...policyData.eligibility,
                  tierIds:
                    tierOptions.length > 0 && tierOptions.every((tier) => selectedTierIds.includes(tier.value))
                      ? []
                      : tierOptions.map((tier) => tier.value),
                },
              })
            }
            onToggle={(value) =>
              setPolicyData({
                ...policyData,
                eligibility: {
                  ...policyData.eligibility,
                  tierIds: selectedTierIds.includes(value)
                    ? selectedTierIds.filter((currentId) => currentId !== value)
                    : [...selectedTierIds, value],
                },
              })
            }
          />
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
          <SelectablePillGroup
            options={departmentOptions}
            selectedValues={selectedDepartmentIds}
            buttonClassName="px-4 py-2 text-body font-semibold"
            onToggleAll={() =>
              setPolicyData({
                ...policyData,
                eligibility: {
                  ...policyData.eligibility,
                  departmentIds:
                    departmentOptions.length > 0 &&
                    departmentOptions.every((department) => selectedDepartmentIds.includes(department.value))
                      ? []
                      : departmentOptions.map((department) => department.value),
                },
              })
            }
            onToggle={(value) =>
              setPolicyData({
                ...policyData,
                eligibility: {
                  ...policyData.eligibility,
                  departmentIds: selectedDepartmentIds.includes(value)
                    ? selectedDepartmentIds.filter((currentId) => currentId !== value)
                    : [...selectedDepartmentIds, value],
                },
              })
            }
          />
        )}
      </div>

      {/* Employment Types */}
      <div className="space-y-3">
        <FieldLabel required>Employment Types</FieldLabel>
        {validationErrors.eligibleEmploymentTypes && (
          <ErrorText>{validationErrors.eligibleEmploymentTypes}</ErrorText>
        )}
        <SelectablePillGroup
          options={EMPLOYMENT_TYPES.map((type) => ({ label: type.label, value: type.id }))}
          selectedValues={selectedEmploymentTypes}
          buttonClassName="px-4 py-2 text-body font-semibold"
          onToggleAll={() =>
            setPolicyData({
              ...policyData,
              eligibleEmploymentTypes:
                EMPLOYMENT_TYPES.every((type) => selectedEmploymentTypes.includes(type.id))
                  ? []
                  : EMPLOYMENT_TYPES.map((type) => type.id),
            })
          }
          onToggle={toggleEmploymentType}
        />
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
            <PolicyAdvancedFilters policyData={policyData} setPolicyData={setPolicyData} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
