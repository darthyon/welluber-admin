"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload } from "@phosphor-icons/react"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle"
import { EmployeeCard } from "@/components/host/organizations/employee-card"
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
import { MOCK_EMPLOYEE_GRID, MOCK_EMPLOYEE_TABLE } from "./mock-data"

interface DirectorySubTabProps {
  orgId: string
  onBulkUpload: () => void
}

export function DirectorySubTab({ orgId, onBulkUpload }: DirectorySubTabProps) {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>("list")
  const [search, setSearch] = useQueryState("employeeSearch", "")

  return (
    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-semibold text-foreground">
            Employee Directory
          </h2>
          <p className="text-body text-subtle">
            Manage workforce records and branch assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 text-label font-medium"
            onClick={onBulkUpload}
          >
            <Upload size={14} weight="bold" /> Bulk Upload
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 text-label font-medium"
            onClick={() => router.push(`/employees/new?org=${orgId}`)}
          >
            <span className="inline-flex items-center gap-1.5">
              <Plus size={14} weight="bold" /> Add Employee
            </span>
          </Button>
          <div className="mx-1 h-4 w-[1px] bg-border" />
          <ViewToggle mode={view} onChange={setView} />
        </div>
      </div>

      <DataFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employees..."
        filters={
          <>
            <FilterItem
              label="Status"
              value="all"
              onChange={() => {}}
              options={[
                { label: "All Status", value: "all" },
                { label: "Linked", value: "linked" },
                { label: "Pending", value: "pending" },
              ]}
            />
            <FilterItem
              label="Needs Action"
              value="all"
              onChange={() => {}}
              options={[
                { label: "No Action", value: "all" },
                { label: "Missing Data", value: "missing" },
              ]}
            />
            <FilterItem
              label="Branch"
              value="all"
              onChange={() => {}}
              options={[
                { label: "All Branches", value: "all" },
                { label: "ACME HQ", value: "hq" },
                { label: "ACME Subang", value: "subang" },
              ]}
            />
          </>
        }
      />

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {MOCK_EMPLOYEE_GRID.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onView={(id) => router.push(`/employees/${id}`)}
              onEdit={(id) => router.push(`/employees/${id}/edit`)}
            />
          ))}
        </div>
      ) : (
        <TooltipProvider>
          <SharedDataTable
            freezeFirst
            freezeLast
            onRowClick={(emp) => router.push(`/employees/${emp.id}`)}
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
                  <Badge variant="outline" className="text-label font-medium whitespace-nowrap">
                    {emp.branch}
                  </Badge>
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
                  <Badge variant="secondary" className="text-label font-medium whitespace-nowrap">
                    {emp.tier || "—"}
                  </Badge>
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
                  <span className="text-label font-medium text-subtle">{emp.joinDate}</span>
                ),
              },
              {
                header: "Last Active",
                accessorKey: "lastActive",
                sortable: true,
                render: (emp) => (
                  <span className="text-label font-medium text-subtle">{emp.lastActive}</span>
                ),
              },
              {
                header: "Policies",
                render: (emp) => (
                  <div className="flex max-w-[280px] flex-wrap items-center gap-1 overflow-visible">
                    {emp.benefitPolicies && emp.benefitPolicies.length > 0 ? (
                      <>
                        {emp.benefitPolicies.slice(0, 2).map(
                          (
                            policy: { policyName: string; benefitGroups?: string[]; utilisation?: number },
                            idx: number
                          ) => (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                <div className="flex cursor-help items-center">
                                  <Badge
                                    variant="secondary"
                                    className="text-label font-medium whitespace-nowrap transition-colors hover:bg-secondary/80"
                                  >
                                    {policy.policyName}
                                    {policy.benefitGroups && policy.benefitGroups.length > 0 && (
                                      <span className="ml-1 max-w-[80px] truncate font-medium text-subtle">
                                        ({policy.benefitGroups.length})
                                      </span>
                                    )}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="z-[200] w-56 p-2">
                                <div className="flex flex-col gap-1.5">
                                  <div className="text-label font-semibold text-foreground">
                                    {policy.policyName}
                                  </div>
                                  {policy.benefitGroups && policy.benefitGroups.length > 0 ? (
                                    <div className="text-label leading-snug text-muted-foreground">
                                      {policy.benefitGroups.join(", ")}
                                    </div>
                                  ) : (
                                    <div className="text-label text-muted-foreground italic">
                                      No specific groups.
                                    </div>
                                  )}
                                  {policy.utilisation !== undefined && (
                                    <StatusBadge
                                      status={`${policy.utilisation}% Utilized`}
                                      variant="emerald"
                                      className="mt-0.5"
                                    />
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        )}
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
                              {emp.benefitPolicies.slice(2).map(
                                (
                                  policy: { policyName: string; benefitGroups?: string[]; utilisation?: number },
                                  i: number
                                ) => (
                                  <div
                                    key={i}
                                    className="flex flex-col gap-1.5 border-b border-border/50 px-1 pb-2.5 last:border-0 last:pb-0"
                                  >
                                    <div className="mt-1 text-label font-semibold text-foreground">
                                      {policy.policyName}
                                    </div>
                                    {policy.benefitGroups && policy.benefitGroups.length > 0 ? (
                                      <div className="text-label leading-snug text-muted-foreground">
                                        {policy.benefitGroups.join(", ")}
                                      </div>
                                    ) : (
                                      <div className="text-label text-muted-foreground italic">
                                        No specific groups.
                                      </div>
                                    )}
                                    {policy.utilisation !== undefined && (
                                      <StatusBadge
                                        status={`${policy.utilisation}% Utilized`}
                                        variant="emerald"
                                        className="mt-0.5"
                                      />
                                    )}
                                  </div>
                                )
                              )}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-label font-medium">
                        None
                      </Badge>
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
                      { label: "View Employee", onClick: () => router.push(`/employees/${emp.id}`) },
                      { label: "Edit Employee", onClick: () => router.push(`/employees/${emp.id}/edit`) },
                      { label: "Terminate Link", isDanger: true },
                    ]}
                  />
                ),
              },
            ]}
            data={MOCK_EMPLOYEE_TABLE}
          />
        </TooltipProvider>
      )}
    </div>
  )
}
