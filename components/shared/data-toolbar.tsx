"use client";

import { cn } from "@/lib/utils";

interface DataToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function DataToolbar({ children, className }: DataToolbarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1", className)}>
      <div className="flex-1 w-full max-w-sm">
        {/* Search is usually the first child or handled outside */}
        {children}
      </div>
    </div>
  );
}

// Actually, let's make it more flexible:
export function DataToolbarContainer({ 
  search, 
  filters, 
  actions, 
  className 
}: { 
  search?: React.ReactNode; 
  filters?: React.ReactNode; 
  actions?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2 px-1", className)}>
      <div className="flex-1 flex items-center gap-3">
        {search}
        <div className="flex items-center gap-2">
          {filters}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </div>
  );
}
