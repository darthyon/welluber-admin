"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface EntityAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Detail-page headers use "square" to match the employee module. */
  shape?: "circle" | "square";
  className?: string;
}

export function EntityAvatar({
  name,
  imageUrl,
  size = "md",
  shape = "circle",
  className
}: EntityAvatarProps) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0]?.substring(0, 2).toUpperCase() || "?";

  const sizeClasses = {
    sm: "h-8 w-8 text-micro",
    md: "h-10 w-10 text-label",
    lg: "h-12 w-12 text-body",
    xl: "h-14 w-14 text-lead",
  };

  // The square variant carries heavier initials, matching the employee header.
  const squareSizeClasses = {
    sm: "h-8 w-8 text-label",
    md: "h-10 w-10 text-body",
    lg: "h-12 w-12 text-lead",
    xl: "h-14 w-14 text-heading",
  };

  const isSquare = shape === "square";
  const radius = isSquare ? "rounded-lg" : "rounded-full";

  return (
    <Avatar className={cn(
      isSquare ? squareSizeClasses[size] : sizeClasses[size],
      radius,
      "border border-primary/20",
      isSquare
        ? "bg-primary/10 shadow-sm"
        : "bg-primary/5 shadow-[0_4px_12px_-4px_rgba(var(--primary-rgb),0.1)]",
      className
    )}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} className={cn(radius, "object-cover")} />}
      <AvatarFallback className={cn(
        radius,
        "bg-transparent font-semibold border-none shadow-none",
        isSquare ? "text-primary" : "text-primary/80 tracking-tighter"
      )}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
