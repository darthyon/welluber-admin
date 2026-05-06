"use client";

import { Buildings, Wallet, Users, ChartPieSlice } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { UtilizationChart } from "./utilization-chart";
import { cn } from "@/lib/utils";

interface BranchCardProps {
  branch: {
    id: string;
    name: string;
    type: string;
    accountModel: string;
    accountName?: string;
    address?: {
      city: string;
      state: string;
    };
    employeesCount?: number;
    status?: string;
    balance?: string;
    limit?: string;
    utilizationRate?: number;
    claimsCount?: number;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function BranchCard({ branch, onView, onEdit }: BranchCardProps) {
  // Map internal wallet models to user-friendly labels
  const accountLabel = branch.accountModel === "New" ? "New" :
                    branch.accountModel === "Existing" ? "Existing" :
                    branch.accountModel;

  return (
    <div 
      className="group bg-card border border-border rounded-lg p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden relative flex flex-col h-full"
      onClick={() => onView?.(branch.id)}
    >
      {/* Decorative Accent */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
            <Buildings size={20} weight="fill" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-body text-foreground group-hover:text-primary transition-all tracking-tight leading-none">
                {branch.name}
              </h4>
              <StatusBadge status={branch.status || "Active"} variant={branch.status === "Active" ? "emerald" : "zinc"} />
            </div>
            <div className="flex items-center gap-1.5 text-label text-muted-foreground">
              <span className="font-medium">{branch.type}</span>
              {branch.address && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-label font-medium text-subtle">{branch.address.city}, {branch.address.state}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <ActionPopover 
          actions={[
            { label: "View Details", onClick: () => onView?.(branch.id) },
            { label: "Edit Branch", onClick: () => onEdit?.(branch.id) },
            { label: "Deactivate", isDanger: true }
          ]}
        />
      </div>

      <div className="mt-auto space-y-4 pt-6 relative z-10">
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-label font-semibold text-faint">Account</span>
            <div className="flex items-center gap-1.5 text-label font-semibold text-foreground">
              <Wallet size={14} weight="bold" className="text-primary" />
              <span className="truncate max-w-[120px]">{branch.accountName || "Unnamed Account"}</span>
              <span className="px-1 py-0 rounded bg-muted border border-border text-label font-medium text-muted-foreground">
                {accountLabel}
              </span>
            </div>
            {branch.balance && (
              <span className="text-label text-faint font-medium pl-5">{branch.balance}</span>
            )}
          </div>
          
          {branch.employeesCount && (
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-label font-semibold text-faint">Workforce</span>
              <div className="flex items-center gap-1.5 text-label font-semibold text-foreground">
                <Users size={14} weight="bold" className="text-primary" />
                <span>{branch.employeesCount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {branch.utilizationRate !== undefined && (
          <div className="space-y-2.5 pt-4 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-faint">
              <ChartPieSlice size={14} weight="bold" />
              <span className="text-label font-semibold text-faint leading-none">Utilisation & Claims</span>
            </div>
            <div className="flex items-center gap-3">
              <UtilizationChart value={branch.utilizationRate} mode="ring" size={40} strokeWidth={4} />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className={cn(
                    "text-body font-medium text-foreground",
                    branch.utilizationRate > 80 ? "text-rose-600 dark:text-rose-400" : branch.utilizationRate > 50 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    {branch.balance}
                  </span>
                  {branch.claimsCount !== undefined && (
                    <span className="text-label font-medium px-1.5 rounded-full bg-muted text-faint border border-border tabular-nums leading-none flex items-center">
                      {branch.claimsCount}
                    </span>
                  )}
                </div>
                {branch.limit && (
                  <span className="text-label text-faint font-medium tabular-nums mt-0.5">
                    / {branch.limit}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
