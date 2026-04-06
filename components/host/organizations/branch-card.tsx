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
    walletModel: string;
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
  const walletLabel = branch.walletModel === "Cash Balance" ? "Single Wallet" : 
                    branch.walletModel === "Shared HQ Wallet" ? "Existing Wallet" : 
                    branch.walletModel;

  return (
    <div 
      className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden relative flex flex-col h-full"
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
              <h4 className="font-semibold text-[14px] text-foreground group-hover:text-primary transition-all tracking-tight leading-none">
                {branch.name}
              </h4>
              <StatusBadge status={branch.status || "Active"} variant={branch.status === "Active" ? "emerald" : "zinc"} />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span className="font-medium">{branch.type}</span>
              {branch.address && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[11px] font-medium opacity-80">{branch.address.city}, {branch.address.state}</span>
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
            <span className="text-[11px] font-semibold tracking-tight text-zinc-500/80">Wallet model</span>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
              <Wallet size={14} weight="duotone" className="text-primary" />
              <span>{walletLabel}</span>
              {branch.balance && (
                <span className="text-muted-foreground font-normal ml-1 border-l border-border pl-2">{branch.balance}</span>
              )}
            </div>
          </div>
          
          {branch.employeesCount && (
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-[11px] font-semibold tracking-tight text-zinc-500/80">Workforce</span>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                <Users size={14} weight="duotone" className="text-primary" />
                <span>{branch.employeesCount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {branch.utilizationRate !== undefined && (
          <div className="space-y-2.5 pt-4 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ChartPieSlice size={14} weight="bold" />
              <span className="text-[11px] font-semibold tracking-tight text-zinc-500/80">Utilisation & Claims</span>
            </div>
            <div className="flex items-center gap-3">
              <UtilizationChart value={branch.utilizationRate} mode="ring" size={40} strokeWidth={4} />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className={cn(
                    "text-[13px] font-bold text-foreground",
                    branch.utilizationRate > 80 ? "text-rose-500" : branch.utilizationRate > 50 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {branch.balance}
                  </span>
                  {branch.claimsCount !== undefined && (
                    <span className="text-[10px] font-bold px-1.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 tabular-nums">
                      {branch.claimsCount}
                    </span>
                  )}
                </div>
                {branch.limit && (
                  <span className="text-[10px] text-muted-foreground/60 font-medium tabular-nums mt-0.5">
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
