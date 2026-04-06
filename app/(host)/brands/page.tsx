"use client";

import { Plus, DownloadSimple, MagnifyingGlass } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandDataTable } from "@/components/host/brands/brand-data-table";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { DataToolbarContainer } from "@/components/shared/data-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_BRANDS } from "@/features/brands/mock-data";

import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Brand } from "@/types/brand";

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [removingBrand, setRemovingBrand] = useState<Brand | null>(null);

  const filteredBrands = MOCK_BRANDS.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || brand.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRemoveConfirm = () => {
    if (!removingBrand) return;
    console.log("Removing brand:", removingBrand.id);
    setRemovingBrand(null);
  };

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Manage Brands</h1>
          <p className="text-muted-foreground text-[13px] mt-1 font-normal opacity-80">
            Create brands and manage the hierarchy of service providers under each brand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-[13px] font-medium border-border/60 hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button asChild className="h-9 text-[13px] font-medium shadow-sm">
            <Link href="/brands/new">
              <Plus size={16} weight="bold" className="mr-1.5" />
              Add Brand
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DataToolbarContainer
        search={
          <SearchBar
            placeholder="Search brands..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-sm"
          />
        }
        filters={
          <>
            <FilterItem
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
            />
          </>
        }
      />

      {/* Content Table */}
      <div className="min-h-[400px]">
        {filteredBrands.length > 0 ? (
          <BrandDataTable data={filteredBrands} onRemove={setRemovingBrand} />
        ) : (
          <div className="py-12">
            <EmptyState
              icon={<MagnifyingGlass size={32} weight="light" />}
              title="No brands match your search"
              description="Try adjusting your filters or search query."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear All Filters
                </Button>
              }
            />
          </div>
        )}
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
