"use client"
import {
  Plus,
  Wallet as WalletIcon,
  MagnifyingGlass,
  CheckCircle,
  ArrowsClockwise,
  Buildings,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { EmptyState } from "@/components/shared/empty-state"
import { useAccounts } from "@/features/accounts/hooks"
import { ACCOUNT_STATUS_OPTIONS } from "@/features/accounts/constants"
import type { Account, AccountStatus } from "@/features/accounts/types"
import { StatusBadge } from "@/components/shared/status-badge"
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid"
import { AdvancedFilterSheet, DEFAULT_ADVANCED_FILTERS } from "@/components/shared/advanced-filter-sheet"
import { ExpandableDataTable } from "@/components/shared/expandable-data-table"
import { SharedDataTable, type Column } from "@/components/shared/data-table"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ActionPopover } from "@/components/shared/action-popover"
import { UpdateBalanceModal } from "@/components/host/accounts/update-balance-modal"
import { RecordTopupModal } from "@/components/host/accounts/record-topup-modal"

interface OrgRow {
  id: string
  orgId: string
  orgName: string
  accountCount: number
  totalBalance: number
  activeCount: number
  suspendedCount: number
  accounts: Account[]
}

function useOrgRows(accounts: Account[]): OrgRow[] {
  return useMemo(() => {
    const map = new Map<string, OrgRow>()
    accounts.forEach((w) => {
      const existing = map.get(w.orgId)
      if (existing) {
        existing.accounts.push(w)
        existing.accountCount += 1
        existing.totalBalance += w.balance
        if (w.status === "active") existing.activeCount += 1
        else if (w.status === "suspended") existing.suspendedCount += 1
      } else {
        map.set(w.orgId, {
          id: w.orgId,
          orgId: w.orgId,
          orgName: w.orgName,
          accountCount: 1,
          totalBalance: w.balance,
          activeCount: w.status === "active" ? 1 : 0,
          suspendedCount: w.status === "suspended" ? 1 : 0,
          accounts: [w],
        })
      }
    })
    return Array.from(map.values())
  }, [accounts])
}

export default function AccountsPage() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set())
  const [updateBalanceAccount, setUpdateBalanceAccount] = useState<Account | null>(null)
  const [recordTopupAccount, setRecordTopupAccount] = useState<Account | null>(null)
  const { accounts, summary, filters, setFilters } = useAccounts()
  const router = useRouter()

  const orgRows = useOrgRows(accounts)

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

  const nestedColumns: Column<Account>[] = [
    {
      header: "Account Name",
      render: (wallet) => (
        <div>
          <span className="block text-body font-medium text-foreground whitespace-nowrap">
            {wallet.name}
          </span>
          <span className="block font-mono text-label text-subtle tracking-tight whitespace-nowrap">
            {wallet.id}
          </span>
        </div>
      ),
    },
    {
      header: "Branch",
      render: (wallet) => (
        <span className="text-body text-subtle whitespace-nowrap">{wallet.branchName}</span>
      ),
    },
    {
      header: "Balance",
      align: "right",
      headerClassName: "text-right",
      render: (wallet) => (
        <span className={cn("text-body font-medium font-mono tabular-nums whitespace-nowrap", wallet.balance < 0 ? "text-destructive" : "text-foreground")}>
          {wallet.balance < 0 ? "-" : ""}RM {Math.abs(wallet.balance).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Pending",
      align: "right",
      headerClassName: "text-right",
      render: (wallet) =>
        wallet.pendingDeductions > 0 ? (
          <div className="flex justify-end">
            <StatusBadge
              status={`RM ${wallet.pendingDeductions.toLocaleString()}`}
              variant="amber"
              className="text-label"
            />
          </div>
        ) : (
          <span className="block text-right text-micro text-faint">—</span>
        ),
    },
    {
      header: "Status",
      align: "center",
      headerClassName: "text-center",
      render: (wallet) => (
        <div className="flex justify-center">
          <StatusBadge
            status={wallet.status}
            variant={wallet.status === "active" ? "emerald" : "zinc"}
          />
        </div>
      ),
    },
    {
      header: "",
      align: "right",
      render: (wallet) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ActionPopover
            actions={[
              {
                label: "View account detail",
                onClick: () => router.push(`/accounts/${wallet.id}`),
              },
              {
                label: "Update balance",
                onClick: () => setUpdateBalanceAccount(wallet),
              },
              {
                label: "Record manual top-up",
                onClick: () => setRecordTopupAccount(wallet),
              },
              {
                label: wallet.status === "suspended" ? "Resume account" : "Suspend account",
                onClick: () => console.log("Toggle status", wallet.id),
                className: wallet.status === "suspended" ? "text-primary" : "text-destructive",
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const renderExpanded = (row: OrgRow) => (
    <div className="px-4 pb-4">
      <SharedDataTable
        data={row.accounts}
        columns={nestedColumns}
        ghost
        freezeFirst
        freezeLast
        onRowClick={(wallet) => router.push(`/accounts/${wallet.id}`)}
      />
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
          <p className="mt-1 text-body font-normal text-subtle">
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
          value={summary.totalAccounts.toString()}
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
              onChange={(v) => setFilters({ ...filters, status: v as "all" | AccountStatus })}
              options={[
                { label: "All Status", value: "all" },
                ...ACCOUNT_STATUS_OPTIONS,
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
            freezeFirst
            freezeLast
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
                      <span className="block text-body font-medium text-foreground whitespace-nowrap">
                        {row.orgName}
                      </span>
                      <span className="block font-mono text-label text-subtle tracking-tight whitespace-nowrap">
                        {row.orgId}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: "Accounts",
                accessorKey: "accountCount",
                sortable: true,
                align: "right",
                render: (row: OrgRow) => (
                  <span className="text-body font-medium text-foreground">
                    {row.accountCount}
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
                      <span className="text-label text-subtle">
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
                header: "",
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
        showAccountModel={false}
        description="Filter accounts by utilisation levels and specific billing models."
      />

      {/* Modals */}
      {updateBalanceAccount && (
        <UpdateBalanceModal
          isOpen={!!updateBalanceAccount}
          onClose={() => setUpdateBalanceAccount(null)}
          accountId={updateBalanceAccount.id}
          accountName={updateBalanceAccount.name}
        />
      )}
      {recordTopupAccount && (
        <RecordTopupModal
          isOpen={!!recordTopupAccount}
          onClose={() => setRecordTopupAccount(null)}
          accountId={recordTopupAccount.id}
          accountName={recordTopupAccount.name}
        />
      )}
    </div>
  )
}
