"use client"

import { cn } from "@/lib/utils"
import { TrendUp, TrendDown, Barbell, Leaf, ForkKnife, Trophy, BookOpen, Info } from "@phosphor-icons/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const CATEGORIES = [
  { id: "c1", name: "Fitness & Gym", icon: Barbell, value: 14200, percentage: 100, trend: 14 },
  { id: "c2", name: "Wellness & Spa", icon: Leaf, value: 9800, percentage: 69, trend: 8 },
  { id: "c3", name: "Nutrition", icon: ForkKnife, value: 7400, percentage: 52, trend: 22 },
  { id: "c4", name: "Sports & Recreation", icon: Trophy, value: 5100, percentage: 35, trend: 45 },
  { id: "c5", name: "Personal Development", icon: BookOpen, value: 4200, percentage: 29, trend: -3 },
]

export function TrendingCategories() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h2 className="text-body font-medium text-foreground tracking-tight">Top service categories</h2>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Info size={14} className="text-faint cursor-help hover:text-primary transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-label font-medium leading-relaxed max-w-[220px]">
                Most utilized across all SPs
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 min-h-0 -mx-5 px-5">
        <div className="flex flex-col justify-between h-full">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="relative">
                <div className="flex items-center justify-between mb-1.5 relative z-10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-label font-medium text-foreground truncate">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-label text-muted-foreground tabular-nums">
                      {category.value.toLocaleString()}
                    </span>
                    <span className={cn(
                      "text-label font-medium flex items-center gap-0.5 w-[42px] justify-end",
                      category.trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                    )}>
                      {category.trend > 0 ? <TrendUp weight="bold" /> : <TrendDown weight="bold" />}
                      {Math.abs(category.trend)}%
                    </span>
                  </div>
                </div>
                {/* Background bar container */}
                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden mt-1 relative">
                  {/* Fill bar */}
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
