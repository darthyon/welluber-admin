"use client"

import { useMemo, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { parseISO } from "date-fns"
import type { ClaimsDataPoint, BranchAccount } from "@/lib/mock-data"
import { bucketByMonth, bucketByYear } from "@/lib/mock-data"

type PeriodType = "month" | "quarter" | "year"
type Metric = "count" | "amount"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const AVAILABLE_YEARS = [2025, 2026]
const BRANCH_SCALE: Record<string, number> = { br_1: 0.6, br_2: 0.4 }

const METRIC_TABS: { label: string; value: Metric }[] = [
  { label: "Claim Count",  value: "count"  },
  { label: "Claim Amount", value: "amount" },
]

interface DashboardClaimsChartProps {
  data: ClaimsDataPoint[]
  selectedBranch: string | "all"
  accounts: BranchAccount[]
  className?: string
}

// ─── Filter + scale helpers ───────────────────────────────────────────────────

function filterByPeriod(
  data: ClaimsDataPoint[],
  type: PeriodType,
  month: string,
  quarter: string,
  year: string
): ClaimsDataPoint[] {
  if (type === "month") return data.filter((d) => d.date.startsWith(month))
  if (type === "quarter") {
    const [y, q] = quarter.split("-Q")
    const qNum = parseInt(q ?? "1")
    const startM = (qNum - 1) * 3 + 1
    const monthKeys = [startM, startM + 1, startM + 2].map(
      (m) => `${y}-${String(m).padStart(2, "0")}`
    )
    return bucketByMonth(data.filter((d) => monthKeys.some((k) => d.date.startsWith(k))))
  }
  return bucketByYear(data, year)
}

function applyBranchScale(data: ClaimsDataPoint[], branch: string | "all"): ClaimsDataPoint[] {
  if (branch === "all") return data
  const scale = BRANCH_SCALE[branch] ?? 1
  return data.map((d) => ({
    ...d,
    count: Math.round(d.count * scale),
    amount: Math.round(d.amount * scale),
    confirmedCount: Math.round(d.confirmedCount * scale),
    pendingCount: Math.round(d.pendingCount * scale),
    uniqueClaimants: Math.round(d.uniqueClaimants * scale),
  }))
}

function tickLabel(value: string, type: PeriodType): string {
  if (type === "month") {
    try { const d = parseISO(value); return `${d.getDate()}/${d.getMonth() + 1}` } catch { return value }
  }
  return value.split(" ")[0] ?? value
}

// ─── Sub-pickers ─────────────────────────────────────────────────────────────

function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [pickerYear, setPickerYear] = useState(() => parseInt(value.split("-")[0] ?? "2026"))
  const [open, setOpen] = useState(false)
  const selectedMonth = parseInt(value.split("-")[1] ?? "1") - 1
  const selectedYear = parseInt(value.split("-")[0] ?? "2026")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 px-3 text-label font-medium min-w-[110px] justify-between">
          {`${MONTHS[selectedMonth]} ${selectedYear}`}
          <span className="text-muted-foreground ml-1">▾</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-3" align="end">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setPickerYear((y) => y - 1)}
            disabled={pickerYear <= AVAILABLE_YEARS[0]!}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted disabled:opacity-30"
          >
            <CaretLeft size={12} weight="bold" />
          </button>
          <span className="text-label font-semibold text-foreground">{pickerYear}</span>
          <button
            onClick={() => setPickerYear((y) => y + 1)}
            disabled={pickerYear >= AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]!}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted disabled:opacity-30"
          >
            <CaretRight size={12} weight="bold" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {MONTHS.map((m, i) => {
            const mKey = `${pickerYear}-${String(i + 1).padStart(2, "0")}`
            const isSelected = mKey === value
            return (
              <button
                key={m}
                onClick={() => { onChange(mKey); setOpen(false) }}
                className={cn(
                  "rounded-md py-1.5 text-label font-medium transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                )}
              >
                {m}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function QuarterPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [y, q] = value.split("-Q")
  const year = y ?? "2026"
  const quarter = q ?? "2"
  const options = AVAILABLE_YEARS.flatMap((yr) =>
    [1, 2, 3, 4].map((qn) => ({ value: `${yr}-Q${qn}`, label: `Q${qn} ${yr}` }))
  )
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[110px] text-label font-medium">
        <SelectValue>{`Q${quarter} ${year}`}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-label">{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function YearPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[90px] text-label font-medium">
        <SelectValue>{value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_YEARS.map((yr) => (
          <SelectItem key={yr} value={String(yr)} className="text-label">{yr}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ClaimsTooltip({ active, payload, label, metric, periodType }: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
  metric: Metric
  periodType: PeriodType
}) {
  if (!active || !payload?.length) return null
  const tick = label ? tickLabel(label, periodType) : label
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm px-3 py-2.5 text-[12px]">
      <p className="font-medium text-foreground mb-1.5">{tick}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">
            {p.name === "confirmedCount" ? "Confirmed" : "Pending"}:
          </span>
          <span className="font-medium text-foreground ml-auto pl-3">
            {metric === "amount" ? `RM ${p.value.toLocaleString("en-MY")}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main chart ───────────────────────────────────────────────────────────────

export function DashboardClaimsChart({ data, selectedBranch, accounts, className }: DashboardClaimsChartProps) {
  const [metric, setMetric] = useState<Metric>("count")
  const [periodType, setPeriodType] = useState<PeriodType>("month")
  const [selectedMonth, setSelectedMonth] = useState("2026-05")
  const [selectedQuarter, setSelectedQuarter] = useState("2026-Q2")
  const [selectedYear, setSelectedYear] = useState("2026")

  const chartData = useMemo(
    () => applyBranchScale(
      filterByPeriod(data, periodType, selectedMonth, selectedQuarter, selectedYear),
      selectedBranch
    ),
    [data, periodType, selectedMonth, selectedQuarter, selectedYear, selectedBranch]
  )

  const branchName = selectedBranch !== "all"
    ? accounts.find((a) => a.branchId === selectedBranch)?.branchName
    : null

  const barSize = periodType === "month" ? 5 : periodType === "year" ? 14 : 20
  const isAmountMetric = metric === "amount"

  // For side-by-side: use confirmedCount/pendingCount for "count", or split amount proportionally
  const confirmedKey = metric === "count" ? "confirmedCount" : "confirmedCount"
  const pendingKey = metric === "count" ? "pendingCount" : "pendingCount"

  // Build chart data with amount split if needed
  const finalChartData = useMemo(() => {
    if (metric === "amount") {
      return chartData.map((d) => ({
        ...d,
        confirmedAmount: d.count > 0 ? Math.round(d.amount * (d.confirmedCount / d.count)) : 0,
        pendingAmount: d.count > 0 ? Math.round(d.amount * (d.pendingCount / d.count)) : 0,
      }))
    }
    return chartData
  }, [chartData, metric])

  const confirmedDataKey = metric === "amount" ? "confirmedAmount" : "confirmedCount"
  const pendingDataKey = metric === "amount" ? "pendingAmount" : "pendingCount"

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex flex-col gap-3 px-5 pt-5 pb-0 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-body font-semibold text-foreground">Claims Trend</p>
          {branchName && <p className="mt-0.5 text-label text-muted-foreground">{branchName}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric tabs */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
            {METRIC_TABS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMetric(m.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-label font-medium transition-all whitespace-nowrap",
                  metric === m.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Period selector */}
          <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
            <SelectTrigger className="h-8 w-[100px] text-label font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month" className="text-label">Month</SelectItem>
              <SelectItem value="quarter" className="text-label">Quarter</SelectItem>
              <SelectItem value="year" className="text-label">Year</SelectItem>
            </SelectContent>
          </Select>

          {periodType === "month"   && <MonthPicker   value={selectedMonth}   onChange={setSelectedMonth} />}
          {periodType === "quarter" && <QuarterPicker value={selectedQuarter} onChange={setSelectedQuarter} />}
          {periodType === "year"    && <YearPicker    value={selectedYear}    onChange={setSelectedYear} />}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <span className="text-[11px] text-muted-foreground font-medium">Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary/30" />
          <span className="text-[11px] text-muted-foreground font-medium">Pending</span>
        </div>
      </div>

      {/* Chart */}
      <div className="pr-2 pt-4 pb-2 min-h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={finalChartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            barSize={barSize}
            barGap={2}
            barCategoryGap="35%"
          >
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => tickLabel(v, periodType)}
              interval={periodType === "month" ? 4 : 0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={isAmountMetric ? (v) => `${(v / 1000).toFixed(0)}k` : undefined}
              width={isAmountMetric ? 36 : 28}
            />
            <Tooltip
              content={<ClaimsTooltip metric={metric} periodType={periodType} />}
              cursor={{ fill: "hsl(var(--muted-foreground))", opacity: 0.06 }}
            />
            <Bar
              dataKey={confirmedDataKey}
              fill="var(--primary)"
              radius={[3, 3, 0, 0]}
              name="confirmedCount"
            />
            <Bar
              dataKey={pendingDataKey}
              fill="oklch(0.75 0.12 277)"
              radius={[3, 3, 0, 0]}
              name="pendingCount"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight strip */}
      <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
        <p className="text-[11px] text-muted-foreground/70 leading-snug">
          Trend insights improve with more history. Keep processing claims to unlock deeper analysis.
        </p>
      </div>
    </Card>
  )
}
