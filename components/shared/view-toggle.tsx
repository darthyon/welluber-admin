"use client";

import { List, SquaresFour } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "grid";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ mode, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("inline-flex items-center p-1 bg-muted/50 border border-border rounded-lg h-9", className)}>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center gap-2 px-3 h-full rounded-md text-[13px] font-medium transition-all duration-200",
          mode === "grid" 
            ? "bg-background text-foreground shadow-sm border border-border/50" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <SquaresFour size={16} weight={mode === "grid" ? "fill" : "regular"} />
        <span>Cards</span>
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-2 px-3 h-full rounded-md text-[13px] font-medium transition-all duration-200",
          mode === "list" 
            ? "bg-background text-foreground shadow-sm border border-border/50" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List size={16} weight={mode === "list" ? "bold" : "regular"} />
        <span>List</span>
      </button>
    </div>
  );
}
