"use client"

import type { Account } from "@/features/accounts/types"
import { getAvailableBalance, getCreditUsed } from "@/features/accounts/types"
import { cn } from "@/lib/utils"

interface AccountBalanceCardProps {
  account: Account
  className?: string
  /** "compact" shows a single-line summary; "full" shows the breakdown */
  variant?: "compact" | "full"
}

export function AccountBalanceCard({ account, className, variant = "full" }: AccountBalanceCardProps) {
  const available   = getAvailableBalance(account)
  const creditUsed  = getCreditUsed(account)
  const creditUsedPct = account.creditLimit > 0
    ? Math.min(100, Math.round((creditUsed / account.creditLimit) * 100))
    : 0

  const isUsingCredit = creditUsed > 0
  const isLow = available < account.creditLimit * 0.2 // < 20% of creditLimit remaining

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-label text-muted-foreground">Available</span>
        <span className={cn("text-lead font-semibold tabular-nums", isLow && "text-rose-600")}>
          RM {available.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
        </span>
        {isUsingCredit && (
          <span className="text-micro rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600">
            Credit in use
          </span>
        )}
        {!account.isActive && (
          <span className="text-micro rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-600">
            Inactive
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card p-5 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label text-muted-foreground">{account.name}</p>
          <p className="text-label text-muted-foreground">{account.branchName}</p>
        </div>
        {!account.isActive && (
          <span className="text-micro rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-600">
            Inactive
          </span>
        )}
      </div>

      {/* Available balance — hero figure */}
      <div>
        <p className="text-label text-muted-foreground">Available</p>
        <p className={cn(
          "text-display font-semibold tabular-nums",
          isLow ? "text-rose-600" : "text-foreground"
        )}>
          RM {available.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 pt-1 border-t border-border">
        {/* Cash balance */}
        <BalanceRow
          label="Cash Balance"
          value={account.balance}
          note={account.balance < 0 ? "Overdrawn — credit in use" : undefined}
          valueClass={account.balance < 0 ? "text-amber-600" : undefined}
        />

        {/* Credit limit */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-label text-muted-foreground">Credit Limit</span>
            <span className="text-body tabular-nums">
              RM {account.creditLimit.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {account.creditLimit > 0 && (
            <>
              {/* Credit used bar */}
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    creditUsedPct > 80 ? "bg-rose-500" : creditUsedPct > 50 ? "bg-amber-400" : "bg-primary"
                  )}
                  style={{ width: `${creditUsedPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-micro text-muted-foreground">
                  {creditUsedPct}% used
                </span>
                <span className="text-micro text-muted-foreground tabular-nums">
                  RM {creditUsed.toLocaleString("en-MY", { minimumFractionDigits: 2 })} in use
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── helper ──

function BalanceRow({
  label,
  value,
  note,
  valueClass,
}: {
  label: string
  value: number
  note?: string
  valueClass?: string
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <span className="text-label text-muted-foreground">{label}</span>
        {note && <p className="text-micro text-amber-600">{note}</p>}
      </div>
      <span className={cn("text-body tabular-nums font-medium", valueClass)}>
        RM {Math.abs(value).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
      </span>
    </div>
  )
}
