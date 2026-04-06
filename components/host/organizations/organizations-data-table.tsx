"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Organization } from "@/features/organizations/types";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { ActionPopover } from "@/components/shared/action-popover";
import { UtilizationChart } from "./utilization-chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";

interface OrganizationsDataTableProps {
  data: Organization[];
}

export function OrganizationsDataTable({ data }: OrganizationsDataTableProps) {
  const router = useRouter();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MY', { 
      style: 'currency', 
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const columns: Column<Organization>[] = [
    {
      header: "Organisation name",
      accessorKey: "name",
      sortable: true,
      headerClassName: "min-w-[220px]",
      render: (org) => (
        <div className="flex flex-col">
          <span className="font-bold text-[14px] text-foreground tracking-tight">{org.name}</span>
          <span className="text-[11px] text-muted-foreground mt-0.5 font-mono tracking-tight">{org.id}</span>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      render: (org) => (
        <StatusBadge 
          status={org.status} 
          variant={org.status === "active" ? "emerald" : org.status === "pending" ? "amber" : "zinc"} 
        />
      )
    },
    {
      header: "Needs Action",
      accessorKey: "needsAction",
      sortable: true,
      headerClassName: "min-w-[160px]",
      render: (org) => {
        if (org.needsAction.length === 0) {
          return (
            <Badge variant="outline" className="text-[10px] px-2 h-5 bg-emerald-50 text-emerald-600 border-emerald-200 font-bold gap-1 animate-in fade-in duration-500">
              <CheckCircle size={12} weight="fill" />
              All good
            </Badge>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {org.needsAction.map((action, i) => (
              <StatusBadge key={i} status={action} variant="rose" className="h-5" />
            ))}
          </div>
        );
      }
    },
    {
      header: "Utilisation & Claims",
      accessorKey: "utilizationRate",
      sortable: true,
      headerClassName: "min-w-[180px]",
      render: (org) => (
        <div className="flex items-center gap-2.5">
          <UtilizationChart value={org.utilizationRate} mode="ring" size={32} strokeWidth={3} />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-[12px] font-bold text-foreground">
                {formatCurrency(org.totalWalletBalance)}
              </span>
              {org.claimsCount !== undefined && (
                <span className="text-[10px] font-bold px-1.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 tabular-nums">
                  {org.claimsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground/60 font-medium tabular-nums mt-0.5">
              / {formatCurrency(org.walletLimit)}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Service category",
      render: (org) => (
        <div className="flex items-center gap-1 overflow-hidden max-w-[200px]">
          {org.services.length === 0 ? (
            <span className="text-[10px] text-muted-foreground/50 font-medium italic px-1">Unassigned</span>
          ) : (
            <>
              {org.services.slice(0, 1).map((service, i) => (
                <Badge key={i} variant="secondary" className="bg-muted/50 font-medium text-[10px] px-1.5 py-0 h-4 border-border/40 whitespace-nowrap">
                  {service}
                </Badge>
              ))}
              {org.services.length > 1 && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-muted-foreground hover:text-primary font-bold px-1 transition-colors"
                    >
                      +{org.services.length - 1}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-52 bg-card rounded-xl border-border shadow-2xl z-[200]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground/70 mb-1 px-1">Service category</span>
                      {org.services.slice(1).map((service, i) => (
                        <div key={i} className="text-[11px] px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
                          {service}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      )
    },
    {
      header: "Benefit Policies",
      headerClassName: "min-w-[120px]",
      render: (org) => (
        <div className="flex items-center gap-1 overflow-hidden">
          {org.policies.length === 0 ? (
            <span className="text-[10px] text-muted-foreground/50 font-medium italic px-1">Unassigned</span>
          ) : (
            <>
              {org.policies.slice(0, 1).map((policy, i) => (
                <Badge key={i} variant="secondary" className="bg-indigo-50/50 text-indigo-700 font-medium text-[10px] px-1.5 py-0 h-4 border-indigo-100 whitespace-nowrap">
                  {policy}
                </Badge>
              ))}
              {org.policies.length > 1 && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-muted-foreground hover:text-indigo-600 font-bold px-1 transition-colors"
                    >
                      +{org.policies.length - 1}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-52 bg-card rounded-xl border-border shadow-2xl z-[200]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground/70 mb-1 px-1">Benefit policies</span>
                      {org.policies.slice(1).map((policy, i) => (
                        <div key={i} className="text-[11px] px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
                          {policy}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      )
    },
    {
      header: "Branches",
      accessorKey: "branches",
      sortable: true,
      headerClassName: "min-w-[120px]",
      render: (org) => (
        <div className="flex items-center gap-1 overflow-hidden">
          {org.branches.length === 0 ? (
            <span className="text-[10px] text-muted-foreground/50 font-medium italic px-1">Unassigned</span>
          ) : (
            <>
              {org.branches.slice(0, 1).map((branch, i) => (
                <Badge key={i} variant="secondary" className="bg-sky-50/50 text-sky-700 font-medium text-[10px] px-1.5 py-0 h-4 border-sky-100 whitespace-nowrap">
                  {branch}
                </Badge>
              ))}
              {org.branches.length > 1 && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-muted-foreground hover:text-sky-600 font-bold px-1 transition-colors"
                    >
                      +{org.branches.length - 1}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-52 bg-card rounded-xl border-border shadow-2xl z-[200]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground/70 mb-1 px-1">Branches</span>
                      {org.branches.slice(1).map((branch, i) => (
                        <div key={i} className="text-[11px] px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
                          {branch}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      )
    },
    {
      header: "Employees",
      accessorKey: "employeeCount",
      sortable: true,
      align: "right",
      render: (org) => <span className="text-[13px] font-bold text-foreground/80">{org.employeeCount.toLocaleString()}</span>
    },
    {
      header: "Joined",
      accessorKey: "createdAt",
      sortable: true,
      headerClassName: "text-right",
      align: "right",
      render: (org) => (
        <span className="text-[12px] text-muted-foreground font-medium">
          {new Date(org.createdAt).toLocaleDateString("en-MY", { 
            year: "numeric", 
            month: "short"
          })}
        </span>
      )
    },
    {
      header: "", // Actions handle internally by SharedDataTable last column freeze
      align: "right",
      render: (org) => (
        <ActionPopover 
          actions={[
            { label: "Edit Organisation", href: `/organizations/${org.id}/edit` },
            { label: "Quick Invite Admin", onClick: () => console.log("Invite clicked") },
            { label: "Settings", isSectionTitle: true },
            { label: "Benefit Policies", href: `/organizations/${org.id}?tab=policies`, className: "text-indigo-600 font-semibold" }
          ]} 
        />
      )
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <SharedDataTable 
          data={data} 
          columns={columns} 
          freezeFirst={true} 
          freezeLast={true}
          rowsPerPage={10}
          onRowClick={(org) => router.push(`/organizations/${org.id}`)}
        />
      </div>
    </TooltipProvider>
  );
}
