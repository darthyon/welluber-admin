"use client"

import { useState, useMemo } from "react"
import {
  Ticket,
  Calendar,
  Storefront,
  Buildings,
  MapPin,
  Eye,
  Download,
} from "@phosphor-icons/react"
import { SharedDataTable, type Column } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { ActionPopover } from "@/components/shared/action-popover"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import type { EmployeeUtilisationRow, ClaimStatus } from "@/types/claims"

// ─── Derived redemption row ───────────────────────────────────────────────────

interface RedemptionRow {
  id: string
  voucherCode: string
  voucherName: string
  date: string
  employeeName: string
  empCode: string
  redeemedBy: string
  redeemedByType: string
  amount: number
  provider: string
  branch: string
  city: string
  status: ClaimStatus
}

function deriveRedemptions(data: EmployeeUtilisationRow[]): RedemptionRow[] {
  const rows: RedemptionRow[] = []
  data.forEach((emp) => {
    emp.claims.forEach((claim) => {
      rows.push({
        id: claim.id,
        voucherCode: claim.voucherCode,
        voucherName: claim.voucherName || claim.voucherCode,
        date: claim.date,
        employeeName: emp.name,
        empCode: emp.empCode,
        redeemedBy: emp.name,
        redeemedByType: "Employee",
        amount: claim.amount,
        provider: claim.provider,
        branch: emp.branch,
        city: claim.location,
        status: claim.status,
      })
    })
  })
  return rows
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: EmployeeUtilisationRow[]
  onViewVoucher?: (redemption: RedemptionRow) => void
}

export function VouchersTable({ data, onViewVoucher }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all")

  const redemptions = useMemo(() => deriveRedemptions(data), [data])

  const filtered = redemptions.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      [
        r.voucherCode,
        r.voucherName,
        r.employeeName,
        r.empCode,
        r.provider,
        r.city,
        r.redeemedBy,
      ].some((f) => String(f).toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns: Column<RedemptionRow>[] = [
    {
      header: "Voucher",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <p className="cursor-pointer text-body font-semibold text-primary underline-offset-2 hover:underline">
            {row.voucherName}
          </p>
          <code className="font-mono text-label text-muted-foreground">
            {row.voucherCode}
          </code>
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="shrink-0 text-faint" />
          <p className="text-label font-medium whitespace-nowrap text-muted-foreground">
            {row.date}
          </p>
        </div>
      ),
    },
    {
      header: "Employee",
      render: (row) => (
        <div>
          <p className="text-body font-medium text-foreground">
            {row.employeeName}
          </p>
          <p className="mt-0.5 text-label font-medium text-muted-foreground">
            {row.empCode}
          </p>
        </div>
      ),
    },
    {
      header: "Redeemed By",
      render: (row) => (
        <div>
          <p className="text-body font-medium text-foreground">
            {row.redeemedBy}
          </p>
          <p className="mt-0.5 text-label font-medium text-muted-foreground">
            {row.redeemedByType}
          </p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      align: "right",
      render: (row) => (
        <p className="font-mono text-body font-semibold text-foreground">
          RM {row.amount.toFixed(2)}
        </p>
      ),
    },
    {
      header: "Service Provider",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1.5">
          <Storefront size={11} className="shrink-0 text-faint" />
          <p className="truncate text-body font-medium text-subtle">
            {row.provider}
          </p>
        </div>
      ),
    },
    {
      header: "Branch",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Buildings size={11} className="shrink-0 text-faint" />
            <p className="truncate text-body font-medium text-foreground">
              {row.branch}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-label font-medium text-muted-foreground">
            <MapPin size={11} className="shrink-0" />
            {row.city}
          </div>
        </div>
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
      header: "",
      align: "right",
      render: (row) => (
        <ActionPopover
          align="end"
          actions={[
            {
              label: "View",
              icon: <Eye size={14} />,
              onClick: () => onViewVoucher?.(row),
            },
            {
              label: "Download",
              icon: <Download size={14} />,
              onClick: () => {},
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search vouchers..."
        filters={
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
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Ticket size={32} weight="light" />}
          title="No Voucher Redemptions Yet"
          description="Voucher redemption activity will appear here once employees start using benefits."
        />
      ) : (
        <SharedDataTable
          data={filtered}
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
