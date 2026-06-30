import { cn } from "@/lib/utils"

export interface PoolSegment {
  /** Legend label, e.g. "Employee" / "Dependents" */
  label: string
  /** Amount spent by this segment (sizes the filled portion) */
  spent: number
  /** Tailwind bg-* class for the segment fill */
  className: string
}

interface StackedPoolBarProps {
  /** Pool ceiling — segments fill against this total */
  allocated: number
  segments: PoolSegment[]
  /** Show the per-segment legend below the bar (default true for >1 segment) */
  showLegend?: boolean
  className?: string
}

/** Compact pool-usage bar. One segment = a plain progress bar; two segments =
 *  a stacked, color-coded bar (e.g. employee + dependent spend over a shared pool). */
export function StackedPoolBar({
  allocated,
  segments,
  showLegend,
  className,
}: StackedPoolBarProps) {
  const totalSpent = segments.reduce((s, seg) => s + seg.spent, 0)
  const pct = allocated > 0 ? Math.min(Math.round((totalSpent / allocated) * 100), 100) : 0
  const legend = showLegend ?? segments.length > 1

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((seg, i) => {
            const w = allocated > 0 ? Math.min((seg.spent / allocated) * 100, 100) : 0
            return (
              <div
                key={i}
                className={cn("h-full transition-all duration-700", seg.className)}
                style={{ width: `${w}%` }}
              />
            )
          })}
        </div>
        <span
          className={cn(
            "shrink-0 whitespace-nowrap pl-1 text-right text-micro font-medium tabular-nums",
            pct > 80 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
          )}
        >
          {pct}% Utilised
        </span>
      </div>
      {legend && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {segments.map((seg, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-micro font-medium text-muted-foreground"
            >
              <span className={cn("h-2 w-2 rounded-full", seg.className)} />
              {seg.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
