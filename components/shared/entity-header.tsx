"use client";

import { ReactNode } from "react";
import { IconProps } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

interface EntityHeaderProps {
  title: string;
  subtitle?: string;
  status?: string;
  statusVariant?: "emerald" | "zinc" | "amber" | "rose";
  icon: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function EntityHeader({ 
  title, 
  subtitle, 
  status, 
  statusVariant = "emerald", 
  icon, 
  actions,
  className
}: EntityHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-heading font-semibold text-foreground text-balance">{title}</h2>
            {status && <StatusBadge status={status} variant={statusVariant} />}
          </div>
          {subtitle && <p className="text-body text-subtle mt-0.5">{subtitle}</p>}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
