"use client";

import { cn } from "@/lib/utils";

interface UtilizationChartProps {
  value: number;
  mode?: "bar" | "ring";
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function UtilizationChart({ 
  value, 
  mode = "bar", 
  size = 40, 
  strokeWidth = 4,
  className 
}: UtilizationChartProps) {
  
  const getStatusColor = (v: number) => {
    if (v > 85) return "text-rose-500 stroke-rose-500 fill-rose-500 bg-rose-500";
    if (v > 60) return "text-amber-500 stroke-amber-500 fill-amber-500 bg-amber-500";
    return "text-emerald-500 stroke-emerald-500 fill-emerald-500 bg-emerald-500";
  };

  const getStatusBgColor = (v: number) => {
    if (v > 85) return "bg-rose-500/10";
    if (v > 60) return "bg-amber-500/10";
    return "bg-emerald-500/10";
  };

  if (mode === "ring") {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted-foreground/10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-700 ease-in-out", getStatusColor(value).split(' ')[1])}
          />
        </svg>
        <span className="absolute text-[10px] font-bold tabular-nums">
          {Math.round(value)}%
        </span>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-700 ease-in-out", getStatusColor(value).split(' ').pop())}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
