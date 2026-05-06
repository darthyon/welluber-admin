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
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { SetupChecklist } from "./setup-checklist";

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
      headerClassName: "min-w-[14rem]",
      render: (org) => (
        <div className="flex items-center gap-3">
          <EntityAvatar name={org.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-body text-foreground leading-tight">{org.name}</span>
            <span className="text-label text-subtle mt-0.5 font-mono tracking-tight">{org.id}</span>
          </div>
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
      headerClassName: "min-w-[10rem]",
      render: (org) => {
        if (org.needsAction.length === 0) {
          return (
            <div className="space-y-2">
              <Badge variant="outline" className="text-label px-2 h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-500/20 font-medium gap-1 animate-in fade-in duration-500">
                <CheckCircle size={12} weight="fill" />
                All good
              </Badge>
            </div>
          );
        }
        return <SetupChecklist organization={org} failingOnly />;
      }
    },
    {
      header: "Utilisation & Claims",
      accessorKey: "utilizationRate",
      sortable: true,
      headerClassName: "min-w-[11rem]",
      render: (org) => (
        <div className="flex items-center gap-2.5">
          <UtilizationChart value={org.utilizationRate} mode="ring" size={32} strokeWidth={3} />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-label font-medium text-foreground">
                {formatCurrency(org.totalAccountBalance)}
              </span>
              {org.claimsCount !== undefined && (
                <span className="text-label font-medium px-1.5 rounded-full bg-muted text-faint border border-border tabular-nums leading-none flex items-center">
                  {org.claimsCount}
                </span>
              )}
            </div>
            <span className="text-label text-faint font-medium tabular-nums mt-0.5">
              / {formatCurrency(org.accountLimit)}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Service category",
      render: (org) => (
        <div className="flex items-center gap-1 overflow-hidden max-w-[12rem]">
          {org.services.length === 0 ? (
            <span className="text-label text-faint font-normal italic px-1">Unassigned</span>
          ) : (
            <>
              {org.services.slice(0, 1).map((service, i) => (
                <Badge key={i} variant="secondary" className="bg-muted/50 font-medium text-label px-2 py-0 h-5 border-border/40 whitespace-nowrap">
                  {service}
                </Badge>
              ))}
              {org.services.length > 1 && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button aria-label="View more services" 
                      onClick={(e) => e.stopPropagation()}
                      className="text-micro text-muted-foreground hover:text-primary font-semibold px-1.5 py-1 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                    >
                      +{org.services.length - 1}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-52 bg-card rounded-lg border-border shadow-2xl z-[200]">
                    <div className="flex flex-col gap-1">
                      <span className="text-label font-medium text-subtle mb-1 px-1">Service category</span>
                      {org.services.slice(1).map((service, i) => (
                        <div key={i} className="text-label px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
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
      headerClassName: "min-w-[8rem]",
      render: (org) => (
        <div className="flex items-center gap-1 overflow-hidden">
          {org.policies.length === 0 ? (
            <span className="text-label text-faint font-normal italic px-1">Unassigned</span>
          ) : (
            <>
              {org.policies.slice(0, 1).map((policy, i) => (
                <Badge key={i} variant="secondary" className="bg-primary/10 text-primary font-medium text-label px-1.5 py-0 h-5 border-primary/20 whitespace-nowrap">
                  {policy}
                </Badge>
              ))}
              {org.policies.length > 1 && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button aria-label="View more services" 
                      onClick={(e) => e.stopPropagation()}
                      className="text-label text-subtle hover:text-primary font-medium px-1.5 py-1 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                    >
                      +{org.policies.length - 1}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-52 bg-card rounded-lg border-border shadow-2xl z-[200]">
                    <div className="flex flex-col gap-1">
                      <span className="text-label font-medium text-subtle mb-1 px-1">Benefit policies</span>
                      {org.policies.slice(1).map((policy, i) => (
                        <div key={i} className="text-label px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
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
      headerClassName: "min-w-[8rem]",
      render: (org) => (
        <div className="flex items-center gap-1 overflow-hidden">
          {org.branches.length === 0 ? (
            <span className="text-label text-faint font-normal italic px-1">Unassigned</span>
          ) : (
            <>
              {org.branches.slice(0, 1).map((branch, i) => (
                <Badge key={i} variant="secondary" className="bg-primary/10 text-primary font-medium text-label px-1.5 py-0 h-5 border-primary/20 whitespace-nowrap">
                  {branch}
                </Badge>
              ))}
              {org.branches.length > 1 && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button aria-label="View more services" 
                      onClick={(e) => e.stopPropagation()}
                      className="text-label text-subtle hover:text-primary font-medium px-1.5 py-1 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                    >
                      +{org.branches.length - 1}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-52 bg-card rounded-lg border-border shadow-2xl z-[200]">
                    <div className="flex flex-col gap-1">
                      <span className="text-label font-medium text-subtle mb-1 px-1">Branches</span>
                      {org.branches.slice(1).map((branch, i) => (
                        <div key={i} className="text-label px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
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
      render: (org) => <span className="text-body font-medium text-foreground">{org.employeeCount.toLocaleString()}</span>
    },
    {
      header: "Joined",
      accessorKey: "createdAt",
      sortable: true,
      headerClassName: "text-right",
      align: "right",
      render: (org) => (
        <span className="text-label text-muted-foreground font-medium">
          {new Date(org.createdAt).toLocaleDateString("en-GB", { 
            day: "2-digit",
            month: "short",
            year: "numeric", 
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
            { label: "Benefit Policies", href: `/organizations/${org.id}?tab=policies`, className: "text-primary font-semibold" }
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
