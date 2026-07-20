"use client"

import { List, SquaresFour } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export type ViewMode = "list" | "grid"

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

export function ViewToggle({ mode, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-lg border border-border bg-muted/50 p-1",
        className
      )}
    >
      <button
        type="button"
        aria-label="Cards view"
        title="Cards view"
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-full w-8 items-center justify-center rounded-md transition-all duration-200",
          mode === "grid"
            ? "border border-border/50 bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <SquaresFour size={16} weight={mode === "grid" ? "fill" : "regular"} />
      </button>
      <button
        type="button"
        aria-label="List view"
        title="List view"
        onClick={() => onChange("list")}
        className={cn(
          "flex h-full w-8 items-center justify-center rounded-md transition-all duration-200",
          mode === "list"
            ? "border border-border/50 bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List size={16} weight={mode === "list" ? "bold" : "regular"} />
      </button>
    </div>
  )
}
