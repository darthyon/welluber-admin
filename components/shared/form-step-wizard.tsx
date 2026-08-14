"use client"

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
} from "@phosphor-icons/react"
import { Spinner } from "@/components/shared/spinner"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface FormWizardStep<TStep extends number = number> {
  id: TStep
  label: string
}

interface FormStepIndicatorProps<TStep extends number = number> {
  currentStep: TStep
  onStepClick: (step: TStep) => void
  steps: readonly FormWizardStep<TStep>[]
  allowStepJumping?: boolean
}

export function FormStepIndicator<TStep extends number = number>({
  currentStep,
  onStepClick,
  steps,
  allowStepJumping = false,
}: FormStepIndicatorProps<TStep>) {
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-2">
        {steps.map((step, idx) => {
          const isDone = currentStep > step.id
          const isActive = currentStep === step.id
          const isReachable = allowStepJumping || step.id <= currentStep

          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                disabled={!isReachable}
                aria-current={isActive ? "step" : undefined}
                className="flex items-center gap-2 rounded-4xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  )
}

export interface FormActionBarProps<TStep extends number = number> {
  currentStep: TStep
  totalSteps: number
  mode: "create" | "edit"
  onCancel: () => void
  onBack: () => void
  onNext?: () => void
  onSave?: () => void
  primaryLabel: string
  primaryIcon?: "none" | "plus" | "check" | "arrow-right"
  formId?: string
  isSubmitting?: boolean
  saveOnEveryStep?: boolean
  contentClassName?: string
  secondaryAction?: {
    label: string
    onClick: () => void
    isLoading?: boolean
  }
  cancelLabel?: string
}

export function FormActionBar<TStep extends number = number>({
  contentClassName = "max-w-[1120px]",
  cancelLabel = "Cancel",
  currentStep,
  formId,
  isSubmitting = false,
  mode,
  onBack,
  onCancel,
  onNext,
  onSave,
  primaryIcon = "none",
  primaryLabel,
  saveOnEveryStep = mode === "edit",
  secondaryAction,
  totalSteps,
}: FormActionBarProps<TStep>) {
  const { isMobile, state } = useSidebar()
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps
  const showSave = mode === "edit" && saveOnEveryStep

  const desktopContentPosition =
    state === "expanded"
      ? "md:ml-[var(--sidebar-width)] md:w-[calc(100%_-_var(--sidebar-width))]"
      : "md:ml-[var(--sidebar-width-icon)] md:w-[calc(100%_-_var(--sidebar-width-icon))]"

  const saveButton = (
    <Button
      type={onSave ? "button" : "submit"}
      form={formId}
      onClick={onSave}
      disabled={isSubmitting}
      size="lg"
      className="min-w-32 gap-2 text-body font-semibold"
    >
      {isSubmitting ? (
        <>
          <Spinner size="sm" variant="white" />
          Saving...
        </>
      ) : (
        <>
          {primaryIcon === "plus" && (
            <Plus size={14} weight="bold" aria-hidden="true" />
          )}
          {primaryLabel}
          {primaryIcon === "check" && (
            <Check size={14} weight="bold" aria-hidden="true" />
          )}
          {primaryIcon === "arrow-right" && (
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          )}
        </>
      )}
    </Button>
  )

  return (
    <div
      data-testid="form-action-bar"
      className="fixed inset-x-0 bottom-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div
        className={cn(
          "flex w-full flex-col gap-3 transition-[margin,width] duration-200 ease-linear sm:flex-row sm:items-center sm:justify-between",
          !isMobile && desktopContentPosition
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full flex-col gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-4",
            contentClassName
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full justify-center text-body font-semibold text-muted-foreground hover:text-foreground sm:w-auto"
          >
            {cancelLabel}
          </Button>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto">
          {!isFirstStep && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onBack}
              disabled={isSubmitting}
              className="gap-2 text-body font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={14} weight="bold" aria-hidden="true" />
              Back
            </Button>
          )}

          {!isLastStep && onNext && (
            <Button
              type="button"
              variant={showSave ? "outline" : "default"}
              size="lg"
              onClick={onNext}
              disabled={isSubmitting}
              className="gap-2 text-body font-semibold"
            >
              Next
              <ArrowRight size={14} weight="bold" />
            </Button>
          )}

          {secondaryAction && isLastStep && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={secondaryAction.onClick}
              disabled={isSubmitting || secondaryAction.isLoading}
              className="text-body font-semibold text-primary"
            >
              {secondaryAction.isLoading ? "Publishing..." : secondaryAction.label}
            </Button>
          )}

          {(isLastStep || showSave) && saveButton}
          </div>
        </div>
      </div>
    </div>
  )
}
