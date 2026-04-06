"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Icon component from @phosphor-icons/react or similar */
  icon?: React.ReactNode;
  /** Primary title of the empty state */
  title: string;
  /** Supporting description text */
  description?: string;
  /** Primary action component (e.g., Button) */
  action?: React.ReactNode;
  /** Custom class name for the container */
  className?: string;
  /** Whether this is a full-page empty state (adds more padding/centering) */
  isPageLevel?: boolean;
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
  isPageLevel = false
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-zinc-200/80 bg-zinc-50/50 transition-all duration-300",
      isPageLevel ? "min-h-[500px] p-20" : "p-12",
      "animate-in fade-in zoom-in-95 duration-500",
      className
    )}>
      {icon && (
        <div className={cn(
          "flex items-center justify-center rounded-2xl bg-white border border-zinc-100 shadow-sm text-zinc-400 mb-6",
          isPageLevel ? "size-20 p-5" : "size-14 p-3.5"
        )}>
          {icon}
        </div>
      )}
      
      <h3 className={cn(
        "font-bold text-zinc-900 tracking-tight",
        isPageLevel ? "text-xl mb-2" : "text-[14px] mb-1"
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          "text-zinc-500 font-medium leading-relaxed",
          isPageLevel ? "text-[15px] max-w-sm mb-8" : "text-[12px] max-w-[240px] mb-6"
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex items-center justify-center animate-in slide-in-from-bottom-2 duration-700 delay-200 fill-mode-both">
          {action}
        </div>
      )}
    </div>
  );
}
