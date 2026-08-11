"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FormActionBar, FormStepIndicator, type FormWizardStep } from "@/components/shared/form-step-wizard"
import { SuccessModal } from "@/components/shared/success-modal"
import { EmployeeFormContent } from "@/components/host/employees/employee-form-content"
import { toast } from "sonner"

const EMPLOYEE_STEPS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Employment Details" },
  { id: 3, label: "Benefit Policy Assignment" },
  { id: 4, label: "Dependent Details" },
] as const satisfies readonly FormWizardStep<1 | 2 | 3 | 4>[]

interface EmployeeCreateFlowProps {
  returnPath?: string
}

export function EmployeeCreateFlow({ returnPath }: EmployeeCreateFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const goBack = () => {
    if (returnPath) router.push(returnPath)
    else router.back()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    toast.success("Employee registered successfully")
    setShowSuccess(true)
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-heading font-semibold text-foreground text-balance">Add New Employee</h1>
            <p className="mt-1 text-body text-subtle">Register a new employee and assign them to a branch and benefit policy.</p>
          </div>
        </div>

        <FormStepIndicator currentStep={currentStep} onStepClick={setCurrentStep} steps={EMPLOYEE_STEPS} />

        <EmployeeFormContent
          mode="create"
          currentStep={currentStep}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        <FormActionBar
          currentStep={currentStep}
          totalSteps={4}
          mode="create"
          onCancel={goBack}
          onBack={() => setCurrentStep((step) => Math.max(1, step - 1) as 1 | 2 | 3 | 4)}
          onNext={() => setCurrentStep((step) => Math.min(4, step + 1) as 1 | 2 | 3 | 4)}
          primaryLabel="Create Employee"
          primaryIcon="plus"
          formId="employeeForm"
          isSubmitting={isSubmitting}
        />
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Employee Registered"
        message="The employee profile has been successfully established and benefit policies pinned."
        primaryAction={{
          label: "Add Another Employee",
          onClick: () => {
            setShowSuccess(false)
            window.location.reload()
          },
        }}
        secondaryAction={{
          label: returnPath ? "Back to Employees" : "View Employee",
          onClick: () => (returnPath ? router.push(returnPath) : router.push("/employees/emp_new")),
        }}
      />
    </div>
  )
}
