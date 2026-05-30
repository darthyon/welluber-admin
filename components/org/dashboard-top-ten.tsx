"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TopProvider, PolicyUtilisation, EmployeeGroupUtilisation } from "@/lib/mock-data"

type Tab = "policy" | "providers" | "group"

const BRANCH_SCALE: Record<string, number> = { br_1: 0.6, br_2: 0.4 }

interface DashboardTopTenProps {
  policies: PolicyUtilisation[]
  providers: TopProvider[]
  employeeGroups: EmployeeGroupUtilisation[]
  selectedBranch: string | "all"
  className?: string
}

function InlineBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="h-1 w-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color ?? "var(--primary)", opacity: 0.5 }}
      />
    </div>
  )
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

export function DashboardTopTen({ policies, providers, employeeGroups, selectedBranch, className }: DashboardTopTenProps) {
  const [tab, setTab] = useState<Tab>("policy")

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

  const scaledProviders = useMemo(
    () => providers.map((p) => ({
      ...p,
      visits: Math.round(p.visits * scale),
      amount: Math.round(p.amount * scale),
    })),
    [providers, scale]
  )

  const scaledGroups = useMemo(
    () => employeeGroups.map((g) => ({
      ...g,
      claimsCount: Math.round(g.claimsCount * scale),
      amountSpent: Math.round(g.amountSpent * scale),
    })).sort((a, b) => b.utilisationPct - a.utilisationPct),
    [employeeGroups, scale]
  )

  const maxVisits = scaledProviders[0]?.visits ?? 1

  const TABS: { label: string; value: Tab }[] = [
    { label: "By Policy",         value: "policy" },
    { label: "Top Centres",       value: "providers" },
    { label: "By Employee Group", value: "group" },
  ]

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-0">
        <p className="text-body font-semibold text-foreground">Top Utilised Policies</p>
        <Link
          href="#"
          className="text-label text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="px-5 pt-3 pb-0">
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5 w-fit">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
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

      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4 space-y-3">
        {tab === "policy" && scaledPolicies.map((p, i) => (
          <div key={p.policyId} className="flex items-center gap-2.5">
            <span className="w-4 text-right text-label font-semibold tabular-nums text-muted-foreground/50 flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-label font-medium text-foreground truncate">{p.policyName}</p>
              <p className="text-label text-muted-foreground/60 leading-tight">
                {p.claimsCount} claims · RM {(p.amountSpent / 1000).toFixed(1)}k
              </p>
            </div>
            <UtilisationBar pct={p.utilisationPct} />
          </div>
        ))}

        {tab === "providers" && scaledProviders.map((p) => (
          <div key={p.name} className="flex items-center gap-2.5">
            <span className="w-4 text-right text-label font-semibold tabular-nums text-muted-foreground/50 flex-shrink-0">
              {p.rank}
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

        {tab === "group" && scaledGroups.map((g, i) => (
          <div key={g.groupId} className="flex items-center gap-2.5">
            <span className="w-4 text-right text-label font-semibold tabular-nums text-muted-foreground/50 flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-label font-medium text-foreground truncate">{g.groupName}</p>
              <p className="text-label text-muted-foreground/60 leading-tight">
                {g.employeeCount} employees · {g.claimsCount} claims
              </p>
            </div>
            <UtilisationBar pct={g.utilisationPct} />
          </div>
        ))}
      </div>
    </Card>
  )
}
