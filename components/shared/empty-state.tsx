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
      "relative flex flex-col items-center justify-center text-center rounded-[32px] border border-dashed border-border/40 bg-muted/5 overflow-hidden transition-all duration-500",
      isPageLevel ? "min-h-[520px] p-24" : "p-12",
      "animate-in fade-in zoom-in-95 duration-700 ease-out",
      className
    )}>
      {/* Premium Background Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.03),transparent_70%)] pointer-events-none" />
      
      {icon && (
        <div className={cn(
          "flex items-center justify-center rounded-2xl bg-background border border-border/40 shadow-xl shadow-black/5 text-primary/80 mb-8 relative z-10",
          "backdrop-blur-sm bg-background/50",
          isPageLevel ? "size-24 p-6" : "size-16 p-4"
        )}>
          <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse" />
          <div className="relative z-10">
            {icon}
          </div>
        </div>
      )}
      
      <h3 className={cn(
        "font-semibold text-foreground tracking-tight relative z-10",
        isPageLevel ? "text-2xl mb-3" : "text-subtitle mb-1.5"
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          "text-muted-foreground font-medium leading-relaxed opacity-60 relative z-10",
          isPageLevel ? "text-[16px] max-w-sm mb-10" : "text-nav max-w-[260px] mb-8"
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex items-center justify-center animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both relative z-10">
          {action}
        </div>
      )}
    </div>
  );
}
