"use client"

import { useMemo, useState } from "react"
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
import { TooltipProvider } from "@/components/ui/tooltip"
import { getMockEmployeeGrid, getMockEmployeeTable } from "./mock-data"
import {
  EmployeeDirectoryEmptyState,
  EmployeePoliciesCell,
} from "./directory-sub-tab-parts"

interface DirectorySubTabProps {
  orgId: string
  onBulkUpload: () => void
}

export function DirectorySubTab({ orgId, onBulkUpload }: DirectorySubTabProps) {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>("list")
  const [search, setSearch] = useQueryState("employeeSearch", "")
  const [filter] = useQueryState("filter", "")
  const employeeGrid = useMemo(() => getMockEmployeeGrid(orgId), [orgId])
  const employeeTable = useMemo(() => getMockEmployeeTable(orgId), [orgId])
  const showMissingPolicyOnly = filter === "missing-policy"
  const filterMissingPolicy = <T extends { benefitPolicies?: unknown[] }>(
    employees: T[]
  ) =>
    showMissingPolicyOnly
      ? employees.filter(
          (employee) => (employee.benefitPolicies?.length ?? 0) === 0
        )
      : employees

  const filteredEmployeeGrid = filterMissingPolicy(employeeGrid)
  const filteredEmployeeTable = filterMissingPolicy(employeeTable)
  const hasSearchOrFilter = Boolean(search || showMissingPolicyOnly)

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
        filteredEmployeeGrid.length === 0 ? (
          <EmployeeDirectoryEmptyState hasSearchOrFilter={hasSearchOrFilter} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredEmployeeGrid.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onView={(id) => router.push(`/employees/${id}?from=${orgId}`)}
                onEdit={(id) => router.push(`/employees/${id}/edit`)}
              />
            ))}
          </div>
        )
      ) : (
        <TooltipProvider>
          <SharedDataTable
            freezeFirst
            freezeLast
            onRowClick={(emp) =>
              router.push(`/employees/${emp.id}?from=${orgId}`)
            }
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
                  <Badge
                    variant="outline"
                    className="text-label font-medium whitespace-nowrap"
                  >
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
                  <Badge
                    variant="secondary"
                    className="text-label font-medium whitespace-nowrap"
                  >
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
                  <EmployeePoliciesCell policies={emp.benefitPolicies} />
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
                        onClick: () =>
                          router.push(`/employees/${emp.id}?from=${orgId}`),
                      },
                      {
                        label: "Edit Employee",
                        onClick: () => router.push(`/employees/${emp.id}/edit`),
                      },
                      { label: "Terminate Link", isDanger: true },
                    ]}
                  />
                ),
              },
            ]}
            data={filteredEmployeeTable}
            emptyState={
              <EmployeeDirectoryEmptyState
                hasSearchOrFilter={hasSearchOrFilter}
              />
            }
          />
        </TooltipProvider>
      )}
    </div>
  )
}
