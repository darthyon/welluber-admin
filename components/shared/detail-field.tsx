"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DetailFieldProps {
  /**
   * The short label for the field. Rendered in a muted, uppercase style.
   */
  label: string;
  /**
   * The value displayed. Large and semibold.
   */
  value: React.ReactNode;
  /**
   * Optional additional class names for the container.
   */
  className?: string;
  /**
   * Whether to stack label and value vertically (default: true).
   */
  vertical?: boolean;
  /**
   * Optional icon to display next to the label.
   */
  icon?: React.ReactNode;
}

/**
 * A consistent key-value display for detail views.
 */
export function DetailField({
  label,
  value,
  className,
  vertical = true,
  icon
}: DetailFieldProps) {
  return (
    <div className={cn(
      "flex",
      vertical ? "flex-col space-y-2" : "items-center justify-between",
      className
    )}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </div>
      <div className="text-[14px] font-semibold text-foreground leading-tight">
        {value || "—"}
      </div>
    </div>
  );
}
