"use client";

import { Buildings, Wallet, Users, Info } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface BranchCardProps {
  branch: {
    id: string;
    name: string;
    type: string;
    accountModel: string;
    accountName?: string;
    accountId?: string;
    address?: {
      city: string;
      state: string;
    };
    employeesCount?: number;
    status?: string;
    cashBalance?: number;
    creditBalance?: number;
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
            ...(branch.type.toLowerCase() !== "hq" ? [{ label: "Deactivate", isDanger: true }] : []),
          ]}
        />
      </div>

      <div className="mt-auto space-y-4 pt-6 relative z-10">
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-label font-semibold text-faint">Account</span>
            <div className="flex items-center gap-1.5 text-label font-semibold text-foreground">
              <Wallet size={14} weight="bold" className="text-primary shrink-0" />
              <span className="truncate">{branch.accountName || "Unnamed Account"}</span>
              <span className="px-1 py-0 rounded bg-muted border border-border text-label font-medium text-muted-foreground shrink-0">
                {accountLabel}
              </span>
            </div>
            {branch.accountId && (
              <span className="font-mono text-label text-subtle tracking-tight truncate">
                {branch.accountId}
              </span>
            )}
            {typeof branch.cashBalance === "number" && typeof branch.creditBalance === "number" && (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="text-label text-faint font-medium text-left hover:text-foreground transition-colors w-fit"
                    >
                      RM {(branch.cashBalance + branch.creditBalance).toLocaleString()}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-52 bg-card rounded-lg border-border shadow-2xl z-[200] p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-label font-medium text-subtle">Cash balance</span>
                        <span className="text-label font-semibold text-foreground tabular-nums">RM {branch.cashBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-label font-medium text-subtle">Credit available</span>
                        <span className="text-label font-semibold text-foreground tabular-nums">RM {branch.creditBalance.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-border/60 my-0.5" />
                      <div className="flex items-center justify-between">
                        <span className="text-label font-semibold text-subtle">Total</span>
                        <span className="text-label font-semibold text-primary tabular-nums">RM {(branch.cashBalance + branch.creditBalance).toLocaleString()}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {branch.employeesCount && (
            <div className="flex flex-col items-end gap-1 text-right shrink-0">
              <span className="text-label font-semibold text-faint">Workforce</span>
              <div className="flex items-center gap-1.5 text-label font-semibold text-foreground">
                <Users size={14} weight="bold" className="text-primary" />
                <span>{branch.employeesCount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {branch.claimsCount !== undefined && (
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <span className="inline-flex items-center gap-1.5 text-label font-semibold text-faint">
              Claims
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="text-faint hover:text-foreground transition-colors"
                      aria-label="About claims"
                    >
                      <Info size={12} weight="regular" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card rounded-lg border-border shadow-2xl z-[200] px-2.5 py-1.5">
                    <span className="text-label font-medium text-foreground">Based on current month&apos;s claim</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="text-body font-medium tabular-nums text-foreground">
              {branch.claimsCount.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
