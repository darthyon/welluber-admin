"use client"

import { useMemo, useState } from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PolicyUtilisation, EmployeeGroupUtilisation } from "@/lib/mock-data"

type Tab = "policy" | "group"

const BRANCH_SCALE: Record<string, number> = { br_1: 0.6, br_2: 0.4 }
const PAGE_SIZE = 5

interface DashboardTopPoliciesProps {
  policies: PolicyUtilisation[]
  employeeGroups: EmployeeGroupUtilisation[]
  selectedBranch: string | "all"
  className?: string
}

function UtilisationBar({ pct }: { pct: number }) {
  const color =
    pct >= 70 ? "oklch(0.58 0.16 160)"
    : pct >= 40 ? "oklch(0.68 0.17 75)"
    : "oklch(0.58 0.20 25)"
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-label tabular-nums text-muted-foreground w-8 text-right flex-shrink-0">{pct}%</span>
    </div>
  )
}

function PaginationBar({ page, total, onPrev, onNext }: {
  page: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const start = page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, total)

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-1">
      <span className="text-[11px] text-muted-foreground/60">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={page === 0}
          className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <CaretLeft size={11} weight="bold" />
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages - 1}
          className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <CaretRight size={11} weight="bold" />
        </button>
      </div>
    </div>
  )
}

export function DashboardTopPolicies({ policies, employeeGroups, selectedBranch, className }: DashboardTopPoliciesProps) {
  const [tab, setTab] = useState<Tab>("policy")
  const [policyPage, setPolicyPage] = useState(0)
  const [groupPage, setGroupPage] = useState(0)

  const scale = selectedBranch !== "all" ? (BRANCH_SCALE[selectedBranch] ?? 1) : 1

  const scaledPolicies = useMemo(
    () => policies.map((p) => ({
      ...p,
      claimsCount: Math.round(p.claimsCount * scale),
      amountSpent: Math.round(p.amountSpent * scale),
      utilisationPct: Math.round(p.utilisationPct * scale),
    })).sort((a, b) => b.utilisationPct - a.utilisationPct),
    [policies, scale]
  )

  const scaledGroups = useMemo(
    () => employeeGroups.map((g) => ({
      ...g,
      claimsCount: Math.round(g.claimsCount * scale),
      amountSpent: Math.round(g.amountSpent * scale),
    })).sort((a, b) => b.utilisationPct - a.utilisationPct),
    [employeeGroups, scale]
  )

  const currentPage = tab === "policy" ? policyPage : groupPage
  const setCurrentPage = tab === "policy" ? setPolicyPage : setGroupPage
  const items = tab === "policy" ? scaledPolicies : scaledGroups
  const pageItems = items.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  const TABS: { label: string; value: Tab }[] = [
    { label: "By Policy",         value: "policy" },
    { label: "By Employee Group", value: "group"  },
  ]

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-0">
        <p className="text-body font-semibold text-foreground">Policy Performance</p>
      </div>

      <div className="px-5 pt-3 pb-0">
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5 w-fit">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTab(t.value) }}
              className={cn(
                "rounded-md px-2.5 py-1 text-label font-medium transition-all whitespace-nowrap",
                tab === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pt-3 pb-0">
        {tab === "policy" && pageItems.map((p, i) => {
          const pp = p as typeof scaledPolicies[0]
          return (
            <div key={pp.policyId} className="flex items-center gap-2.5 py-2.5 border-b border-border/40 last:border-0">
              <span className="w-4 text-right text-label font-semibold tabular-nums text-muted-foreground/50 flex-shrink-0">
                {currentPage * PAGE_SIZE + i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-label font-medium text-foreground truncate">{pp.policyName}</p>
                <p className="text-label text-muted-foreground/60 leading-tight">
                  {pp.claimsCount} claims · RM {(pp.amountSpent / 1000).toFixed(1)}k
                </p>
              </div>
              <UtilisationBar pct={pp.utilisationPct} />
            </div>
          )
        })}

        {tab === "group" && pageItems.map((g, i) => {
          const gg = g as typeof scaledGroups[0]
          return (
            <div key={gg.groupId} className="flex items-center gap-2.5 py-2.5 border-b border-border/40 last:border-0">
              <span className="w-4 text-right text-label font-semibold tabular-nums text-muted-foreground/50 flex-shrink-0">
                {currentPage * PAGE_SIZE + i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-label font-medium text-foreground truncate">{gg.groupName}</p>
                <p className="text-label text-muted-foreground/60 leading-tight">
                  {gg.employeeCount} employees · {gg.claimsCount} claims
                </p>
              </div>
              <UtilisationBar pct={gg.utilisationPct} />
            </div>
          )
        })}
      </div>

      <div className="px-5 pb-4">
        <PaginationBar
          page={currentPage}
          total={items.length}
          onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
          onNext={() => setCurrentPage((p) => p + 1)}
        />
      </div>
    </Card>
  )
}
