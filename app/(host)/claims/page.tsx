"use client"

import { useState, useMemo } from "react"
import {
  Receipt,
  MapPin,
  Calendar,
  Ticket,
  Eye,
  Download,
} from "@phosphor-icons/react"
import { SharedDataTable, type Column } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { ActionPopover } from "@/components/shared/action-popover"
import { StatusBadge } from "@/components/shared/status-badge"
import type { ClaimStatus, TransactionType } from "@/types/claims"
import { MOCK_CLAIMS } from "@/lib/mock-data"
import type { GlobalClaimRow } from "@/lib/mock-data"

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClaimsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all")
  const [txnFilter, setTxnFilter] = useState<TransactionType | "all">("all")
  const [orgFilter, setOrgFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")

  const orgOptions = useMemo(() => {
    const orgs = Array.from(new Set(MOCK_CLAIMS.map((c) => c.organisation)))
    return [{ label: "All Organisations", value: "all" }, ...orgs.map((o) => ({ label: o, value: o }))]
  }, [])

  const providerOptions = useMemo(() => {
    const providers = Array.from(new Set(MOCK_CLAIMS.map((c) => c.provider)))
    return [
      { label: "All Providers", value: "all" },
      ...providers.map((p) => ({ label: p, value: p })),
    ]
  }, [])

  const filteredData = useMemo(() => {
    return MOCK_CLAIMS.filter((row) => {
      const matchesSearch =
        !searchQuery ||
        [
          row.id,
          row.employeeName,
          row.empCode,
          row.provider,
          row.location,
          row.voucherCode,
          row.voucherName,
          row.organisation,
          row.service,
        ].some((f) => String(f).toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === "all" || row.status === statusFilter
      const matchesTxn = txnFilter === "all" || row.transactionType === txnFilter
      const matchesOrg = orgFilter === "all" || row.organisation === orgFilter
      const matchesProvider = providerFilter === "all" || row.provider === providerFilter
      return matchesSearch && matchesStatus && matchesTxn && matchesOrg && matchesProvider
    })
  }, [searchQuery, statusFilter, txnFilter, orgFilter, providerFilter])

  const columns: Column<GlobalClaimRow>[] = [
    {
      header: "Claim ID",
      accessorKey: "id",
      render: (row) => (
        <code className="text-label font-mono text-subtle tracking-tight whitespace-nowrap">
          {row.id}
        </code>
      ),
    },
    {
      header: "Employee",
      accessorKey: "employeeName",
      render: (row) => (
        <div>
          <p className="text-body font-medium text-foreground whitespace-nowrap">
            {row.employeeName}
          </p>
          <p className="text-label font-mono text-subtle font-medium mt-0.5 tracking-tight">
            {row.empCode}
          </p>
        </div>
      ),
    },
    {
      header: "Organisation",
      accessorKey: "organisation",
      render: (row) => (
        <span className="text-label font-medium text-foreground truncate max-w-[180px] block">
          {row.organisation}
        </span>
      ),
    },
    {
      header: "Service Provider",
      accessorKey: "provider",
      render: (row) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={14} className="text-faint shrink-0" />
          <p className="text-body text-subtle font-medium truncate">
            {row.provider}
          </p>
        </div>
      ),
    },
    {
      header: "Service",
      accessorKey: "service",
      render: (row) => (
        <p className="text-label font-medium text-foreground whitespace-nowrap">{row.service}</p>
      ),
    },
    {
      header: "Voucher",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-primary">
          <Ticket size={14} weight="bold" />
          <span className="text-label font-medium whitespace-nowrap">
            {row.voucherName || row.voucherCode}
          </span>
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      align: "right",
      render: (row) => (
        <p className="text-body font-semibold font-mono text-foreground">
          RM {row.amount.toFixed(2)}
        </p>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) => (
        <StatusBadge
          status={row.status}
          variant={
            row.status === "pre-auth"
              ? "amber"
              : row.status === "confirmed"
                ? "emerald"
                : "rose"
          }
        />
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-faint shrink-0" />
          <p className="text-label text-subtle font-medium whitespace-nowrap">
            {row.date}
          </p>
        </div>
      ),
    },
    {
      header: "",
      align: "right",
      render: () => (
        <ActionPopover
          align="end"
          actions={[
            {
              label: "View Details",
              icon: <Eye size={14} />,
              onClick: () => {},
            },
            {
              label: "View Voucher",
              icon: <Ticket size={14} />,
              onClick: () => {},
            },
            {
              label: "Download PDF",
              icon: <Download size={14} />,
              onClick: () => {},
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading font-semibold text-foreground">Claims</h1>
          <p className="text-body text-subtle">
            Global claims ledger across all organisations and service providers.
          </p>
        </div>
      </div>

      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search claims, employees, providers..."
        filters={
          <div className="flex items-center gap-4 flex-wrap">
            <FilterItem
              label="Organisation"
              value={orgFilter}
              onChange={setOrgFilter}
              options={orgOptions}
            />
            <FilterItem
              label="Provider"
              value={providerFilter}
              onChange={setProviderFilter}
              options={providerOptions}
            />
            <FilterItem
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as ClaimStatus | "all")}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Pre-auth", value: "pre-auth" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
            <FilterItem
              label="Type"
              value={txnFilter}
              onChange={(v) => setTxnFilter(v as TransactionType | "all")}
              options={[
                { label: "All Types", value: "all" },
                { label: "Redemption", value: "redemption" },
                { label: "Reimbursement", value: "reimbursement" },
                { label: "Refund", value: "refund" },
              ]}
            />
          </div>
        }
      />

      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border">
          <Receipt size={36} weight="duotone" className="text-faint mb-3" />
          <p className="text-muted-foreground font-medium text-body">
            No claims found.
          </p>
          <p className="text-label text-faint mt-1">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <SharedDataTable
          data={filteredData}
          columns={columns}
          rowsPerPage={10}
          freezeFirst
          freezeLast
          defaultSort={{ key: "date", direction: "desc" }}
        />
      )}
    </div>
  )
}
