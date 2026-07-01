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
        "flex flex-col items-center justify-center text-center",
        isPageLevel ? "min-h-[520px] px-8 py-24" : "px-6 py-12",
        "animate-in duration-500 ease-out fade-in",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-6 flex items-center justify-center text-primary/45",
            isPageLevel ? "size-16" : "size-12"
          )}
        >
          {icon}
        </div>
      )}

      <h3
        className={cn(
          "font-semibold text-balance text-foreground",
          isPageLevel ? "mb-3 text-heading" : "mb-1.5 text-lead"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "leading-relaxed font-normal text-pretty text-subtle",
            isPageLevel
              ? "mb-8 max-w-md text-body"
              : "mb-6 max-w-[320px] text-body"
          )}
        >
          {description}
        </p>
      )}

      {action && (
        <div className="flex items-center justify-center">{action}</div>
      )}
    </div>
  )
}
