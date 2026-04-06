"use client";

import { Plus, Wallet as WalletIcon, MagnifyingGlass, FadersHorizontal, CreditCard, Bank, ArrowsClockwise, CheckCircle, Ticket, ChartPieSlice } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { DataToolbarContainer } from "@/components/shared/data-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { useWallets } from "@/features/wallets/hooks";
import { WALLET_MODEL_OPTIONS, WALLET_STATUS_OPTIONS } from "@/features/wallets/constants";
import { Wallet } from "@/features/wallets/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid";
import { AdvancedFilterSheet, DEFAULT_ADVANCED_FILTERS } from "@/components/shared/advanced-filter-sheet";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionPopover } from "@/components/shared/action-popover";
import { UtilizationChart } from "@/components/host/organizations/utilization-chart";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function WalletsPage() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { wallets, summary, filters, setFilters } = useWallets();

  const activeAdvancedCount = 
    (filters.utilization[1] < 100 ? 1 : 0) + 
    (filters.walletModel !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground text-[20px]">Wallets</h1>
          <p className="text-muted-foreground text-[13px] mt-1 font-normal opacity-80">
            Monitor and manage organisation/branch fiscal balances.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-[13px] font-medium border-border/60 hover:bg-muted/50">
            <ArrowsClockwise size={16} className="mr-1.5 opacity-60" />
            Refresh
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button className="h-9 text-[13px] font-medium shadow-sm">
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
      <DataToolbarContainer 
        search={
          <SearchBar 
            placeholder="Search wallets, orgs, or branches..." 
            value={filters.search}
            onChange={(v) => setFilters({ ...filters, search: v })}
            className="max-w-md"
          />
        }
        filters={
          <>
            <FilterItem 
              label="Model"
              value={filters.model}
              onChange={(v) => setFilters({ ...filters, model: v as any })}
              options={[{ label: "All Models", value: "all" }, ...WALLET_MODEL_OPTIONS]}
            />
            <FilterItem 
              label="Status"
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v as any })}
              options={[{ label: "All Status", value: "all" }, ...WALLET_STATUS_OPTIONS]}
            />
            <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                    "h-9 text-[13px] gap-2 rounded-lg border border-border/60 hover:bg-muted/50 transition-all",
                    activeAdvancedCount > 0 && "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                )}
                onClick={() => setIsFilterSheetOpen(true)}
            >
              <FadersHorizontal size={16} weight={activeAdvancedCount > 0 ? "fill" : "bold"} />
              Advanced Filters
              {activeAdvancedCount > 0 && (
                <Badge className="h-4 min-w-[16px] px-1 bg-primary text-primary-foreground border-0 text-[10px]">
                  {activeAdvancedCount}
                </Badge>
              )}
            </Button>
          </>
        }
      />

      {/* Wallet Grid */}
      <div className="min-h-[400px]">
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Button variant="outline" onClick={() => setFilters({ ...filters, search: "", status: "all", model: "all", ...DEFAULT_ADVANCED_FILTERS })}>
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
  );
}

function WalletGridCard({ wallet }: { wallet: Wallet }) {
  const router = useRouter();
  
  const getUtilColor = (val: number) => {
    if (val > 90) return "text-rose-500";
    if (val > 70) return "text-amber-500";
    return "text-emerald-500";
  };

  const limit = wallet.creditLimit || wallet.balance;
  const utilizationRate = limit > 0 ? (wallet.balance / limit) * 100 : 0;

  const actions = [
    { label: "View wallet detail", href: `/wallets/${wallet.id}` },
    { label: "Update balance/limit", onClick: () => console.log("Update balance", wallet.id) },
    { label: "Record manual top-up", onClick: () => console.log("Top-up", wallet.id) },
    { label: "Wallet lifecycle", isSectionTitle: true },
    { 
      label: wallet.status === "suspended" ? "Resume wallet" : "Suspend wallet", 
      onClick: () => console.log("Toggle status", wallet.id),
      className: wallet.status === "suspended" ? "text-emerald-600 font-semibold" : "text-destructive font-semibold"
    }
  ];

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group relative bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={() => router.push(`/wallets/${wallet.id}`)}
      >
        {/* Decorative accent */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100/80 border border-zinc-200/60 text-zinc-500 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/5 group-hover:text-primary">
               {wallet.model === "cash_balance" ? <Bank size={24} weight="fill" /> : <CreditCard size={24} weight="fill" />}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[14px] text-foreground hover:text-zinc-900 transition-colors block leading-tight tracking-tight">
                {wallet.orgName}
              </h3>
              <div className="flex items-center gap-2">
                <StatusBadge 
                  status={wallet.status} 
                  variant={wallet.status === "active" ? "emerald" : "zinc"} 
                  className="px-1.5 py-0.5 rounded-md text-[10px]"
                />
                <span className="text-[10px] text-zinc-400 font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200 tracking-tight">{wallet.id}</span>
              </div>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <ActionPopover actions={actions} />
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            {/* Wallet Model & Branch */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <WalletIcon size={14} weight="bold" />
                <span className="text-[11px] font-semibold tracking-tight text-muted-foreground/80">Wallet model</span>
              </div>
              <div className="space-y-1">
                <span className="text-[14px] font-bold text-zinc-800 block">
                  {wallet.model === "cash_balance" ? "Cash" : "Credit"}
                </span>
                <span className="text-[11px] font-medium text-zinc-400 truncate block max-w-full">
                   {wallet.branchName}
                </span>
              </div>
            </div>

            {/* Utilization Ring */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <ChartPieSlice size={14} weight="bold" />
                <span className="text-[11px] font-semibold tracking-tight text-zinc-500/80">Utilisation</span>
              </div>
              <div className="flex items-center gap-3">
                <UtilizationChart value={utilizationRate} mode="ring" size={44} strokeWidth={4} />
                <div className="flex flex-col justify-center">
                  <span className={cn("text-[14px] font-bold leading-tight", getUtilColor(utilizationRate))}>
                    RM {wallet.balance.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium tabular-nums mt-0.5">
                    / RM {limit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending claims aligned with SP style */}
          <div className="pt-2 flex items-center gap-2">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all",
              wallet.pendingDeductions > 0
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-zinc-50 border-zinc-200 text-zinc-400"
            )}>
              <Ticket size={14} weight="fill" />
              {wallet.pendingDeductions === 0 ? "0" : `RM ${wallet.pendingDeductions.toLocaleString()}`} pending
            </div>
            {wallet.status === "suspended" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-100 bg-red-50 text-[11px] font-semibold text-red-600">
                    Hold active
                </div>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
