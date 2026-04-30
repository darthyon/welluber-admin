"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
 * Built on top of the Shadcn Card foundations.
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
  if (ghost) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lead font-semibold">
                {title}
              </CardTitle>
              {description && (
                <p className="text-label text-subtle mt-1">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
        <div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50 border-b border-border/60 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lead font-semibold">
                {title}
              </CardTitle>
              {description && (
                <p className="text-label text-subtle mt-1">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
