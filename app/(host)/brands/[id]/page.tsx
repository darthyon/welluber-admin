"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BrandDetailView } from "@/components/host/brands/brand-detail-view";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { MOCK_BRANDS } from "@/features/brands/mock-data";
import { Brand } from "@/types/brand";

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [removingBrand, setRemovingBrand] = useState<Brand | null>(null);

  const brandId = params.id as string;
  const brand = MOCK_BRANDS.find((b) => b.id === brandId);

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-2xl border border-dashed border-border">
        <h2 className="text-heading font-semibold text-foreground">Brand Not Found</h2>
        <p className="text-muted-foreground mt-2">The brand you are looking for does not exist or has been removed.</p>
        <button
            onClick={() => router.push("/brands")}
            className="mt-6 text-primary font-semibold hover:underline"
        >
            Back to Brands
        </button>
      </div>
    );
  }

  const handleRemoveConfirm = () => {
    if (!removingBrand) return;
    console.log("Removing brand:", removingBrand.id);
    setRemovingBrand(null);
    router.push("/brands");
  };

  return (
    <>
      <BrandDetailView
        brand={brand}
        onBack={() => router.push("/brands")}
        onEdit={(id) => router.push(`/brands/${id}/edit`)}
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
          "20 Active Vouchers will be archived"
        ]}
      />
    </>
  );
}
