"use client"

import { CaretDown, TreeStructure } from "@phosphor-icons/react"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  getMainServiceName,
  resolveMainServiceId,
} from "@/lib/mock-data/service-catalog"
import { getMainServiceIcon } from "@/components/host/policies/detail-tabs/policy-detail-helpers"
import { EntitlementAllocationPersonCard } from "@/components/shared/entitlement-allocation-person-card"
import type {
  EntitlementServiceAllocation,
  EntitlementSummary,
} from "@/features/employees/entitlement-resolver"
import type {
  Benefit,
  BenefitGroup,
  BenefitGroupCoverageScope,
} from "@/types/policy"
import type { EntitlementGroupPoolDisplay } from "@/features/employees/entitlement-pool-display"

interface EntitlementGroupLedgerCardProps {
  benefits: Benefit[]
  display: EntitlementGroupPoolDisplay
  group: BenefitGroup
  serviceAllocations: Map<string, EntitlementServiceAllocation>
}

export function EntitlementGroupLedgerCard({
  benefits,
  display,
  group,
  serviceAllocations,
}: EntitlementGroupLedgerCardProps) {
  const coverageScope = group.coverageScope ?? "Employee"

  return (
    <section
      data-testid={`entitlement-group-${group.id}`}
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <TreeStructure size={18} weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-lead font-semibold text-foreground">
            {group.name}
          </h4>
          <p className="mt-0.5 truncate text-label text-muted-foreground">
            {formatGroupMeta(group, coverageScope, benefits.length)}
          </p>
        </div>
        <StatusBadge
          status={poolBadgeLabel(display.kind)}
          variant="primary"
          className="border-primary/40 bg-primary/15 px-2.5 py-1 font-semibold"
        />
      </div>

      <div className="space-y-5 p-4">
        <ServiceGrid
          benefits={benefits}
          serviceAllocations={serviceAllocations}
        />
      </div>
    </section>
  )
}

function ServiceGrid({
  benefits,
  serviceAllocations,
}: {
  benefits: Benefit[]
  serviceAllocations: Map<string, EntitlementServiceAllocation>
}) {
  return (
    <div>
      <p className="mb-3 text-label font-semibold text-muted-foreground">
        Services
      </p>
      {benefits.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/10 py-8 text-center text-label text-muted-foreground">
          No benefits configured for this group.
        </p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {benefits.map((benefit) => (
            <ServiceRow
              key={benefit.id}
              benefit={benefit}
              serviceAllocation={serviceAllocations.get(benefit.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceRow({
  benefit,
  serviceAllocation,
}: {
  benefit: Benefit
  serviceAllocation?: EntitlementServiceAllocation
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {getMainServiceIcon(benefit.serviceId)}
          </span>
          <span className="truncate text-body font-semibold text-foreground">
            {getMainServiceName(benefit.serviceId)}
          </span>
          <span className="ml-auto shrink-0 font-mono text-label tracking-widest text-muted-foreground uppercase">
            {resolveMainServiceId(benefit.serviceId)}
          </span>
          <CaretDown
            size={14}
            className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 border-t border-border bg-muted/20 px-4 py-4">
          {serviceAllocation ? (
            <>
              <ServiceSummary
                benefitId={benefit.id}
                summary={serviceAllocation.summary}
              />
              <div
                data-testid={`service-allocation-cards-${benefit.id}`}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
              >
                {serviceAllocation.rows.map((row) => (
                  <EntitlementAllocationPersonCard
                    key={row.beneficiaryId}
                    compact
                    row={row}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-label text-muted-foreground">
              Allocation details are not available for this service.
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ServiceSummary({
  benefitId,
  summary,
}: {
  benefitId: string
  summary: EntitlementSummary
}) {
  return (
    <div
      data-testid={`service-allocation-summary-${benefitId}`}
      className="grid grid-cols-1 gap-3 rounded-lg border border-border/70 bg-card px-3 py-3 sm:grid-cols-3"
    >
      <MetricValue
        label="Total Allocated"
        value={formatRM(summary.allocated)}
      />
      <MetricValue label="Total Used" value={formatRM(summary.used)} />
      <MetricValue label="Balance Left" value={formatRM(summary.left)} />
    </div>
  )
}

function MetricValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-micro text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-label font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function poolBadgeLabel(kind: EntitlementGroupPoolDisplay["kind"]) {
  if (kind === "shared") return "Shared"
  if (kind === "individual") return "Individual"
  if (kind === "combined") return "Combined"
  return "Employee"
}

function formatGroupMeta(
  group: BenefitGroup,
  coverageScope: BenefitGroupCoverageScope,
  serviceCount: number
) {
  const distribution =
    group.distributionType === "SharedAmount"
      ? "Shared Amount"
      : "Individual Benefit Amount"
  return `${coverageScope} · ${distribution} · ${group.isTaxable ? "Taxable" : "Not Taxable"} · ${serviceCount} ${serviceCount === 1 ? "Service" : "Services"}`
}
