"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  /** Icon component from @phosphor-icons/react or similar */
  icon?: React.ReactNode
  /** Primary title of the empty state */
  title: string
  /** Supporting description text */
  description?: string
  /** Primary action component (e.g., Button) */
  action?: React.ReactNode
  /** Custom class name for the container */
  className?: string
  /** Whether this is a full-page empty state (adds more padding/centering) */
  isPageLevel?: boolean
}

/**
 * A standardized Empty State component Following a high-fidelity muted aesthetic.
 * Uses soft grays and clean borders for a professional administrative feel.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  isPageLevel = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-[32px] border border-dashed border-border/40 bg-muted/5 text-center transition-all duration-500",
        isPageLevel ? "min-h-[520px] p-24" : "p-12",
        "animate-in duration-700 ease-out zoom-in-95 fade-in",
        className
      )}
    >
      {/* Premium Background Accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.03),transparent_70%)]" />

      {icon && (
        <div
          className={cn(
            "relative z-10 mb-8 flex items-center justify-center rounded-2xl border border-border/40 bg-background text-primary/80 shadow-xl shadow-black/5",
            "bg-background/50 backdrop-blur-sm",
            isPageLevel ? "size-24 p-6" : "size-16 p-4"
          )}
        >
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/5" />
          <div className="relative z-10">{icon}</div>
        </div>
      )}

      <h3
        className={cn(
          "relative z-10 font-semibold tracking-tight text-foreground",
          isPageLevel ? "mb-3 text-display" : "mb-1.5 text-subtitle"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "relative z-10 leading-relaxed font-medium text-muted-foreground opacity-60",
            isPageLevel
              ? "mb-10 max-w-sm text-section"
              : "mb-8 max-w-[260px] text-nav"
          )}
        >
          {description}
        </p>
      )}

      {action && (
        <div className="relative z-10 flex animate-in items-center justify-center delay-300 duration-1000 fill-mode-both slide-in-from-bottom-4">
          {action}
        </div>
      )}
    </div>
  )
}
