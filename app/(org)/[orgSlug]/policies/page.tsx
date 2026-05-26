"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Shield, IdentificationCard, TreeStructure } from "@phosphor-icons/react"
import { SharedDataTable, type Column } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { routes } from "@/lib/navigation"

type PolicyRow = {
  id: string
  name: string
  code: string
  version?: string
  type: string
  assignedTo: string
  status: "draft" | "active" | "deactivated"
  employeeCount: number
  lastUpdated: string
}

// Same inline data as host org detail page
const ACME_POLICIES: PolicyRow[] = [
  {
    id: "pol_1",
    name: "Acme Employee Wellness Policy FY2026",
    code: "BEN-STD-01",
    version: "V1.1",
    type: "Wellness",
    assignedTo: "All Branches",
    status: "active",
    employeeCount: 1240,
    lastUpdated: "24 Mar 2026",
  },
  {
    id: "pol_2",
    name: "Acme Leadership Benefits Policy FY2026",
    code: "BEN-EXC-02",
    version: "V2.0",
    type: "Lifestyle",
    assignedTo: "Subang Jaya",
    status: "active",
    employeeCount: 450,
    lastUpdated: "02 Apr 2026",
  },
]

const POLICIES_BY_SLUG: Record<string, PolicyRow[]> = {
  "acme-corporation": ACME_POLICIES,
}

export default function OrgPoliciesPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const policies = POLICIES_BY_SLUG[orgSlug] ?? ACME_POLICIES

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [policies, search, statusFilter])

  const columns: Column<PolicyRow>[] = [
    {
      header: "Policy",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shrink-0">
            <IdentificationCard size={20} weight="duotone" />
          </div>
          <div>
            <p className="text-body font-medium text-foreground group-hover:text-primary transition-colors leading-tight whitespace-nowrap">
              {p.name}
            </p>
            <p className="text-label font-mono text-subtle tracking-tight">{p.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Version",
      headerClassName: "text-center",
      render: (p) => (
        <div className="text-center">
          {p.version ? (
            <Badge variant="outline" className="text-label font-mono">{p.version}</Badge>
          ) : (
            <span className="text-label text-faint">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Scope",
      render: (p) => (
        <div className="flex items-center gap-2">
          <TreeStructure size={14} className="text-faint" />
          <span className="text-body font-medium text-subtle">{p.assignedTo}</span>
        </div>
      ),
    },
    {
      header: "Employees",
      headerClassName: "text-center",
      render: (p) => (
        <div className="text-center font-medium text-body text-subtle tabular-nums">
          {p.employeeCount.toLocaleString()}
        </div>
      ),
    },
    {
      header: "Status",
      render: (p) => (
        <StatusBadge
          status={p.status}
          variant={p.status === "active" ? "emerald" : p.status === "draft" ? "amber" : "zinc"}
        />
      ),
    },
    {
      header: "Last Updated",
      render: (p) => <span className="text-label text-subtle font-medium whitespace-nowrap">{p.lastUpdated}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Benefit Policies</h1>
        <p className="text-muted-foreground mt-0.5 text-body">{policies.length} policies assigned</p>
      </div>

      <DataFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search policies..."
        filters={
          <FilterItem
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Draft", value: "draft" },
              { label: "Deactivated", value: "deactivated" },
            ]}
          />
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Shield size={32} weight="duotone" />}
          title="No policies found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <SharedDataTable
          data={filtered}
          columns={columns}
          freezeFirst
          freezeLast
          rowsPerPage={10}
          onRowClick={(p) => router.push(`${routes.org.policies(orgSlug)}/${p.id}`)}
        />
      )}
    </div>
  )
}
