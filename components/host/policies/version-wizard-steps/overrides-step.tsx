"use client"

import { TreeStructure, X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { getServiceName, formatRM } from "../version-wizard-helpers"
import type { VersionWizardCtx } from "../version-wizard-types"

interface OverridesStepProps {
  ctx: VersionWizardCtx
}

export function OverridesStep({ ctx }: OverridesStepProps) {
  const {
    parentPolicy,
    parentGroups,
    parentBenefits,
    versionName,
    setVersionName,
    capOverride,
    setCapOverride,
    overrides,
    setOverride,
    clearOverride,
  } = ctx

  return (
    <div className="space-y-6">
      {/* Version name */}
      <div className="glass-card rounded-xl p-5">
        <p className="text-label font-semibold text-subtle mb-1">Version Name</p>
        <p className="text-label text-faint mb-3">
          Give this version a descriptive name to distinguish it from the parent policy.
        </p>
        <input
          type="text"
          placeholder="e.g. Engineering Supplement FY2026"
          value={versionName}
          onChange={(e) => setVersionName(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 bg-background border border-border rounded-lg text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Policy cap */}
      <div className="glass-card rounded-xl p-5">
        <p className="text-label font-semibold text-subtle mb-1">Override Spending Cap (RM)</p>
        <p className="text-label text-faint mb-3">
          {parentPolicy.totalCapAmount
            ? `Parent cap: ${formatRM(parentPolicy.totalCapAmount)} — leave blank to inherit`
            : "Parent has no spending cap"}
        </p>
        <input
          type="number"
          min={0}
          placeholder={
            parentPolicy.totalCapAmount
              ? `Inherited (${formatRM(parentPolicy.totalCapAmount)})`
              : "No cap"
          }
          value={capOverride}
          onChange={(e) => setCapOverride(e.target.value)}
          className="w-full max-w-xs px-4 py-2.5 bg-background border border-border rounded-lg text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Per-group benefit overrides */}
      {parentGroups.map((group) => {
        const groupBenefits = parentBenefits.filter((b) => b.groupId === group.id)
        return (
          <div key={group.id} className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <TreeStructure size={16} weight="duotone" />
              </div>
              <div>
                <p className="text-body font-semibold text-foreground">{group.name}</p>
                <p className="text-label text-faint">
                  {group.distributionType === "SharedAmount"
                    ? `Shared pool · ${formatRM(group.maxUsagePerCycle ?? 0)}`
                    : "Individual per benefit"}
                </p>
              </div>
            </div>
            <div className="divide-y divide-border/40">
              {groupBenefits.map((benefit) => {
                const override = overrides[benefit.id]
                const hasOverride = override?.amount !== undefined
                const overrideVal = hasOverride ? String(override.amount) : ""

                return (
                  <div
                    key={benefit.id}
                    className={cn(
                      "px-5 py-4 transition-colors",
                      hasOverride && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-body font-semibold text-foreground">
                          {getServiceName(benefit.serviceId)}
                        </p>
                        <p className="text-label text-faint italic mt-0.5">
                          Inherited: {formatRM(benefit.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-label text-faint font-medium">RM</span>
                        <input
                          type="number"
                          min={0}
                          placeholder={benefit.amount.toFixed(2)}
                          value={overrideVal}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === "") {
                              clearOverride(benefit.id, "amount")
                            } else {
                              setOverride(benefit.id, "amount", parseFloat(val))
                            }
                          }}
                          className="w-28 px-3 py-1.5 bg-background border border-border rounded-lg text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all text-right"
                        />
                        {hasOverride && (
                          <button
                            onClick={() => clearOverride(benefit.id, "amount")}
                            className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-500/20 transition-colors"
                          >
                            <X size={12} weight="bold" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
