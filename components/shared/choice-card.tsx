"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IconProps } from "@phosphor-icons/react";

interface ChoiceCardProps {
  title: string;
  description: string;
  icon: React.ElementType<IconProps>;
  selected: boolean;
  onSelect: () => void;
  className?: string;
  disabled?: boolean;
}

export function ChoiceCard({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
  className,
  disabled = false
}: ChoiceCardProps) {
  return (
    <div
      onClick={() => !disabled && onSelect()}
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all group",
        selected
          ? "border-primary bg-primary/5"
          : "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30",
        !disabled ? "cursor-pointer" : "cursor-not-allowed opacity-60 grayscale-[0.2]",
        className
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
        selected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
      )}>
        <Icon size={20} weight={selected ? "fill" : "regular"} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-body font-semibold mb-0.5 transition-colors",
          selected ? "text-primary" : "text-foreground"
        )}>
          {title}
        </h4>
        <p className="text-label text-muted-foreground leading-snug">
          {description}
        </p>

      </div>

      <div className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ml-auto",
        selected ? "border-primary bg-primary" : "border-muted-foreground/30"
      )}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-50 duration-200" />}
      </div>
    </div>
  );
}
