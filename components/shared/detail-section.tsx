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
  className
}: DetailSectionProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden transition-all duration-300", className)}>
      <div className="px-6 py-4 border-b border-border bg-muted/50 flex items-center justify-between">
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
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
