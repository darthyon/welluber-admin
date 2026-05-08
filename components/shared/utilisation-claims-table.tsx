"use client";

import { useState } from "react";
import { CaretDown, MapPin, Calendar, Storefront, Receipt } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Claim, EmployeeUtilisationRow } from "@/types/claims";

export type { Claim, EmployeeUtilisationRow };

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<Claim["status"], string> = {
  "pre-auth":   "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  confirmed:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  cancelled:    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: EmployeeUtilisationRow[];
}

export function UtilisationClaimsTable({ data }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border">
        <Receipt size={36} weight="duotone" className="text-faint mb-3" />
        <p className="text-muted-foreground font-medium text-body">No utilisation data yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Table header */}
      <div className="grid grid-cols-[2.5fr_1.5fr_140px_260px_80px] p-4 bg-muted/30 border-b border-border/60">
        <p className="text-body font-semibold text-muted-foreground whitespace-nowrap">Employee</p>
        <p className="text-body font-semibold text-muted-foreground whitespace-nowrap">Branch</p>
        <p className="text-body font-semibold text-muted-foreground whitespace-nowrap text-right pr-4">Allocated</p>
        <p className="text-body font-semibold text-muted-foreground whitespace-nowrap pl-3 text-left">Claims Usage</p>
        <p className="text-body font-semibold text-muted-foreground whitespace-nowrap text-center">Claims</p>
      </div>

      {data.map((emp) => {
        const isExpanded = expandedIds.has(emp.id);
        const pct = emp.allocated > 0 ? Math.min(Math.round((emp.used / emp.allocated) * 100), 100) : 0;
        const isHigh = pct > 80;

        return (
          <div key={emp.id} className={cn("border-b border-border/40 last:border-0")}>
            {/* Employee row */}
            <button
              className="w-full grid grid-cols-[2.5fr_1.5fr_140px_260px_80px] p-4 text-left hover:bg-muted/30 transition-all items-center"
              onClick={() => toggle(emp.id)}
            >
              <div>
                <p className="text-body font-medium text-foreground group-hover:text-primary transition-colors">{emp.name}</p>
                <p className="text-label text-muted-foreground font-medium mt-0.5">{emp.empCode}</p>
              </div>

              <p className="text-label font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border w-fit">{emp.branch}</p>

              <p className="text-body font-mono font-semibold text-foreground text-right pr-4">
                RM {emp.allocated.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-label">
                  <span className="text-faint">
                    RM {emp.used.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                  </span>
                  <span className={cn("font-semibold", isHigh ? "text-rose-600 dark:text-rose-400" : "text-primary")}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      isHigh
                        ? "bg-rose-500 dark:bg-rose-400"
                        : "bg-primary shadow-[0_0_6px_rgba(var(--primary-rgb),0.35)]"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <span className="text-label font-semibold text-muted-foreground">{emp.claims.length}</span>
                <CaretDown
                  size={13}
                  weight="bold"
                  className={cn("text-faint transition-transform duration-200", isExpanded && "rotate-180")}
                />
              </div>
            </button>

            {/* Claims rows */}
            {isExpanded && (
              <div className="border-t border-border/40 bg-muted/20">
                {/* Claims sub-header */}
                <div className="grid grid-cols-[140px_1fr_1fr_1fr_110px_90px] gap-3 px-10 py-2.5 border-b border-border/40">
                  {["Voucher", "Service", "Provider", "Location", "Date", "Amount"].map((h) => (
                    <p key={h} className="text-label font-semibold text-faint font-sans">{h}</p>
                  ))}
                </div>

                {emp.claims.length === 0 ? (
                  <p className="text-label text-faint italic px-10 py-4">No claims recorded yet.</p>
                ) : (
                  emp.claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="grid grid-cols-[140px_1fr_1fr_1fr_110px_90px] gap-3 px-10 py-3 border-b border-border/40 last:border-0 hover:bg-muted/50 transition-colors items-center"
                    >
                      {/* Voucher + status */}
                      <div className="flex items-center gap-2">
                        <span className={cn("text-label font-medium px-1.5 py-0.5 rounded", STATUS_STYLE[claim.status])}>
                          {claim.status}
                        </span>
                        <span className="text-label font-semibold text-primary cursor-pointer hover:underline underline-offset-2">{claim.voucherName || claim.voucherCode}</span>
                      </div>

                      <p className="text-label text-subtle font-medium">{claim.service}</p>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Storefront size={11} className="text-faint shrink-0" />
                        <p className="text-label text-subtle truncate">{claim.provider}</p>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={11} className="text-faint shrink-0" />
                        <p className="text-label text-subtle truncate">{claim.location}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-faint shrink-0" />
                        <p className="text-label text-muted-foreground whitespace-nowrap">{claim.date}</p>
                      </div>

                      <p className="text-label font-semibold font-mono text-foreground text-right">
                        RM {claim.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
