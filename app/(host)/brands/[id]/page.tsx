"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { BrandDetailView } from "@/components/host/brands/brand-detail-view"
import { ConfirmationModal } from "@/components/shared/confirmation-modal"
import { MOCK_BRANDS } from "@/lib/mock-data"
import { Brand } from "@/types/brand"

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [removingBrand, setRemovingBrand] = useState<Brand | null>(null)

  const brandId = params.id as string
  const brand = MOCK_BRANDS.find((b) => b.id === brandId)

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/5 py-20">
        <h2 className="text-heading font-semibold text-foreground">
          Brand Not Found
        </h2>
        <p className="mt-2 text-muted-foreground">
          The brand you are looking for does not exist or has been removed.
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

  const handleRemoveConfirm = () => {
    if (!removingBrand) return
    void removingBrand.id
    setRemovingBrand(null)
    router.push("/brands")
  }

  return (
    <>
      <BrandDetailView
        brand={brand}
        onBack={() => router.push("/brands")}
        onRemove={() => setRemovingBrand(brand)}
      />

      <ConfirmationModal
        isOpen={!!removingBrand}
        onClose={() => setRemovingBrand(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Brand"
        description={`Are you sure you want to remove ${removingBrand?.name}? This action cannot be undone and will affect all assigned service providers.`}
        confirmLabel="Remove Brand"
        impactPoints={[
          `${removingBrand?.assignedSpCount || 0} Service Providers will be unlinked`,
          "5 Active Branches will be affected",
          "20 Active Vouchers will be archived",
        ]}
      />
    </>
  )
}
