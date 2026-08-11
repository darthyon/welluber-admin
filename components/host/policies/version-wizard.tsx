"use client"

import { SuccessCelebration } from "@/components/shared/success-celebration"
import {
  FormActionBar,
  FormStepIndicator,
  type FormWizardStep,
} from "@/components/shared/form-step-wizard"
import { useVersionWizard } from "@/hooks/use-version-wizard"
import { OverridesStep } from "./version-wizard-steps/overrides-step"
import { TargetingStep } from "./version-wizard-steps/targeting-step"
import { ReviewStep } from "./version-wizard-steps/review-step"
import type { VersionWizardProps } from "./version-wizard-types"

const VERSION_WIZARD_STEPS = [
  { id: 1, label: "Override Amounts" },
  { id: 2, label: "Targeting" },
  { id: 3, label: "Review And Assign" },
] as const satisfies readonly FormWizardStep<1 | 2 | 3>[]

// Re-export types for consumers
export type {
  VersionWizardProps,
  VersionResult,
  BenefitOverride,
} from "./version-wizard-types"

// ─── Component ────────────────────────────────────────────────────────────────

export function VersionWizard(props: VersionWizardProps) {
  const wiz = useVersionWizard(props)

  if (wiz.isSuccess) {
    return (
      <SuccessCelebration
        title="Version Created"
        message={`Sub-policy derived from ${props.parentPolicy.name} has been created and assigned to ${wiz.ctx.confirmedEmployeeIds.length} employee${wiz.ctx.confirmedEmployeeIds.length !== 1 ? "s" : ""}.`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      {/* Step indicator */}
      <div className="glass-card rounded-xl px-5 py-4">
        <FormStepIndicator
          currentStep={wiz.currentStep as 1 | 2 | 3}
          onStepClick={(step) => wiz.goToStep(step)}
          steps={VERSION_WIZARD_STEPS}
        />
      </div>

      {/* Step content */}
      <div
        key={wiz.currentStep}
        className="animate-in duration-200 fade-in slide-in-from-bottom-1"
      >
        {wiz.currentStep === 1 && <OverridesStep ctx={wiz.ctx} />}
        {wiz.currentStep === 2 && <TargetingStep ctx={wiz.ctx} />}
        {wiz.currentStep === 3 && <ReviewStep ctx={wiz.ctx} />}
      </div>

      <FormActionBar
        currentStep={wiz.currentStep as 1 | 2 | 3}
        totalSteps={3}
        mode="create"
        onCancel={props.onCancel}
        onBack={wiz.goPrev}
        onNext={wiz.goNext}
        onSave={wiz.handleSubmit}
        primaryLabel="Create Version"
        primaryIcon="plus"
        isSubmitting={wiz.isSubmitting}
      />
    </div>
  )
}
