"use client";

import { useRouter } from "next/navigation";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { OverflowTags } from "@/components/shared/overflow-tags";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { SERVICE_TAXONOMY } from "@/features/organizations/constants";
import type { Brand } from "@/types/brand";
import React, { useMemo, useState } from "react";

interface BrandDataTableProps {
  data: Brand[];
  onRemove: (brand: Brand) => void;
}

export function BrandDataTable({ data, onRemove }: BrandDataTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    return data.filter(brand => {
      const searchMatch = !searchQuery || 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        brand.id.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === "all" || brand.status === statusFilter;
      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.some(cat => brand.serviceCategories?.includes(cat));
        
      return searchMatch && statusMatch && categoryMatch;
    });
  }, [data, searchQuery, statusFilter, selectedCategories]);

  const columns: Column<Brand>[] = [
    {
      header: "Brand",
      headerClassName: "min-w-[240px]",
      render: (brand) => (
        <div className="flex items-center gap-3">
          <EntityAvatar name={brand.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-body text-foreground leading-tight">{brand.name}</span>
            <span className="text-label text-subtle font-mono tracking-tight mt-0.5">{brand.id}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (brand) => (
        <StatusBadge
          status={brand.status}
          variant={brand.status === "active" ? "emerald" : "zinc"}
        />
      ),
    },
    {
      header: "Service Categories",
      headerClassName: "min-w-[180px]",
      render: (brand) => (
        <div className="max-w-[170px]">
          <OverflowTags items={brand.serviceCategories || []} />
        </div>
      ),
    },

    {
      header: "Assigned SPs",
      align: "right",
      render: (brand) => (
        <span className="text-body font-semibold text-subtle">{brand.assignedSpCount}</span>
      ),
    },
    {
      header: "Added Since",
      headerClassName: "text-right",
      align: "right",
      render: (brand) => (
        <span className="text-label text-subtle font-medium whitespace-nowrap">
          {new Date(brand.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "short" })}
        </span>
      ),
    },
    {
      header: "",
      align: "right",
      render: (brand) => (
        <ActionPopover
          actions={[
            { label: "View details", onClick: () => router.push(`/brands/${brand.id}`) },
            { label: "Edit brand", onClick: () => router.push(`/brands/${brand.id}/edit`) },
            { label: "Actions", isSectionTitle: true },
            {
              label: brand.status === "inactive" ? "Activate Brand" : "Deactivate Brand",
              onClick: () => console.log("toggle status", brand.id),
            },
            {
              label: "Remove Brand",
              onClick: () => onRemove(brand),
              className: "text-destructive font-semibold",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <DataFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by brand name or ID..."
          filters={
            <>
              <FilterItem
                label="Status"
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
              />
              <MultiSelectFilter
                label="Service Category"
                taxonomy={SERVICE_TAXONOMY}
                selected={selectedCategories}
                onChange={setSelectedCategories}
              />
            </>
          }
        />
        <SharedDataTable
          data={filteredData}
          columns={columns}
          freezeFirst
          freezeLast
          rowsPerPage={10}
          onRowClick={(brand) => router.push(`/brands/${brand.id}`)}
        />
      </div>
    </TooltipProvider>
  );
}
