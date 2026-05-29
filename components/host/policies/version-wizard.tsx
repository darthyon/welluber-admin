"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { motion, AnimatePresence } from "framer-motion"
import { useVersionWizard } from "@/hooks/use-version-wizard"
import { StepIndicator } from "./version-wizard-steps/step-indicator"
import { OverridesStep } from "./version-wizard-steps/overrides-step"
import { TargetingStep } from "./version-wizard-steps/targeting-step"
import { ReviewStep } from "./version-wizard-steps/review-step"
import type { VersionWizardProps } from "./version-wizard-types"

// Re-export types for consumers
export type { VersionWizardProps, VersionResult, BenefitOverride } from "./version-wizard-types"

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
      <AnimatePresence mode="wait">
        <motion.div
          key={wiz.currentStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {wiz.currentStep === 1 && <OverridesStep ctx={wiz.ctx} />}
          {wiz.currentStep === 2 && <TargetingStep ctx={wiz.ctx} />}
          {wiz.currentStep === 3 && <ReviewStep ctx={wiz.ctx} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
        <Button
          variant="ghost"
          size="lg"
          className="text-body font-medium px-6 transition-colors"
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
        <div className="w-px h-6 bg-border/40" />
        {wiz.currentStep < 3 ? (
          <Button
            size="lg"
            className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={wiz.goNext}
          >
            Continue
            <CaretRight size={14} weight="bold" />
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={wiz.isSubmitting}
            className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={wiz.handleSubmit}
          >
            {wiz.isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
