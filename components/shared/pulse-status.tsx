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
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    border: "border-emerald-500/20"
  },
  pending: {
    dot: "bg-amber-500",
    glow: "bg-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/20"
  },
  suspended: {
    dot: "bg-red-500",
    glow: "bg-red-500/40",
    bg: "bg-red-500/10",
    text: "text-red-600",
    border: "border-red-500/20"
  },
  draft: {
    dot: "bg-slate-400",
    glow: "bg-slate-400/40",
    bg: "bg-slate-500/10",
    text: "text-slate-600",
    border: "border-slate-500/20"
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
