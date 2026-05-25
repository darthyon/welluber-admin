"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users, IdentificationCard } from "@phosphor-icons/react"
import { SharedDataTable, type Column } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { MOCK_EMPLOYEES, MOCK_DEPENDENTS } from "@/lib/mock-data"
import type { EmployeeDirectoryItem } from "@/lib/mock-data"
import type { Dependent } from "@/features/organizations/types"
import { routes } from "@/lib/navigation"

const ORG_BY_SLUG: Record<string, string> = {
  "acme-corporation": "ORG-20260115-0001",
}

export default function OrgEmployeesPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const orgId = ORG_BY_SLUG[orgSlug] ?? ""

  const [activeTab, setActiveTab] = useState<"directory" | "dependents">("directory")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const employees = useMemo(
    () => MOCK_EMPLOYEES.filter((e) => e.orgId === orgId),
    [orgId]
  )

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.empCode.toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || e.status.toLowerCase() === statusFilter
      return matchSearch && matchStatus
    })
  }, [employees, search, statusFilter])

  const dependents = useMemo(
    () => MOCK_DEPENDENTS.filter((d) => employees.some((e) => e.id === d.employeeId)),
    [employees]
  )

  const filteredDependents = useMemo(() => {
    const q = search.toLowerCase()
    if (!search) return dependents
    return dependents.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.employeeName?.toLowerCase().includes(q)
    )
  }, [dependents, search])

  const empColumns: Column<EmployeeDirectoryItem>[] = [
    {
      header: "Employee",
      render: (e) => (
        <div>
          <p className="text-body font-semibold text-foreground leading-tight">{e.name}</p>
          <p className="text-label font-mono text-faint">{e.empCode}</p>
        </div>
      ),
    },
    {
      header: "Email",
      render: (e) => <span className="text-body text-subtle">{e.email}</span>,
    },
    {
      header: "Branch",
      render: (e) => <span className="text-body text-subtle">{e.branch}</span>,
    },
    {
      header: "Department",
      render: (e) => <span className="text-body text-subtle">{e.department}</span>,
    },
    {
      header: "Tier",
      render: (e) => <span className="text-body text-subtle">{e.tier}</span>,
    },
    {
      header: "Status",
      render: (e) => (
        <StatusBadge
          status={e.status}
          variant={e.status === "Linked" ? "emerald" : "amber"}
        />
      ),
    },
    {
      header: "Joined",
      render: (e) => <span className="text-body text-faint">{e.joinDate}</span>,
    },
  ]

  const depColumns: Column<Dependent>[] = [
    {
      header: "Name",
      render: (d) => (
        <div>
          <p className="text-body font-semibold text-foreground">{d.name}</p>
          <p className="text-label text-faint capitalize">{d.relationship}</p>
        </div>
      ),
    },
    {
      header: "Linked Employee",
      render: (d) => <span className="text-body text-subtle">{d.employeeName}</span>,
    },
    {
      header: "Status",
      render: (d) => (
        <StatusBadge
          status={d.status}
          variant={d.status === "active" ? "emerald" : "zinc"}
        />
      ),
    },
    {
      header: "Joined",
      render: (d) => <span className="text-body text-faint">{d.joinDate}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
        <p className="text-muted-foreground mt-0.5 text-body">
          {employees.length} employees · {dependents.length} dependents
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/60">
        {(["directory", "dependents"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch("") }}
            className={`px-4 py-2 text-body font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-subtle hover:text-foreground"
            }`}
          >
            {tab === "directory" ? "Employee Directory" : "Dependents"}
          </button>
        ))}
      </div>

      <DataFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={activeTab === "directory" ? "Search employees..." : "Search dependents..."}
        filters={
          activeTab === "directory" ? (
            <FilterItem
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All Status", value: "all" },
                { label: "Linked", value: "linked" },
                { label: "Pending", value: "pending" },
              ]}
            />
          ) : null
        }
      />

      {activeTab === "directory" ? (
        filteredEmployees.length === 0 ? (
          <EmptyState
            icon={<Users size={32} weight="duotone" />}
            title="No employees found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <SharedDataTable
            data={filteredEmployees}
            columns={empColumns}
            freezeFirst
            onRowClick={(e) => router.push(`${routes.org.employees(orgSlug)}/${e.id}`)}
          />
        )
      ) : (
        filteredDependents.length === 0 ? (
          <EmptyState
            icon={<IdentificationCard size={32} weight="duotone" />}
            title="No dependents found"
            description="Try adjusting your search."
          />
        ) : (
          <SharedDataTable
            data={filteredDependents}
            columns={depColumns}
            freezeFirst
          />
        )
      )}
    </div>
  )
}
