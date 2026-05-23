"use client"

import { useRouter } from "next/navigation"
import { BrandForm } from "@/components/host/brands/brand-form"
import { CaretLeft, Plus } from "@phosphor-icons/react"
import { useState } from "react"
import { SuccessModal } from "@/components/shared/success-modal"
import { Button } from "@/components/ui/button"

export default function NewBrandPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (data: unknown) => {
    setIsSubmitting(true)
    // Simulate API call
    void data
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
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
            {/* Header */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground"
              >
                <CaretLeft size={16} />
                Back
              </button>
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

            {/* Floating Action Bar */}
            <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl duration-700 ease-out slide-in-from-bottom-10 lg:left-[calc(50%+104px)] lg:translate-x-0">
              <Button
                variant="ghost"
                size="lg"
                className="px-6 text-body font-semibold transition-colors"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <div className="h-6 w-px bg-border/40" />
              <Button
                type="submit"
                form="newBrandForm"
                size="lg"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 text-body font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Brand
                <Plus size={14} weight="bold" />
              </Button>
            </div>

            <div className="h-[60vh]" />
          </div>
        </div>
      </div>
    </div>
  )
}
