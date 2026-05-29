"use client"

import { useState } from "react"
import { StatusBadge } from "@/components/shared/status-badge"

interface NewValuesConfirmationProps {
  newDeptCount: number
  newTierCount: number
  newPolicyCount: number
}

export function NewValuesConfirmation({
  newDeptCount,
  newTierCount,
  newPolicyCount,
}: NewValuesConfirmationProps) {
  const [confirmed, setConfirmed] = useState(false)

  const items: string[] = []
  if (newDeptCount > 0)
    items.push(`${newDeptCount} new ${newDeptCount === 1 ? "department" : "departments"}`)
  if (newTierCount > 0)
    items.push(`${newTierCount} new ${newTierCount === 1 ? "tier" : "tiers"}`)
  if (newPolicyCount > 0)
    items.push(`${newPolicyCount} new ${newPolicyCount === 1 ? "policy" : "policies"}`)

  return (
    <div className="rounded-lg border border-border bg-muted/10 px-4 py-3 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {confirmed ? (
            <StatusBadge status="Confirmed" variant="emerald" />
          ) : (
            <StatusBadge status="Review" variant="amber" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <p className="text-body font-semibold text-foreground">
              {confirmed ? "New values confirmed" : "New values detected"}
            </p>
            <p className="text-label text-muted-foreground">
              This import contains {items.join(", ")} that do not exist in the system yet.
              Please verify the spelling is correct to avoid duplicates from typos.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-label font-medium text-foreground">
              I confirm these new values are correct
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
