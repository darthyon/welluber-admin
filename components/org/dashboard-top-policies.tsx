"use client"

import { useMemo, useState } from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type {
  PolicyUtilisation,
  EmployeeTierUtilisation,
} from "@/lib/mock-data"

type DashboardMode = "policy" | "tier"

const BRANCH_SCALE: Record<string, number> = { br_1: 0.6, br_2: 0.4 }
const PAGE_SIZE = 5

interface DashboardTopPoliciesProps {
  policies: PolicyUtilisation[]
  employeeTiers: EmployeeTierUtilisation[]
  selectedBranch: string | "all"
  mode: DashboardMode
  className?: string
}

function UtilisationBar({ pct }: { pct: number }) {
  const tone =
    pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-primary/65" : "bg-primary/35"
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-20 flex-shrink-0 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 flex-shrink-0 text-right text-label text-muted-foreground tabular-nums">
        {pct}%
      </span>
    </div>
  )
}

function PaginationBar({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const start = page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, total)

  return (
    <div className="mt-1 flex items-center justify-between border-t border-border/40 pt-3">
      <span className="text-label text-muted-foreground/60">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={page === 0}
          className="flex h-6 w-6 items-center justify-center rounded border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous page"
        >
          <CaretLeft size={11} weight="bold" />
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages - 1}
          className="flex h-6 w-6 items-center justify-center rounded border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next page"
        >
          <CaretRight size={11} weight="bold" />
        </button>
      </div>
    </div>
  )
}

export function DashboardTopPolicies({
  policies,
  employeeTiers,
  selectedBranch,
  mode,
  className,
}: DashboardTopPoliciesProps) {
  const [page, setPage] = useState(0)

  const scale =
    selectedBranch !== "all" ? (BRANCH_SCALE[selectedBranch] ?? 1) : 1

  const scaledPolicies = useMemo(
    () =>
      policies
        .map((p) => ({
          ...p,
          claimsCount: Math.round(p.claimsCount * scale),
          amountSpent: Math.round(p.amountSpent * scale),
        }))
        .sort((a, b) => b.amountSpent - a.amountSpent),
    [policies, scale]
  )

  const scaledTiers = useMemo(
    () =>
      employeeTiers
        .map((t) => ({
          ...t,
          claimsCount: Math.round(t.claimsCount * scale),
          amountSpent: Math.round(t.amountSpent * scale),
        }))
        .sort((a, b) => b.amountSpent - a.amountSpent),
    [employeeTiers, scale]
  )

  const items = mode === "policy" ? scaledPolicies : scaledTiers
  const totalAmount = items.reduce((sum, item) => sum + item.amountSpent, 0)
  const sharePct = (amount: number) =>
    totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const title =
    mode === "policy" ? "Usage By Policy" : "Usage By Employee Tiers"
  const subtitle =
    mode === "policy"
      ? "Share of claim amount and claims volume by policy"
      : "Employee tiers, usage, and linked policies"

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-0">
        <div>
          <p className="text-body font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-label text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 px-5 pt-3 pb-0">
        {mode === "policy" &&
          pageItems.map((p, i) => {
            const pp = p as (typeof scaledPolicies)[0]
            return (
              <div
                key={pp.policyId}
                className="flex items-center gap-2.5 border-b border-border/40 py-2.5 last:border-0"
              >
                <span className="w-4 flex-shrink-0 text-right text-label font-semibold text-muted-foreground/50 tabular-nums">
                  {page * PAGE_SIZE + i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label font-medium text-foreground">
                    {pp.policyName}
                  </p>
                  <p className="text-label leading-tight text-muted-foreground">
                    {pp.claimsCount} claims · RM{" "}
                    {(pp.amountSpent / 1000).toFixed(1)}k
                  </p>
                </div>
                <UtilisationBar pct={sharePct(pp.amountSpent)} />
              </div>
            )
          })}

        {mode === "tier" &&
          pageItems.map((g, i) => {
            const gg = g as (typeof scaledTiers)[0]
            return (
              <div
                key={gg.tierId}
                className="flex items-center gap-2.5 border-b border-border/40 py-2.5 last:border-0"
              >
                <span className="w-4 flex-shrink-0 text-right text-label font-semibold text-muted-foreground/50 tabular-nums">
                  {page * PAGE_SIZE + i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label font-medium text-foreground">
                    {gg.tierName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-label leading-tight text-muted-foreground">
                    <span>{gg.employeeCount} employees assigned</span>
                    <span>·</span>
                    <span>{gg.claimsCount} claims</span>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-primary transition-colors hover:text-primary/80"
                          >
                            {gg.policyNames.length} policies
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
                          <div className="space-y-1.5">
                            <p className="text-label font-semibold text-foreground">
                              Linked Policies
                            </p>
                            {gg.policyNames.map((policyName) => (
                              <p
                                key={policyName}
                                className="text-label text-muted-foreground"
                              >
                                {policyName}
                              </p>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <UtilisationBar pct={sharePct(gg.amountSpent)} />
              </div>
            )
          })}
      </div>

      <div className="px-5 pb-4">
        <PaginationBar
          page={page}
          total={items.length}
          onPrev={() => setPage((current) => Math.max(0, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      </div>
    </Card>
  )
}
