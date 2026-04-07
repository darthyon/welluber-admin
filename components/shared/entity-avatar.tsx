"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface EntityAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function EntityAvatar({ 
  name, 
  imageUrl, 
  size = "md", 
  className 
}: EntityAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "h-8 w-8 text-[9px]",
    md: "h-10 w-10 text-[11px]",
    lg: "h-12 w-12 text-[13px]",
    xl: "h-14 w-14 text-[15px]",
  };

  return (
    <Avatar className={cn(
      sizeClasses[size], 
      "rounded-full border border-primary/20 shadow-[0_4px_12px_-4px_rgba(var(--primary-rgb),0.1)] bg-primary/5", 
      className
    )}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} className="rounded-full object-cover" />}
      <AvatarFallback className="bg-transparent text-primary/80 font-bold rounded-full border-none shadow-none tracking-tighter">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
