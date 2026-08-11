"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FormActionBar, FormStepIndicator, type FormWizardStep } from "@/components/shared/form-step-wizard"
import { EmployeeFormContent } from "@/components/host/employees/employee-form-content"
import { toast } from "sonner"

const EMPLOYEE_EDIT_STEPS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Employment Details" },
  { id: 3, label: "Benefit Policy Assignment" },
  { id: 4, label: "Dependent Details" },
] as const satisfies readonly FormWizardStep<1 | 2 | 3 | 4>[]

interface EmployeeEditFlowProps {
  employeeId: string
  returnPath?: string
}

export function EmployeeEditFlow({ employeeId, returnPath }: EmployeeEditFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goBack = () => {
    router.push(returnPath ?? `/employees/${encodeURIComponent(employeeId)}`)
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    toast.success("Employee profile updated successfully")
    goBack()
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">Edit Employee</h1>
          <p className="mt-1 text-body text-subtle">Update identity, employment details, and benefit policy assignments.</p>
        </div>

        <FormStepIndicator
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          steps={EMPLOYEE_EDIT_STEPS}
          allowStepJumping
        />

        <EmployeeFormContent
          mode="edit"
          currentStep={currentStep}
          onSubmit={handleSave}
          isSubmitting={isSubmitting}
        />

        <FormActionBar
          currentStep={currentStep}
          totalSteps={4}
          mode="edit"
          onCancel={goBack}
          onBack={() => setCurrentStep((step) => Math.max(1, step - 1) as 1 | 2 | 3 | 4)}
          onNext={() => setCurrentStep((step) => Math.min(4, step + 1) as 1 | 2 | 3 | 4)}
          onSave={() => void handleSave()}
          primaryLabel="Save Changes"
          formId="employeeForm"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
