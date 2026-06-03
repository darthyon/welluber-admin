"use client"

import { useState } from "react"
import { CaretLeft, CaretRight, Wallet, Users, ClipboardText, Ticket } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { BranchAccount, OrgCoverageFunnel, VoucherCounts } from "@/lib/mock-data"

interface DashboardKpiRowProps {
  accounts: BranchAccount[]
  funnel: OrgCoverageFunnel
  voucherCounts: VoucherCounts
  claimsThisMonth: number
  confirmedClaimsCount: number
  pendingClaimsCount: number
  selectedBranch: string | "all"
  className?: string
}

const BRANCH_SCALE: Record<string, number> = { br_1: 0.6, br_2: 0.4 }

function fmt(n: number) {
  return n.toLocaleString("en-MY")
}

function fmtK(n: number) {
  if (n >= 1000) return `RM ${(n / 1000).toFixed(0)}k`
  return `RM ${fmt(n)}`
}

// ─── Generic KPI card ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  footer,
  footerVariant = "default",
  icon: Icon,
  className,
}: {
  label: string
  value: string
  sub: string
  footer: string
  footerVariant?: "default" | "warning" | "muted"
  icon: React.ElementType
  className?: string
}) {
  return (
    <div className={cn(
      "relative overflow-hidden group bg-card border border-border rounded-lg p-5 flex flex-col justify-between",
      "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500",
      className
    )}>
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:w-32 group-hover:h-32 group-hover:bg-primary/10 transition-all duration-500" />

      {/* Icon + label */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 flex-shrink-0">
          <Icon size={16} weight="fill" />
        </div>
        <p className="text-label font-semibold text-muted-foreground leading-none group-hover:text-primary transition-colors">
          {label}
        </p>
      </div>

      {/* Value + sub */}
      <div className="py-2 relative z-10">
        <p className="text-display font-semibold tabular-nums text-foreground leading-none">
          {value}
        </p>
        <p className="text-label text-muted-foreground mt-2 leading-snug">{sub}</p>
      </div>

      <p
        className={cn(
          "text-label leading-none pt-3 border-t border-border/50 relative z-10",
          footerVariant === "warning" && "text-amber-600 dark:text-amber-400",
          footerVariant === "muted" && "text-muted-foreground/60",
          footerVariant === "default" && "text-muted-foreground"
        )}
      >
        {footer}
      </p>
    </div>
  )
}

function runwayLabel(days: number): string {
  if (days < 14) return "Less than 2 weeks of funds left"
  if (days < 30) return `About ${Math.round(days / 7)} weeks of funds left`
  if (days < 60) return "About 1 month of funds left"
  return `~${Math.round(days / 30)} months of funds remaining`
}

// ─── Account Health card with carousel ────────────────────────────────────────

function AccountCard({
  accounts,
  selectedBranch,
}: {
  accounts: BranchAccount[]
  selectedBranch: string | "all"
}) {
  const [index, setIndex] = useState(0)

  const visibleAccounts =
    selectedBranch === "all"
      ? accounts
      : accounts.filter((a) => a.branchId === selectedBranch)

  const total = visibleAccounts.length
  const safeIndex = total === 0 ? 0 : index % total
  const account = visibleAccounts[safeIndex]
  const showNav = selectedBranch === "all" && total > 1

  if (!account) return null

  const creditRemaining = account.creditLimit - account.creditBalance
  const isLowRunway = account.runwayDays < 30

  return (
    <div className="relative overflow-hidden group bg-card border border-border rounded-lg p-5 flex flex-col justify-between hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:w-32 group-hover:h-32 group-hover:bg-primary/10 transition-all duration-500" />
      {/* Icon + Label + nav */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 flex-shrink-0">
            <Wallet size={16} weight="fill" />
          </div>
          <p className="text-label font-semibold text-muted-foreground leading-none group-hover:text-primary transition-colors">
            Account Balance
          </p>
        </div>
        {showNav && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIndex((i) => (i - 1 + total) % total)}
              className="h-5 w-5 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
              aria-label="Previous account"
            >
              <CaretLeft size={10} weight="bold" />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % total)}
              className="h-5 w-5 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
              aria-label="Next account"
            >
              <CaretRight size={10} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Branch name */}
      {showNav && (
        <p className="text-label text-muted-foreground/60 relative z-10">{account.branchName}</p>
      )}

      {/* Two-column: Cash Balance + Credit Remaining */}
      <div className="py-2 flex items-start gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-micro text-muted-foreground/60 font-medium mb-1">Cash Balance</p>
          <p className="text-display font-semibold tabular-nums text-foreground leading-none">
            RM {fmt(account.cashBalance)}
          </p>
          <p className="text-label text-muted-foreground/70 mt-1.5 leading-snug">
            {fmtK(account.availableBalance)} available · {fmtK(account.reservedBalance)} on hold
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-micro text-muted-foreground/60 font-medium mb-1">Credit Remaining</p>
          <p className="text-heading font-semibold tabular-nums text-foreground leading-none">
            {fmtK(creditRemaining)}
          </p>
          <p className="text-label text-muted-foreground/70 mt-1.5 leading-snug">
            of {fmtK(account.creditLimit)} limit
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 relative z-10">
        <p className={cn(
          "text-label",
          isLowRunway ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
        )}>
          {runwayLabel(account.runwayDays)}
        </p>
        {showNav && (
          <div className="flex items-center gap-1">
            {visibleAccounts.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i === safeIndex ? "w-4 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/40"
                )}
                aria-label={`Account ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main row ─────────────────────────────────────────────────────────────────

export function DashboardKpiRow({
  accounts,
  funnel,
  voucherCounts,
  claimsThisMonth,
  confirmedClaimsCount,
  pendingClaimsCount,
  selectedBranch,
  className,
}: DashboardKpiRowProps) {
  const scale = selectedBranch !== "all" ? (BRANCH_SCALE[selectedBranch] ?? 1) : 1

  const empCovered = Math.round(funnel.employeeCovered * scale)
  const depCovered = Math.round(funnel.dependentCovered * scale)
  const unassigned = Math.round(funnel.unassigned * scale)

  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4", className)}>
      <div className="col-span-2 md:col-span-1">
        <AccountCard accounts={accounts} selectedBranch={selectedBranch} />
      </div>

      <KpiCard
        label="Benefit Coverage"
        icon={Users}
        value={`${funnel.coveragePct}%`}
        sub={`${fmt(empCovered)} employees · ${fmt(depCovered)} dependents covered`}
        footer={`${unassigned} unassigned`}
        footerVariant={unassigned > 0 ? "warning" : "muted"}
      />

      <KpiCard
        label="Claims Summary"
        icon={ClipboardText}
        value={String(claimsThisMonth)}
        sub={`${pendingClaimsCount} pending · ${confirmedClaimsCount} confirmed`}
        footer="vs Apr +2"
      />

      <KpiCard
        label="Vouchers In Use"
        icon={Ticket}
        value={`${voucherCounts.activeCount} Active`}
        sub={`${voucherCounts.totalIssued} issued · ${voucherCounts.redeemedCount} redeemed`}
        footer={`${voucherCounts.expiringSoon} expiring in 30 days`}
        footerVariant={voucherCounts.expiringSoon > 0 ? "warning" : "muted"}
      />
    </div>
  )
}
