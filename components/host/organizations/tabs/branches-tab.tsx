"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus, Info } from "@phosphor-icons/react"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { Button } from "@/components/ui/button"
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle"
import { BranchCard } from "@/components/host/organizations/branch-card"
import { BranchDetailView } from "@/components/host/organizations/branch-detail-view"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { SharedDataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActionPopover } from "@/components/shared/action-popover"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { MOCK_BRANCHES } from "./branches-mock-data"

interface BranchesTabProps {
  orgId: string
}

export function BranchesTab({ orgId }: BranchesTabProps) {
  const router = useRouter()
  const [branchesView, setBranchesView] = useState<ViewMode>("list")
  const [branchSearch, setBranchSearch] = useQueryState("branchSearch", "")
  const [viewBranchId, setViewBranchId] = useQueryState("branchId")

  if (viewBranchId) {
    return (
      <BranchDetailView
        branchId={viewBranchId}
        onBack={() => setViewBranchId(null)}
        onEdit={() =>
          router.push(
            `/organizations/${orgId}/branches/${viewBranchId}/edit`
          )
        }
      />
    )
  }

  return (
    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-semibold text-foreground">
            Branches
          </h2>
          <p className="text-body text-subtle">
            Manage geographical locations and their specific account
            configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
          >
            <Link href={`/organizations/${orgId}/branches/new`}>
              <Plus size={14} weight="bold" /> Add Branch
            </Link>
          </Button>
          <div className="mx-1 h-4 w-[1px] bg-border" />
          <ViewToggle mode={branchesView} onChange={setBranchesView} />
        </div>
      </div>

      <DataFilterBar
        searchQuery={branchSearch}
        onSearchChange={setBranchSearch}
        searchPlaceholder="Search branches..."
        filters={
          <>
            <FilterItem
              label="Region"
              value="all"
              onChange={() => {}}
              options={[
                { label: "All States", value: "all" },
                { label: "Selangor", value: "sel" },
                { label: "Kuala Lumpur", value: "kl" },
              ]}
            />
            <FilterItem
              label="Status"
              value="all"
              onChange={() => {}}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </>
        }
      />

      {branchesView === "grid" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_BRANCHES.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onView={() => setViewBranchId(branch.id)}
              onEdit={() =>
                router.push(
                  `/organizations/${orgId}/branches/${branch.id}/edit`
                )
              }
            />
          ))}
        </div>
      ) : (
        <TooltipProvider>
          <SharedDataTable
            freezeFirst
            freezeLast
            onRowClick={(branch) => setViewBranchId(branch.id)}
            columns={[
              {
                header: "Branch name",
                accessorKey: "name",
                sortable: true,
                render: (branch: { name: string }) => (
                  <span className="text-body font-medium text-foreground transition-colors group-hover:text-primary">
                    {branch.name}
                  </span>
                ),
              },
              {
                header: "Status",
                accessorKey: "status",
                sortable: true,
                render: (branch: { status: string }) => (
                  <StatusBadge status={branch.status} variant="emerald" />
                ),
              },
              {
                header: "Type",
                accessorKey: "type",
                sortable: true,
                render: (branch: { type: string }) => (
                  <span className="text-body text-subtle">{branch.type}</span>
                ),
              },
              {
                header: "Employees",
                accessorKey: "employees",
                sortable: true,
                render: (branch: { employees: number | string }) => (
                  <span className="text-body text-subtle">
                    {branch.employees}
                  </span>
                ),
              },
              {
                header: "Account",
                accessorKey: "accountName",
                sortable: true,
                headerClassName: "min-w-[220px]",
                render: (branch: {
                  accountName: string
                  accountId: string
                  cashBalance: number
                  creditBalance: number
                }) => {
                  const total = branch.cashBalance + branch.creditBalance
                  return (
                    <div className="flex items-center gap-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-body font-semibold text-foreground">
                          {branch.accountName}
                        </span>
                        <span className="tracking-tight mt-0.5 font-mono text-label text-subtle">
                          {branch.accountId}
                        </span>
                      </div>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="ml-auto text-body font-semibold text-foreground tabular-nums transition-colors hover:text-primary"
                          >
                            RM {total.toLocaleString()}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="z-[200] w-56 rounded-lg border-border bg-card p-3 shadow-2xl">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-label font-medium text-subtle">
                                Cash balance
                              </span>
                              <span className="text-label font-semibold text-foreground tabular-nums">
                                RM {branch.cashBalance.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-label font-medium text-subtle">
                                Credit available
                              </span>
                              <span className="text-label font-semibold text-foreground tabular-nums">
                                RM {branch.creditBalance.toLocaleString()}
                              </span>
                            </div>
                            <div className="my-0.5 h-px bg-border/60" />
                            <div className="flex items-center justify-between">
                              <span className="text-label font-semibold text-subtle">
                                Total
                              </span>
                              <span className="text-label font-semibold text-primary tabular-nums">
                                RM {total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )
                },
              },
              {
                header: (
                  <span className="inline-flex items-center gap-1">
                    Claims
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="text-faint transition-colors hover:text-foreground"
                          aria-label="About claims"
                        >
                          <Info size={12} weight="regular" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="z-[200] rounded-lg border-border bg-card px-2.5 py-1.5 shadow-2xl">
                        <span className="text-label font-medium text-foreground">
                          Based on current month&apos;s claim
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                ),
                accessorKey: "claimsCount",
                sortable: true,
                headerClassName: "min-w-[120px]",
                render: (branch: { claimsCount: number }) => (
                  <span className="text-body font-medium text-foreground tabular-nums">
                    {branch.claimsCount.toLocaleString()}
                  </span>
                ),
              },
              {
                header: "Actions",
                align: "right",
                render: (branch: { id: string; type: string }) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ActionPopover
                      actions={[
                        {
                          label: "View Details",
                          onClick: () => setViewBranchId(branch.id),
                        },
                        {
                          label: "Edit Branch",
                          onClick: () =>
                            router.push(
                              `/organizations/${orgId}/branches/${branch.id}/edit`
                            ),
                        },
                        ...(branch.type.toLowerCase() !== "hq"
                          ? [{ label: "Deactivate", isDanger: true }]
                          : []),
                      ]}
                    />
                  </div>
                ),
              },
            ]}
            data={MOCK_BRANCHES}
          />
        </TooltipProvider>
      )}
    </div>
  )
}
