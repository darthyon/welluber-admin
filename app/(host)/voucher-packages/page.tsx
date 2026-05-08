"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Ticket } from "@phosphor-icons/react"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { EmptyState } from "@/components/shared/empty-state"
import {
  VoucherPackagesTable,
  VoucherPackageItem,
} from "@/components/host/voucher-packages/voucher-packages-table"
import { MOCK_SPS } from "@/lib/mock-data"
import type { SpVoucherStatus } from "@/types/provider"

const STATUS_FILTER_TABS: { label: string; value: SpVoucherStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Activated", value: "activated" },
  { label: "Paused", value: "paused" },
  { label: "Ended", value: "ended" },
]

const ALL_VOUCHERS: VoucherPackageItem[] = MOCK_SPS.flatMap((sp) =>
  sp.vouchers.map((v) => ({
    ...v,
    providerName: sp.name,
    redemptionCount:
      v.id === "VCH-001" ? 124 : v.id === "VCH-002" ? 89 : 0,
    totalRedemptionAmount:
      v.id === "VCH-001" ? 31250 : v.id === "VCH-002" ? 17800 : 0,
    branchNames:
      v.branchScope === "all"
        ? ["All Branches"]
        : v.branchIds
            .map((id) => sp.branches.find((b) => b.id === id)?.name)
            .filter(Boolean) as string[],
  }))
)

const SP_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  ...Array.from(new Set(MOCK_SPS.map((sp) => sp.name))).map((name) => ({
    label: name,
    value: name,
  })),
]

export default function VoucherPackagesPage() {
  const router = useRouter()
  const [statusTab, setStatusTab] = useState<SpVoucherStatus | "all">("all")
  const [spFilter, setSpFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = useMemo(() => {
    return ALL_VOUCHERS.filter((v) => {
      const matchesStatus = statusTab === "all" || v.status === statusTab
      const matchesSp = spFilter === "all" || v.providerName === spFilter
      const matchesSearch =
        !searchQuery ||
        [v.name, v.description, v.code, v.providerName].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesStatus && matchesSp && matchesSearch
    })
  }, [statusTab, spFilter, searchQuery])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading font-semibold text-foreground">
            Voucher Packages
          </h1>
          <p className="text-body text-subtle">
            All voucher packages across service providers.
          </p>
        </div>
      </div>

      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search vouchers..."
        filters={
          <>
            <FilterItem
              label="Status"
              value={statusTab}
              onChange={(value) =>
                setStatusTab(value as SpVoucherStatus | "all")
              }
              options={STATUS_FILTER_TABS.map(({ label, value }) => ({
                label: `${label}${value === "all" ? "" : ` (${ALL_VOUCHERS.filter((v) => v.status === value).length})`}`,
                value,
              }))}
            />
            <FilterItem
              label="Service Provider"
              value={spFilter}
              onChange={setSpFilter}
              options={SP_FILTER_OPTIONS.map(({ label, value }) => ({
                label: `${label}${value === "all" ? "" : ` (${ALL_VOUCHERS.filter((v) => v.providerName === value).length})`}`,
                value,
              }))}
            />
          </>
        }
      />

      {filteredData.length === 0 ? (
        <EmptyState
          icon={<Ticket size={32} weight="light" />}
          title={
            searchQuery || statusTab !== "all"
              ? "No vouchers found"
              : "No vouchers yet"
          }
          description={
            searchQuery || statusTab !== "all"
              ? "Try another search or clear the status filter."
              : "Voucher packages will appear here once providers create them."
          }
        />
      ) : (
        <VoucherPackagesTable
          data={filteredData}
          onView={(voucher) =>
            router.push(
              `/service-providers/${voucher.spId}?voucherView=detail&voucherId=${voucher.id}`
            )
          }
          onEdit={(voucher) =>
            router.push(
              `/service-providers/${voucher.spId}?voucherView=edit&voucherId=${voucher.id}`
            )
          }
          onViewGenerated={(voucher) =>
            router.push(`/voucher-packages/${voucher.id}/vouchers`)
          }
        />
      )}
    </div>
  )
}
