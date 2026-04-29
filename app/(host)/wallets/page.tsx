"use client"

import {
  Plus,
  Wallet as WalletIcon,
  MagnifyingGlass,
  FadersHorizontal,
  CheckCircle,
  ArrowsClockwise,
  Ticket,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { EmptyState } from "@/components/shared/empty-state"
import { useWallets } from "@/features/wallets/hooks"
import {
  WALLET_STATUS_OPTIONS,
} from "@/features/wallets/constants"
import type { Wallet } from "@/features/wallets/types"
import { StatusBadge } from "@/components/shared/status-badge"
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid"
import {
  AdvancedFilterSheet,
  DEFAULT_ADVANCED_FILTERS,
} from "@/components/shared/advanced-filter-sheet"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ActionPopover } from "@/components/shared/action-popover"
import { SharedDataTable } from "@/components/shared/data-table"

export default function WalletsPage() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const { wallets, summary, filters, setFilters } = useWallets()
  const router = useRouter()

  const activeAdvancedCount =
    (filters.utilization[1] < 100 ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-heading font-semibold tracking-tight text-foreground">
            Wallets
          </h1>
          <p className="mt-1 text-nav font-normal text-muted-foreground opacity-80">
            Monitor and manage organisation/branch fiscal balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-nav font-medium hover:bg-muted/50"
          >
            <ArrowsClockwise size={16} className="mr-1.5 opacity-60" />
            Refresh
          </Button>

          <div className="mx-1 h-4 w-[1px] bg-border" />

          <Button className="h-9 text-nav font-medium shadow-sm">
            <Plus size={16} weight="bold" className="mr-1.5" />
            Create Wallet
          </Button>
        </div>
      </div>

      {/* Summary Metrics (Bento Style) */}
      <BentoGrid className="gap-3">
        <BentoCard
          title="Total Balance"
          value={`RM ${summary.totalBalance.toLocaleString()}`}
          icon={WalletIcon}
        />
        <BentoCard
          title="Active Wallets"
          value={summary.activeCount.toString()}
          icon={CheckCircle}
        />
        <BentoCard
          title="Suspended Wallets"
          value={summary.suspendedCount.toString()}
          icon={WalletIcon}
          className={summary.suspendedCount > 0 ? "border-destructive/30" : ""}
        />
        <BentoCard
          title="Total Wallets"
          value={summary.totalWallets.toString()}
          icon={WalletIcon}
        />
      </BentoGrid>

      {/* Search & Filter Bar */}
      <DataFilterBar
        searchQuery={filters.search}
        onSearchChange={(v) => setFilters({ ...filters, search: v })}
        searchPlaceholder="Search wallet names, orgs, or branches..."
        filters={
          <>
            <FilterItem
              label="Status"
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v as any })}
              options={[
                { label: "All Status", value: "all" },
                ...WALLET_STATUS_OPTIONS,
              ]}
            />
          </>
        }
        advancedFilter={{
          isOpen: isFilterSheetOpen,
          onToggle: () => setIsFilterSheetOpen(true),
          activeCount: activeAdvancedCount,
        }}
      />

      {/* Wallet Table */}
      <div className="min-h-[400px]">
        {wallets.length > 0 ? (
          <SharedDataTable
            data={wallets}
            onRowClick={(wallet) => router.push(`/wallets/${wallet.id}`)}
            columns={[
              {
                header: "Wallet Name",
                accessorKey: "name",
                sortable: true,
                render: (wallet: Wallet) => (
                  <div className="space-y-0.5">
                    <span className="block text-body font-semibold text-foreground">
                      {wallet.name}
                    </span>
                    <span className="block font-mono text-micro tracking-tight text-muted-foreground/60">
                      {wallet.id}
                    </span>
                  </div>
                ),
              },
              {
                header: "Organization",
                accessorKey: "orgName",
                sortable: true,
                render: (wallet: Wallet) => (
                  <span className="text-nav font-medium text-foreground">
                    {wallet.orgName}
                  </span>
                ),
              },
              {
                header: "Branch",
                accessorKey: "branchName",
                sortable: true,
                render: (wallet: Wallet) => (
                  <span className="text-nav text-muted-foreground">
                    {wallet.branchName}
                  </span>
                ),
              },
              {
                header: "Balance",
                accessorKey: "balance",
                sortable: true,
                align: "right",
                render: (wallet: Wallet) => (
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-body font-semibold",
                        wallet.balance < 0 ? "text-rose-500" : "text-foreground"
                      )}
                    >
                      {wallet.balance < 0 ? "-" : ""}RM{" "}
                      {Math.abs(wallet.balance).toLocaleString()}
                    </span>
                  </div>
                ),
              },
              {
                header: "Pending",
                accessorKey: "pendingDeductions",
                sortable: true,
                align: "right",
                render: (wallet: Wallet) => (
                  <div className="text-right">
                    {wallet.pendingDeductions > 0 ? (
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-caption font-semibold text-amber-700">
                        <Ticket size={12} weight="fill" />
                        RM {wallet.pendingDeductions.toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-caption text-muted-foreground/60">—</span>
                    )}
                  </div>
                ),
              },
              {
                header: "Status",
                accessorKey: "status",
                sortable: true,
                align: "center",
                render: (wallet: Wallet) => (
                  <StatusBadge
                    status={wallet.status}
                    variant={wallet.status === "active" ? "emerald" : "zinc"}
                    className="rounded-md px-1.5 py-0.5 text-micro"
                  />
                ),
              },
              {
                header: "Actions",
                align: "right",
                render: (wallet: Wallet) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ActionPopover
                      actions={[
                        {
                          label: "View wallet detail",
                          onClick: () => router.push(`/wallets/${wallet.id}`),
                        },
                        {
                          label: "Update balance",
                          onClick: () => console.log("Update balance", wallet.id),
                        },
                        {
                          label: "Record manual top-up",
                          onClick: () => console.log("Top-up", wallet.id),
                        },
                        { label: "Wallet lifecycle", isSectionTitle: true },
                        {
                          label:
                            wallet.status === "suspended"
                              ? "Resume wallet"
                              : "Suspend wallet",
                          onClick: () => console.log("Toggle status", wallet.id),
                          className:
                            wallet.status === "suspended"
                              ? "text-emerald-600 font-semibold"
                              : "text-destructive font-semibold",
                        },
                      ]}
                    />
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            icon={<MagnifyingGlass size={32} weight="light" />}
            title="No wallets found"
            description="Adjust your search or filters to find what you're looking for."
            action={
              <Button
                variant="ghost"
                onClick={() =>
                  setFilters({
                    ...filters,
                    search: "",
                    status: "all",
                    ...DEFAULT_ADVANCED_FILTERS,
                  })
                }
              >
                Clear Filters
              </Button>
            }
          />
        )}
      </div>

      <AdvancedFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        setFilters={(f) => setFilters({ ...filters, ...f })}
        onApply={() => setIsFilterSheetOpen(false)}
        showWorkforce={false}
        showIndustry={false}
        showWalletModel={false}
        description="Filter wallets by utilisation levels and specific billing models."
      />
    </div>
  )
}
