"use client"

import { cn } from "@/lib/utils"
import type { BranchWallet, OrgCoverageFunnel, VoucherCounts } from "@/lib/mock-data"

interface DashboardKpiRowProps {
  wallets: BranchWallet[]
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

// ─── Single KPI card ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  footer,
  footerVariant = "default",
  className,
}: {
  label: string
  value: string
  sub: string
  footer: string
  footerVariant?: "default" | "warning" | "muted"
  className?: string
}) {
  return (
    <div className={cn("bg-card border border-border rounded-lg p-5 flex flex-col gap-3", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground leading-none">
        {label}
      </p>
      <div>
        <p className="text-[28px] font-semibold tabular-nums text-foreground leading-none tracking-tight">
          {value}
        </p>
        <p className="text-label text-muted-foreground mt-1.5 leading-snug">{sub}</p>
      </div>
      <p
        className={cn(
          "text-[11px] leading-none pt-3 border-t border-border/50",
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

// ─── Main row ─────────────────────────────────────────────────────────────────

export function DashboardKpiRow({
  wallets,
  funnel,
  voucherCounts,
  claimsThisMonth,
  confirmedClaimsCount,
  pendingClaimsCount,
  selectedBranch,
  className,
}: DashboardKpiRowProps) {
  const scale = selectedBranch !== "all" ? (BRANCH_SCALE[selectedBranch] ?? 1) : 1

  // Wallet Health
  const wallet =
    selectedBranch !== "all"
      ? wallets.find((w) => w.branchId === selectedBranch) ?? wallets[0]
      : null
  const totalCash = wallet
    ? wallet.cashBalance
    : wallets.reduce((s, w) => s + w.cashBalance, 0)
  const totalAvailable = wallet
    ? wallet.availableBalance
    : wallets.reduce((s, w) => s + w.availableBalance, 0)
  const totalReserved = wallet
    ? wallet.reservedBalance
    : wallets.reduce((s, w) => s + w.reservedBalance, 0)
  const runwayDays = wallet
    ? wallet.runwayDays
    : Math.min(...wallets.map((w) => w.runwayDays))

  // Coverage
  const coveredCount = Math.round(funnel.coveredCount * scale)
  const empCovered = Math.round(funnel.employeeCovered * scale)
  const depCovered = Math.round(funnel.dependentCovered * scale)
  const unassigned = Math.round(funnel.unassigned * scale)

  return (
    <div className={cn("grid grid-cols-4 gap-4", className)}>
      <KpiCard
        label="Wallet Health"
        value={`RM ${fmt(totalCash)}`}
        sub={`${fmtK(totalAvailable)} available · ${fmtK(totalReserved)} reserved`}
        footer={`${runwayDays} days runway`}
        footerVariant={runwayDays < 30 ? "warning" : "default"}
      />

      <KpiCard
        label="Coverage"
        value={`${funnel.coveragePct}%`}
        sub={`${fmt(empCovered)} employees · ${fmt(depCovered)} dependents covered`}
        footer={`${unassigned} unassigned`}
        footerVariant={unassigned > 0 ? "warning" : "muted"}
      />

      <KpiCard
        label="Claims This Month"
        value={String(claimsThisMonth)}
        sub={`${pendingClaimsCount} pending · ${confirmedClaimsCount} confirmed`}
        footer="vs Apr +2"
      />

      <KpiCard
        label="Vouchers In Use"
        value={`${voucherCounts.activeCount} Active`}
        sub={`${voucherCounts.redeemedCount} redeemed · ${voucherCounts.expiringSoon} expiring soon`}
        footer={`${voucherCounts.expiringSoon} expiring in 30 days`}
        footerVariant={voucherCounts.expiringSoon > 0 ? "warning" : "muted"}
      />
    </div>
  )
}
