"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white" | "destructive";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-8 h-8 border-[3px]",
};

const variantMap = {
  primary: "border-primary/20 border-t-primary",
  white: "border-white/30 border-t-white",
  destructive: "border-destructive/20 border-t-destructive",
};

export function Spinner({
  size = "md",
  variant = "primary",
  className,
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block rounded-full animate-spin",
        sizeMap[size],
        variantMap[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
