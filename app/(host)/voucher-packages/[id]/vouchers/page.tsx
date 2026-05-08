"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Ticket } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { FilterItem } from "@/components/shared/filter-item"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { SharedDataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { MOCK_GENERATED_VOUCHERS } from "@/lib/mock-data"
import { MOCK_SPS } from "@/lib/mock-data"
import type { GeneratedVoucherStatus } from "@/features/voucher-packages/types"

function findVoucherPackage(packageId: string) {
  for (const sp of MOCK_SPS) {
    const found = sp.vouchers.find(v => v.id === packageId)
    if (found) return { ...found, providerName: sp.name }
  }
  return null
}

const STATUS_OPTIONS: { label: string; value: GeneratedVoucherStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Redeemed", value: "redeemed" },
  { label: "Expired", value: "expired" },
  { label: "Cancelled", value: "cancelled" },
]

const STATUS_VARIANT: Record<string, "emerald" | "amber" | "rose" | "zinc"> = {
  active: "emerald",
  redeemed: "amber",
  expired: "zinc",
  cancelled: "rose",
}

export default function GeneratedVouchersPage() {
  const params = useParams()
  const router = useRouter()
  const packageId = params.id as string

  const [statusFilter, setStatusFilter] = useState<GeneratedVoucherStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const voucherPackage = findVoucherPackage(packageId)

  const filteredVouchers = MOCK_GENERATED_VOUCHERS.filter(v => {
    const matchesPackage = v.voucherPackageId === packageId
    const matchesStatus = statusFilter === "all" || v.status === statusFilter
    const matchesSearch = !searchQuery ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesPackage && matchesStatus && matchesSearch
  })

  if (!voucherPackage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-heading font-semibold tracking-tight">Voucher Package Not Found</h2>
        <Button variant="ghost" onClick={() => router.push("/voucher-packages")}>
          Back to Voucher Packages
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Voucher Packages", href: "/voucher-packages" },
          { label: voucherPackage.name, href: `/voucher-packages/${packageId}/vouchers` },
          { label: "Generated Vouchers" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/voucher-packages")}
              className="flex items-center gap-1 text-label font-semibold text-faint hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
          <h1 className="text-heading font-semibold text-foreground mt-2">
            Generated Vouchers
          </h1>
          <p className="text-body text-subtle">
            {voucherPackage.name} &middot; {voucherPackage.providerName}
          </p>
        </div>
      </div>

      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by code, employee name or ID..."
        filters={
          <FilterItem
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as GeneratedVoucherStatus | "all")}
            options={STATUS_OPTIONS.map(({ label, value }) => ({
              label: `${label}${value === "all" ? "" : ` (${MOCK_GENERATED_VOUCHERS.filter(v => v.voucherPackageId === packageId && v.status === value).length})`}`,
              value,
            }))}
          />
        }
      />

      {filteredVouchers.length === 0 ? (
        <EmptyState
          icon={<Ticket size={32} weight="light" />}
          title="No generated vouchers found"
          description={searchQuery || statusFilter !== "all" ? "Try another search or clear the filter." : "No vouchers have been generated for this package yet."}
        />
      ) : (
        <SharedDataTable
          freezeFirst
          freezeLast
          data={filteredVouchers}
          defaultSort={{ key: "generatedAt", direction: "desc" }}
          columns={[
            {
              header: "Voucher Code",
              accessorKey: "code",
              sortable: true,
              render: (v: (typeof filteredVouchers)[number]) => (
                <div className="space-y-1">
                  <p className="font-mono text-body font-semibold text-foreground tracking-tight">
                    {v.code}
                  </p>
                  <p className="text-label text-faint">ID: {v.id}</p>
                </div>
              ),
            },
            {
              header: "Employee",
              accessorKey: "employeeName",
              sortable: true,
              render: (v: (typeof filteredVouchers)[number]) => (
                <div className="space-y-0.5">
                  <p className="text-body font-semibold text-foreground">{v.employeeName}</p>
                  <p className="font-mono text-label text-faint">{v.employeeId}</p>
                </div>
              ),
            },
            {
              header: "Amount",
              accessorKey: "amount",
              sortable: true,
              align: "right",
              render: (v: (typeof filteredVouchers)[number]) => (
                <span className="text-body font-semibold text-foreground tabular-nums">
                  {v.amount.toLocaleString()} pts
                </span>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              render: (v: (typeof filteredVouchers)[number]) => (
                <StatusBadge
                  status={v.status}
                  variant={STATUS_VARIANT[v.status as string] || "zinc"}
                  className="w-fit"
                />
              ),
            },
            {
              header: "Generated",
              accessorKey: "generatedAt",
              sortable: true,
              align: "center",
              render: (v: (typeof filteredVouchers)[number]) => (
                <div className="text-center">
                  <p className="text-body font-semibold text-subtle">
                    {new Date(v.generatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              ),
            },
            {
              header: "Redeemed",
              accessorKey: "redeemedAt",
              align: "center",
              render: (v: (typeof filteredVouchers)[number]) => (
                <div className="text-center">
                  {v.redeemedAt ? (
                    <p className="text-body font-semibold text-subtle">
                      {new Date(v.redeemedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  ) : (
                    <span className="text-label text-faint">—</span>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
