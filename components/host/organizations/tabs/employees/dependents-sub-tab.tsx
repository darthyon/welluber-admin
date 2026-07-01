"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { UsersThree } from "@phosphor-icons/react"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle"
import { DependentCard } from "@/components/host/organizations/dependent-card"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { SharedDataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActionPopover } from "@/components/shared/action-popover"
import { useOrgWorkforce } from "@/hooks/use-org-workforce"

interface DependentsSubTabProps {
  orgId: string
  onNavigateToDirectory: () => void
}

export function DependentsSubTab({
  orgId,
  onNavigateToDirectory,
}: DependentsSubTabProps) {
  const router = useRouter()
  const { dependents } = useOrgWorkforce(orgId)
  const [view, setView] = useState<ViewMode>("list")
  const [search, setSearch] = useQueryState("depSearch", "")

  const filtered = useMemo(() => {
    if (!search) return dependents
    const q = search.toLowerCase()
    return dependents.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.employeeName?.toLowerCase().includes(q)
    )
  }, [dependents, search])

  return (
    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-semibold text-foreground">
            Dependent Directory
          </h2>
          <p className="text-body text-subtle">
            Manage family members linked to employee benefits
          </p>
        </div>
        <ViewToggle mode={view} onChange={setView} />
      </div>

      <DataFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by dependent or employee name..."
      />

      {view === "grid" ? (
        filtered.length === 0 ? (
          <EmptyState
            icon={<UsersThree size={32} weight="light" />}
            title="No Dependents Found"
            description={
              search
                ? "Try another search term to find a linked dependent."
                : "Dependents linked to employees will appear here once added."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filtered.map((dep) => (
              <DependentCard
                key={dep.id}
                dependent={dep}
                onViewEmployee={(employeeId) => {
                  onNavigateToDirectory()
                  router.push(`/employees/${employeeId}`)
                }}
                onEdit={() => {}}
              />
            ))}
          </div>
        )
      ) : (
        <SharedDataTable
          freezeFirst
          freezeLast
          columns={[
            {
              header: "Dependent Name",
              accessorKey: "name",
              render: (dep) => (
                <span className="text-body font-medium text-foreground">
                  {dep.name}
                </span>
              ),
            },
            {
              header: "Linked Employee",
              accessorKey: "employeeName",
              render: (dep) => (
                <button
                  onClick={() => {
                    onNavigateToDirectory()
                    router.push(`/employees/${dep.employeeId}`)
                  }}
                  className="text-body font-medium text-primary hover:underline"
                >
                  {dep.employeeName}
                </button>
              ),
            },
            {
              header: "Relationship",
              accessorKey: "relationship",
              render: (dep) => (
                <Badge
                  variant="outline"
                  className="text-label font-medium capitalize"
                >
                  {dep.relationship}
                </Badge>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              render: (dep) => (
                <StatusBadge status={dep.status} variant="emerald" />
              ),
            },
            {
              header: "Joined Date",
              accessorKey: "joinDate",
              render: (dep) => (
                <span className="text-label font-medium text-subtle">
                  {dep.joinDate}
                </span>
              ),
            },
            {
              header: "Actions",
              align: "right",
              render: () => (
                <ActionPopover
                  actions={[
                    { label: "View Details", onClick: () => {} },
                    { label: "Edit Dependent", onClick: () => {} },
                    { label: "Remove", isDanger: true },
                  ]}
                />
              ),
            },
          ]}
          data={filtered}
          emptyState={
            <EmptyState
              icon={<UsersThree size={32} weight="light" />}
              title="No Dependents Found"
              description={
                search
                  ? "Try another search term to find a linked dependent."
                  : "Dependents linked to employees will appear here once added."
              }
            />
          }
        />
      )}
    </div>
  )
}
