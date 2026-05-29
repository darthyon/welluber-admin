"use client"

import { Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const WIZARD_STEPS = [
  { id: 1, label: "Override Amounts" },
  { id: 2, label: "Targeting" },
  { id: 3, label: "Review & Assign" },
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {WIZARD_STEPS.map((step, idx) => {
        const isDone = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-label font-semibold transition-all",
                  isDone && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone && !isActive && "bg-muted text-muted-foreground border border-border"
                )}
              >
                {isDone ? <Check size={13} weight="bold" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-label font-medium hidden sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 h-px",
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
