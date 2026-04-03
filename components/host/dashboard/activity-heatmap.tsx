import { cn } from "@/lib/utils"

// Dummy data generator for heatmap
const generateHeatmapData = (weeks: number, daysPerWeek: number) => {
  const data = []
  for (let w = 0; w < weeks; w++) {
    const week = []
    for (let d = 0; d < daysPerWeek; d++) {
      // Random intensity 0-4
      const intensity = Math.floor(Math.random() * 5)
      week.push(intensity)
    }
    data.push(week)
  }
  return data
}

export function ActivityHeatmap() {
  const weeks = 12
  const daysPerWeek = 7
  const data = generateHeatmapData(weeks, daysPerWeek)

  const getIntensityClass = (level: number) => {
    switch (level) {
      case 0: return "bg-muted/40"
      case 1: return "bg-primary/20"
      case 2: return "bg-primary/40"
      case 3: return "bg-primary/70"
      case 4: return "bg-primary"
      default: return "bg-muted/40"
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[13px] font-semibold text-foreground mb-0.5">Voucher Redemption Intensity</h2>
          <p className="text-[12px] text-muted-foreground">Activity density over last 84 days.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Redemptions</p>
          <p className="text-xl font-semibold text-foreground tracking-tight">482.4k</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end">
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {data.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((level, dIdx) => (
                <div
                  key={`${wIdx}-${dIdx}`}
                  className={cn("w-4 h-4 rounded-[2px]", getIntensityClass(level))}
                  title={`Intensity level ${level}`}
                />
              ))}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
          <span>April 15, 2026</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div key={level} className={cn("w-2.5 h-2.5 rounded-[1px]", getIntensityClass(level))} />
              ))}
            </div>
            <span>More</span>
          </div>
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}
