"use client"

import { IdentificationCard, Gear, TreeStructure, CaretDown } from "@phosphor-icons/react"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { SERVICES } from "@/lib/mock-data"
import { MONTHS } from "./wizard-constants"
import { ReadFieldMuted } from "./wizard-shared-ui"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

interface PolicyReviewCardsProps {
  policy: Partial<BenefitPolicy>
  groups: BenefitGroup[]
  benefits: Benefit[]
}

export function PolicyReviewCards({ policy, groups, benefits }: PolicyReviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* Policy Details card */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 text-body font-semibold text-foreground">
          <IdentificationCard size={16} weight="duotone" className="text-primary" />
          Policy Details
        </h4>
        <ReadFieldMuted label="Policy Name" value={policy.name || undefined} />
        <ReadFieldMuted label="Description" value={policy.description || undefined} />
        <ReadFieldMuted
          label="Employment Types"
          value={policy.eligibleEmploymentTypes
            ?.map((t) =>
              t
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
            )
            .join(", ")}
        />
        <ReadFieldMuted
          label="Age Range"
          value={
            policy.eligibility?.minAge || policy.eligibility?.maxAge
              ? `${policy.eligibility?.minAge || "Any"} — ${policy.eligibility?.maxAge || "Any"}`
              : "Any age"
          }
        />
        <ReadFieldMuted
          label="Gender"
          value={
            policy.eligibility?.gender
              ? policy.eligibility.gender.charAt(0).toUpperCase() +
                policy.eligibility.gender.slice(1)
              : "All"
          }
        />
      </div>

      {/* Pool & Cycle card */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 text-body font-semibold text-foreground">
          <Gear size={16} weight="duotone" className="text-primary" />
          Pool &amp; Cycle
        </h4>
        <ReadFieldMuted
          label="Dependents"
          value={
            (policy.dependentCoverages?.length ?? 0) > 0
              ? `Covered (${policy.dependentCoverages?.map((c) => c.type).join(", ")})`
              : "Employee Only"
          }
        />
        <ReadFieldMuted
          label="Employee Policy Amount"
          value={
            policy.totalCapAmount ? `RM ${policy.totalCapAmount.toFixed(2)}` : "Not Set"
          }
        />
        {(policy.dependentCoverages?.length ?? 0) > 0 && (
          <ReadFieldMuted
            label="Dependents Pool Type"
            value={
              policy.dependentsPoolType === "SharedWithEmployee"
                ? "Shared with Employee"
                : policy.dependentsPoolType
            }
          />
        )}
        <ReadFieldMuted
          label="Utilisation Mode"
          value={
            policy.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"
          }
        />
        {policy.utilisationMode === "Prorated" && (
          <ReadFieldMuted label="Prorate Unit" value={policy.prorateUnit} />
        )}
        <ReadFieldMuted label="Refresh Cycle" value={policy.refreshCycle} />
        <ReadFieldMuted
          label="Start Reference"
          value={
            policy.refreshStartReference === "financial_year"
              ? "Financial Year"
              : "Calendar Year"
          }
        />
        {policy.refreshStartMonth && (
          <ReadFieldMuted
            label="Start Month"
            value={MONTHS[policy.refreshStartMonth - 1]}
          />
        )}
      </div>

      {/* Benefit Groups card */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5 md:col-span-2">
        <h4 className="flex items-center gap-2 text-body font-semibold text-foreground">
          <TreeStructure size={16} weight="duotone" className="text-primary" />
          Benefit Groups
        </h4>
        {groups.length === 0 ? (
          <p className="text-body font-medium text-faint">No benefit groups configured.</p>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => {
              const groupBenefits = benefits.filter((b) => b.groupId === group.id)
              return (
                <Collapsible key={group.id}>
                  <CollapsibleTrigger className="group w-full">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-transparent p-3 transition-colors hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted text-primary">
                          <TreeStructure size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-body font-medium text-foreground">{group.name}</p>
                          <p className="text-label font-semibold text-muted-foreground">
                            {groupBenefits.length} benefit{groupBenefits.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <CaretDown
                        size={14}
                        weight="bold"
                        className="ml-3 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-1 px-3 pt-1 pb-3">
                      {groupBenefits.length === 0 ? (
                        <p className="py-2 text-label text-faint">No services configured.</p>
                      ) : (
                        groupBenefits.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-2"
                          >
                            <span className="text-body text-foreground">
                              {SERVICES.find((s) => s.id === b.serviceId)?.name ?? b.serviceId}
                            </span>
                            <span className="text-body font-semibold text-foreground tabular-nums">
                              {b.amount.toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                      {group.distributionType === "SharedAmount" && (
                        <div className="mt-1 flex items-center justify-between rounded-md border-t border-border/40 px-3 py-2 pt-2">
                          <span className="text-label font-medium text-muted-foreground">
                            Group Cap
                          </span>
                          <span className="text-body font-semibold text-foreground tabular-nums">
                            {group.maxUsagePerCycle?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
