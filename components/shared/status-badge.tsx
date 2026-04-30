"use client";

import { cn } from "@/lib/utils";

export type StatusColor = "emerald" | "amber" | "rose" | "primary" | "zinc";

interface StatusBadgeProps {
  status: string;
  variant?: StatusColor;
  className?: string;
  dot?: boolean;
}

const colorConfig: Record<StatusColor, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20 border-amber-500/20 dark:border-amber-500/30",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20 border-rose-500/20 dark:border-rose-500/30",
  primary: "bg-primary/10 text-primary border-primary/20",
  zinc: "bg-muted/10 text-muted-foreground dark:text-faint dark:bg-muted/20 border-zinc-500/20 dark:border-zinc-500/30",
};

const dotConfig: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  primary: "bg-primary",
  zinc: "bg-muted-foreground",
};

export function StatusBadge({ 
  status, 
  variant = "emerald", 
  className,
  dot = false 
}: StatusBadgeProps) {
  // Safe conversion to Title Case as per DESIGN.md
  if (!status || typeof status !== "string") return null;
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-label font-medium border transition-colors",
      colorConfig[variant as StatusColor] || colorConfig.zinc,
      className
    )}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 shrink-0", dotConfig[variant])} />
      )}
      {formattedStatus}
    </span>
  );
}
