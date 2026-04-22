"use client";

import * as React from "react";
import { Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ItemSectionProps {
  /**
   * The 1-based index to display in the circle.
   */
  index: number;
  /**
   * The label to display next to the index.
   */
  label: string;
  /**
   * Optional callback when the remove button is clicked.
   * If omitted, the remove button is not rendered.
   */
  onRemove?: () => void;
  /**
   * The content of the section.
   */
  children: React.ReactNode;
  /**
   * Optional additional class names for the container.
   */
  className?: string;
}

/**
 * A standardized component for indexed line items in forms.
 * Matches the 'Service Line Item' pattern with a numeric badge and removal action.
 */
export function ItemSection({
  index,
  label,
  onRemove,
  children,
  className
}: ItemSectionProps) {
  return (
    <div 
      className={cn(
        "p-5 bg-muted/40 rounded-lg border border-border/60 space-y-5 animate-in fade-in slide-in-from-top-1 duration-300", 
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center">
            <span className="text-caption font-semibold text-muted-foreground/80">
              {index}
            </span>
          </div>
          <span className="text-label font-semibold text-muted-foreground/60 tracking-tight">
            {label}
          </span>
        </div>
        
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="w-8 h-8 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all font-semibold"
          >
            <Trash size={18} />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
