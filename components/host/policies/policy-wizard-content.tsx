"use client"

import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import { useState } from "react"
import { FormStepIndicator, type FormWizardStep } from "@/components/shared/form-step-wizard"
import { usePolicyWizardContent } from "@/hooks/use-policy-wizard-content"
import { PolicyDetailsSection } from "./wizard-sections/policy-details-section"
import { PoolSection } from "./wizard-sections/pool-section"
import { GroupsSection } from "./wizard-sections/groups-section"

// Re-export for consumers that import from this file
export { PolicyReviewCards } from "./policy-review-cards"

const POLICY_STEPS = [
  { id: 1, label: "Policy Details" },
  { id: 2, label: "Pool And Cycle" },
  { id: 3, label: "Benefit Groups And Services" },
] as const satisfies readonly FormWizardStep<1 | 2 | 3>[]

// ─── Props ────────────────────────────────────────────────────────────────────

interface PolicyWizardContentProps {
  mode?: "create" | "edit"
  groupsOnly?: boolean
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
  onSubmit: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
  onReview?: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
  lockedOrganizationId?: string
  onValidationChange?: (sectionErrorCounts: Record<string, number>) => void
  onDirtyChange?: (dirty: boolean) => void
  onTargetingChange?: (targeting: {
    organizationId?: string
    employmentTypes: string[]
    tierIds: string[]
    departmentIds: string[]
  }) => void
  onIssuesChange?: (
    entries: Array<{ key: string; label: string; target: string }>
  ) => void
  onSaveStatusChange?: (state: {
    status: "idle" | "saving" | "saved"
    savedAt?: string
  }) => void
  currentStep?: 1 | 2 | 3
  onStepChange?: (step: 1 | 2 | 3) => void
  allowStepJumping?: boolean
  reviewOnSubmit?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PolicyWizardContent({
  mode = "create",
  groupsOnly = false,
  initialData,
  onSubmit,
  onReview,
  lockedOrganizationId,
  onValidationChange,
  onDirtyChange,
  onTargetingChange,
  onIssuesChange,
  onSaveStatusChange,
  currentStep: controlledStep,
  onStepChange,
  allowStepJumping = false,
  reviewOnSubmit = false,
}: PolicyWizardContentProps) {
  const [localStep, setLocalStep] = useState<1 | 2 | 3>(groupsOnly ? 3 : 1)
  const currentStep = controlledStep ?? localStep
  const changeStep = (step: 1 | 2 | 3) => {
    if (!controlledStep) setLocalStep(step)
    onStepChange?.(step)
  }
  const { ctx, handleSubmit } = usePolicyWizardContent({
    mode,
    groupsOnly,
    initialData,
    onSubmit,
    onReview,
    lockedOrganizationId,
    onValidationChange,
    onDirtyChange,
    onTargetingChange,
    onIssuesChange,
    onSaveStatusChange,
  })

  return (
    <form
      id="policyWizardForm"
      onSubmit={(e) => {
        e.preventDefault()
        if (!groupsOnly && currentStep < 3 && !reviewOnSubmit) {
          changeStep((currentStep + 1) as 1 | 2 | 3)
        } else {
          handleSubmit()
        }
      }}
      className="space-y-8"
    >
      {!groupsOnly && (
        <FormStepIndicator currentStep={currentStep} onStepClick={changeStep} steps={POLICY_STEPS} allowStepJumping={allowStepJumping} />
      )}

      {!groupsOnly && currentStep === 1 && (
        <section id="policy-details" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">
              <PolicyDetailsSection ctx={ctx} />
            </div>
          </div>
        </section>
      )}

      {!groupsOnly && currentStep === 2 && (
        <section id="pool-cycle" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">
              <PoolSection ctx={ctx} />
            </div>
          </div>
        </section>
      )}

      {(groupsOnly || currentStep === 3) && (
        <section id="groups-services" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">
              <GroupsSection ctx={ctx} />
            </div>
          </div>
        </section>
      )}
    </form>
  )
}
