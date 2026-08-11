"use client"

import { useRouter } from "next/navigation"
import { BrandForm, type BrandFormData } from "@/components/host/brands/brand-form"
import { useState } from "react"
import { SuccessModal } from "@/components/shared/success-modal"
import { FormActionBar } from "@/components/shared/form-step-wizard"

export default function NewBrandPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true)
    // Simulate API call
    void data
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  return (
    <div className="animate-in pb-28 duration-500 fade-in slide-in-from-bottom-4">
      <SuccessModal
        isOpen={isSuccess}
        onClose={() => router.push("/brands")}
        title="Brand Created Successfully"
        message="Your new brand identity has been established and is ready for service provider assignment."
        primaryAction={{
          label: "Back to Brand List",
          onClick: () => router.push("/brands"),
        }}
        secondaryAction={{
          label: "Create Another Brand",
          onClick: () => {
            setIsSuccess(false)
            setFormKey((k) => k + 1)
          },
        }}
      />

      <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            <div>
              <div>
                <h1 className="text-heading font-semibold text-balance text-foreground">
                  Add New Brand
                </h1>
                <p className="text-body text-subtle">
                  Create a new brand identity to organize service providers and
                  branches.
                </p>
              </div>
            </div>

            <BrandForm
              key={formKey}
              formId="newBrandForm"
              showFooter={false}
              onSubmit={handleSubmit}
              onCancel={() => router.push("/brands")}
              isSubmitting={isSubmitting}
            />

            <FormActionBar
              currentStep={1}
              totalSteps={1}
              mode="create"
              onCancel={() => router.back()}
              onBack={() => router.back()}
              primaryLabel="Create Brand"
              primaryIcon="plus"
              formId="newBrandForm"
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
