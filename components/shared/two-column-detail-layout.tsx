"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TwoColumnDetailLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export function TwoColumnDetailLayout({ children, sidebar, className }: TwoColumnDetailLayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8", className)}>
      <div className="lg:col-span-2 space-y-8">
        {children}
      </div>
      {sidebar && (
        <div className="space-y-6">
          {sidebar}
        </div>
      )}
    </div>
  );
}
