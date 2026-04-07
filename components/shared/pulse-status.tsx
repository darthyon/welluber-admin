"use client";

import { cn } from "@/lib/utils";

export type StatusVariant = "active" | "pending" | "suspended" | "draft";

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
  suspended: {
    dot: "bg-red-500",
    glow: "bg-red-500/40",
    bg: "bg-red-500/10 dark:bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/20 dark:border-red-500/30"
  },
  draft: {
    dot: "bg-slate-400",
    glow: "bg-slate-400/40",
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/20 dark:border-slate-500/30"
  },
};

export function PulseStatus({ status, label, showLabel = true, className }: PulseStatusProps) {
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2 py-0.5 rounded-full border text-[11px] font-semibold capitalize",
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
