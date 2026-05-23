"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { BrandForm } from "@/components/host/brands/brand-form"
import { CaretLeft } from "@phosphor-icons/react"
import { MOCK_BRANDS } from "@/lib/mock-data"

export default function EditBrandPage() {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const brandId = params.id as string
  const brand = MOCK_BRANDS.find((b) => b.id === brandId) ?? null

  const handleSubmit = async (data: unknown) => {
    setIsSubmitting(true)
    // Simulate API call
    void data
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    router.push(`/brands/${brandId}`)
  }

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/5 py-20">
        <h2 className="text-heading font-semibold text-foreground">
          Brand Not Found
        </h2>
        <p className="mt-2 text-muted-foreground">
          The brand you are looking for does not exist.
        </p>
        <button
          onClick={() => router.push("/brands")}
          className="mt-6 font-semibold text-primary hover:underline"
        >
          Back to Brands
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in pb-12 duration-500 fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-primary"
        >
          <CaretLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back
        </button>

        <div>
          <h1 className="tracking-tight text-display font-semibold text-foreground">
            Edit Brand
          </h1>
          <p className="mt-1 text-body font-normal text-subtle opacity-80">
            Update the brand identity for {brand.name}.
          </p>
        </div>
      </div>

      <BrandForm
        initialData={brand}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/brands/${brandId}`)}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
