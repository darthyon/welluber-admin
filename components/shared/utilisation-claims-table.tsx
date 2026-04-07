"use client";

import { useState } from "react";
import { CaretDown, MapPin, Calendar, Storefront, Receipt } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Claim {
  id: string;
  voucherCode: string;
  service: string;
  provider: string;
  location: string;
  date: string;
  amount: number;
  status: "Approved" | "Pending" | "Rejected";
}

export interface EmployeeUtilisationRow {
  id: string;
  name: string;
  empCode: string;
  branch: string;
  allocated: number;
  used: number;
  claims: Claim[];
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<Claim["status"], string> = {
  Approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Pending:  "bg-amber-500/10  text-amber-600  dark:text-amber-400 border border-amber-500/20",
  Rejected: "bg-rose-500/10   text-rose-600   dark:text-rose-400 border border-rose-500/20",
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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border">
        <Receipt size={36} weight="duotone" className="text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground font-medium text-[13px]">No utilisation data yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Table header */}
      <div className="grid grid-cols-[2.5fr_1.5fr_140px_260px_80px] p-4 bg-zinc-50 dark:bg-muted/30 border-b border-border/60">
        <p className="text-[13px] font-semibold text-muted-foreground tracking-tight whitespace-nowrap">Employee</p>
        <p className="text-[13px] font-semibold text-muted-foreground tracking-tight whitespace-nowrap">Branch</p>
        <p className="text-[13px] font-semibold text-muted-foreground tracking-tight whitespace-nowrap text-right pr-4">Allocated</p>
        <p className="text-[13px] font-semibold text-muted-foreground tracking-tight whitespace-nowrap pl-3 text-left">Utilisation & Claims</p>
        <p className="text-[13px] font-semibold text-muted-foreground tracking-tight whitespace-nowrap text-center">Claims</p>
      </div>

      {data.map((emp) => {
        const isExpanded = expandedIds.has(emp.id);
        const pct = emp.allocated > 0 ? Math.min(Math.round((emp.used / emp.allocated) * 100), 100) : 0;
        const isHigh = pct > 80;

        return (
          <div key={emp.id} className={cn("border-b border-zinc-100 last:border-0")}>
            {/* Employee row */}
            <button
              className="w-full grid grid-cols-[2.5fr_1.5fr_140px_260px_80px] p-4 text-left hover:bg-muted/30 transition-all items-center"
              onClick={() => toggle(emp.id)}
            >
              <div>
                <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{emp.name}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{emp.empCode}</p>
              </div>

              <p className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border w-fit">{emp.branch}</p>

              <p className="text-[13px] font-mono font-bold text-foreground text-right pr-4">
                RM {emp.allocated.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">
                    RM {emp.used.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                  </span>
                  <span className={cn("font-bold", isHigh ? "text-rose-500" : "text-primary")}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      isHigh
                        ? "bg-rose-500"
                        : "bg-primary shadow-[0_0_6px_rgba(var(--primary-rgb),0.35)]"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[12px] font-semibold text-zinc-500">{emp.claims.length}</span>
                <CaretDown
                  size={13}
                  weight="bold"
                  className={cn("text-zinc-400 transition-transform duration-200", isExpanded && "rotate-180")}
                />
              </div>
            </button>

            {/* Claims rows */}
            {isExpanded && (
              <div className="border-t border-border/40 bg-muted/20">
                {/* Claims sub-header */}
                <div className="grid grid-cols-[140px_1fr_1fr_1fr_110px_90px] gap-3 px-10 py-2.5 border-b border-border/40">
                  {["Voucher", "Service", "Provider", "Location", "Date", "Amount"].map((h) => (
                    <p key={h} className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">{h}</p>
                  ))}
                </div>

                {emp.claims.length === 0 ? (
                  <p className="text-[12px] text-zinc-400 italic px-10 py-4">No claims recorded yet.</p>
                ) : (
                  emp.claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="grid grid-cols-[140px_1fr_1fr_1fr_110px_90px] gap-3 px-10 py-3 border-b border-border/40 last:border-0 hover:bg-muted/50 transition-colors items-center"
                    >
                      {/* Voucher + status */}
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", STATUS_STYLE[claim.status])}>
                          {claim.status}
                        </span>
                        <code className="text-[11px] font-mono text-zinc-600">{claim.voucherCode}</code>
                      </div>

                      <p className="text-[12px] text-foreground/80 font-medium">{claim.service}</p>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Storefront size={11} className="text-zinc-400 shrink-0" />
                        <p className="text-[12px] text-foreground/70 truncate">{claim.provider}</p>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={11} className="text-zinc-400 shrink-0" />
                        <p className="text-[12px] text-foreground/70 truncate">{claim.location}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-zinc-400 shrink-0" />
                        <p className="text-[11px] text-zinc-500 whitespace-nowrap">{claim.date}</p>
                      </div>

                      <p className="text-[12px] font-bold font-mono text-foreground text-right">
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
