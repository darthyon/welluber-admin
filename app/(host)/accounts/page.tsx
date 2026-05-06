"use client"

import {
  Plus,
  Wallet as WalletIcon,
  MagnifyingGlass,
  CheckCircle,
  ArrowsClockwise,
  Ticket,
  Buildings,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { EmptyState } from "@/components/shared/empty-state"
import { useWallets } from "@/features/wallets/hooks"
import { WALLET_STATUS_OPTIONS } from "@/features/wallets/constants"
import type { Wallet } from "@/features/wallets/types"
import { StatusBadge } from "@/components/shared/status-badge"
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid"
import {
  AdvancedFilterSheet,
  DEFAULT_ADVANCED_FILTERS,
} from "@/components/shared/advanced-filter-sheet"
import { ExpandableDataTable } from "@/components/shared/expandable-data-table"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ActionPopover } from "@/components/shared/action-popover"
import { UpdateBalanceModal } from "@/components/host/wallets/update-balance-modal"
import { RecordTopupModal } from "@/components/host/wallets/record-topup-modal"

interface OrgRow {
  id: string
  orgId: string
  orgName: string
  walletCount: number
  totalBalance: number
  activeCount: number
  suspendedCount: number
  wallets: Wallet[]
}

function useOrgRows(wallets: Wallet[]): OrgRow[] {
  return useMemo(() => {
    const map = new Map<string, OrgRow>()
    wallets.forEach((w) => {
      const existing = map.get(w.orgId)
      if (existing) {
        existing.wallets.push(w)
        existing.walletCount += 1
        existing.totalBalance += w.balance
        if (w.status === "active") existing.activeCount += 1
        else if (w.status === "suspended") existing.suspendedCount += 1
      } else {
        map.set(w.orgId, {
          id: w.orgId,
          orgId: w.orgId,
          orgName: w.orgName,
          walletCount: 1,
          totalBalance: w.balance,
          activeCount: w.status === "active" ? 1 : 0,
          suspendedCount: w.status === "suspended" ? 1 : 0,
          wallets: [w],
        })
      }
    })
    return Array.from(map.values())
  }, [wallets])
}

export default function AccountsPage() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set())
  const [updateBalanceWallet, setUpdateBalanceWallet] = useState<Wallet | null>(null)
  const [recordTopupWallet, setRecordTopupWallet] = useState<Wallet | null>(null)
  const { wallets, summary, filters, setFilters } = useWallets()
  const router = useRouter()

  const orgRows = useOrgRows(wallets)

  const activeAdvancedCount = filters.utilization[1] < 100 ? 1 : 0

  const isExpanded = (row: OrgRow) => expandedOrgIds.has(row.orgId)

  const onToggleExpand = (row: OrgRow) => {
    setExpandedOrgIds((prev) => {
      const next = new Set(prev)
      if (next.has(row.orgId)) next.delete(row.orgId)
      else next.add(row.orgId)
      return next
    })
  }

  const renderExpanded = (row: OrgRow) => (
    <div className="px-4 py-4">
      <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
        {/* Nested Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-muted/30 border-b border-border/60 text-label font-semibold text-faint">
          <div className="col-span-3">Account Name</div>
          <div className="col-span-2">Branch</div>
          <div className="col-span-2 text-right">Balance</div>
          <div className="col-span-2 text-right">Pending</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Account Rows */}
        {row.wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-border/40 last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer"
            onClick={() => router.push(`/accounts/${wallet.id}`)}
          >
            <div className="col-span-3">
              <span className="block text-body font-medium text-foreground">
                {wallet.name}
              </span>
              <span className="block font-mono text-label text-faint">
                {wallet.id}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-body text-subtle">
                {wallet.branchName}
              </span>
            </div>

            <div className="col-span-2 text-right">
              <span
                className={cn(
                  "text-body font-semibold tabular-nums",
                  wallet.balance < 0 ? "text-destructive" : "text-foreground"
                )}
              >
                {wallet.balance < 0 ? "-" : ""}{Math.abs(wallet.balance).toLocaleString()} pts
              </span>
            </div>

            <div className="col-span-2 text-right">
              {wallet.pendingDeductions > 0 ? (
                <div className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/20 px-1.5 py-0.5 text-label font-medium text-amber-600 dark:text-amber-400">
                  <Ticket size={10} weight="fill" />
                  {wallet.pendingDeductions.toLocaleString()} pts
                </div>
              ) : (
                <span className="text-micro text-faint">—</span>
              )}
            </div>

            <div className="col-span-1 flex justify-center">
              <StatusBadge
                status={wallet.status}
                variant={wallet.status === "active" ? "emerald" : "zinc"}
                className="rounded-md px-1.5 py-0.5 text-micro"
              />
            </div>

            <div
              className="col-span-2 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <ActionPopover
                actions={[
                  {
                    label: "View account detail",
                    onClick: () => router.push(`/accounts/${wallet.id}`),
                  },
                  {
                    label: "Update balance",
                    onClick: () => setUpdateBalanceWallet(wallet),
                  },
                  {
                    label: "Record manual top-up",
                    onClick: () => setRecordTopupWallet(wallet),
                  },
                  {
                    label:
                      wallet.status === "suspended"
                        ? "Resume account"
                        : "Suspend account",
                    onClick: () => console.log("Toggle status", wallet.id),
                    className:
                      wallet.status === "suspended"
                        ? "text-primary font-semibold"
                        : "text-destructive font-semibold",
                  },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">
            Accounts
          </h1>
          <p className="mt-1 text-body font-normal text-muted-foreground">
            Monitor and manage organisation/branch accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-body font-medium hover:bg-muted/50"
          >
            <ArrowsClockwise size={16} className="mr-1.5 opacity-60" />
            Refresh
          </Button>

          <div className="mx-1 h-4 w-[1px] bg-border" />

          <Button className="h-9 text-body font-medium shadow-sm">
            <Plus size={16} weight="bold" className="mr-1.5" />
            Create Account
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <BentoGrid className="gap-3">
        <BentoCard
          title="Active Accounts"
          value={summary.activeCount.toString()}
          icon={CheckCircle}
        />
        <BentoCard
          title="Suspended Accounts"
          value={summary.suspendedCount.toString()}
          icon={WalletIcon}
          className={summary.suspendedCount > 0 ? "border-destructive/30" : ""}
        />
        <BentoCard
          title="Total Accounts"
          value={summary.totalWallets.toString()}
          icon={Buildings}
        />
      </BentoGrid>

      {/* Search & Filter Bar */}
      <DataFilterBar
        searchQuery={filters.search}
        onSearchChange={(v) => setFilters({ ...filters, search: v })}
        searchPlaceholder="Search organisations or account names..."
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

      {/* Org-first Expandable Table */}
      <div className="min-h-[400px]">
        {orgRows.length > 0 ? (
          <ExpandableDataTable
            data={orgRows}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            renderExpanded={renderExpanded}
            columns={[
              {
                header: "Organisation",
                accessorKey: "orgName",
                sortable: true,
                render: (row: OrgRow) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                      <Buildings size={20} weight="fill" />
                    </div>
                    <div>
                      <span className="block text-body font-semibold text-foreground">
                        {row.orgName}
                      </span>
                      <span className="block font-mono text-label text-faint">
                        {row.orgId}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: "Accounts",
                accessorKey: "walletCount",
                sortable: true,
                align: "right",
                render: (row: OrgRow) => (
                  <span className="text-body font-medium text-foreground">
                    {row.walletCount}
                  </span>
                ),
              },

              {
                header: "Status",
                accessorKey: "suspendedCount",
                sortable: true,
                align: "center",
                render: (row: OrgRow) =>
                  row.suspendedCount > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <StatusBadge
                        status="active"
                        variant="emerald"
                        className="rounded-md px-1.5 py-0.5 text-micro"
                      />
                      <span className="text-label text-faint">
                        +{row.suspendedCount} suspended
                      </span>
                    </div>
                  ) : (
                    <StatusBadge
                      status="active"
                      variant="emerald"
                      className="rounded-md px-1.5 py-0.5 text-micro"
                    />
                  ),
              },
              {
                header: "Actions",
                align: "right",
                render: (row: OrgRow) => (
                  <ActionPopover
                    actions={[
                      {
                        label: "View organisation",
                        onClick: () =>
                          router.push(`/organizations/${row.orgId}`),
                      },
                      {
                        label: "Create account",
                        onClick: () =>
                          console.log("Create account", row.orgId),
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            icon={<MagnifyingGlass size={32} weight="light" />}
            title="No accounts found"
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
        description="Filter accounts by utilisation levels and specific billing models."
      />

      {/* Modals */}
      {updateBalanceWallet && (
        <UpdateBalanceModal
          isOpen={!!updateBalanceWallet}
          onClose={() => setUpdateBalanceWallet(null)}
          walletId={updateBalanceWallet.id}
          walletName={updateBalanceWallet.name}
        />
      )}
      {recordTopupWallet && (
        <RecordTopupModal
          isOpen={!!recordTopupWallet}
          onClose={() => setRecordTopupWallet(null)}
          walletId={recordTopupWallet.id}
          walletName={recordTopupWallet.name}
        />
      )}
    </div>
  )
}
