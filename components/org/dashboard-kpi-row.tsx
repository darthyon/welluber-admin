"use client"

import { useState } from "react"
import {
  CaretLeft,
  CaretRight,
  Wallet,
  Users,
  ClipboardText,
  Ticket,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type {
  BranchAccount,
  OrgCoverageFunnel,
  VoucherCounts,
} from "@/lib/mock-data"

interface DashboardKpiRowProps {
  accounts: BranchAccount[]
  funnel: OrgCoverageFunnel
  voucherCounts: VoucherCounts
  claimsThisMonth: number
  claimsAmount: number
  confirmedClaimsCount: number
  preAuthorisedClaimsCount: number
  selectedBranch: string | "all"
  onTopUp: (account: BranchAccount) => void
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
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-border bg-card px-5 py-4",
        "transition-colors hover:bg-muted/10",
        className
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60 text-muted-foreground">
          <Icon size={16} weight="fill" />
        </div>
        <p className="text-label leading-none font-medium text-muted-foreground">
          {label}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-5">
        <div className="space-y-2">
          <p className="text-heading leading-none font-semibold text-foreground tabular-nums sm:text-display">
            {value}
          </p>
          <p className="text-label leading-snug text-muted-foreground">{sub}</p>
        </div>

        <p
          className={cn(
            "border-t border-border/50 pt-3 text-label leading-snug",
            footerVariant === "warning" && "text-amber-600 dark:text-amber-400",
            footerVariant === "muted" && "text-muted-foreground/60",
            footerVariant === "default" && "text-muted-foreground"
          )}
        >
          {footer}
        </p>
      </div>
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
  onTopUp,
}: {
  accounts: BranchAccount[]
  selectedBranch: string | "all"
  onTopUp: (account: BranchAccount) => void
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
    <div className="flex h-full flex-col rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60 text-muted-foreground">
            <Wallet size={16} weight="fill" />
          </div>
          <div className="space-y-1">
            <p className="text-label leading-none font-medium text-muted-foreground">
              Account Balance
            </p>
            {showNav && (
              <p className="text-label leading-none text-foreground/70">
                {account.branchName}
              </p>
            )}
          </div>
        </div>
        {showNav && (
          <div className="mt-0.5 flex items-center gap-1">
            <button
              onClick={() => setIndex((i) => (i - 1 + total) % total)}
              className="flex h-5 w-5 items-center justify-center rounded border border-border transition-colors hover:bg-muted"
              aria-label="Previous account"
            >
              <CaretLeft size={10} weight="bold" />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % total)}
              className="flex h-5 w-5 items-center justify-center rounded border border-border transition-colors hover:bg-muted"
              aria-label="Next account"
            >
              <CaretRight size={10} weight="bold" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 grid flex-1 grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
        <div className="min-w-0 space-y-2.5">
          <div className="space-y-1.5">
            <p className="text-micro font-medium text-muted-foreground/60">
              Available Balance
            </p>
            <p className="text-title leading-none font-semibold text-primary tabular-nums sm:text-display">
              RM {fmt(account.availableBalance)}
            </p>
          </div>
          <p className="text-label leading-snug text-muted-foreground">
            of {fmtK(account.cashBalance)} total
          </p>
        </div>

        <div className="space-y-2.5 border-l border-border/50 pl-5 text-right">
          <div className="space-y-1.5">
            <p className="text-micro font-medium text-muted-foreground/60">
              Credit Available
            </p>
            <p className="text-lead leading-none font-semibold text-primary tabular-nums sm:text-heading">
              {fmtK(creditRemaining)}
            </p>
          </div>
          <p className="text-label leading-snug text-muted-foreground">
            of {fmtK(account.creditLimit)} limit
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-border/50 pt-3">
        <div className="space-y-2.5">
          <p
            className={cn(
              "max-w-[24ch] text-label leading-snug",
              isLowRunway
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          >
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
                    i === safeIndex
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-border hover:bg-muted-foreground/40"
                  )}
                  aria-label={`Account ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 rounded-4xl px-4 text-label font-medium"
          onClick={() => onTopUp(account)}
        >
          Top Up
        </Button>
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
  claimsAmount,
  confirmedClaimsCount,
  preAuthorisedClaimsCount,
  selectedBranch,
  onTopUp,
  className,
}: DashboardKpiRowProps) {
  const scale =
    selectedBranch !== "all" ? (BRANCH_SCALE[selectedBranch] ?? 1) : 1

  const empCovered = Math.round(funnel.employeeCovered * scale)
  const depCovered = Math.round(funnel.dependentCovered * scale)
  const unassigned = Math.round(funnel.unassigned * scale)
  const totalVouchers = Math.round(voucherCounts.totalIssued * scale)
  const vouchersRedeemed = Math.round(voucherCounts.redeemedCount * scale)
  const vouchersPurchased = Math.max(totalVouchers - vouchersRedeemed, 0)

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] xl:items-stretch",
        className
      )}
    >
      <div className="min-w-0">
        <AccountCard
          accounts={accounts}
          selectedBranch={selectedBranch}
          onTopUp={onTopUp}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:gap-3.5">
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
          value={fmtK(claimsAmount)}
          sub={`${claimsThisMonth} claims · ${preAuthorisedClaimsCount} pre-authorised`}
          footer={`${confirmedClaimsCount} confirmed`}
        />

        <KpiCard
          label="Vouchers In Use"
          icon={Ticket}
          value={fmt(totalVouchers)}
          sub={`${fmt(vouchersPurchased)} purchased · ${fmt(vouchersRedeemed)} redeemed`}
          footer={`${voucherCounts.expiringSoon} expiring in 30 days`}
          footerVariant={voucherCounts.expiringSoon > 0 ? "warning" : "muted"}
        />
      </div>
    </div>
  )
}
