"use client"

import {
  Plus,
  Wallet as WalletIcon,
  MagnifyingGlass,
  FadersHorizontal,
  CreditCard,
  Bank,
  ArrowsClockwise,
  CheckCircle,
  Ticket,
  ChartPieSlice,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { EmptyState } from "@/components/shared/empty-state"
import { useWallets } from "@/features/wallets/hooks"
import {
  WALLET_MODEL_OPTIONS,
  WALLET_STATUS_OPTIONS,
} from "@/features/wallets/constants"
import { Wallet } from "@/features/wallets/types"
import { StatusBadge } from "@/components/shared/status-badge"
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid"
import {
  AdvancedFilterSheet,
  DEFAULT_ADVANCED_FILTERS,
} from "@/components/shared/advanced-filter-sheet"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ActionPopover } from "@/components/shared/action-popover"
import { UtilizationChart } from "@/components/host/organizations/utilization-chart"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function WalletsPage() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const { wallets, summary, filters, setFilters } = useWallets()

  const activeAdvancedCount =
    (filters.utilization[1] < 100 ? 1 : 0) +
    (filters.walletModel !== "all" ? 1 : 0)

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
            variant="outline"
            size="sm"
            className="h-9 border-border/60 text-nav font-medium hover:bg-muted/50"
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
          title="Total Cash Balance"
          value={`RM ${summary.totalCashBalance.toLocaleString()}`}
          icon={Bank}
        />
        <BentoCard
          title="Total Utilisation"
          value={`RM ${summary.totalCreditUtilized.toLocaleString()}`}
          description={`Limit: RM ${summary.totalCreditLimit.toLocaleString()}`}
          icon={CreditCard}
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
      </BentoGrid>

      {/* Search & Filter Bar */}
      <DataFilterBar
        searchQuery={filters.search}
        onSearchChange={(v) => setFilters({ ...filters, search: v })}
        searchPlaceholder="Search wallets, orgs, or branches..."
        filters={
          <>
            <FilterItem
              label="Model"
              value={filters.model}
              onChange={(v) => setFilters({ ...filters, model: v as any })}
              options={[
                { label: "All Models", value: "all" },
                ...WALLET_MODEL_OPTIONS,
              ]}
            />
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

      {/* Wallet Grid */}
      <div className="min-h-[400px]">
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {wallets.map((wallet) => (
                <WalletGridCard key={wallet.id} wallet={wallet} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={<MagnifyingGlass size={32} weight="light" />}
            title="No wallets found"
            description="Adjust your search or filters to find what you're looking for."
            action={
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    ...filters,
                    search: "",
                    status: "all",
                    model: "all",
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
        description="Filter wallets by utilisation levels and specific billing models."
      />
    </div>
  )
}

function WalletGridCard({ wallet }: { wallet: Wallet }) {
  const router = useRouter()

  const getUtilColor = (val: number) => {
    if (val > 90) return "text-rose-500"
    if (val > 70) return "text-amber-500"
    return "text-emerald-500"
  }

  const limit = wallet.creditLimit || wallet.balance
  const utilizationRate = limit > 0 ? (wallet.balance / limit) * 100 : 0

  const actions = [
    { label: "View wallet detail", href: `/wallets/${wallet.id}` },
    {
      label: "Update balance/limit",
      onClick: () => console.log("Update balance", wallet.id),
    },
    {
      label: "Record manual top-up",
      onClick: () => console.log("Top-up", wallet.id),
    },
    { label: "Wallet lifecycle", isSectionTitle: true },
    {
      label: wallet.status === "suspended" ? "Resume wallet" : "Suspend wallet",
      onClick: () => console.log("Toggle status", wallet.id),
      className:
        wallet.status === "suspended"
          ? "text-emerald-600 font-semibold"
          : "text-destructive font-semibold",
    },
  ]

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group relative cursor-pointer overflow-hidden rounded-lg border border-zinc-200 bg-muted/50 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-md"
        onClick={() => router.push(`/wallets/${wallet.id}`)}
      >
        {/* Decorative accent */}
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:h-40 group-hover:w-40 group-hover:bg-primary/10" />

        {/* Header */}
        <div className="relative z-10 mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-200/60 bg-muted/80 text-muted-foreground transition-all duration-300 group-hover:bg-primary/5 group-hover:text-primary">
              {wallet.model === "cash_balance" ? (
                <Bank size={24} weight="fill" />
              ) : (
                <CreditCard size={24} weight="fill" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="block text-body leading-tight font-semibold tracking-tight text-foreground transition-colors hover:text-foreground">
                {wallet.orgName}
              </h3>
              <div className="flex items-center gap-2">
                <StatusBadge
                  status={wallet.status}
                  variant={wallet.status === "active" ? "emerald" : "zinc"}
                  className="rounded-md px-1.5 py-0.5 text-micro"
                />
                <span className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-micro tracking-tight text-muted-foreground/60">
                  {wallet.id}
                </span>
              </div>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <ActionPopover actions={actions} />
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Wallet Model & Branch */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-muted-foreground/60">
                <WalletIcon size={14} weight="bold" />
                <span className="text-caption font-semibold tracking-tight text-muted-foreground/80">
                  Wallet model
                </span>
              </div>
              <div className="space-y-1">
                <span className="block text-body font-semibold text-foreground">
                  {wallet.model === "cash_balance" ? "Cash" : "Credit"}
                </span>
                <span className="block max-w-full truncate text-caption font-medium text-muted-foreground/60">
                  {wallet.branchName}
                </span>
              </div>
            </div>

            {/* Utilization Ring */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-muted-foreground/60">
                <ChartPieSlice size={14} weight="bold" />
                <span className="text-caption font-semibold tracking-tight text-muted-foreground">
                  Utilisation
                </span>
              </div>
              <div className="flex items-center gap-3">
                <UtilizationChart
                  value={utilizationRate}
                  mode="ring"
                  size={44}
                  strokeWidth={4}
                />
                <div className="flex flex-col justify-center">
                  <span
                    className={cn(
                      "text-body leading-tight font-semibold",
                      getUtilColor(utilizationRate)
                    )}
                  >
                    RM {wallet.balance.toLocaleString()}
                  </span>
                  <span className="mt-0.5 text-micro font-medium text-muted-foreground/60 tabular-nums">
                    / RM {limit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending claims aligned with SP style */}
          <div className="flex items-center gap-2 pt-2">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-caption font-semibold transition-all",
                wallet.pendingDeductions > 0
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-zinc-200 bg-muted text-muted-foreground/60"
              )}
            >
              <Ticket size={14} weight="fill" />
              {wallet.pendingDeductions === 0
                ? "0"
                : `RM ${wallet.pendingDeductions.toLocaleString()}`}{" "}
              pending
            </div>
            {wallet.status === "suspended" && (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-caption font-semibold text-red-600">
                Hold active
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
