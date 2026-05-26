"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Buildings } from "@phosphor-icons/react"
import { BranchCard } from "@/components/host/organizations/branch-card"
import { SharedDataTable, type Column } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { routes } from "@/lib/navigation"

type Branch = {
  id: string
  name: string
  type: string
  accountModel: string
  accountName?: string
  accountId?: string
  address: { city: string; state: string }
  employeesCount: number
  status: string
  cashBalance: number
  creditBalance: number
  claimsCount: number
}

// Inline mock data — same branches as host org detail view
const ACME_BRANCHES: Branch[] = [
  {
    id: "br_1",
    name: "ACME HQ",
    type: "HQ",
    accountModel: "New",
    accountName: "KL HQ Account",
    accountId: "ACC-20260115-0001",
    address: { city: "Kuala Lumpur", state: "Wilayah Persekutuan" },
    employeesCount: 1240,
    status: "Active",
    cashBalance: 45000,
    creditBalance: 10000,
    claimsCount: 12,
  },
  {
    id: "br_2",
    name: "ACME Subang Jaya",
    type: "Branch Office",
    accountModel: "Existing",
    accountName: "Acme Shared Account",
    accountId: "ACC-20260115-0002",
    address: { city: "Subang Jaya", state: "Selangor" },
    employeesCount: 450,
    status: "Active",
    cashBalance: 12500,
    creditBalance: 5000,
    claimsCount: 5,
  },
]

const BRANCHES_BY_SLUG: Record<string, Branch[]> = {
  "acme-corporation": ACME_BRANCHES,
}

export default function OrgBranchesPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string

  const [view, setView] = useState<ViewMode>("grid")
  const [search, setSearch] = useState("")

  const branches = BRANCHES_BY_SLUG[orgSlug] ?? ACME_BRANCHES

  const filtered = branches.filter((b) => {
    const q = search.toLowerCase()
    return (
      !search ||
      b.name.toLowerCase().includes(q) ||
      b.address.city.toLowerCase().includes(q) ||
      b.address.state.toLowerCase().includes(q)
    )
  })

  const listColumns: Column<Branch>[] = [
    {
      header: "Branch",
      render: (b) => (
        <div>
          <p className="text-body font-medium text-foreground whitespace-nowrap">{b.name}</p>
          <p className="text-label text-subtle font-medium whitespace-nowrap">{b.address.city}, {b.address.state}</p>
        </div>
      ),
    },
    { header: "Type", render: (b) => <span className="text-body text-subtle">{b.type}</span> },
    {
      header: "Status",
      render: (b) => <StatusBadge status={b.status} variant={b.status === "Active" ? "emerald" : "zinc"} />,
    },
    {
      header: "Employees",
      headerClassName: "text-right",
      align: "right",
      render: (b) => <span className="text-body font-medium tabular-nums">{b.employeesCount.toLocaleString()}</span>,
    },
    {
      header: "Balance",
      headerClassName: "text-right",
      align: "right",
      render: (b) => (
        <span className="text-body font-medium font-mono tabular-nums">
          RM {(b.cashBalance + b.creditBalance).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Claims",
      headerClassName: "text-right",
      align: "right",
      render: (b) => <span className="text-body font-medium tabular-nums text-subtle">{b.claimsCount}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Branches</h1>
          <p className="text-muted-foreground mt-0.5 text-body">{branches.length} branches</p>
        </div>
        <ViewToggle mode={view} onChange={setView} />
      </div>

      <DataFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branches..."
      />

      {filtered.length === 0 ? (
        <EmptyState icon={<Buildings size={32} weight="duotone" />} title="No branches found" description="Try adjusting your search." />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BranchCard
              key={b.id}
              branch={b}
              onView={(id) => router.push(`${routes.org.branches(orgSlug)}/${id}`)}
            />
          ))}
        </div>
      ) : (
        <SharedDataTable
          data={filtered}
          columns={listColumns}
          freezeFirst
          freezeLast
          rowsPerPage={10}
          onRowClick={(b) => router.push(`${routes.org.branches(orgSlug)}/${b.id}`)}
        />
      )}
    </div>
  )
}
