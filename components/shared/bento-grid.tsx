"use client";

import * as React from "react";
import { IconProps, TrendUp, TrendDown } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  /**
   * List of BentoCard components.
   */
  children: React.ReactNode;
  /**
   * Optional container class names.
   */
  className?: string;
}

/**
 * A flexible bento grid layout for dashboard stat cards.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(8rem,auto)]",
      className
    )}>
      {children}
    </div>
  );
}

interface BentoCardProps {
  /**
   * The short title displayed in the card.
   */
  title: string;
  /**
   * Primary large value to display.
   */
  value?: string | number | React.ReactNode;
  /**
   * Optional helper text below the value.
   */
  description?: string;
  /**
   * Optional trend data (percentage and label).
   */
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
  /**
   * Optional Phosphor icon component.
   */
  icon?: React.ElementType<IconProps>;
  /**
   * Custom content to render in the card body.
   */
  children?: React.ReactNode;
  /**
   * Optional container class names.
   */
  className?: string;
  /**
   * Column span for the card (1-4). Defaults to 1.
   */
  span?: 1 | 2 | 3 | 4;
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
  span = 1
}: BentoCardProps) {
  const spanClasses = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
  };

  return (
    <div className={cn(
      "group bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-300",
      "hover:shadow-md hover:border-primary/30",
      "flex flex-col justify-between overflow-hidden relative",
      spanClasses[span],
      className
    )}>
      <div className="flex items-start justify-between relative z-10">
        <p className={cn(
          "text-[11px] font-semibold uppercase tracking-widest transition-colors",
          className?.includes("bg-primary") ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>{title}</p>
        {Icon && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            className?.includes("bg-primary") ? "bg-white/10 text-white" : "bg-primary/10 text-primary"
          )}>
            <Icon size={18} weight="duotone" />
          </div>
        )}
      </div>
      
      <div className="mt-5 relative z-10 flex flex-col flex-1">
        {value && (
          <div className="flex items-baseline gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <h4 className="text-3xl font-bold text-foreground tracking-tight cursor-help">{value}</h4>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-[12px] font-medium leading-none">
                    Actual: {typeof value === 'string' && value.includes('M') ? `RM ${value.replace('RM ', '').replace('M', ',000,000')}` : value}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        <div className="mt-auto pt-4 flex items-center justify-between gap-4">
          {trend && (
            <div className="flex items-center gap-2 h-6">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold tracking-tight h-5 transition-all",
                trend.isPositive !== false 
                  ? "bg-emerald-500/10 text-emerald-600" 
                  : "bg-destructive/10 text-destructive",
                className?.includes("bg-primary") && "bg-white/20 text-white"
              )}>
                {trend.isPositive !== false ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                {trend.value}
              </span>
              {trend.label && (
                <span className={cn(
                  "text-[11px] font-medium leading-none whitespace-nowrap",
                  className?.includes("bg-primary") ? "text-primary-foreground/80" : "text-muted-foreground/80"
                )}>
                  {trend.label}
                </span>
              )}
            </div>
          )}
          {!trend && description && !children && (
            <p className={cn(
              "text-[11px] font-medium flex items-center gap-1.5",
              className?.includes("bg-primary") ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {description}
            </p>
          )}
          {children && <div className="flex-1 flex justify-end">{children}</div>}
        </div>
      </div>

      {/* Subtle Background Accent */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:w-32 group-hover:h-32 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />
    </div>
  );
}
