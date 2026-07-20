"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { useVersionWizard } from "@/hooks/use-version-wizard"
import { StepIndicator } from "./version-wizard-steps/step-indicator"
import { OverridesStep } from "./version-wizard-steps/overrides-step"
import { TargetingStep } from "./version-wizard-steps/targeting-step"
import { ReviewStep } from "./version-wizard-steps/review-step"
import type { VersionWizardProps } from "./version-wizard-types"

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
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="glass-card rounded-xl px-5 py-4">
        <StepIndicator currentStep={wiz.currentStep} />
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

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl duration-700 ease-out slide-in-from-bottom-10">
        <Button
          variant="ghost"
          size="lg"
          className="px-6 text-body font-medium transition-colors"
          onClick={wiz.currentStep === 1 ? props.onCancel : wiz.goPrev}
        >
          {wiz.currentStep === 1 ? (
            "Cancel"
          ) : (
            <span className="flex items-center gap-1.5">
              <CaretLeft size={14} weight="bold" />
              Back
            </span>
          )}
        </Button>
        <div className="h-6 w-px bg-border/40" />
        {wiz.currentStep < 3 ? (
          <Button
            size="lg"
            className="flex items-center gap-2 px-8 text-body font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={wiz.goNext}
          >
            Continue
            <CaretRight size={14} weight="bold" />
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={wiz.isSubmitting}
            className="flex items-center gap-2 px-8 text-body font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={wiz.handleSubmit}
          >
            {wiz.isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating…
              </>
            ) : (
              "Create Version"
            )}
          </Button>
        )}
      </div>

      {/* Bottom spacer for floating nav */}
      <div className="h-20" />
    </div>
  )
}
