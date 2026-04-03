"use client";

import { cn } from "@/lib/utils";

export type StatusColor = "emerald" | "amber" | "rose" | "indigo" | "zinc";

interface StatusBadgeProps {
  status: string;
  variant?: StatusColor;
  className?: string;
  dot?: boolean;
}

const colorConfig: Record<StatusColor, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  rose: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  zinc: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
};

const dotConfig: Record<StatusColor, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  zinc: "bg-zinc-500",
};

export function StatusBadge({ 
  status, 
  variant = "emerald", 
  className,
  dot = false 
}: StatusBadgeProps) {
  // Safe conversion to Sentence Case (e.g., "ACTIVE" -> "Active", "pending invite" -> "Pending invite")
  if (!status || typeof status !== "string") return null;
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight border transition-colors",
      colorConfig[variant],
      className
    )}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 shrink-0", dotConfig[variant])} />
      )}
      {formattedStatus}
    </span>
  );
}
