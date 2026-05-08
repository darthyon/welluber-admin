"use client";

import { cn } from "@/lib/utils";

export type StatusVariant = "active" | "inactive" | "draft" | "deactivated" | "suspended" | "pending";

interface PulseStatusProps {
  status: StatusVariant;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  active: {
    dot: "bg-emerald-500",
    glow: "bg-emerald-500/40",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20 dark:border-emerald-500/30"
  },
  pending: {
    dot: "bg-amber-500",
    glow: "bg-amber-500/40",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20 dark:border-amber-500/30"
  },
  inactive: {
    dot: "bg-amber-500",
    glow: "bg-amber-500/40",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20 dark:border-amber-500/30"
  },
  draft: {
    dot: "bg-muted-foreground",
    glow: "bg-muted-foreground/40",
    bg: "bg-muted/10 dark:bg-muted/20",
    text: "text-muted-foreground dark:text-faint",
    border: "border-border/20 dark:border-border/30"
  },
  deactivated: {
    dot: "bg-muted-foreground",
    glow: "bg-muted-foreground/40",
    bg: "bg-muted/10 dark:bg-muted/20",
    text: "text-muted-foreground dark:text-faint",
    border: "border-border/20 dark:border-border/30"
  },
  suspended: {
    dot: "bg-rose-500",
    glow: "bg-rose-500/40",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20 dark:border-rose-500/30"
  },
};

export function PulseStatus({ status, label, showLabel = true, className }: PulseStatusProps) {
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2 py-0.5 rounded-full border text-label font-semibold capitalize",
      config.bg,
      config.text,
      config.border,
      className
    )}>
      <div className="relative flex h-1.5 w-1.5">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          config.glow
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-1.5 w-1.5",
          config.dot
        )}></span>
      </div>
      {showLabel && (
        <span>{label || status}</span>
      )}
    </div>
  );
}
