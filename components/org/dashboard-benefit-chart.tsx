"use client"

import { useMemo, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import type { BenefitGroupUsage } from "@/lib/mock-data"

type Metric = "amount" | "count"

const BRANCH_SCALE: Record<string, number> = { br_1: 0.6, br_2: 0.4 }

const METRICS: { label: string; value: Metric }[] = [
  { label: "Claim Amount", value: "amount" },
  { label: "Claim Count", value: "count" },
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

// ─── Category list row ────────────────────────────────────────────────────────

function CategoryRow({
  group,
  metric,
  totalClaims,
  rank,
}: {
  group: BenefitGroupUsage & {
    claimsCount: number
    usedAmount: number
    allocatedAmount: number
  }
  metric: Metric
  totalClaims: number
  rank: number
}) {
  const barPct =
    metric === "amount"
      ? group.allocatedAmount > 0
        ? (group.usedAmount / group.allocatedAmount) * 100
        : 0
      : totalClaims > 0
        ? (group.claimsCount / totalClaims) * 100
        : 0

  const pctLabel =
    metric === "amount"
      ? `${group.utilisationPct}%`
      : `${totalClaims > 0 ? Math.round((group.claimsCount / totalClaims) * 100) : 0}%`

  return (
    <div className="flex items-center gap-3 border-b border-border/40 py-2.5 last:border-0">
      <span className="w-3 flex-shrink-0 text-right text-micro font-semibold text-muted-foreground/50 tabular-nums">
        {rank}
      </span>
      <span
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: group.color }}
      />
      <span className="min-w-0 flex-1 truncate text-label font-medium text-foreground">
        {group.groupName}
      </span>
      <div className="flex flex-shrink-0 items-center gap-2">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(barPct, 100)}%`,
              backgroundColor: group.color,
              opacity: 0.85,
            }}
          />
        </div>
        <span className="w-8 text-right text-label font-semibold text-muted-foreground tabular-nums">
          {pctLabel}
        </span>
        <span className="min-w-[90px] text-right text-label font-medium text-foreground tabular-nums">
          {metric === "amount"
            ? `${formatRM(group.usedAmount)} / ${formatRM(group.allocatedAmount)}`
            : `${group.claimsCount} claims`}
        </span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardBenefitChart({
  data,
  selectedBranch,
  className,
}: DashboardBenefitChartProps) {
  const [metric, setMetric] = useState<Metric>("amount")

  const config = buildConfig(data)
  const scale =
    selectedBranch !== "all" ? (BRANCH_SCALE[selectedBranch] ?? 1) : 1

  const scaledData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        claimsCount: Math.round(d.claimsCount * scale),
        usedAmount: Math.round(d.usedAmount * scale),
        allocatedAmount: Math.round(d.allocatedAmount * scale),
      })),
    [data, scale]
  )

  const sorted = [...scaledData].sort((a, b) =>
    metric === "amount"
      ? b.usedAmount - a.usedAmount
      : b.claimsCount - a.claimsCount
  )

  const chartData = sorted.map((d) => ({
    name: d.groupName,
    value: metric === "amount" ? d.usedAmount : d.claimsCount,
    color: d.color,
  }))

  const totalUsed = scaledData.reduce((s, d) => s + d.usedAmount, 0)
  const totalClaims = scaledData.reduce((s, d) => s + d.claimsCount, 0)
  const totalAllocated = scaledData.reduce((s, d) => s + d.allocatedAmount, 0)
  const overallPct =
    totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-0">
        <div>
          <p className="text-body font-semibold text-foreground">
            Benefit Utilisation By Category
          </p>
          <p className="mt-0.5 text-label text-muted-foreground">
            {overallPct}% of total allocation used
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
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

      <div
        className="flex flex-col gap-6 px-5 pt-4 pb-5 md:grid md:gap-6"
        style={{ gridTemplateColumns: "180px 1fr" }}
      >
        {/* Donut */}
        <div className="flex flex-shrink-0 flex-col items-center">
          <ChartContainer config={config} className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                        <p className="text-label font-medium text-foreground">
                          {d.name}
                        </p>
                        <p className="mt-0.5 text-label text-muted-foreground">
                          {metric === "amount"
                            ? `RM ${Number(d.value).toLocaleString("en-MY")}`
                            : `${d.value} claims`}
                        </p>
                      </div>
                    )
                  }}
                />
                <text
                  x="50%"
                  y="44%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    fill: "var(--foreground)",
                  }}
                >
                  {overallPct}%
                </text>
                <text
                  x="50%"
                  y="57%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                >
                  Used
                </text>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-1 text-center">
            <p className="text-label text-muted-foreground">
              {formatRM(totalUsed)} of {formatRM(totalAllocated)}
            </p>
            <p className="text-micro text-muted-foreground/60">
              allocation used
            </p>
          </div>
        </div>

        {/* Sorted list */}
        <div className="flex min-w-0 flex-col">
          {sorted.map((d, i) => (
            <CategoryRow
              key={d.groupName}
              group={d}
              metric={metric}
              totalClaims={totalClaims}
              rank={i + 1}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
