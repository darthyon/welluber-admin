"use client";

import { useRouter } from "next/navigation";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
          <span className="font-bold text-[14px] text-foreground tracking-tight">{sp.name}</span>
          <span className="text-[11px] text-muted-foreground mt-0.5 font-mono tracking-tight">{sp.registrationNo}</span>
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
      header: "Service Categories",
      render: (sp) => (
        <div className="flex items-center gap-1 overflow-hidden max-w-[200px]">
          {sp.serviceCategories.length === 0 ? (
            <span className="text-[10px] text-muted-foreground/50 font-medium italic px-1">None</span>
          ) : (
            <>
              <Badge variant="secondary" className="bg-muted/50 font-medium text-[10px] px-1.5 py-0 h-4 border-border/40 whitespace-nowrap">
                {sp.serviceCategories[0]}
              </Badge>
              {sp.serviceCategories.length > 1 && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button onClick={(e) => e.stopPropagation()} className="text-[10px] text-muted-foreground hover:text-primary font-bold px-1 transition-colors">
                      +{sp.serviceCategories.length - 1}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-52 bg-card rounded-xl border-border shadow-2xl z-[200]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-semibold tracking-tight text-muted-foreground opacity-60 mb-1 px-1">Service categories</span>
                      {sp.serviceCategories.slice(1).map((cat, i) => (
                        <div key={i} className="text-[11px] px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">{cat}</div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
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
        <span className="text-[13px] font-semibold text-foreground/80">{sp.activeVoucherCount}</span>
      ),
    },
    {
      header: "Branches",
      accessorKey: "branches",
      sortable: true,
      align: "right",
      render: (sp) => (
        <span className="text-[13px] font-medium text-muted-foreground">{sp.branches.length}</span>
      ),
    },
    {
      header: "Tax Registered",
      render: (sp) => (
        <span className={sp.taxProfile.isTaxRegistered ? "text-[11px] font-semibold text-emerald-600" : "text-[11px] text-muted-foreground/50"}>
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
        <span className="text-[12px] text-muted-foreground font-medium">
          {new Date(sp.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "short" })}
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
