"use client"

import { DetailSection } from "@/components/shared/detail-section"
import { FieldHelp } from "@/components/shared/field-help"
import { Check, IdentificationCard } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { MOCK_ORGS } from "@/lib/mock-data"
import { EMPLOYMENT_TYPES } from "../wizard-constants"
import { ReadField, StatusPicker } from "../wizard-shared-ui"
import type { PolicyStatus } from "@/types/policy"
import type { BenefitPolicyWizardCtx } from "../wizard-types"

interface BasicsStepProps {
  ctx: BenefitPolicyWizardCtx
  mode?: "create" | "edit" | "view"
}

export function BasicsStep({ ctx, mode = "create" }: BasicsStepProps) {
  const { policyData, setPolicyData, validationErrors, isViewMode, orgId } = ctx

  if (isViewMode) {
    const activeOrgId = orgId ?? policyData.organizationId
    const org = activeOrgId ? MOCK_ORGS.find((item) => item.id === activeOrgId) : null
    const tierOptions = (org?.tierConfigs ?? []).map((t) => ({
      value: t.id,
      label: t.code ? `${t.code} - ${t.name}` : t.name,
    }))

    return (
      <div className="max-w-3xl animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-2">
        <DetailSection
          title="Policy Basics"
          icon={<IdentificationCard size={18} weight="duotone" />}
          description="Name your policy and define who is eligible"
          ghost
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ReadField label="Policy Name" value={policyData.name} />
            <ReadField label="Description" value={policyData.description || undefined} />
            <ReadField
              label="Employment Types"
              value={(policyData.eligibleEmploymentTypes ?? [])
                .map((t) => EMPLOYMENT_TYPES.find((e) => e.id === t)?.label ?? t)
                .join(", ")}
            />
            {tierOptions.length > 0 && (
              <ReadField
                label="Eligible Tiers"
                value={
                  (policyData.eligibility?.tierIds ?? []).length > 0
                    ? (policyData.eligibility?.tierIds ?? [])
                        .map((id) => tierOptions.find((t) => t.value === id)?.label ?? id)
                        .join(", ")
                    : "All tiers"
                }
              />
            )}
          </div>
        </DetailSection>
        {(isViewMode || mode === "edit") && (
          <StatusSection policyData={policyData} setPolicyData={ctx.setPolicyData} isViewMode={isViewMode} />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-2">
      <DetailSection
        title="Policy Basics"
        icon={<IdentificationCard size={18} weight="duotone" />}
        description="Name your policy and define who is eligible"
        ghost
      >
        <div className="space-y-5 md:max-w-xl">
          <div className="space-y-1.5">
            <label className="text-label font-medium text-subtle">
              Policy Name{" "}
              <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wellness Premium 2026"
              className={cn(
                "w-full rounded-lg border bg-background px-4 py-3 text-body font-semibold text-foreground transition-all outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
                validationErrors.name
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                  : "border-border"
              )}
              value={policyData.name || ""}
              onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
              disabled={isViewMode}
            />
            {validationErrors.name && (
              <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                {validationErrors.name}
              </p>
            )}
            <p className="text-micro text-faint">
              Max 100 characters. Must be unique in your account.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-label font-medium text-subtle">Description</label>
            <textarea
              placeholder="Describe the purpose of this benefit policy..."
              rows={3}
              className="min-h-[80px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-body font-medium text-muted-foreground transition-all outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              value={policyData.description || ""}
              onChange={(e) => setPolicyData({ ...policyData, description: e.target.value })}
              disabled={isViewMode}
            />
            <p className="text-micro text-faint">Optional. Max 300 characters.</p>
          </div>

          <div className="space-y-3">
            <label className="text-label font-medium text-subtle">
              Employment Types{" "}
              <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            {validationErrors.eligibleEmploymentTypes && (
              <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                {validationErrors.eligibleEmploymentTypes}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {(() => {
                const allSelected = EMPLOYMENT_TYPES.every((t) =>
                  policyData.eligibleEmploymentTypes?.includes(t.id)
                )
                return (
                  <button
                    type="button"
                    disabled={isViewMode}
                    onClick={() =>
                      setPolicyData({
                        ...policyData,
                        eligibleEmploymentTypes: allSelected
                          ? policyData.eligibleEmploymentTypes
                          : EMPLOYMENT_TYPES.map((t) => t.id),
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
                    key={type.id}
                    disabled={isViewMode}
                    onClick={() => ctx.toggleEmploymentType(type.id)}
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

          {/* Tier eligibility */}
          {(() => {
            const activeOrgId = orgId ?? policyData.organizationId
            if (!activeOrgId) return null
            const org = MOCK_ORGS.find((item) => item.id === activeOrgId)
            const tierOptions = (org?.tierConfigs ?? []).map((tier) => ({
              value: tier.id,
              label: tier.code ? `${tier.code} - ${tier.name}` : tier.name,
            }))
            if (tierOptions.length === 0) return null
            return (
              <div className="space-y-3">
                <label className="text-label font-medium text-subtle">Eligible Tiers</label>
                <div className="flex flex-wrap gap-2">
                  {tierOptions.map((tier) => {
                    const selected = policyData.eligibility?.tierIds?.includes(tier.value) ?? false
                    return (
                      <button
                        key={tier.value}
                        type="button"
                        disabled={isViewMode}
                        onClick={() => {
                          const current = policyData.eligibility?.tierIds ?? []
                          const updated = selected
                            ? current.filter((id) => id !== tier.value)
                            : [...current, tier.value]
                          setPolicyData({
                            ...policyData,
                            eligibility: { ...policyData.eligibility, tierIds: updated },
                          })
                        }}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-label font-medium transition-all",
                          selected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {tier.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-micro text-faint">Leave all unchecked to apply to all tiers.</p>
              </div>
            )
          })()}
        </div>
      </DetailSection>

      {mode === "edit" && (
        <StatusSection policyData={policyData} setPolicyData={ctx.setPolicyData} isViewMode={isViewMode} />
      )}
    </div>
  )
}

// ─── Status section (shown in edit/view mode alongside Basics) ────────────────

function StatusSection({
  policyData,
  setPolicyData,
  isViewMode,
}: Pick<BenefitPolicyWizardCtx, "policyData" | "setPolicyData" | "isViewMode">) {
  return (
    <div className="mt-10 border-t border-border pt-6">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-body font-medium text-foreground">Policy Status</h4>
          <p className="mt-0.5 text-label text-faint">
            Control the visibility and lifecycle state of this policy.
          </p>
        </div>
        <StatusPicker
          value={(policyData.status as PolicyStatus) || "draft"}
          onChange={(s) => setPolicyData({ ...policyData, status: s })}
          disabled={isViewMode}
        />
      </div>
    </div>
  )
}
