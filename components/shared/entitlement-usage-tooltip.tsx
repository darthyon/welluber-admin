"use client"

import { Info } from "@phosphor-icons/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function EntitlementUsageTooltip() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="About Overall Usage"
            className="inline-flex h-5 w-5 items-center justify-center rounded-4xl text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Info size={14} weight="duotone" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="end"
          className="max-w-[280px] text-label leading-relaxed"
        >
          Overall Usage combines employee and dependent spend against the total
          allocation. Pool rules and individual balances are shown in each
          benefit group below.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
