"use client";

import { useRouter } from "next/navigation";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ServicePortfolioTags } from "./service-portfolio-tags";
import type { ServiceProvider } from "@/types/provider";
import React, { useMemo, useState } from "react";

interface SpDataTableProps {
  data: ServiceProvider[];
}

export function SpDataTable({ data }: SpDataTableProps) {
  const router = useRouter();

  const columns: Column<ServiceProvider>[] = [
    {
      header: "Service Provider",
      accessorKey: "name",
      sortable: true,
      headerClassName: "min-w-[220px]",
      render: (sp) => (
        <div className="flex flex-col">
          <span className="font-semibold text-body text-foreground">{sp.name}</span>
          <span className="text-label text-muted-foreground mt-0.5 font-mono tracking-tight">{sp.registrationNo}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      render: (sp) => (
        <StatusBadge
          status={sp.status}
          variant={sp.status === "active" ? "emerald" : sp.status === "pending" ? "amber" : "zinc"}
        />
      ),
    },
    {
      header: "Main Services",
      headerClassName: "min-w-[240px]",
      render: (sp) => (
        <div className="max-w-[240px]">
          {sp.mainServices.length === 0 ? (
            <span className="text-label text-faint font-medium italic px-1">None</span>
          ) : (
            <ServicePortfolioTags mainServices={sp.mainServices} />
          )}
        </div>
      ),
    },
    {
      header: "Active Vouchers",
      accessorKey: "activeVoucherCount",
      sortable: true,
      align: "right",
      render: (sp) => (
        <span className="text-body font-semibold text-subtle">{sp.activeVoucherCount}</span>
      ),
    },
    {
      header: "Branches",
      accessorKey: "branches",
      sortable: true,
      align: "right",
      render: (sp) => (
        <span className="text-body font-medium text-subtle">{sp.branches.length}</span>
      ),
    },
    {
      header: "Tax Registered",
      render: (sp) => (
        <span className={sp.taxProfile.isTaxRegistered ? "text-label font-semibold text-emerald-600" : "text-label text-faint"}>
          {sp.taxProfile.isTaxRegistered ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Since",
      accessorKey: "createdAt",
      sortable: true,
      headerClassName: "text-right",
      align: "right",
      render: (sp) => (
        <span className="text-label text-muted-foreground font-medium">
          {new Date(sp.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      header: "",
      align: "right",
      render: (sp) => (
        <ActionPopover
          actions={[
            { label: "View details", href: `/service-providers/${sp.id}` },
            { label: "Edit SP", href: `/service-providers/${sp.id}/edit` },
            { label: "Actions", isSectionTitle: true },
            {
              label: sp.status === "suspended" ? "Activate SP" : "Suspend SP",
              onClick: () => console.log("toggle status", sp.id),
              className: sp.status === "suspended" ? "text-emerald-600 font-semibold" : "text-destructive font-semibold",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <SharedDataTable
          data={data}
          columns={columns}
          freezeFirst
          freezeLast
          rowsPerPage={10}
          onRowClick={(sp) => router.push(`/service-providers/${sp.id}`)}
        />
      </div>
    </TooltipProvider>
  );
}
