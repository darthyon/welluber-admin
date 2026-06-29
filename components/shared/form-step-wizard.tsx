"use client"

import {
  ArrowRight,
  CaretLeft,
  Check,
  PaperPlaneTilt,
} from "@phosphor-icons/react"
import { Spinner } from "@/components/shared/spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FormWizardStep<TStep extends number = number> {
  id: TStep
  label: string
}

interface FormStepIndicatorProps<TStep extends number = number> {
  currentStep: TStep
  onStepClick: (step: TStep) => void
  steps: readonly FormWizardStep<TStep>[]
}

export function FormStepIndicator<TStep extends number = number>({
  currentStep,
  onStepClick,
  steps,
}: FormStepIndicatorProps<TStep>) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => {
        const isDone = currentStep > step.id
        const isActive = currentStep === step.id

        return (
          <div key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className="flex items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-label font-semibold transition-all",
                  isDone &&
                    "bg-primary text-primary-foreground hover:ring-4 hover:ring-primary/20",
                  isActive &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone &&
                    !isActive &&
                    "border border-border bg-muted text-muted-foreground hover:border-primary/40"
                )}
              >
                {isDone ? <Check size={13} weight="bold" /> : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-label font-medium sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8",
                  currentStep > step.id ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface WizardActionBarProps<TStep extends number = number> {
  createLabel: string
  currentStep: TStep
  isEditing: boolean
  isSubmitting: boolean
  onBack: () => void
  onNext: () => void
  saveLabel: string
  totalSteps: number
}

export function WizardActionBar<TStep extends number = number>({
  createLabel,
  currentStep,
  isEditing,
  isSubmitting,
  onBack,
  onNext,
  saveLabel,
  totalSteps,
}: WizardActionBarProps<TStep>) {
  const isLastStep = currentStep === totalSteps

  return (
    <>
      <div className="pointer-events-none sticky bottom-0 z-10 flex justify-end pt-4 pb-8">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background px-3 py-2 shadow-lg">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onBack}
            disabled={currentStep === 1 || isSubmitting}
            className="gap-2 px-4 text-body font-semibold text-muted-foreground hover:text-foreground"
          >
            <CaretLeft size={14} weight="bold" />
            Back
          </Button>

          <div className="h-6 w-px bg-border/40" />

          {isLastStep ? (
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="flex items-center gap-2 px-8 text-body font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" variant="white" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEditing ? saveLabel : createLabel}
                  <PaperPlaneTilt size={14} weight="bold" />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={onNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 text-body font-semibold"
            >
              Next
              <ArrowRight size={14} weight="bold" />
            </Button>
          )}
        </div>
      </div>

      <div className="h-28" />
    </>
  )
}
