"use client";

import { useRouter } from "next/navigation";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const filteredData = useMemo(() => {
    return data.filter(brand => {
      const searchMatch = !searchQuery || 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        brand.id.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === "all" || brand.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [data, searchQuery, statusFilter]);

  const columns: Column<Brand>[] = [
    {
      header: "Brand",
      headerClassName: "min-w-[240px]",
      render: (brand) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg bg-muted border border-border/40">
            <AvatarImage src={brand.logo} alt={brand.name} />
            <AvatarFallback className="rounded-lg text-[10px] bg-muted-foreground/10 text-muted-foreground font-bold">
              {brand.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-[14px] text-foreground tracking-tight leading-tight">{brand.name}</span>
            <span className="text-[11px] text-muted-foreground mt-0.5 tracking-tight opacity-70">ID: {brand.id}</span>
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
      header: "Assigned SPs",
      align: "right",
      render: (brand) => (
        <span className="text-[13px] font-semibold text-foreground/80">{brand.assignedSpCount}</span>
      ),
    },
    {
      header: "Added Since",
      headerClassName: "text-right",
      align: "right",
      render: (brand) => (
        <span className="text-[12px] text-muted-foreground font-medium">
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
              className: brand.status === "inactive" ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold",
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
