"use client";

import { Plus, DownloadSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandDataTable } from "@/components/host/brands/brand-data-table";
import { MOCK_BRANDS } from "@/features/brands/mock-data";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Brand } from "@/types/brand";

export default function BrandsPage() {
  const [removingBrand, setRemovingBrand] = useState<Brand | null>(null);

  const handleRemoveConfirm = () => {
    if (!removingBrand) return;
    console.log("Removing brand:", removingBrand.id);
    setRemovingBrand(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Brands</h1>
          <p className="text-muted-foreground text-nav mt-1 font-normal opacity-80">
            Create brands and manage the hierarchy of service providers under each brand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-nav font-medium border-border/60 hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button asChild className="h-9 text-nav font-medium shadow-sm">
            <Link href="/brands/new">
              <Plus size={16} weight="bold" className="mr-1.5" />
              Add Brand
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Table */}
      <div className="min-h-[400px]">
        <BrandDataTable data={MOCK_BRANDS} onRemove={setRemovingBrand} />
      </div>

      <ConfirmationModal
        isOpen={!!removingBrand}
        onClose={() => setRemovingBrand(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Brand"
        description={`Are you sure you want to remove the "${removingBrand?.name}" brand? This action will impact all its assigned service providers.`}
        impactPoints={[
          `${removingBrand?.assignedSpCount || 0} Service Providers will lose their brand association`,
          "5 Branches will be affected",
          "Brand will be hidden from new selections",
        ]}
        confirmLabel="Remove Brand"
        tone="danger"
      />
    </div>
  );
}
