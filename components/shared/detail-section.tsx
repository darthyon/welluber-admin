"use client";

import * as React from "react";
import { IconProps } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DetailSectionProps {
  /**
   * The title of the section. Rendered in the header.
   */
  title: string;
  /**
   * Optional description text rendered below the title.
   */
  description?: string;
  /**
   * Optional icon to display in the header.
   */
  icon?: React.ReactNode;
  /**
   * Optional action elements (buttons, etc.) rendered on the right side of the header.
   */
  action?: React.ReactNode;
  /**
   * The main content of the section.
   */
  children: React.ReactNode;
  /**
   * Optional additional class names for the container.
   */
  className?: string;
  /**
   * If true, removes the card background, border, and shadow.
   */
  ghost?: boolean;
}

/**
 * A reusable section component for detail views, following the Luma/Vercel aesthetic.
 * Features a distinct header with subtle background and indigo icon integration.
 */
export function DetailSection({
  title,
  description,
  icon,
  action,
  children,
  className,
  ghost = false
}: DetailSectionProps) {
  return (
    <div className={cn(
      "transition-all duration-300",
      !ghost ? "bg-card border border-border rounded-xl overflow-hidden shadow-sm" : "bg-transparent border-none shadow-none",
      className
    )}>
      <div className={cn(
        "px-6 py-4 flex items-center justify-between transition-all",
        !ghost ? "border-b border-border bg-muted/50" : "px-0 border-none bg-transparent pb-3"
      )}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-[13px] font-semibold text-foreground leading-none tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-[11px] text-muted-foreground mt-1.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className={cn("p-6", ghost && "px-0 py-2")}>
        {children}
      </div>
    </div>
  );
}
