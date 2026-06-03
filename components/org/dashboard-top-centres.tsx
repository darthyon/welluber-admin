"use client"

import { useMemo, useState } from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TopProvider } from "@/lib/mock-data"

const BRANCH_SCALE: Record<string, number> = { br_1: 0.6, br_2: 0.4 }
const PAGE_SIZE = 5

interface DashboardTopCentresProps {
  providers: TopProvider[]
  selectedBranch: string | "all"
  className?: string
}

function InlineBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="h-1 w-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
      <div
        className="h-full rounded-full transition-all bg-primary/50"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function DashboardTopCentres({ providers, selectedBranch, className }: DashboardTopCentresProps) {
  const [page, setPage] = useState(0)

  const scale = selectedBranch !== "all" ? (BRANCH_SCALE[selectedBranch] ?? 1) : 1

  const scaledProviders = useMemo(
    () => providers.map((p) => ({
      ...p,
      visits: Math.round(p.visits * scale),
      amount: Math.round(p.amount * scale),
    })),
    [providers, scale]
  )

  const maxVisits = scaledProviders[0]?.visits ?? 1
  const totalPages = Math.ceil(scaledProviders.length / PAGE_SIZE)
  const pageItems = scaledProviders.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const start = page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, scaledProviders.length)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-0">
        <div>
          <p className="text-body font-semibold text-foreground">Top Wellness Centres</p>
          <p className="text-label text-muted-foreground mt-0.5">Most visited service providers</p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-0">
        {pageItems.map((p, i) => (
          <div key={p.name} className="flex items-center gap-2.5 py-2.5 border-b border-border/40 last:border-0">
            <span className="w-4 text-right text-label font-semibold tabular-nums text-muted-foreground/50 flex-shrink-0">
              {page * PAGE_SIZE + i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-label font-medium text-foreground truncate">{p.name}</p>
              <p className="text-label text-muted-foreground/60 leading-tight">{p.category}</p>
            </div>
            <InlineBar value={p.visits} max={maxVisits} />
            <span className="text-right text-label tabular-nums text-muted-foreground flex-shrink-0 w-16">
              {p.visits} visits
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-5 pt-3 pb-4 border-t border-border/40 mt-1">
        <span className="text-label text-muted-foreground/60">
          {start}–{end} of {scaledProviders.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <CaretLeft size={11} weight="bold" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <CaretRight size={11} weight="bold" />
          </button>
        </div>
      </div>
    </Card>
  )
}
