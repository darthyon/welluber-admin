"use client"

import { Button } from "@/components/ui/button"

interface PostAssignPolicyModalProps {
  isOpen: boolean
  policyName: string
  onAutoMatch: () => void
  onManual: () => void
  onLater: () => void
}

export function PostAssignPolicyModal({
  isOpen,
  policyName,
  onAutoMatch,
  onManual,
  onLater,
}: PostAssignPolicyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg rounded-[24px] border border-border bg-card shadow-2xl">
        <div className="p-8 pb-4">
          <h3 className="text-heading font-semibold text-foreground">
            Policy Assigned
          </h3>
          <p className="mt-1 text-body text-subtle">
            <span className="font-medium text-foreground">{policyName}</span> is
            now assigned to this organisation.
          </p>
          <p className="mt-2 text-label text-muted-foreground">
            Do you want to assign it to employees now?
          </p>
        </div>

        <div className="space-y-2 px-8 pb-2">
          <Button className="h-11 w-full rounded-4xl" onClick={onAutoMatch}>
            Assign to Employees (Tier Auto-Match)
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-4xl"
            onClick={onManual}
          >
            Assign to Employees Manually
          </Button>
          <Button
            variant="ghost"
            className="h-11 w-full rounded-4xl"
            onClick={onLater}
          >
            Later
          </Button>
        </div>

        <div className="border-t border-border bg-muted/30 p-8 pt-4">
          <p className="text-micro text-faint">
            You can manage employee assignment from Employees or Benefit Policy
            tabs anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
