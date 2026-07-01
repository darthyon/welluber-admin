"use client"

import { useState } from "react"
import {
  CaretDown,
  MapPin,
  Calendar,
  Storefront,
  Receipt,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Claim, EmployeeUtilisationRow } from "@/types/claims"

export type { Claim, EmployeeUtilisationRow }

const CLAIM_STATUS_VARIANT: Record<
  Claim["status"],
  "amber" | "emerald" | "rose" | "primary" | "zinc"
> = {
  "pre-auth": "amber",
  confirmed: "emerald",
  cancelled: "rose",
  pending_review: "primary",
  flagged: "rose",
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: EmployeeUtilisationRow[]
}

export function UtilisationClaimsTable({ data }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={32} weight="light" />}
        title="No Utilisation Data Yet"
        description="Claims usage will appear here once beneficiaries start spending against their allocations."
      />
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Table header */}
      <div className="grid grid-cols-[2.5fr_1.5fr_140px_260px_80px] border-b border-border/60 bg-muted/30 p-4">
        <p className="text-label font-medium whitespace-nowrap text-subtle">
          Employee
        </p>
        <p className="text-label font-medium whitespace-nowrap text-subtle">
          Branch
        </p>
        <p className="pr-4 text-right text-label font-medium whitespace-nowrap text-subtle">
          Allocated
        </p>
        <p className="pl-3 text-left text-label font-medium whitespace-nowrap text-subtle">
          Claims Usage
        </p>
        <p className="text-center text-label font-medium whitespace-nowrap text-subtle">
          Claims
        </p>
      </div>

      {data.map((emp) => {
        const isExpanded = expandedIds.has(emp.id)
        const pct =
          emp.allocated > 0
            ? Math.min(Math.round((emp.used / emp.allocated) * 100), 100)
            : 0
        const isHigh = pct > 80

        return (
          <div
            key={emp.id}
            className={cn("border-b border-border/40 last:border-0")}
          >
            {/* Employee row */}
            <button
              className="grid w-full grid-cols-[2.5fr_1.5fr_140px_260px_80px] items-center p-4 text-left transition-all hover:bg-muted/30"
              onClick={() => toggle(emp.id)}
            >
              <div>
                <p className="text-body font-medium text-foreground transition-colors group-hover:text-primary">
                  {emp.name}
                </p>
                <p className="mt-0.5 font-mono text-label text-subtle">
                  {emp.empCode}
                </p>
              </div>

              <p className="w-fit rounded-md border border-border bg-muted px-2 py-0.5 text-label font-semibold text-muted-foreground">
                {emp.branch}
              </p>

              <p className="pr-4 text-right font-mono text-body font-semibold text-foreground">
                RM{" "}
                {emp.allocated.toLocaleString("en-MY", {
                  minimumFractionDigits: 2,
                })}
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-label">
                  <span className="text-faint">
                    RM{" "}
                    {emp.used.toLocaleString("en-MY", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      isHigh
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-primary"
                    )}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
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
                <span className="text-label font-semibold text-muted-foreground">
                  {emp.claims.length}
                </span>
                <CaretDown
                  size={13}
                  weight="bold"
                  className={cn(
                    "text-faint transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </button>

            {/* Claims rows */}
            {isExpanded && (
              <div className="border-t border-border/40 bg-muted/20">
                {/* Claims sub-header */}
                <div className="grid grid-cols-[140px_1fr_1fr_1fr_110px_90px] gap-3 border-b border-border/40 px-10 py-2.5">
                  {[
                    "Voucher",
                    "Service",
                    "Provider",
                    "Location",
                    "Date",
                    "Amount",
                  ].map((h) => (
                    <p key={h} className="text-label font-medium text-subtle">
                      {h}
                    </p>
                  ))}
                </div>

                {emp.claims.length === 0 ? (
                  <p className="px-10 py-4 text-label text-faint italic">
                    No claims recorded yet.
                  </p>
                ) : (
                  emp.claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="grid grid-cols-[140px_1fr_1fr_1fr_110px_90px] items-center gap-3 border-b border-border/40 px-10 py-3 transition-colors last:border-0 hover:bg-muted/50"
                    >
                      {/* Voucher + status */}
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status={claim.status}
                          variant={CLAIM_STATUS_VARIANT[claim.status]}
                        />
                        <span className="cursor-pointer text-label font-medium text-primary underline-offset-2 hover:underline">
                          {claim.voucherName || claim.voucherCode}
                        </span>
                      </div>

                      <p className="text-label font-medium text-subtle">
                        {claim.service}
                      </p>

                      <div className="flex min-w-0 items-center gap-1.5">
                        <Storefront size={14} className="shrink-0 text-faint" />
                        <p className="truncate text-label text-subtle">
                          {claim.provider}
                        </p>
                      </div>

                      <div className="flex min-w-0 items-center gap-1.5">
                        <MapPin size={14} className="shrink-0 text-faint" />
                        <p className="truncate text-label text-subtle">
                          {claim.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="shrink-0 text-faint" />
                        <p className="text-label whitespace-nowrap text-subtle">
                          {claim.date}
                        </p>
                      </div>

                      <p className="text-right font-mono text-label font-semibold text-foreground">
                        RM {claim.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
