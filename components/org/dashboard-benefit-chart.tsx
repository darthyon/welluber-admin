"use client"

import { useMemo, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import type { BenefitGroupUsage } from "@/lib/mock-data"

type Metric = "amount" | "count"

const BRANCH_SCALE: Record<string, number> = { br_1: 0.6, br_2: 0.4 }

const METRICS: { label: string; value: Metric }[] = [
  { label: "By Amount", value: "amount" },
  { label: "By Claims", value: "count"  },
]

interface DashboardBenefitChartProps {
  data: BenefitGroupUsage[]
  selectedBranch: string | "all"
  className?: string
}

function buildConfig(data: BenefitGroupUsage[]): ChartConfig {
  return Object.fromEntries(
    data.map((d) => [d.groupName, { label: d.groupName, color: d.color }])
  )
}

function formatRM(v: number): string {
  return v >= 1000 ? `RM ${(v / 1000).toFixed(1)}k` : `RM ${v}`
}

// ─── Category tile ────────────────────────────────────────────────────────────

function CategoryTile({ group, metric, totalClaims }: {
  group: BenefitGroupUsage & { claimsCount: number; usedAmount: number; allocatedAmount: number }
  metric: Metric
  totalClaims: number
}) {
  const barPct = metric === "amount"
    ? (group.allocatedAmount > 0 ? (group.usedAmount / group.allocatedAmount) * 100 : 0)
    : (totalClaims > 0 ? (group.claimsCount / totalClaims) * 100 : 0)
  const pctLabel = metric === "amount"
    ? `${group.utilisationPct}%`
    : `${totalClaims > 0 ? Math.round((group.claimsCount / totalClaims) * 100) : 0}%`

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
          <span className="text-[11px] font-medium text-foreground truncate">{group.groupName}</span>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground flex-shrink-0">{pctLabel}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-none">
        {metric === "amount"
          ? `${formatRM(group.usedAmount)} of ${formatRM(group.allocatedAmount)}`
          : `${group.claimsCount} of ${totalClaims} claims`}
      </p>
      <div className="h-1 rounded-full bg-border/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(barPct, 100)}%`,
            backgroundColor: "var(--primary)",
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardBenefitChart({ data, selectedBranch, className }: DashboardBenefitChartProps) {
  const [metric, setMetric] = useState<Metric>("amount")

  const config = buildConfig(data)
  const scale = selectedBranch !== "all" ? (BRANCH_SCALE[selectedBranch] ?? 1) : 1

  const scaledData = useMemo(() =>
    data.map((d) => ({
      ...d,
      claimsCount: Math.round(d.claimsCount * scale),
      usedAmount: Math.round(d.usedAmount * scale),
      allocatedAmount: Math.round(d.allocatedAmount * scale),
    })),
    [data, scale]
  )

  const sorted = [...scaledData].sort((a, b) => b.usedAmount - a.usedAmount)

  const chartData = sorted.map((d) => ({
    name: d.groupName,
    value: metric === "amount" ? d.usedAmount : d.claimsCount,
    color: d.color,
  }))

  const totalUsed = scaledData.reduce((s, d) => s + d.usedAmount, 0)
  const totalClaims = scaledData.reduce((s, d) => s + d.claimsCount, 0)
  const totalAllocated = scaledData.reduce((s, d) => s + d.allocatedAmount, 0)
  const overallPct = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-0">
        <div>
          <p className="text-body font-semibold text-foreground">Benefit Utilisation By Category</p>
          <p className="mt-0.5 text-label text-muted-foreground">{overallPct}% of total allocation used</p>
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5 flex-shrink-0">
          {METRICS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-label font-medium transition-all",
                metric === m.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid px-5 pt-4 pb-5 gap-6" style={{ gridTemplateColumns: "220px 1fr" }}>
        {/* Donut */}
        <div className="flex-shrink-0">
          <ChartContainer config={config} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                        <p className="text-label font-medium text-foreground">{d.name}</p>
                        <p className="text-label text-muted-foreground mt-0.5">
                          {metric === "amount"
                            ? `RM ${Number(d.value).toLocaleString("en-MY")}`
                            : `${d.value} claims`}
                        </p>
                      </div>
                    )
                  }}
                />
                {/* Center: pct */}
                <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 20, fontWeight: 600, fill: "hsl(var(--foreground))" }}>
                  {overallPct}%
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}>
                  Used
                </text>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          {/* Under donut */}
          <div className="text-center mt-1">
            <p className="text-[11px] text-muted-foreground leading-snug">
              {formatRM(totalUsed)} of {formatRM(totalAllocated)}
            </p>
            <p className="text-[10px] text-muted-foreground/60">allocation used</p>
          </div>
        </div>

        {/* Category tiles — 2 × N grid */}
        <div className="grid grid-cols-2 gap-2 content-start">
          {sorted.map((d) => (
            <CategoryTile
              key={d.groupName}
              group={d}
              metric={metric}
              totalClaims={totalClaims}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
