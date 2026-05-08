"use client"

import type { EmployeeDirectoryItem } from "@/features/employees/types"
import { SharedDataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActionPopover } from "@/components/shared/action-popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"


interface EmployeeDirectoryTableProps {
  data: EmployeeDirectoryItem[]
  onRowClick?: (employee: EmployeeDirectoryItem) => void
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

export function EmployeeDirectoryTable({
  data,
  onRowClick,
  onView,
  onEdit,
}: EmployeeDirectoryTableProps) {
  return (
    <TooltipProvider>
      <SharedDataTable
        freezeFirst
        freezeLast
        onRowClick={onRowClick}
        columns={[
          {
            header: "Employee",
            accessorKey: "name",
            sortable: true,
            render: (emp) => (
              <div className="flex flex-col">
                <span className="text-body font-medium text-foreground transition-colors group-hover:text-primary">
                  {emp.name}
                </span>
                <span className="mt-0.5 text-label font-medium text-muted-foreground">
                  {emp.email}
                </span>
              </div>
            ),
          },
          {
            header: "Organization",
            accessorKey: "organization",
            sortable: true,
            render: (emp) => (
              <span className="rounded-md border border-border bg-muted/80 px-2 py-0.5 text-label font-semibold text-muted-foreground">
                {emp.organization}
              </span>
            ),
          },
          {
            header: "ID / Code",
            accessorKey: "empCode",
            sortable: true,
            render: (emp) => (
              <span className="text-body font-medium text-subtle">
                {emp.empCode}
              </span>
            ),
          },
          {
            header: "Branch",
            accessorKey: "branch",
            sortable: true,
            render: (emp) => (
              <span className="rounded-md border border-border bg-muted/80 px-2 py-0.5 text-label font-semibold text-muted-foreground">
                {emp.branch}
              </span>
            ),
          },
          {
            header: "Department",
            accessorKey: "department",
            sortable: true,
            render: (emp) => (
              <span className="text-label font-medium text-foreground">
                {emp.department || "—"}
              </span>
            ),
          },
          {
            header: "Tier",
            accessorKey: "tier",
            sortable: true,
            render: (emp) => (
              <span className="whitespace-nowrap text-label font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                {emp.tier || "—"}
              </span>
            ),
          },
          {
            header: "Employment Type",
            accessorKey: "employmentType",
            sortable: true,
            render: (emp) => (
              <span className="text-label font-medium text-muted-foreground capitalize">
                {emp.employmentType?.replace("-", " ") || "—"}
              </span>
            ),
          },
          {
            header: "Joined Date",
            accessorKey: "joinDate",
            sortable: true,
            render: (emp) => (
              <span className="text-label font-medium text-subtle">
                {emp.joinDate}
              </span>
            ),
          },
          {
            header: "Last Active",
            accessorKey: "lastActive",
            sortable: true,
            render: (emp) => (
              <span className="text-label font-medium text-subtle">
                {emp.lastActive}
              </span>
            ),
          },
          {
            header: "Policies",
            render: (emp) => (
              <div className="flex max-w-[280px] flex-wrap items-center gap-1 overflow-visible">
                {emp.benefitPolicies && emp.benefitPolicies.length > 0 ? (
                  <>
                    {emp.benefitPolicies.slice(0, 2).map((policy, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div className="flex cursor-help items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-label font-semibold whitespace-nowrap text-primary transition-colors hover:bg-primary/10">
                            {policy.policyName}
                            {policy.benefitGroups.length > 0 && (
                              <span className="ml-1 max-w-[80px] truncate font-medium text-subtle">
                                ({policy.benefitGroups.length})
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[200] w-56 p-2">
                          <div className="flex flex-col gap-1.5">
                            <div className="text-label font-semibold text-foreground">
                              {policy.policyName}
                            </div>
                            {policy.benefitGroups.length > 0 ? (
                              <div className="text-label leading-snug text-muted-foreground">
                                {policy.benefitGroups.join(", ")}
                              </div>
                            ) : (
                              <div className="text-label text-muted-foreground italic">
                                No specific groups.
                              </div>
                            )}
                            <StatusBadge status={`${policy.utilisation}% Utilized`} variant="emerald" className="mt-0.5" />
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {emp.benefitPolicies.length > 2 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-help px-1 text-label font-medium text-subtle transition-colors hover:text-primary"
                          >
                            +{emp.benefitPolicies.length - 2}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="z-[200] flex w-56 flex-col gap-2 p-2">
                          <div className="px-1 text-label font-semibold text-muted-foreground opacity-60">
                            Other policies
                          </div>
                          {emp.benefitPolicies.slice(2).map((policy, i) => (
                            <div
                              key={i}
                              className="flex flex-col gap-1.5 border-b border-border/50 px-1 pb-2.5 last:border-0 last:pb-0"
                            >
                              <div className="mt-1 text-label font-semibold text-foreground">
                                {policy.policyName}
                              </div>
                              {policy.benefitGroups.length > 0 ? (
                                <div className="text-label leading-snug text-muted-foreground">
                                  {policy.benefitGroups.join(", ")}
                                </div>
                              ) : (
                                <div className="text-label text-muted-foreground italic">
                                  No specific groups.
                                </div>
                              )}
                              <StatusBadge status={`${policy.utilisation}% Utilized`} variant="emerald" className="mt-0.5" />
                            </div>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                ) : (
                  <StatusBadge status="No Policy" variant="amber" />
                )}
              </div>
            ),
          },
          {
            header: "Status",
            accessorKey: "status",
            sortable: true,
            render: (emp) => (
              <StatusBadge
                status={emp.status}
                variant={emp.status === "Linked" ? "emerald" : "amber"}
              />
            ),
          },
          {
            header: "Actions",
            align: "right",
            render: (emp) => (
              <ActionPopover
                actions={[
                  {
                    label: "View Employee",
                    onClick: () => onView?.(emp.id),
                  },
                  {
                    label: "Edit Employee",
                    onClick: () => onEdit?.(emp.id),
                  },
                  {
                    label: "Terminate Link",
                    isDanger: true,
                  },
                ]}
              />
            ),
          },
        ]}
        data={data}
      />
    </TooltipProvider>
  )
}
