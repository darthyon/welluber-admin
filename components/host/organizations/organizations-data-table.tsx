"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Organization } from "@/features/organizations/types";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { ActionPopover } from "@/components/shared/action-popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Registry } from "@/lib/mock-data/registry";
import { formatStateCountry } from "@/lib/utils/location-codes";

const BRANCH_NAME_MAP: Record<string, string> = {
  "BR-20260115-0001": "Kuala Lumpur HQ",
  "BR-20260115-0002": "Subang Jaya",
  "BR-20260115-0003": "Penang Office",
  "BR-20260301-0001": "Petaling Jaya Branch",
  "BR-20260310-0001": "Singapore HQ",
  "BR-20260310-0002": "KL Office",
  "BR-20260401-0004": "Main Office",
  "BR-20260401-0005": "Logistics Hub",
  "BR-20260401-0006": "Energy Park",
  "BR-20260401-0007": "Medical Campus",
  "BR-20260401-0008": "Retail HQ",
  "BR-20260401-0009": "Construction Office",
  "BR-20260401-0010": "Education Centre",
}

function resolvePolicyName(id: string): string {
  return Registry.policies.get(id)?.name ?? id
}

function resolveBranchName(id: string): string {
  return BRANCH_NAME_MAP[id] ?? id
}

interface CountCellProps {
  count: number;
  label: string;
  items: string[];
  orgId: string;
  tab: "branches" | "employees" | "policies";
  router: ReturnType<typeof useRouter>;
}

function CountCell({ count, label, items, orgId, tab, router }: CountCellProps) {
  if (count === 0) {
    return <span className="text-label text-faint font-normal italic">0</span>
  }
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-body font-medium tabular-nums text-foreground hover:text-primary transition-colors"
        >
          {count.toLocaleString()}
        </button>
      </TooltipTrigger>
      <TooltipContent className="w-56 bg-card rounded-lg border-border shadow-2xl z-[200] p-2">
        <div className="flex flex-col gap-1">
          <span className="text-label font-medium text-subtle mb-1 px-1">{label}</span>
          {items.slice(0, 5).map((item, i) => (
            <div key={i} className="text-label px-2 py-1.5 hover:bg-muted rounded text-foreground transition-colors font-medium">
              {item}
            </div>
          ))}
          {count > 5 && (
            <Button
              variant="link"
              size="sm"
              className="justify-start px-2 h-7 text-label"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/organizations/${orgId}?tab=${tab}`);
              }}
            >
              View all {count} →
            </Button>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

interface OrganizationsDataTableProps {
  data: Organization[];
}

export function OrganizationsDataTable({ data }: OrganizationsDataTableProps) {
  const router = useRouter();

  const columns: Column<Organization>[] = [
    {
      header: "Organisation name",
      accessorKey: "name",
      sortable: true,
      headerClassName: "min-w-[14rem]",
      render: (org) => (
        <div className="flex items-center gap-3">
          <EntityAvatar name={org.name} size="sm" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-body text-foreground leading-tight truncate">{org.name}</span>
            <span className="text-label text-subtle mt-0.5 font-mono tracking-tight">{org.id}</span>
          </div>
        </div>
      )
    },
    {
      header: "Location",
      headerClassName: "min-w-[6rem]",
      render: (org) => (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="text-label font-mono font-medium tracking-tight text-foreground hover:text-primary transition-colors"
            >
              {formatStateCountry(org.state, org.country)}
            </button>
          </TooltipTrigger>
          <TooltipContent className="w-52 bg-card rounded-lg border-border shadow-2xl z-[200] p-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-label font-medium text-subtle px-1">State</span>
              <span className="text-label text-foreground font-medium px-1 pb-1">{org.state}</span>
              <span className="text-label font-medium text-subtle px-1">Country</span>
              <span className="text-label text-foreground font-medium px-1">{org.country}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      )
    },
    {
      header: "Accounts",
      align: "right",
      headerClassName: "min-w-[6rem] text-right",
      render: (org) => {
        const accounts = [...Registry.accounts.values()].filter(a => a.orgId === org.id)
        const items = accounts.map(a => `${a.branchName} • ${a.name}`)
        return (
          <CountCell
            count={accounts.length}
            label="Accounts"
            items={items}
            orgId={org.id}
            tab="branches"
            router={router}
          />
        )
      }
    },
    {
      header: "Branches",
      accessorKey: "branches",
      sortable: true,
      align: "right",
      headerClassName: "min-w-[6rem] text-right",
      render: (org) => (
        <CountCell
          count={org.branches.length}
          label="Branches"
          items={org.branches.map(resolveBranchName)}
          orgId={org.id}
          tab="branches"
          router={router}
        />
      )
    },
    {
      header: "Employees",
      accessorKey: "employeeCount",
      sortable: true,
      align: "right",
      headerClassName: "min-w-[6rem] text-right",
      render: (org) => {
        const employees = [...Registry.employees.values()].filter(e => e.orgId === org.id)
        const items = employees.map(e => e.name)
        return (
          <CountCell
            count={org.employeeCount}
            label="Employees"
            items={items}
            orgId={org.id}
            tab="employees"
            router={router}
          />
        )
      }
    },
    {
      header: "Benefit Policies",
      align: "right",
      headerClassName: "min-w-[7rem] text-right",
      render: (org) => (
        <CountCell
          count={org.policies.length}
          label="Benefit policies"
          items={org.policies.map(resolvePolicyName)}
          orgId={org.id}
          tab="policies"
          router={router}
        />
      )
    },
    {
      header: "",
      align: "right",
      render: (org) => (
        <ActionPopover
          actions={[
            { label: "Edit Organisation", href: `/organizations/${org.id}/edit` },
            { label: "Quick Invite Admin", onClick: () => {} },
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
