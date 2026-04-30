"use client"

import * as React from "react"
import { IconProps, TrendUp, TrendDown } from "@phosphor-icons/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BentoGridProps {
  /**
   * List of BentoCard components.
   */
  children: React.ReactNode
  /**
   * Optional container class names.
   */
  className?: string
}

/**
 * A flexible bento grid layout for dashboard stat cards.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(7.25rem,auto)] grid-cols-1 gap-4 md:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoCardProps {
  /**
   * The short title displayed in the card.
   */
  title: string
  /**
   * Primary large value to display.
   */
  value?: string | number | React.ReactNode
  /**
   * Optional helper text below the value.
   */
  description?: string
  /**
   * Optional trend data (percentage and label).
   */
  trend?: {
    value: string
    label: string
    isPositive?: boolean
  }
  /**
   * Optional Phosphor icon component.
   */
  icon?: React.ElementType<IconProps>
  /**
   * Custom content to render in the card body.
   */
  children?: React.ReactNode
  /**
   * Optional container class names.
   */
  className?: string
  /**
   * Column span for the card (1-4). Defaults to 1.
   */
  span?: 1 | 2 | 3 | 4
  /**
   * Optional click handler.
   */
  onClick?: () => void
}

/**
 * A premium stat card with micro-interactions and bento-box styling.
 */
export function BentoCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  children,
  className,
  span = 1,
  onClick,
}: BentoCardProps) {
  const spanClasses = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden p-4",
        spanClasses[span],
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="relative z-10 mb-6 flex items-start justify-between">
        <CardTitle
          className={cn(
            "text-body font-medium transition-colors",
            className?.includes("bg-primary")
              ? "text-primary-foreground/80"
              : "text-subtle"
          )}
        >
          {title}
        </CardTitle>
        {Icon && (
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              className?.includes("bg-primary")
                ? "bg-background/10 text-primary-foreground"
                : "border border-primary/20 bg-primary/10 text-primary"
            )}
          >
            <Icon size={18} weight="duotone" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        {value && (
          <div className="flex items-baseline gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <h4 className="cursor-help text-display leading-tight font-semibold tracking-tight text-foreground tabular-nums">
                    {value}
                  </h4>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-label leading-none font-medium">
                    Actual:{" "}
                    {typeof value === "string" && value.includes("M")
                      ? `RM ${value.replace("RM ", "").replace("M", ",000,000")}`
                      : value}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          {trend && (
            <div className="flex h-6 items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-5 items-center gap-1.5 rounded px-2 py-1 text-label font-medium transition-all",
                  trend.isPositive !== false
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20"
                    : "bg-destructive/10 text-destructive",
                  className?.includes("bg-primary") && "bg-background/20 text-primary-foreground"
                )}
              >
                {trend.isPositive !== false ? (
                  <TrendUp size={12} weight="bold" />
                ) : (
                  <TrendDown size={12} weight="bold" />
                )}
                {trend.value}
              </span>
              {trend.label && (
                <span
                  className={cn(
                    "text-label leading-none font-medium whitespace-nowrap",
                    className?.includes("bg-primary")
                      ? "text-primary-foreground/80"
                      : "text-subtle"
                  )}
                >
                  {trend.label}
                </span>
              )}
            </div>
          )}
          {!trend && description && !children && (
            <p
              className={cn(
                "flex items-center gap-1.5 text-label font-medium",
                className?.includes("bg-primary")
                  ? "text-primary-foreground/80"
                  : "text-subtle"
              )}
            >
              {description}
            </p>
          )}
          {children && (
            <div className="flex flex-1 justify-end">{children}</div>
          )}
        </div>
      </div>

      {/* Subtle Background Accent */}
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:h-32 group-hover:w-32 group-hover:bg-primary/10" />
    </Card>
  )
}
