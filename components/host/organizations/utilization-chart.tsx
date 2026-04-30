"use client";

import { cn } from "@/lib/utils";

interface UtilizationChartProps {
  value: number;
  mode?: "bar" | "ring";
  size?: number;
  strokeWidth?: number;
  className?: string;
}

interface StatusColorSet {
  text: string;
  stroke: string;
  fill: string;
  bg: string;
  bgTint: string;
}

function getStatusColors(v: number): StatusColorSet {
  if (v > 85) {
    return {
      text: "text-rose-500 dark:text-rose-400",
      stroke: "stroke-rose-500 dark:stroke-rose-400",
      fill: "fill-rose-500 dark:fill-rose-400",
      bg: "bg-rose-500 dark:bg-rose-400",
      bgTint: "bg-rose-500/10 dark:bg-rose-500/20",
    };
  }
  if (v > 60) {
    return {
      text: "text-amber-500 dark:text-amber-400",
      stroke: "stroke-amber-500 dark:stroke-amber-400",
      fill: "fill-amber-500 dark:fill-amber-400",
      bg: "bg-amber-500 dark:bg-amber-400",
      bgTint: "bg-amber-500/10 dark:bg-amber-500/20",
    };
  }
  return {
    text: "text-emerald-500 dark:text-emerald-400",
    stroke: "stroke-emerald-500 dark:stroke-emerald-400",
    fill: "fill-emerald-500 dark:fill-emerald-400",
    bg: "bg-emerald-500 dark:bg-emerald-400",
    bgTint: "bg-emerald-500/10 dark:bg-emerald-500/20",
  };
}

export function UtilizationChart({ 
  value, 
  mode = "bar", 
  size = 40, 
  strokeWidth = 4,
  className 
}: UtilizationChartProps) {
  const colors = getStatusColors(value);

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
            className={cn("transition-all duration-700 ease-in-out", colors.stroke)}
          />
        </svg>
        <span className={cn("absolute text-micro font-medium tabular-nums", colors.text)}>
          {Math.round(value)}%
        </span>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-700 ease-in-out", colors.bg)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
