"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-muted/5 animate-in fade-in zoom-in-95 duration-300",
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground/40">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-[13px] text-muted-foreground max-w-[280px] mb-6">
          {description}
        </p>
      )}
      {action && (
        <div className="flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
