"use client"

import { Check, Users, CheckSquare, Square } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getServiceName, formatRM } from "../version-wizard-helpers"
import type { VersionWizardCtx } from "../version-wizard-types"

interface ReviewStepProps {
  ctx: VersionWizardCtx
}

export function ReviewStep({ ctx }: ReviewStepProps) {
  const {
    parentPolicy,
    parentBenefits,
    capOverride,
    overrides,
    targetedEmployees,
    confirmedEmployeeIds,
    pinnedEmployeeIds,
    toggleConfirmed,
    toggleAllConfirmed,
  } = ctx

  const allSelected = confirmedEmployeeIds.length === targetedEmployees.length

  return (
    <div className="space-y-6">
      {/* Diff summary */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <p className="text-body font-semibold text-foreground">Benefit Overrides</p>
          <p className="text-label text-muted-foreground mt-0.5">
            Changes relative to parent policy
          </p>
        </div>
        <div className="divide-y divide-border/40">
          {capOverride && parseFloat(capOverride) !== parentPolicy.totalCapAmount && (
            <div className="px-5 py-3 grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="text-label font-semibold text-foreground">Spending Cap</p>
                <p className="text-body font-semibold text-primary">
                  {formatRM(parseFloat(capOverride))}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-label font-semibold text-faint">Parent</p>
                <p className="text-body text-faint italic">
                  {parentPolicy.totalCapAmount
                    ? formatRM(parentPolicy.totalCapAmount)
                    : "No cap"}
                </p>
              </div>
            </div>
          )}
          {parentBenefits.map((benefit) => {
            const override = overrides[benefit.id]
            const isOverridden = override?.amount !== undefined
            return (
              <div key={benefit.id} className="px-5 py-3 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-label font-semibold text-foreground">
                    {getServiceName(benefit.serviceId)}
                  </p>
                  <p
                    className={cn(
                      "text-body font-semibold",
                      isOverridden ? "text-primary" : "text-faint italic"
                    )}
                  >
                    {isOverridden ? formatRM(override.amount!) : "Inherited"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-label font-semibold text-faint">Parent</p>
                  <p className="text-body text-faint">{formatRM(benefit.amount)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Employee roster */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <p className="text-body font-semibold text-foreground">Employee Assignment</p>
            <p className="text-label text-muted-foreground mt-0.5">
              {confirmedEmployeeIds.length} of {targetedEmployees.length} selected
            </p>
          </div>
          <button
            onClick={toggleAllConfirmed}
            className="flex items-center gap-1.5 text-label text-primary font-medium hover:opacity-80 transition-opacity"
          >
            {allSelected ? (
              <CheckSquare size={16} weight="fill" />
            ) : (
              <Square size={16} />
            )}
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        {targetedEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users size={32} weight="duotone" className="text-muted/30 mb-3" />
            <p className="text-body font-medium text-muted-foreground">
              No employees match the targeting criteria.
            </p>
            <p className="text-label text-faint mt-1">
              Go back and adjust tier, department, or pin individuals.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {targetedEmployees.map((emp) => {
              const isSelected = confirmedEmployeeIds.includes(emp.id)
              const isPinned = pinnedEmployeeIds.includes(emp.id)
              return (
                <button
                  key={emp.id}
                  onClick={() => toggleConfirmed(emp.id)}
                  className={cn(
                    "w-full grid grid-cols-12 items-center px-5 py-3 text-left transition-colors hover:bg-muted/20",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <div className="col-span-1">
                    <div
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background"
                      )}
                    >
                      {isSelected && <Check size={11} weight="bold" />}
                    </div>
                  </div>
                  <div className="col-span-5">
                    <div className="flex items-center gap-2">
                      <p className="text-body font-semibold text-foreground">{emp.name}</p>
                      {isPinned && (
                        <span className="px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 text-micro font-medium">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-label font-mono text-faint">{emp.empCode}</p>
                  </div>
                  <div className="col-span-3">
                    <span className="text-body text-subtle">{emp.department}</span>
                  </div>
                  <div className="col-span-3">
                    <Badge variant="secondary">{emp.tier}</Badge>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
